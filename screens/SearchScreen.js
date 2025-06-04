import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import stylesFactory from '../styles/styles';
import SymbolData from '../assets/sp500symbols.json';
import Icon from 'react-native-vector-icons/Ionicons';


export default function SearchScreen() {
  const navigation = useNavigation();
  const styles = stylesFactory();
  const [query, setQuery] = useState('');

  const filteredSymbols = SymbolData.filter(item => {
    const symbol = item.Symbol || '';
    const security = item.Security || '';
    return (
      symbol.toLowerCase().includes(query.toLowerCase()) ||
      security.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
            style={styles.title}
            placeholder="Search for a symbol..."
            value={query}
            onChangeText={text => setQuery(text)}
            onSubmitEditing={Keyboard.dismiss}
        />
      </View>

      <FlatList
        data={filteredSymbols}
        keyExtractor={(item) => item.Symbol}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.feedItem}
            onPress={() =>
              navigation.navigate('Symbol', {
                symbol: item.Symbol,
                name: item.Security,
              })
            }
          >
            <Text style={styles.feedUser}>{item.Symbol}</Text>
            <Text style={styles.feedText}>{item.Security}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}