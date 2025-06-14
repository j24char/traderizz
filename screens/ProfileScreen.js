import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useTheme } from '@react-navigation/native';
import createStyles from '../styles/styles';
import IconImage from '../assets/icon.png';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = createStyles(useTheme().dark ? 'dark' : 'light');

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const user = supabase.auth.getUser(); // Promise, we'll handle in loadProfile

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Error', 'Unable to load user');
      setLoading(false);
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
      setAvatarUrl(data.avatar_url || null);
      setEmail(data.email || user.email || '');
    }

    setLoading(false);
  }

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.IMAGE,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      uploadAvatar(uri);
    }
  }

  async function uploadAvatar(uri) {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const fileRes = await fetch(uri);
      const fileBlob = await fileRes.blob();

      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, fileBlob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl.publicUrl);
    } catch (error) {
      Alert.alert('Upload failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const updates = {
      id: user.id,
      username,
      bio,
      avatar_url: avatarUrl,
      email: user.email,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) Alert.alert('Error saving profile', error.message);
    else Alert.alert('Profile updated!');
    setLoading(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && <ActivityIndicator size="large" color={colors.primary} />}
      <Image
        source={IconImage}
        style={styles.logo}
      />
      <Text style={[styles.sectionTitle]}>
        Edit Profile
      </Text>

      {avatarUrl && (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
        />
      )}
      <Button title="Change Avatar" onPress={pickAvatar} />

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

      <Button title="Save Profile" onPress={saveProfile} disabled={loading} />
    </View>
  );
}
