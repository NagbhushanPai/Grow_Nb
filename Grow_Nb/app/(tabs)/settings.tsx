import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  SlideInRight
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exportData } from '../../utils/exportData';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleExportData = async () => {
    try {
      await exportData();
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your tasks, fitness logs, coding logs, and journal entries. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    gradientColors = ['#6b7280', '#9ca3af']
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    gradientColors?: readonly [string, string];
  }) => (
    <TouchableOpacity style={styles.settingItemContainer} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={gradientColors} style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={24} color="#ffffff" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {rightComponent || (
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.8)" />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2'] as const} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="settings" size={32} color="#ffffff" />
          </View>
        </Animated.View>

        <View style={styles.content}>
          {/* App Preferences */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 Preferences</Text>
            
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Switch to dark theme"
              gradientColors={['#4c51bf', '#667eea'] as const}
              rightComponent={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
                  thumbColor={darkMode ? '#ffffff' : '#ffffff'}
                />
              }
            />
            
            <SettingItem
              icon="notifications"
              title="Notifications"
              subtitle="Daily reminders and encouragements"
              gradientColors={['#8b5cf6', '#a855f7'] as const}
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
                  thumbColor={notifications ? '#ffffff' : '#ffffff'}
                />
              }
            />
          </Animated.View>

          {/* Data Management */}
          <Animated.View entering={SlideInRight.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>💾 Data Management</Text>
            
            <SettingItem
              icon="download"
              title="Export Data"
              subtitle="Download all your data as JSON"
              onPress={handleExportData}
              gradientColors={['#10b981', '#34d399'] as const}
            />
            
            <SettingItem
              icon="trash"
              title="Clear All Data"
              subtitle="Permanently delete all app data"
              onPress={handleClearData}
              gradientColors={['#ef4444', '#f87171'] as const}
            />
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ About</Text>
            
            <SettingItem
              icon="information-circle"
              title="App Version"
              subtitle="1.0.0"
              gradientColors={['#3b82f6', '#60a5fa'] as const}
            />
            
            <SettingItem
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help with using the app"
              gradientColors={['#f59e0b', '#fbbf24'] as const}
            />
            
            <SettingItem
              icon="star"
              title="Rate the App"
              subtitle="Leave a review on the App Store"
              gradientColors={['#f59e0b', '#fbbf24'] as const}
            />
          </Animated.View>

          {/* App Info */}
          <Animated.View entering={FadeInDown.delay(800)} style={styles.infoContainer}>
            <LinearGradient colors={['#ffffff', '#f8fafc'] as const} style={styles.infoGradient}>
              <Text style={styles.infoTitle}>🚀 Productivity App</Text>
              <Text style={styles.infoSubtitle}>
                Track your tasks, fitness, coding progress, and daily reflections all in one place.
              </Text>
              <Text style={styles.infoVersion}>
                Built with React Native & TypeScript ❤️
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>
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
  content: {
    padding: 20,
    flex: 1,
  },
  section: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    padding: 20,
    paddingBottom: 12,
  },
  settingItemContainer: {
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  infoContainer: {
    borderRadius: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  infoGradient: {
    padding: 24,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoVersion: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
