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
import { FitnessLog } from '../../types/types';

const exerciseTypes = [
  { id: 'pushups', name: 'Push-ups', unit: 'reps', icon: 'fitness', color: ['#ff6b6b', '#ff8e8e'] as const },
  { id: 'squats', name: 'Squats', unit: 'reps', icon: 'fitness', color: ['#4ecdc4', '#45b7aa'] as const },
  { id: 'pullups', name: 'Pull-ups', unit: 'reps', icon: 'fitness', color: ['#45b7d1', '#3498db'] as const },
  { id: 'crunches', name: 'Crunches', unit: 'reps', icon: 'fitness', color: ['#f39c12', '#e67e22'] as const },
  { id: 'running', name: 'Running', unit: 'km', icon: 'walk', color: ['#9b59b6', '#8e44ad'] as const },
];

export default function FitnessScreen() {
  const [logs, setLogs] = useStorage<FitnessLog[]>('fitnessLogs', []);
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [reps, setReps] = useState('');
  const [distance, setDistance] = useState('');
  const [pace, setPace] = useState('');
  const [currentLog, setCurrentLog] = useState<Partial<FitnessLog> | null>(null);

  const todayLogs = useMemo(() => {
    const today = new Date().toDateString();
    return logs.filter(log => new Date(log.timestamp).toDateString() === today);
  }, [logs]);

  const weeklyStats = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekLogs = logs.filter(log => new Date(log.timestamp) >= oneWeekAgo);
    
    const stats = exerciseTypes.reduce((acc, exercise) => {
      const exerciseLogs = weekLogs.filter(log => log.type === exercise.id);
      acc[exercise.id] = {
        total: exerciseLogs.reduce((sum, log) => sum + (log.reps || log.distance || 0), 0),
        count: exerciseLogs.length,
        unit: exercise.unit
      };
      return acc;
    }, {} as any);
    
    return stats;
  }, [logs]);

  const handleAddLog = () => {
    if (!selectedExercise) return;
    
    if (currentLog && currentLog.id) {
      // Editing existing log
      const updatedLog: FitnessLog = {
        ...currentLog,
        type: selectedExercise,
        ...(selectedExercise === 'running' 
          ? { distance: parseFloat(distance) || 0, pace } 
          : { reps: parseInt(reps) || 0 })
      } as FitnessLog;
      
      setLogs(logs.map(log => log.id === currentLog.id ? updatedLog : log));
    } else {
      // Adding new log
      const newLog: FitnessLog = {
        id: Date.now().toString(),
        type: selectedExercise,
        timestamp: new Date().toISOString(),
        ...(selectedExercise === 'running' 
          ? { distance: parseFloat(distance) || 0, pace } 
          : { reps: parseInt(reps) || 0 })
      };
      
      setLogs([newLog, ...logs]);
    }
    
    setModalVisible(false);
    // Reset form immediately
    setCurrentLog(null);
    setSelectedExercise('');
    setReps('');
    setDistance('');
    setPace('');
  };

  const handleEditLog = (log: FitnessLog) => {
    setCurrentLog(log);
    setSelectedExercise(log.type);
    if (log.reps !== undefined) setReps(log.reps.toString());
    if (log.distance !== undefined) setDistance(log.distance.toString());
    if (log.pace) setPace(log.pace);
    setModalVisible(true);
  };

  const handleOpenModal = () => {
    setCurrentLog(null);
    setSelectedExercise('');
    setReps('');
    setDistance('');
    setPace('');
    setModalVisible(true);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  const renderCalendarFitnessLog = (log: FitnessLog, onEdit: () => void, onDelete: () => void) => {
    const exerciseInfo = exerciseTypes.find(ex => ex.id === log.type);
    return (
      <View style={styles.calendarLogContainer}>
        <View style={styles.calendarLogContent}>
          <Text style={styles.calendarLogTitle}>
            {exerciseInfo?.name || log.type}
          </Text>
          <Text style={styles.calendarLogDetails}>
            {log.reps !== undefined ? `${log.reps} reps` : `${log.distance} km`}
            {log.pace && ` • Pace: ${log.pace}`}
          </Text>
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
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2'] as const} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <Text style={styles.headerTitle}>💪 Fitness Beast</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.headerButton}>
              <Ionicons name="calendar-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerIcon}>
              <Ionicons name="fitness" size={32} color="#ffffff" />
            </View>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Weekly Stats */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>🔥 Weekly Gains</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {exerciseTypes.map((exercise, index) => (
                <Animated.View 
                  key={exercise.id} 
                  entering={SlideInRight.delay(300 + index * 100)}
                >
                  <LinearGradient
                    colors={exercise.color}
                    style={styles.statCard}
                  >
                    <Ionicons name={exercise.icon as any} size={28} color="#ffffff" />
                    <Text style={styles.statValue}>
                      {weeklyStats[exercise.id]?.total || 0}
                    </Text>
                    <Text style={styles.statLabel}>{exercise.name}</Text>
                    <Text style={styles.statUnit}>{exercise.unit}</Text>
                  </LinearGradient>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Today's Logs */}
          <Animated.View entering={SlideInRight.delay(400)} style={styles.todayContainer}>
            <Text style={styles.sectionTitle}>🏆 Today's Victories</Text>
            {todayLogs.length === 0 ? (
              <Animated.View entering={FadeInUp.delay(600)}>
                <Text style={styles.emptyText}>Ready to crush some goals? 💥</Text>
              </Animated.View>
            ) : (
              <FlatList
                data={todayLogs}
                scrollEnabled={false}
                renderItem={({ item, index }) => {
                  const exercise = exerciseTypes.find(e => e.id === item.type);
                  return (
                    <Animated.View entering={FadeInDown.delay(index * 100)}>
                      <LinearGradient
                        colors={exercise?.color || (['#667eea', '#764ba2'] as const)}
                        style={styles.logItem}
                      >
                        <View style={styles.logContent}>
                          <Text style={styles.logType}>
                            {exercise?.name}
                          </Text>
                          <Text style={styles.logValue}>
                            {item.reps ? `${item.reps} reps` : `${item.distance} km`}
                            {item.pace && ` (${item.pace} min/km)`}
                          </Text>
                          <Text style={styles.logTime}>
                            {new Date(item.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => handleDeleteLog(item.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={22} color="#ffffff" />
                        </TouchableOpacity>
                      </LinearGradient>
                    </Animated.View>
                  );
                }}
                keyExtractor={item => item.id}
              />
            )}
          </Animated.View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleOpenModal}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#ff6b6b', '#ff8e8e'] as const} style={styles.addButtonGradient}>
            <Ionicons name="add" size={32} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <Modal 
          visible={modalVisible} 
          animationType="slide" 
          transparent={false}
          onRequestClose={() => setModalVisible(false)}
        >
          <LinearGradient colors={['#2c3e50', '#3498db'] as const} style={styles.modalGradient}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {currentLog?.id ? '✏️ Edit Workout' : '🔥 Log Workout'}
                  </Text>
                  <TouchableOpacity onPress={handleAddLog}>
                    <Text style={styles.saveButton}>Save</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalContent}>
                  <Text style={styles.inputLabel}>💪 Choose Your Exercise</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseSelector}>
                    {exerciseTypes.map((exercise) => (
                      <TouchableOpacity
                        key={exercise.id}
                        style={styles.exerciseOptionContainer}
                        onPress={() => setSelectedExercise(exercise.id)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={selectedExercise === exercise.id ? exercise.color : (['#34495e', '#2c3e50'] as const)}
                          style={[
                            styles.exerciseOption,
                            selectedExercise === exercise.id && styles.exerciseOptionSelected
                          ]}
                        >
                          <Ionicons 
                            name={exercise.icon as any} 
                            size={28} 
                            color="#ffffff"
                          />
                          <Text style={styles.exerciseOptionText}>
                            {exercise.name}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {selectedExercise && selectedExercise !== 'running' && (
                    <Animated.View entering={FadeInDown.duration(300)}>
                      <Text style={styles.inputLabel}>🔢 Repetitions</Text>
                      <TextInput
                        placeholder="How many reps did you crush?"
                        value={reps}
                        onChangeText={setReps}
                        style={styles.input}
                        keyboardType="numeric"
                        placeholderTextColor="#95a5a6"
                      />
                    </Animated.View>
                  )}

                  {selectedExercise === 'running' && (
                    <Animated.View entering={FadeInDown.duration(300)}>
                      <Text style={styles.inputLabel}>🏃‍♂️ Distance (km)</Text>
                      <TextInput
                        placeholder="How far did you run?"
                        value={distance}
                        onChangeText={setDistance}
                        style={styles.input}
                        keyboardType="numeric"
                        placeholderTextColor="#95a5a6"
                      />
                      <Text style={styles.inputLabel}>⏱️ Pace (min/km)</Text>
                      <TextInput
                        placeholder="e.g., 5:30"
                        value={pace}
                        onChangeText={setPace}
                        style={styles.input}
                        placeholderTextColor="#95a5a6"
                      />
                    </Animated.View>
                  )}
                </ScrollView>
              </SafeAreaView>
            </LinearGradient>
        </Modal>

        <SimpleCalendar
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          data={logs}
          getItemDate={(log: FitnessLog) => log.timestamp}
          renderItem={renderCalendarFitnessLog}
          onEditItem={handleEditLog}
          onDeleteItem={(log: FitnessLog) => handleDeleteLog(log.id)}
          title="Fitness"
          accentColor="#667eea"
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
  statsContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  statCard: {
    alignItems: 'center',
    marginRight: 16,
    padding: 16,
    borderRadius: 16,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  statUnit: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  todayContainer: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 20,
    fontSize: 16,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  logContent: {
    flex: 1,
  },
  logType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  logTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: 30,
    shadowColor: '#ff6b6b',
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
  exerciseSelector: {
    marginBottom: 20,
  },
  exerciseOptionContainer: {
    marginRight: 16,
  },
  exerciseOption: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  exerciseOptionSelected: {
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  exerciseOptionText: {
    fontSize: 13,
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
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
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
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
  calendarLogDetails: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  calendarLogTime: {
    fontSize: 12,
    color: '#64748b',
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
