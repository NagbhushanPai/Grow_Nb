import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Modal, TextInput, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useStorage } from '../../hooks/useStorage';
import { Task } from '../../types/types';

export default function TodoScreen() {
  const [tasks, setTasks] = useStorage<Task[]>('tasks', []);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);

  const handleAddTask = () => {
    setCurrentTask({ title: '', description: '', dueDate: '' });
    setModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setModalVisible(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleSaveTask = () => {
    if (!currentTask?.title?.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    // Validate date format if provided
    if (currentTask.dueDate && currentTask.dueDate.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(currentTask.dueDate)) {
        Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
        return;
      }
    }

    if (currentTask && currentTask.title?.trim()) {
      if (currentTask.id) {
        // Edit existing task
        setTasks(
          tasks.map(task =>
            task.id === currentTask.id 
              ? { ...currentTask, timestamp: task.timestamp || new Date().toISOString() } as Task 
              : task
          )
        );
      } else {
        // Add new task
        const newTask: Task = {
          id: Date.now().toString(),
          title: currentTask.title.trim(),
          description: currentTask.description || '',
          completed: false,
          dueDate: currentTask.dueDate,
          timestamp: new Date().toISOString()
        };
        setTasks([newTask, ...tasks]);
      }
      setModalVisible(false);
      setCurrentTask(null);
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={styles.taskItem} 
      onPress={() => handleEditTask(item)}
      activeOpacity={0.8}
    >
      <View style={styles.taskContent}>
        <TouchableOpacity 
          style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
          onPress={() => handleToggleTask(item.id)}
        >
          {item.completed && <Ionicons name="checkmark" size={16} color="#ffffff" />}
        </TouchableOpacity>
        
        <View style={styles.taskText}>
          <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.taskDescription}>{item.description}</Text>
          )}
          {item.dueDate && (
            <Text style={styles.taskDueDate}>Due: {item.dueDate}</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = tasks.length > 0 ? completedTasks / tasks.length : 0;

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✅ Task Master</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="checkbox" size={32} color="#ffffff" />
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <LinearGradient colors={['#ffffff', '#f0fdf4']} style={styles.progressGradient}>
            <Text style={styles.progressLabel}>🎯 Progress ({completedTasks}/{tasks.length})</Text>
            <View style={styles.progressBarContainer}>
              <LinearGradient 
                colors={['#10b981', '#34d399']}
                style={[styles.progressBarFill, { width: `${progress * 100}%` }]} 
              />
            </View>
          </LinearGradient>
        </View>

        {/* Task List */}
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          style={styles.taskList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>No tasks yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first task</Text>
            </View>
          }
        />

        {/* Add Button */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddTask}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#ff6b6b', '#ee5a24']} style={styles.addButtonGradient}>
            <Ionicons name="add" size={32} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Add/Edit Task Modal */}
        <Modal 
          visible={modalVisible} 
          animationType="slide" 
          transparent={false}
        >
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modalGradient}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => {
                  setModalVisible(false);
                  setCurrentTask(null);
                }}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {currentTask?.id ? '✏️ Edit Task' : '✨ New Task'}
                </Text>
                <TouchableOpacity onPress={handleSaveTask}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <Text style={styles.inputLabel}>📝 Task Title</Text>
                <TextInput
                  placeholder="What needs to be done?"
                  value={currentTask?.title || ''}
                  onChangeText={text => setCurrentTask({ ...currentTask, title: text })}
                  style={styles.input}
                  placeholderTextColor="#95a5a6"
                  autoFocus
                />
                
                <Text style={styles.inputLabel}>📄 Description</Text>
                <TextInput
                  placeholder="Add some details..."
                  value={currentTask?.description || ''}
                  onChangeText={text => setCurrentTask({ ...currentTask, description: text })}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#95a5a6"
                />
                
                <Text style={styles.inputLabel}>📅 Due Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={currentTask?.dueDate || ''}
                  onChangeText={text => setCurrentTask({ ...currentTask, dueDate: text })}
                  style={styles.input}
                  placeholderTextColor="#95a5a6"
                />
              </View>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
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
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  progressGradient: {
    padding: 20,
    borderRadius: 20,
  },
  progressLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskText: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 2,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: 32,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  addButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    height: 100,
    textAlignVertical: 'top',
  },
});
