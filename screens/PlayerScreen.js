import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { useAudio } from '../context/AudioProvider';

export default function PlayerScreen() {
  const {
    currentTrack,
    isPlaying,
    pause,
    resume,
    playNextTrack,
    playPrevTrack,
  } = useAudio();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const coverAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    coverAnim.setValue(0);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(coverAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentTrack]);

  if (!currentTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Brak wybranego utworu</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Odtwarzanie utworu</Text>

      <Animated.View style={[styles.coverWrap, { transform: [{ scale: coverAnim }] }]}>
        {currentTrack.cover && <Image source={currentTrack.cover} style={styles.coverImg} />}
      </Animated.View>

      <Text style={styles.songTitle}>{currentTrack.title || 'Brak tytułu'}</Text>
      <Text style={styles.artist}>{currentTrack.artist || 'Wykonawca'}</Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrevTrack}>
          <Text style={styles.control}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (isPlaying ? pause() : resume())}>
          <Text style={styles.control}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={playNextTrack}>
          <Text style={styles.control}>⏭</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  coverWrap: { width: 200, height: 200, marginBottom: 20 },
  coverImg: { width: '100%', height: '100%', borderRadius: 8 },
  songTitle: { fontSize: 20, color: 'white' },
  artist: { fontSize: 16, color: 'gray', marginBottom: 20 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', width: '60%' },
  control: { fontSize: 28, color: 'white' },
});
