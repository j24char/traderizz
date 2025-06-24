import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import createStyles from '../styles/styles';
import { supabase } from '../lib/supabase';
import SignUpScreen from './SignUpScreen';
import ProfileScreen from './ProfileScreen';
import IconImage from '../assets/icon.png';
import { Image } from 'react-native';



export default function SignInScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const styles = createStyles(useTheme().dark ? 'dark' : 'light');

  const signIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Signed in!");
        navigation.navigate('Profile');
      }
    } catch (err) {
      Alert.alert("Unexpected error", err.message || String(err));
    }
  };



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={IconImage}
        style={styles.logo}
      />

      <Text style={[styles.sectionTitle]}>
        Sign In
      </Text>

      <Text style={[styles.label, { color: colors.text }]}>Email</Text>
      
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder="Enter your email"
        placeholderTextColor={colors.border}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={[styles.label, { color: colors.text }]}>Password</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder="Enter your password"
        placeholderTextColor={colors.border}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.signInButton}
        onPress={ signIn }
      >
        <Text style={styles.addButtonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.signInButton}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.addButtonText}>
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
