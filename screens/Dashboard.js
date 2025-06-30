import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useThemeContext } from '../styles/ThemeContext';
import createStyles from '../styles/styles';

export default function DashboardScreen() {
  const { theme } = useThemeContext();
  const styles = createStyles(theme.mode);
  const colors = theme.colors;

  const [holdings, setHoldings] = useState([]); // List of open buy trades
  const [profits, setProfits] = useState([]);   // List of {date, profit}
  const [modalVisible, setModalVisible] = useState(false);
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [selectedStockIndex, setSelectedStockIndex] = useState(null);

  // Fields for adding new stock
  const [newSymbol, setNewSymbol] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDate, setNewDate] = useState('');

  // Fields for selling
  const [sellQuantity, setSellQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellDate, setSellDate] = useState('');

  const openAddModal = () => {
    setNewSymbol('');
    setNewQuantity('');
    setNewPrice('');
    setNewDate('');
    setModalVisible(true);
  };

  const handleAddStock = () => {
  if (!newSymbol || !newQuantity || !newPrice || !newDate) {
    Alert.alert('Missing Fields');
    return;
  }

  const symbol = newSymbol.trim().toUpperCase();
  const quantity = parseInt(newQuantity);
  const price = parseFloat(newPrice);

  const existingIndex = holdings.findIndex(h => h.symbol === symbol);

  const updatedHoldings = [...holdings];

  if (existingIndex !== -1) {
    // Combine with existing holding
    const existing = updatedHoldings[existingIndex];
    const totalQuantity = existing.quantity + quantity;
    const totalCost = (existing.quantity * existing.price) + (quantity * price);
    const newAvgPrice = totalCost / totalQuantity;

    updatedHoldings[existingIndex] = {
      ...existing,
      quantity: totalQuantity,
      price: parseFloat(newAvgPrice.toFixed(2)),
      date: newDate, // optionally keep newest date
    };
  } else {
    updatedHoldings.push({
      symbol,
      quantity,
      price,
      date: newDate,
    });
  }

  setHoldings(updatedHoldings);
  setModalVisible(false);
};


  const openSellModal = (index) => {
    setSelectedStockIndex(index);
    setSellQuantity('');
    setSellPrice('');
    setSellDate('');
    setSellModalVisible(true);
  };

  const handleSellStock = () => {
    if (
      selectedStockIndex === null ||
      !sellQuantity ||
      !sellPrice ||
      !sellDate
    ) {
      Alert.alert('Missing Sell Info');
      return;
    }

    const sellQty = parseInt(sellQuantity);
    const sellP = parseFloat(sellPrice);

    const updatedHoldings = [...holdings];
    const stock = updatedHoldings[selectedStockIndex];

    if (sellQty > stock.quantity) {
      Alert.alert('Cannot sell more than you own.');
      return;
    }

    // Calculate profit
    const costBasis = stock.price * sellQty;
    const proceeds = sellQty * sellP;
    const profit = proceeds - costBasis;

    const updatedProfits = [...profits, {
      date: sellDate,
      profit,
    }];
    setProfits(updatedProfits);

    // Update or remove from holdings
    if (sellQty === stock.quantity) {
      updatedHoldings.splice(selectedStockIndex, 1);
    } else {
      updatedHoldings[selectedStockIndex].quantity -= sellQty;
    }

    setHoldings(updatedHoldings);
    setSellModalVisible(false);
  };

  const chartData = {
    labels: [],
    datasets: [{ data: [] }]
  };

  if (profits.length > 0) {
    const grouped = profits.reduce((acc, p) => {
      acc[p.date] = (acc[p.date] || 0) + p.profit;
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort();
    chartData.labels = sortedDates;
    chartData.datasets[0].data = sortedDates.map(date => grouped[date]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Realized Profit</Text>

      {chartData.datasets[0].data.length === 0 ? (
        <Text style={{ color: colors.text, textAlign: 'center', marginVertical: 20 }}>
          No Trade Data Available
        </Text>
      ) : (
        <LineChart
          data={chartData}
          width={styles.screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            color: (opacity = 1) => `rgba(57, 219, 122, ${opacity})`,
            labelColor: () => colors.text,
            decimalPlaces: 0,
          }}
          style={styles.chart}
        />
      )}

      <ScrollView style={styles.feedContainer}>
        {holdings.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tile}
            onPress={() => openSellModal(index)}
          >
            <View style={styles.tileLeft}>
              <Text style={styles.tileDate}>{item.date}</Text>
            </View>
            <View style={styles.tileCenter}>
              <Text style={styles.tileSymbol}>{item.symbol}</Text>
            </View>
            <View style={styles.tileRight}>
              <Text style={styles.tileGainLoss}>
                {item.quantity} @ ${item.price}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={openAddModal}
      >
        <Text style={styles.addButtonText}>+ Add Stock</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Stock</Text>
            <TextInput style={styles.input} placeholder="Symbol" value={newSymbol} onChangeText={setNewSymbol} placeholderTextColor="#aaa" />
            <TextInput style={styles.input} placeholder="Quantity" value={newQuantity} onChangeText={setNewQuantity} keyboardType="numeric" placeholderTextColor="#aaa" />
            <TextInput style={styles.input} placeholder="Buy Price" value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" placeholderTextColor="#aaa" />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={newDate} onChangeText={setNewDate} placeholderTextColor="#aaa" />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddStock}>
              <Text style={styles.saveButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sell Modal */}
      <Modal visible={sellModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sell Stock</Text>
            <TextInput style={styles.input} placeholder="Quantity to Sell" value={sellQuantity} onChangeText={setSellQuantity} keyboardType="numeric" placeholderTextColor="#aaa" />
            <TextInput style={styles.input} placeholder="Sell Price" value={sellPrice} onChangeText={setSellPrice} keyboardType="numeric" placeholderTextColor="#aaa" />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={sellDate} onChangeText={setSellDate} placeholderTextColor="#aaa" />
            <TouchableOpacity style={styles.saveButton} onPress={handleSellStock}>
              <Text style={styles.saveButtonText}>Sell</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setSellModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
