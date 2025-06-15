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

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(useTheme().dark ? 'dark' : 'light');
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [caption, setCaption] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);


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
      .select('id, caption, image_url, created_at, user_id') // No join
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
        <Image
          source={{ uri: item.image_url }}
          style={localStyles.postImage}
          onError={() => console.warn('Image failed to load:', item.image_url)}
        />
      ) : null}
      <Text style={{ color: colors.text, fontWeight: 'bold' }}>
        {item.user_id}
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
    <View style={[styles.container, { backgroundColor: colors.background, flex: 1 }]}>
      <TouchableOpacity
        style={localStyles.newPostButton}
        onPress={handleNewPost}
      >
        <Text style={localStyles.buttonText}>+ New Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

    <Modal visible={modalVisible} animationType="slide">
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>New Post</Text>
        <TextInput
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 }}
        />
        <Button title="Pick Image" onPress={pickImage} />
        {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            style={{ width: 200, height: 200, marginVertical: 10 }}
          />
        )}
        <Button title={uploading ? 'Posting...' : 'Post'} onPress={handlePost} disabled={uploading} />
        <Button title="Cancel" onPress={() => setModalVisible(false)} />
      </View>
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
});
