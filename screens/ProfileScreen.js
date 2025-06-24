import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useTheme } from '@react-navigation/native';
import createStyles from '../styles/styles';
import IconImage from '../assets/icon.png';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = createStyles(useTheme().dark ? 'dark' : 'light');

  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [email, setEmail] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = supabase.auth.getUser(); // Promise, we'll handle in loadProfile

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (avatarUrl) {
      console.log("New image URL:", avatarUrl);
    }
  }, [avatarUrl]);

  
  async function loadProfile() {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Error', 'Unable to load user');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      Alert.alert('Error', error.message);
    }

    if (data) {
      setUsername(data.username || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || '');
      setEmail(data.email || user.email || '');
    }
  };

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri); // save for immediate use
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri) => {
    let imageUrl = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not found'); // TODO: jump to sign in screen
    }
    setLoading(true);
    console.log("local file url: " + uri);
          
    try { 
      const fileExt = uri.split('.').pop().split('?')[0];
      const fileName = `${user.id}/avatar.${fileExt}`;
      const filePath = uri;

      // Read file as base64 string
      const base64 = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("Attempt to load to storage");
      // Convert base64 to a Blob-like Uint8Array
      const fileBuffer = Buffer.from(base64, 'base64');
      // Upload to Supabase storage 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicData, error: publicError } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (publicError) throw publicError;

      imageUrl = publicData.publicUrl;
      console.log("retrieved publicUrl: " + imageUrl);
    } catch (error) {
      setLoading(false);
      return;
    }

    try {
      console.log("attempt to update avatar_url in profile table");
      // update profile table with avatar url
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          avatar_url: imageUrl,
        }
      ]);
    } catch (error) {
      console.error("URL update for profile table failed:", error.message);
    }

    setAvatarUrl(imageUrl);
    await loadProfile();
    setLoading(false);
  };

  const saveProfile = async () => {
    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not found');

      // Now save profile info
      const updates = {
        id: user.id,
        username,
        bio,
        avatar_url: avatarUrl,
        email: user.email,
        updated_at: new Date(),
      };

      const { error: updateError } = await supabase.from('profiles').upsert(updates);
      if (updateError) throw updateError;

      Alert.alert('Profile updated!');
    } catch (error) {
      Alert.alert('Error saving profile', error.message);
    } finally {
      setLoading(false);
      navigation.navigate('Home');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Error', error.message);
    } else {
      navigation.navigate('SignIn'); // Or 'Home' or wherever your login screen is
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && <ActivityIndicator size="large" color={colors.primary} />}
      {/* top left logo */}
      <Image
        source={IconImage}
        style={styles.logo}
      />
      {/* Page Title */}
      <Text style={[styles.sectionTitle]}>
        Edit Profile
      </Text>

      <TouchableOpacity onPress={pickAvatar}>
        {selectedImage ? (
          <Image 
            source={{ uri: selectedImage }}
            style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
          />
        ) : avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
          />
        ) : (
          <Ionicons
            name="person-circle-outline"
            size={100}
            color={colors.primary}
            style={{ marginBottom: 10 }}
          />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.signInButton}
        onPress={pickAvatar}
      >
        <Text style={styles.addButtonText}>Change Avatar</Text>
      </TouchableOpacity>

      <Text style={{ color: colors.text, marginTop: 20 }}>Username</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          padding: 10,
          borderRadius: 10,
          color: colors.text,
        }}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        placeholderTextColor={colors.border}
      />

      <Text style={{ color: colors.text, marginTop: 20 }}>Bio</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          padding: 10,
          borderRadius: 10,
          color: colors.text,
        }}
        value={bio}
        onChangeText={setBio}
        placeholder="Enter a short bio"
        placeholderTextColor={colors.border}
        multiline
      />

      <Text style={{
        color: colors.text,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: colors.border,
        }}>
        {email}
      </Text>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={saveProfile}
      >
        <Text style={styles.addButtonText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.signInButton, { backgroundColor: 'lightcoral', marginTop: 10 }]}
        onPress={handleLogout}
      >
        <Text style={[styles.addButtonText, { color: 'white' }]}>Log Out</Text>
      </TouchableOpacity>

    </View>
  );
}
