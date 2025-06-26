import React, {useEffect, useState} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './screens/Dashboard';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import SymbolScreen from './screens/SymbolScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ProfileScreen from './screens/ProfileScreen';
import { supabase } from './lib/supabase';

import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const isUserLoggedIn = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
};


function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="Symbol" component={SymbolScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      {/* Add more profile-related screens later if needed */}
    </Stack.Navigator>
  );
}

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Check existing session on app startup
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user); // <- your logic to store user in state
      }
    };

    checkSession();

    // 2. Listen for auth state changes (login/logout/refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (session) {
        setUser(session.user); // <- update user on login/refresh
      } else {
        setUser(null); // <- clear user on logout
      }
    });

    return () => {
      authListener.subscription?.unsubscribe(); // clean up listener
    };
  }, []);

  return (

    <NavigationContainer theme={MyLightTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // Hides the top header
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Dashboard') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#39db7a',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            paddingBottom: 5,
            height: 60,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Search" component={SearchStack} />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          listeners={({ navigation }) => ({
            tabPress: async (e) => {
              const loggedIn = await isUserLoggedIn();
              if (!loggedIn) {
                // This will always show the Auth screen as the first screen in the stack
                navigation.navigate('Profile', { screen: 'SignIn' });
              } else {
                // Later, replace this with profile/dashboard
                navigation.navigate('Profile', { screen: 'ProfileMain' });
              }
            },
          })}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
