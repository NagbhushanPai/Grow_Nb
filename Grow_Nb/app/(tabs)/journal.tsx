import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  SlideInRight, 
  FadeInUp
} from 'react-native-reanimated';
import { useStorage } from '../../hooks/useStorage';
import SimpleCalendar from '../../components/SimpleCalendar';
import { JournalEntry } from '../../types/types';

const moodEmojis = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
};

const moodGradients = {
  happy: ['#10b981', '#34d399'] as const,
  neutral: ['#f59e0b', '#fbbf24'] as const,
  sad: ['#ef4444', '#f87171'] as const,
};

const moodColors = {
  happy: '#10b981',
  neutral: '#f59e0b',
  sad: '#ef4444',
};

export default function JournalScreen() {
  const [entries, setEntries] = useStorage<JournalEntry[]>('journalEntries', []);
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [whatHappened, setWhatHappened] = useState('');
  const [gratefulItems, setGratefulItems] = useState(['', '', '']);
  const [selectedMood, setSelectedMood] = useState<'happy' | 'neutral' | 'sad'>('happy');
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry> | null>(null);

  const todayEntry = useMemo(() => {
    const today = new Date().toDateString();
    return entries.find(entry => new Date(entry.timestamp).toDateString() === today);
  }, [entries]);

  const recentEntries = useMemo(() => {
    return entries
      .filter(entry => new Date(entry.timestamp).toDateString() !== new Date().toDateString())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7);
  }, [entries]);

  const moodStats = useMemo(() => {
    const last7Days = entries.slice(-7);
    const moodCounts = last7Days.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return moodCounts;
  }, [entries]);

  const handleSaveEntry = () => {
    if (!whatHappened.trim()) return;
    
    const validGratefulItems = gratefulItems.filter(item => item.trim());
    
    if (currentEntry && currentEntry.id) {
      // Editing existing entry
      const updatedEntry: JournalEntry = {
        ...currentEntry,
        whatHappened: whatHappened.trim(),
        gratefulFor: validGratefulItems,
        mood: selectedMood,
      } as JournalEntry;
      
      setEntries(entries.map(entry => 
        entry.id === currentEntry.id ? updatedEntry : entry
      ));
    } else {
      // Adding new entry or updating today's entry
      const newEntry: JournalEntry = {
        id: todayEntry?.id || Date.now().toString(),
        whatHappened: whatHappened.trim(),
        gratefulFor: validGratefulItems,
        mood: selectedMood,
        timestamp: todayEntry?.timestamp || new Date().toISOString(),
      };
      
      if (todayEntry) {
        setEntries(entries.map(entry => 
          entry.id === todayEntry.id ? newEntry : entry
        ));
      } else {
        setEntries([newEntry, ...entries]);
      }
    }
    
    setModalVisible(false);
    // Reset form immediately
    setCurrentEntry(null);
    setWhatHappened('');
    setGratefulItems(['', '', '']);
    setSelectedMood('happy');
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setWhatHappened(entry.whatHappened);
    setGratefulItems([
      entry.gratefulFor[0] || '',
      entry.gratefulFor[1] || '',
      entry.gratefulFor[2] || '',
    ]);
    setSelectedMood(entry.mood);
    setModalVisible(true);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleOpenModal = () => {
    setCurrentEntry(null);
    if (todayEntry) {
      setWhatHappened(todayEntry.whatHappened);
      setGratefulItems([
        todayEntry.gratefulFor[0] || '',
        todayEntry.gratefulFor[1] || '',
        todayEntry.gratefulFor[2] || '',
      ]);
      setSelectedMood(todayEntry.mood);
    } else {
      setWhatHappened('');
      setGratefulItems(['', '', '']);
      setSelectedMood('happy');
    }
    setModalVisible(true);
  };

  const renderCalendarJournalEntry = (entry: JournalEntry, onEdit: () => void, onDelete: () => void) => (
    <View style={styles.calendarEntryContainer}>
      <View style={styles.calendarEntryContent}>
        <View style={styles.calendarEntryHeader}>
          <Text style={styles.calendarEntryMood}>
            {moodEmojis[entry.mood]} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
          </Text>
          <Text style={styles.calendarEntryTime}>
            {new Date(entry.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <Text style={styles.calendarEntryText} numberOfLines={3}>
          {entry.whatHappened}
        </Text>
        {entry.gratefulFor.length > 0 && (
          <Text style={styles.calendarEntryGrateful}>
            Grateful for: {entry.gratefulFor.slice(0, 2).join(', ')}
            {entry.gratefulFor.length > 2 && '...'}
          </Text>
        )}
      </View>
      <View style={styles.calendarEntryActions}>
        <TouchableOpacity onPress={onEdit} style={styles.calendarActionButton}>
          <Ionicons name="create-outline" size={18} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.calendarActionButton}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const updateGratefulItem = (index: number, value: string) => {
    const newItems = [...gratefulItems];
    newItems[index] = value;
    setGratefulItems(newItems);
  };

  return (
    <LinearGradient colors={['#fbbf24', '#f59e0b'] as const} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <Text style={styles.headerTitle}>📖 Journal of Joy</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.headerButton}>
              <Ionicons name="calendar-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerIcon}>
              <Ionicons name="book" size={32} color="#ffffff" />
            </View>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Today's Entry */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.todayContainer}>
            <LinearGradient colors={['#ffffff', '#fef3c7'] as const} style={styles.todayGradient}>
              <View style={styles.todayHeader}>
                <Text style={styles.sectionTitle}>✨ Today's Reflection</Text>
                <TouchableOpacity onPress={handleOpenModal} style={styles.editButton}>
                  <Ionicons 
                    name={todayEntry ? "pencil" : "add"} 
                    size={24} 
                    color="#ffffff" 
                  />
                </TouchableOpacity>
              </View>
              
              {todayEntry ? (
                <View style={styles.entryContent}>
                  <LinearGradient 
                    colors={moodGradients[todayEntry.mood]} 
                    style={styles.moodIndicator}
                  >
                    <Text style={styles.moodEmoji}>
                      {moodEmojis[todayEntry.mood]}
                    </Text>
                    <Text style={styles.moodText}>
                      {todayEntry.mood.charAt(0).toUpperCase() + todayEntry.mood.slice(1)}
                    </Text>
                  </LinearGradient>
                  
                  <Text style={styles.entryText}>{todayEntry.whatHappened}</Text>
                  
                  {todayEntry.gratefulFor.length > 0 && (
                    <LinearGradient colors={['#fef3c7', '#fde68a'] as const} style={styles.gratefulSection}>
                      <Text style={styles.gratefulTitle}>🙏 Grateful for:</Text>
                      {todayEntry.gratefulFor.map((item, index) => (
                        <Text key={index} style={styles.gratefulItem}>
                          • {item}
                        </Text>
                      ))}
                    </LinearGradient>
                  )}
                </View>
              ) : (
                <Animated.View entering={FadeInUp.delay(600)}>
                  <Text style={styles.emptyText}>Ready to capture today's moments? ✍️</Text>
                </Animated.View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Mood Statistics */}
          <Animated.View entering={SlideInRight.delay(400)} style={styles.moodStatsContainer}>
            <LinearGradient colors={['#ffffff', '#f0fdf4'] as const} style={styles.moodStatsGradient}>
              <Text style={styles.sectionTitle}>📊 This Week's Mood Journey</Text>
              <View style={styles.moodStatsGrid}>
                {Object.entries(moodStats).map(([mood, count], index) => (
                  <Animated.View 
                    key={mood} 
                    entering={FadeInDown.delay(500 + index * 100)}
                  >
                    <LinearGradient
                      colors={moodGradients[mood as keyof typeof moodGradients]}
                      style={styles.moodStatItem}
                    >
                      <Text style={styles.moodStatEmoji}>
                        {moodEmojis[mood as keyof typeof moodEmojis]}
                      </Text>
                      <Text style={styles.moodStatCount}>{count}</Text>
                      <Text style={styles.moodStatLabel}>
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </Text>
                    </LinearGradient>
                  </Animated.View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Recent Entries */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.recentContainer}>
            <LinearGradient colors={['#ffffff', '#f8fafc'] as const} style={styles.recentGradient}>
              <Text style={styles.sectionTitle}>🕒 Recent Memories</Text>
              {recentEntries.length === 0 ? (
                <Text style={styles.emptyText}>Your journey starts here 🌟</Text>
              ) : (
                <FlatList
                  data={recentEntries}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 100)}>
                      <LinearGradient
                        colors={moodGradients[item.mood]}
                        style={styles.recentEntry}
                      >
                        <View style={styles.recentEntryHeader}>
                          <Text style={styles.recentEntryDate}>
                            {new Date(item.timestamp).toLocaleDateString()}
                          </Text>
                          <Text style={styles.recentMoodEmoji}>
                            {moodEmojis[item.mood]}
                          </Text>
                        </View>
                        <Text style={styles.recentEntryText} numberOfLines={2}>
                          {item.whatHappened}
                        </Text>
                      </LinearGradient>
                    </Animated.View>
                  )}
                  keyExtractor={item => item.id}
                />
              )}
            </LinearGradient>
          </Animated.View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleOpenModal}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#f59e0b', '#d97706'] as const} style={styles.addButtonGradient}>
            <Ionicons name={todayEntry ? "pencil" : "add"} size={32} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <Modal 
          visible={modalVisible} 
          animationType="slide" 
          transparent={false}
          onRequestClose={() => setModalVisible(false)}
        >
          <LinearGradient colors={['#fbbf24', '#f59e0b'] as const} style={styles.modalGradient}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {currentEntry?.id ? '✏️ Edit Journal Entry' : '📖 Today\'s Journal'}
                </Text>
                <TouchableOpacity onPress={handleSaveEntry}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
              </View>
                
                <ScrollView style={styles.modalContent}>
                  <Text style={styles.inputLabel}>😊 How are you feeling today?</Text>
                  <View style={styles.moodSelector}>
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <TouchableOpacity
                        key={mood}
                        style={styles.moodOptionContainer}
                        onPress={() => setSelectedMood(mood as 'happy' | 'neutral' | 'sad')}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={selectedMood === mood ? moodGradients[mood as keyof typeof moodGradients] : (['#34495e', '#2c3e50'] as const)}
                          style={[
                            styles.moodOption,
                            selectedMood === mood && styles.moodOptionSelected
                          ]}
                        >
                          <Text style={styles.moodOptionEmoji}>{emoji}</Text>
                          <Text style={styles.moodOptionText}>
                            {mood.charAt(0).toUpperCase() + mood.slice(1)}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>📝 What happened today?</Text>
                  <TextInput
                    placeholder="Tell me about your day..."
                    value={whatHappened}
                    onChangeText={setWhatHappened}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={6}
                    placeholderTextColor="#95a5a6"
                  />

                  <Text style={styles.inputLabel}>🙏 What are you grateful for?</Text>
                  {gratefulItems.map((item, index) => (
                    <TextInput
                      key={index}
                      placeholder={`Grateful item ${index + 1}`}
                      value={item}
                      onChangeText={(text) => updateGratefulItem(index, text)}
                      style={styles.input}
                      placeholderTextColor="#95a5a6"
                    />
                  ))}
                </ScrollView>
              </SafeAreaView>
            </LinearGradient>
        </Modal>

        <SimpleCalendar
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          data={entries}
          getItemDate={(entry: JournalEntry) => entry.timestamp}
          renderItem={renderCalendarJournalEntry}
          onEditItem={handleEditEntry}
          onDeleteItem={(entry: JournalEntry) => handleDeleteEntry(entry.id)}
          title="Journal"
          accentColor="#f59e0b"
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  todayContainer: {
    margin: 20,
    borderRadius: 20,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  todayGradient: {
    padding: 24,
    borderRadius: 20,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  entryContent: {
    marginTop: 8,
  },
  moodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  moodText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  entryText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  gratefulSection: {
    padding: 16,
    borderRadius: 12,
  },
  gratefulTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  gratefulItem: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 20,
    fontSize: 16,
  },
  moodStatsContainer: {
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  moodStatsGradient: {
    padding: 20,
    borderRadius: 20,
  },
  moodStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  moodStatItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  moodStatEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  moodStatCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moodStatLabel: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
    fontWeight: '600',
  },
  recentContainer: {
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 100,
  },
  recentGradient: {
    padding: 20,
    borderRadius: 20,
  },
  recentEntry: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  recentEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentEntryDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  recentMoodEmoji: {
    fontSize: 20,
  },
  recentEntryText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: 30,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  addButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cancelButton: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  saveButton: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 24,
    flex: 1,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  moodOptionContainer: {
    marginHorizontal: 4,
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  moodOptionSelected: {
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  moodOptionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#2c3e50',
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  calendarEntryContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  calendarEntryContent: {
    flex: 1,
    marginRight: 12,
  },
  calendarEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarEntryMood: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  calendarEntryTime: {
    fontSize: 12,
    color: '#64748b',
  },
  calendarEntryText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    lineHeight: 20,
  },
  calendarEntryGrateful: {
    fontSize: 12,
    color: '#10b981',
    fontStyle: 'italic',
  },
  calendarEntryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
