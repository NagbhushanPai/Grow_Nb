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
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { useStorage } from '../../hooks/useStorage';
import SimpleCalendar from '../../components/SimpleCalendar';
import { CodingLog } from '../../types/types';

const difficulties = ['Easy', 'Medium', 'Hard'] as const;

export default function CodingScreen() {
  const [logs, setLogs] = useStorage<CodingLog[]>('codingLogs', []);
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [learned, setLearned] = useState('');
  const [problemTitle, setProblemTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [currentLog, setCurrentLog] = useState<Partial<CodingLog> | null>(null);

  const streak = useMemo(() => {
    if (logs.length === 0) return 0;
    
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].timestamp);
      const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  }, [logs]);

  const todayLogs = useMemo(() => {
    const today = new Date().toDateString();
    return logs.filter(log => new Date(log.timestamp).toDateString() === today);
  }, [logs]);

  const handleAddLog = () => {
    if (!learned.trim()) return;
    
    if (currentLog && currentLog.id) {
      // Editing existing log
      const updatedLog: CodingLog = {
        ...currentLog,
        learned: learned.trim(),
        ...(problemTitle.trim() && {
          leetcodeProblem: {
            title: problemTitle.trim(),
            difficulty,
            link: link.trim(),
            notes: notes.trim(),
          }
        })
      } as CodingLog;
      
      setLogs(logs.map(log => log.id === currentLog.id ? updatedLog : log));
    } else {
      // Adding new log
      const newLog: CodingLog = {
        id: Date.now().toString(),
        learned: learned.trim(),
        timestamp: new Date().toISOString(),
        ...(problemTitle.trim() && {
          leetcodeProblem: {
            title: problemTitle.trim(),
            difficulty,
            link: link.trim(),
            notes: notes.trim(),
          }
        })
      };
      
      setLogs([newLog, ...logs]);
    }
    
    // Reset form and close modal
    setModalVisible(false);
    setCurrentLog(null);
    setLearned('');
    setProblemTitle('');
    setLink('');
    setNotes('');
    setDifficulty('Easy');
  };

  const handleEditLog = (log: CodingLog) => {
    setCurrentLog(log);
    setLearned(log.learned);
    if (log.leetcodeProblem) {
      setProblemTitle(log.leetcodeProblem.title);
      setDifficulty(log.leetcodeProblem.difficulty);
      setLink(log.leetcodeProblem.link);
      setNotes(log.leetcodeProblem.notes);
    } else {
      setProblemTitle('');
      setLink('');
      setNotes('');
      setDifficulty('Easy');
    }
    setModalVisible(true);
  };

  const handleOpenModal = (type?: 'learning' | 'leetcode') => {
    setCurrentLog(null);
    setLearned('');
    setLink('');
    setNotes('');
    setDifficulty('Easy');
    
    if (type === 'leetcode') {
      setProblemTitle('Problem Title');
    } else {
      setProblemTitle('');
    }
    setModalVisible(true);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  const renderCalendarCodingLog = (log: CodingLog, onEdit: () => void, onDelete: () => void) => (
    <View style={styles.calendarLogContainer}>
      <View style={styles.calendarLogContent}>
        {log.leetcodeProblem ? (
          <>
            <Text style={styles.calendarLogTitle}>
              ⚡ {log.leetcodeProblem.title}
            </Text>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(log.leetcodeProblem.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {log.leetcodeProblem.difficulty}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.calendarLogTitle}>💡 Quick Learning</Text>
        )}
        <Text style={styles.calendarLogLearning}>{log.learned}</Text>
        {log.leetcodeProblem?.notes && (
          <Text style={styles.calendarLogNotes}>💭 {log.leetcodeProblem.notes}</Text>
        )}
        <Text style={styles.calendarLogTime}>
          {new Date(log.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      <View style={styles.calendarLogActions}>
        <TouchableOpacity onPress={onEdit} style={styles.calendarActionButton}>
          <Ionicons name="create-outline" size={18} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.calendarActionButton}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coding Log</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.headerButton}>
            <Ionicons name="calendar-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Ionicons name="code-slash" size={32} color="#8b5cf6" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Streak Counter */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.streakContainer}>
          <View style={styles.streakContent}>
            <Ionicons name="flame" size={32} color="#f59e0b" />
            <View style={styles.streakTextContainer}>
              <Text style={styles.streakNumber}>
                {streak}
              </Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          {streak > 0 && (
            <Text style={styles.streakMessage}>
              🎉 Keep the momentum going!
            </Text>
          )}
        </Animated.View>

        {/* Quick Learning Section */}
        <Animated.View entering={SlideInRight.delay(300)} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="bulb" size={24} color="#10b981" />
              <Text style={styles.sectionTitle}>💡 Quick Learning</Text>
            </View>
            <TouchableOpacity 
              style={styles.quickAddButton}
              onPress={() => handleOpenModal('learning')}
            >
              <Ionicons name="add-circle" size={28} color="#10b981" />
            </TouchableOpacity>
          </View>
          
          {todayLogs.filter(log => !log.leetcodeProblem).length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>📚 Log what you learned today!</Text>
              <Text style={styles.emptySubtext}>Quick notes, tutorials, concepts...</Text>
            </View>
          ) : (
            <FlatList
              data={todayLogs.filter(log => !log.leetcodeProblem)}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 100)}>
                  <View style={styles.learningItem}>
                    <View style={styles.learningContent}>
                      <Text style={styles.learningText}>{item.learned}</Text>
                      <Text style={styles.learningTime}>
                        {new Date(item.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteLog(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
              keyExtractor={item => item.id}
            />
          )}
        </Animated.View>

        {/* LeetCode Practice Section */}
        <Animated.View entering={SlideInRight.delay(400)} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="code-working" size={24} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>⚡ LeetCode Practice</Text>
            </View>
            <TouchableOpacity 
              style={styles.leetcodeAddButton}
              onPress={() => handleOpenModal('leetcode')}
            >
              <Ionicons name="add-circle" size={28} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
          
          {todayLogs.filter(log => log.leetcodeProblem).length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>🚀 Solve a problem today!</Text>
              <Text style={styles.emptySubtext}>Track your problem-solving journey...</Text>
            </View>
          ) : (
            <FlatList
              data={todayLogs.filter(log => log.leetcodeProblem)}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 100)}>
                  <View style={styles.problemItem}>
                    <View style={styles.problemContent}>
                      <View style={styles.problemHeader}>
                        <Text style={styles.problemTitle}>
                          {item.leetcodeProblem?.title}
                        </Text>
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: getDifficultyColor(item.leetcodeProblem?.difficulty || 'Easy') }
                        ]}>
                          <Text style={styles.difficultyText}>
                            {item.leetcodeProblem?.difficulty}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.problemLearning}>{item.learned}</Text>
                      {item.leetcodeProblem?.notes && (
                        <Text style={styles.problemNotes}>
                          💭 {item.leetcodeProblem.notes}
                        </Text>
                      )}
                      <Text style={styles.problemTime}>
                        {new Date(item.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteLog(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
              keyExtractor={item => item.id}
            />
          )}
        </Animated.View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {currentLog?.id 
                ? (problemTitle ? '✏️ Edit LeetCode' : '✏️ Edit Learning') 
                : (problemTitle ? '⚡ LeetCode Problem' : '💡 Quick Learning')
              }
            </Text>
            <TouchableOpacity onPress={handleAddLog}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>What did you learn today? *</Text>
            <TextInput
              placeholder="Describe what you learned..."
              value={learned}
              onChangeText={setLearned}
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.inputLabel}>LeetCode Problem (Optional)</Text>
            <TextInput
              placeholder="Problem title"
              value={problemTitle}
              onChangeText={setProblemTitle}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />

            {problemTitle.trim() && (
              <>
                <Text style={styles.inputLabel}>Difficulty</Text>
                <View style={styles.difficultySelector}>
                  {difficulties.map((diff) => (
                    <TouchableOpacity
                      key={diff}
                      style={[
                        styles.difficultyOption,
                        { borderColor: getDifficultyColor(diff) },
                        difficulty === diff && { backgroundColor: getDifficultyColor(diff) }
                      ]}
                      onPress={() => setDifficulty(diff)}
                    >
                      <Text style={[
                        styles.difficultyOptionText,
                        { color: getDifficultyColor(diff) },
                        difficulty === diff && { color: 'white' }
                      ]}>
                        {diff}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Problem Link</Text>
                <TextInput
                  placeholder="https://leetcode.com/problems/..."
                  value={link}
                  onChangeText={setLink}
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  placeholder="Any additional notes..."
                  value={notes}
                  onChangeText={setNotes}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9ca3af"
                />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      <SimpleCalendar
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        data={logs}
        getItemDate={(log: CodingLog) => log.timestamp}
        renderItem={renderCalendarCodingLog}
        onEditItem={handleEditLog}
        onDeleteItem={(log: CodingLog) => handleDeleteLog(log.id)}
        title="Coding"
        accentColor="#8b5cf6"
      />
    </SafeAreaView>
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
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 2,
    borderBottomColor: '#8b5cf6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  streakContainer: {
    margin: 20,
    padding: 25,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTextContainer: {
    alignItems: 'center',
    marginLeft: 16,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  streakLabel: {
    fontSize: 16,
    color: '#a855f7',
    fontWeight: '600',
  },
  streakMessage: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#10b981',
    fontWeight: '500',
  },
  // Section Styles
  sectionContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.3)',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  quickAddButton: {
    padding: 4,
  },
  leetcodeAddButton: {
    padding: 4,
  },
  emptySection: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#a855f7',
    fontStyle: 'italic',
    fontSize: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  // Learning Item Styles
  learningItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 6,
    marginHorizontal: 15,
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  learningContent: {
    flex: 1,
  },
  learningText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    fontWeight: '500',
  },
  learningTime: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 8,
    fontWeight: '500',
  },
  // Problem Item Styles
  problemItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 6,
    marginHorizontal: 15,
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  problemContent: {
    flex: 1,
  },
  problemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  problemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#60a5fa',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  problemNotes: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
    fontStyle: 'italic',
  },
  problemLearning: {
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 22,
    marginTop: 8,
    fontStyle: 'italic',
  },
  problemTime: {
    fontSize: 12,
    color: '#8b5cf6',
    marginTop: 8,
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 2,
    borderBottomColor: '#8b5cf6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cancelButton: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a855f7',
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
    color: '#ffffff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  difficultySelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  difficultyOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    marginRight: 15,
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
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
  calendarLogContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  calendarLogContent: {
    flex: 1,
    marginRight: 12,
  },
  calendarLogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  calendarLogLearning: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  calendarLogNotes: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  calendarLogTime: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  calendarLogActions: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
