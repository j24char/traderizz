// components/TradeModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../styles/styles';

const TradeModal = ({ visible, onClose, onSave, initialData }) => {
  const [symbol, setSymbol] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellDate, setSellDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSymbol(initialData.symbol || '');
      setBuyPrice(initialData.buyPrice?.toString() || '');
      setSellPrice(initialData.sellPrice?.toString() || '');
      setSellDate(initialData.sellDate ? new Date(initialData.sellDate) : new Date());
    } else {
      setSymbol('');
      setBuyPrice('');
      setSellPrice('');
      setSellDate(new Date());
    }
  }, [initialData, visible]);

  const handleSave = () => {
    onSave({
      id: initialData?.id || Date.now().toString(),
      symbol,
      buyPrice: parseFloat(buyPrice),
      sellPrice: parseFloat(sellPrice),
      sellDate: sellDate.toISOString(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Trade Details</Text>
          <Text>Symbol</Text>
          <TextInput value={symbol} onChangeText={setSymbol} style={styles.input} />

          <Text>Purchase Price</Text>
          <TextInput value={buyPrice} onChangeText={setBuyPrice} keyboardType="numeric" style={styles.input} />

          <Text>Sell Price</Text>
          <TextInput value={sellPrice} onChangeText={setSellPrice} keyboardType="numeric" style={styles.input} />

          <Text>Sell Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            <Text>{sellDate.toLocaleDateString()} {sellDate.toLocaleTimeString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={sellDate}
              mode="datetime"
              display="default"
              onChange={(e, date) => {
                setShowDatePicker(false);
                if (date) setSellDate(date);
              }}
            />
          )}

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TradeModal;
