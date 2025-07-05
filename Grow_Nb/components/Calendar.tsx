import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

interface CalendarProps<T> {
  visible: boolean;
  onClose: () => void;
  data: T[];
  getItemDate: (item: T) => string;
  renderItem: (item: T, onEdit: () => void, onDelete: () => void) => React.ReactNode;
  onEditItem: (item: T) => void;
  onDeleteItem: (item: T) => void;
  title: string;
  accentColor: string;
}

interface DateData<T> {
  dateString: string;
  items: T[];
}

export default function Calendar<T extends { id: string }>({
  visible,
  onClose,
  data,
  getItemDate,
  renderItem,
  onEditItem,
  onDeleteItem,
  title,
  accentColor,
}: CalendarProps<T>) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group data by date
  const groupedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const grouped: { [key: string]: T[] } = {};
    
    data.forEach(item => {
      try {
        const dateString = new Date(getItemDate(item)).toDateString();
        if (!grouped[dateString]) {
          grouped[dateString] = [];
        }
        grouped[dateString].push(item);
      } catch (error) {
        console.warn('Invalid date for item:', item);
      }
    });

    // Convert to array and sort by date (newest first)
    return Object.entries(grouped)
      .map(([dateString, items]) => ({ dateString, items }))
      .sort((a, b) => new Date(b.dateString).getTime() - new Date(a.dateString).getTime());
  }, [data]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: accentColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title} Calendar</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {groupedData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#64748b" />
              <Text style={styles.emptyText}>No logs found</Text>
              <Text style={styles.emptySubtext}>Start logging to see your history!</Text>
            </View>
          ) : (
            groupedData.map((dateGroup, index) => (
              <Animated.View key={dateGroup.dateString} entering={FadeInDown.delay(index * 100)}>
                <View style={styles.dateSection}>
                  <TouchableOpacity
                    style={[styles.dateHeader, { borderLeftColor: accentColor }]}
                    onPress={() => 
                      setSelectedDate(
                        selectedDate === dateGroup.dateString 
                          ? null 
                          : dateGroup.dateString
                      )
                    }
                  >
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateTitle}>
                        {formatDate(dateGroup.dateString)}
                      </Text>
                      <Text style={[styles.dateSubtitle, { color: accentColor }]}>
                        {getRelativeDate(dateGroup.dateString)} • {dateGroup.items.length} {dateGroup.items.length === 1 ? 'entry' : 'entries'}
                      </Text>
                    </View>
                    <Ionicons 
                      name={selectedDate === dateGroup.dateString ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={accentColor} 
                    />
                  </TouchableOpacity>

                  {selectedDate === dateGroup.dateString && (
                    <Animated.View entering={SlideInRight.duration(300)}>
                      <View style={styles.itemsContainer}>
                        {dateGroup.items.map((item, itemIndex) => (
                          <View key={item.id} style={styles.itemWrapper}>
                            {renderItem(
                              item,
                              () => onEditItem(item),
                              () => onDeleteItem(item)
                            )}
                          </View>
                        ))}
                      </View>
                    </Animated.View>
                  )}
                </View>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 2,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  dateSection: {
    marginBottom: 16,
  },
  dateHeader: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateInfo: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dateSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  itemsContainer: {
    marginTop: 8,
    paddingLeft: 20,
  },
  itemWrapper: {
    marginBottom: 8,
  },
});
