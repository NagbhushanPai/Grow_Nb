import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  value: string;
  onDateChange: (date: string) => void;
  label: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onDateChange, label }) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleDateSelect = () => {
    // For now, we'll use a simple prompt, but this could be enhanced with a proper date picker
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateButton} onPress={handleDateSelect}>
        <Text style={styles.dateText}>{formatDate(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color="#667eea" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
});
