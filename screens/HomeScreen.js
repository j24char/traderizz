import React, { useState, useEffect } from 'react';
import {
  View, Text, Button, Modal, TextInput, Image, TouchableOpacity,
  StyleSheet, Alert, FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import createStyles from '../styles/styles';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { Ionicons } from '@expo/vector-icons';
import IconImage from '../assets/icon.png';
import { useThemeContext } from '../styles/ThemeContext'; 

export default function HomeScreen() {
  const { theme, toggleTheme } = useThemeContext();
  const styles = createStyles(theme.mode);
  const colors = theme.colors;
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [caption, setCaption] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);


  useEffect(() => {
    loadUser();
    fetchPosts();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        caption,
        image_url,
        created_at,
        user_id,
        profiles (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading posts:', error.message);
    } else {
      console.log('Fetched posts:', data);
      setPosts(data);
    }
  }

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleNewPost = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
      setModalVisible(true);
    } else {
      navigation.navigate('Profile', { screen: 'SignIn' });
    }
  };

  const renderPost = ({ item }) => (
    <View style={[localStyles.postCard, { backgroundColor: colors.card }]}>
      {item.image_url ? (
        <TouchableOpacity onPress={() => setFullScreenImage(item.image_url)}>
          <Image source={{ uri: item.image_url }} style={localStyles.postImage} />
        </TouchableOpacity>
      ) : null}

      <Text style={{ color: colors.text, fontWeight: 'bold' }}>
        {item.profiles?.username ?? 'Anonymous'}
      </Text>

      <Text style={{ color: colors.text, fontSize: 12 }}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
      <Text style={{ color: colors.text }}>{item.caption}</Text>
    </View>
  );

  const handlePost = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Not signed in');
      return;
    }

    setUploading(true);

    let imageUrl = null;

    if (selectedImage) {
      try {
        const fileExt = selectedImage.split('.').pop().split('?')[0];
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = selectedImage;

        // Read file as base64 string
        const base64 = await FileSystem.readAsStringAsync(filePath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to a Blob-like Uint8Array
        const fileBuffer = Buffer.from(base64, 'base64');

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicData, error: publicError } = supabase
          .storage
          .from('post-images')
          .getPublicUrl(fileName);

        if (publicError) throw publicError;

        imageUrl = publicData.publicUrl;
      } catch (error) {
        console.error("Image upload failed:", error.message);
        Alert.alert('Image upload failed', error.message);
        setUploading(false);
        return;
      }
    }
    const { error: insertError } = await supabase.from('posts').insert([
      {
        user_id: user.id,
        caption,
        image_url: imageUrl,
      }
    ]);

    if (insertError) {
      Alert.alert('Error creating post', insertError.message);
    } else {
      Alert.alert('Post created!');
      setModalVisible(false);
      setCaption('');
      setSelectedImage(null);
      fetchPosts(); // refresh feed
    }

    setUploading(false);
  };


  return (
    <View style={[styles.container, {  flex: 1 }]}>
      <Image source={IconImage} style={styles.logo} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={localStyles.floatingButton}
        onPress={handleNewPost}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

    <Modal visible={modalVisible} animationType="slide">
      <View style={{ padding: 20 }}>
        <Image source={IconImage} style={styles.logo} />
        <Text style={styles.header}>New Post</Text>
        <TextInput
          placeholder='Write a comment...'
          value={caption}
          onChangeText={setCaption}
          style={{ borderWidth: 1, color: colors.text, borderColor: '#ccc', padding: 10, marginBottom: 10 }}
          placeholderTextColor={'#ccc'}
        />
        {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            style={{ width: 200, height: 200, marginVertical: 10 }}
          />
        )}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={pickImage}
        >
          <Text style={styles.addButtonText}>Pick Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handlePost}
        >
          <Text style={styles.addButtonText}>+ Post</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => {
            setModalVisible(false);
            setCaption('');
            setSelectedImage(null);
          }}
        >
          <Text style={styles.addButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>

    <Modal
      visible={!!fullScreenImage}
      transparent
      animationType="fade"
      onRequestClose={() => setFullScreenImage(null)}
    >
      <TouchableOpacity
        style={localStyles.fullScreenContainer}
        onPress={() => setFullScreenImage(null)}
        activeOpacity={1}
      >
        <Image
          source={{ uri: fullScreenImage }}
          style={localStyles.fullScreenImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Modal>

    </View>
  );
}

const localStyles = StyleSheet.create({
  newPostButton: {
    backgroundColor: '#39db7a',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#39db7a',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // for Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 15,
    borderRadius: 10,
  },
  postCard: {
    borderRadius: 15,
    margin: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },

});
