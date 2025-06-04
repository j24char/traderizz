// SearchStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from './SearchScreen';
import SymbolScreen from './SymbolScreen';

const Stack = createNativeStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="Symbol" component={SymbolScreen} />
    </Stack.Navigator>
  );
}
