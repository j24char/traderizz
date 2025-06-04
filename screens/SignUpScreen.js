import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import styles from '../styles/styles';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Sign Up</Text>

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
        placeholder="Create a password"
        placeholderTextColor={colors.border}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title="Create Account"
        color={colors.primary}
        onPress={() => navigation.navigate('Dashboard')}
      />

      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text style={[styles.linkText, { color: colors.primary }]}>
          Already have an account? Sign in
        </Text>
      </TouchableOpacity>
    </View>
  );
}
