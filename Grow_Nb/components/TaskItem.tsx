import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Task } from '../types/types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleToggle = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onToggle(task.id);
  };

  return (
    <Animated.View 
      entering={FadeIn.springify()} 
      exiting={FadeOut.springify()} 
      style={[styles.container, animatedStyle]}
    >
      <TouchableOpacity onPress={handleToggle} style={styles.taskContainer}>
        <View style={[
          styles.checkbox,
          task.completed && styles.checkboxCompleted
        ]}>
          {task.completed && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, task.completed && styles.completedText]}>
            {task.title}
          </Text>
          {task.description && (
            <Text style={[styles.description, task.completed && styles.completedText]}>
              {task.description}
            </Text>
          )}
          {task.dueDate && (
            <Text style={[styles.dueDate, task.completed && styles.completedText]}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#6366f1',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
