import React from 'react';
import { View, Text, Button, ScrollView, FlatList } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import createStyles from '../styles/styles';
import { TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import IconImage from '../assets/small-icon.png';

const mockPosts = [
  { id: '1', user: 'TraderJoe', text: 'Sold TSLA at +25% profit 💰' },
  { id: '2', user: 'OptionQueen', text: 'Lost 15% on GOOGL 😢' },
  { id: '3', user: 'SwingKing', text: 'Nice swing on AMD +12%' },
  { id: '4', user: 'Sniper', text: 'Quick day trade on AAPL for +3%' },
  // Add more sample posts or connect to backend later
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = createStyles(useTheme().dark ? 'dark' : 'light');


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={IconImage}
        style={styles.logo}
      />
      <Text style={styles.title}>
        Welcome to Traderizz
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.homeScreenButtons} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.homeScreenButtonText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeScreenButtons} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.homeScreenButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle]}>
        Recent Trader Posts
      </Text>

      <View style={styles.feedContainer}>
        <FlatList
          data={mockPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.feedItem}>
              <Text style={styles.feedUser}>
                {item.user}
              </Text>
              <Text style={styles.feedText}>
                {item.text}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}
