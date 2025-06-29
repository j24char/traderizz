import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import createStyles from '../styles/styles';
import { useThemeContext } from '../styles/ThemeContext'; 

export default function DashboardScreen() {
  const { theme, toggleTheme } = useThemeContext();
  const styles = createStyles(theme.mode);
  const colors = theme.colors;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [tradeData, setTradeData] = useState([
    { date: '2025-06-01', quantity: 10, symbol: 'AAPL' },
    { date: '2025-06-02', quantity: 20, symbol: 'TSLA' },
    { date: '2025-06-03', quantity: 15, symbol: 'MSFT' },
  ]);

  const [newQuantity, setNewQuantity] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const openModalToEdit = (index) => {
    const item = tradeData[index];
    setNewQuantity(String(item.quantity));
    setNewDate(item.date);
    setNewSymbol(item.symbol || '');
    setEditingIndex(index);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!newQuantity || !newDate || !newSymbol) return;

    const updatedTrade = {
      quantity: parseInt(newQuantity),
      date: newDate,
      symbol: newSymbol,
    };

    if (editingIndex !== null) {
      const updatedData = [...tradeData];
      updatedData[editingIndex] = updatedTrade;
      setTradeData(updatedData);
    } else {
      setTradeData([...tradeData, updatedTrade]);
    }

    // Reset modal
    setNewQuantity('');
    setNewDate('');
    setNewSymbol('');
    setEditingIndex(null);
    setModalVisible(false);
  };

  const chartData = {
    labels: tradeData.map((item) => item.date),
    datasets: [
      {
        data: tradeData.map((item) => item.quantity),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Chart */}
      <Text style={styles.header}>Trade Chart</Text>
      <LineChart
        data={chartData}
        width={styles.screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: colors.backgroundColor,
          backgroundGradientFrom: colors.backgroundColor,
          backgroundGradientTo: colors.backgroundColor,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(57, 219, 122, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chart}
      />

      {/* Trades List */}
      <ScrollView style={styles.feedContainer}>
        {tradeData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tile}
            onPress={() => openModalToEdit(index)}
          >
            <View style={styles.tileLeft}>
              <Text style={styles.tileDate}>{item.date}</Text>
            </View>
            <View style={styles.tileCenter}>
              <Text style={styles.tileSymbol}>{item.symbol}</Text>
            </View>
            <View style={styles.tileRight}>
              <Text style={styles.tileGainLoss}>{item.quantity}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add New Data */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setNewQuantity('');
          setNewDate('');
          setNewSymbol('');
          setEditingIndex(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add Data</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingIndex !== null ? 'Edit Trade Data' : 'Add Trade Data'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Symbol (e.g. AAPL)"
              value={newSymbol}
              onChangeText={setNewSymbol}
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              value={newQuantity}
              onChangeText={setNewQuantity}
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={newDate}
              onChangeText={setNewDate}
              placeholderTextColor="#888"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
