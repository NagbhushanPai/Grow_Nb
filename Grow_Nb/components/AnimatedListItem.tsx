import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface AnimatedListItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  onDelete?: () => void;
  enableSwipeToDelete?: boolean;
  index?: number;
}

export default function AnimatedListItem({ 
  children, 
  onPress, 
  onDelete,
  enableSwipeToDelete = false,
  index = 0
}: AnimatedListItemProps) {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
    };
  });

  const deleteAnimatedStyle = useAnimatedStyle(() => {
    const opacity = translateX.value < -50 ? 1 : 0;
    return {
      opacity,
      transform: [{ scale: translateX.value < -50 ? 1 : 0.8 }],
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (enableSwipeToDelete && event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -120);
      }
    })
    .onEnd((event) => {
      if (enableSwipeToDelete && event.translationX < -80 && onDelete) {
        translateX.value = withSpring(-200, {}, () => {
          runOnJS(onDelete)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  const combinedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  return (
    <Animated.View 
      entering={FadeIn.delay(index * 100).springify()}
      exiting={FadeOut.springify()}
      style={styles.container}
    >
      <View style={styles.deleteBackground}>
        <Animated.View style={[styles.deleteButton, deleteAnimatedStyle]}>
          <Animated.Text style={styles.deleteText}>Delete</Animated.Text>
        </Animated.View>
      </View>
      
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 4,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
