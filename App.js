import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/Dashboard';
import HomeScreen from './screens/HomeScreen';
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#39db7a',
    secondary: '#457a5a',
    background: '#f7f7f7',
    card: '#fff',
    text: '#111',
    border: '#ccc',
  },
};

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#39db7a',
    secondary: '#457a5a',
    background: '#1a1a1a',
    card: '#2a2a2a',
    text: '#eee',
    border: '#555',
  },
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
