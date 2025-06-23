import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioProvider';

export default function BottomPlayer() {
  const navigation = useNavigation();
  const { currentTrack, isPlaying, pause, resume, playPrevTrack, playNextTrack } = useAudio();

  const fadeAnim = useRef(new Animated.Value(0)).current; // start z opacity 0 (niewidoczny)

  useEffect(() => {
    if (currentTrack) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  const goToPlayer = () =>
    navigation.navigate('Player', {
      title: currentTrack.title,
      file: currentTrack.file,
      cover: currentTrack.cover,
    });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Pressable style={styles.info} onPress={goToPlayer}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.sub}>Odtwarzanie...</Text>
      </Pressable>

      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrevTrack} style={styles.controlButton}>
          <Text style={styles.icon}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => (isPlaying ? pause() : resume())}
          style={styles.controlButton}
        >
          <Text style={styles.icon}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={playNextTrack} style={styles.controlButton}>
          <Text style={styles.icon}>⏭</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#333',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  trackTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  sub: {
    color: 'gray',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    paddingHorizontal: 10,
  },
  icon: {
    fontSize: 24,
    color: 'limegreen',
  },
});
