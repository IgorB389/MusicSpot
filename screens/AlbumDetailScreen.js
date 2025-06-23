// screens/AlbumDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from '../context/AudioProvider';
import SongCard from '../components/SongCard';

export default function AlbumDetailScreen({ route }) {
  // Bezpieczne pobieranie albumu z obsługą błędów
  const album = route?.params?.album || { 
    title: 'Nieznany Album', 
    songs: [], 
    cover: null 
  };
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const [favorites, setFavorites] = useState([]);
  const { setPlaylistAndPlay } = useAudio();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();

    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const parsed = stored ? JSON.parse(stored) : [];
      setFavorites(parsed);
    } catch (e) {
      console.error('Błąd podczas wczytywania ulubionych', e);
    }
  };

  const toggleFavorite = async (title) => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      let parsed = stored ? JSON.parse(stored) : [];
      if (parsed.includes(title)) {
        parsed = parsed.filter(item => item !== title);
      } else {
        parsed.push(title);
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(parsed));
      setFavorites(parsed);
    } catch (e) {
      console.error('Błąd podczas zmiany ulubionych', e);
    }
  };

  const playAlbum = () => {
    if (album.songs && album.songs.length > 0) {
      setPlaylistAndPlay(album.songs, 0);
    }
  };

  const shufflePlay = () => {
    if (album.songs && album.songs.length > 0) {
      const shuffledSongs = [...album.songs].sort(() => Math.random() - 0.5);
      setPlaylistAndPlay(shuffledSongs, 0);
    }
  };

  return (
    <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={{ transform: [{ translateY: slideAnim }] }}>
      
      {/* Okładka albumu */}
      <View style={styles.coverContainer}>
        {album.cover ? (
          <Image source={album.cover} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
      </View>

      {/* Informacje o albumie */}
      <Text style={styles.albumTitle}>{album.title}</Text>
      <Text style={styles.artist}>Album • {album.songs?.length || 0} utworów</Text>

      {/* Akcje */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={playAlbum}>
          <Text style={styles.action}>▶️ Odtwórz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={shufflePlay}>
          <Text style={styles.action}>🔀 Losowo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.action}>⬇️ Pobierz</Text>
        </TouchableOpacity>
      </View>

      {/* Lista utworów */}
      <View style={styles.tracksContainer}>
        <Text style={styles.tracksTitle}>Utwory</Text>
        {album.songs && album.songs.map((song, index) => (
          <Animated.View 
            key={song.id} 
            style={{ 
              transform: [{ translateY: slideAnim }], 
              opacity: fadeAnim 
            }}
          >
            <SongCard
              title={song.title}
              cover={song.cover}
              isFavorite={favorites.includes(song.title)}
              onPress={() => {
                setPlaylistAndPlay(album.songs, index);
              }}
              toggleFavorite={() => toggleFavorite(song.title)}
            />
          </Animated.View>
        ))}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212', 
    padding: 16 
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coverImage: { 
    width: 200, 
    height: 200, 
    borderRadius: 8,
  },
  coverPlaceholder: { 
    width: 200, 
    height: 200, 
    backgroundColor: '#333', 
    borderRadius: 8 
  },
  albumTitle: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  artist: { 
    fontSize: 16, 
    color: 'gray', 
    textAlign: 'center',
    marginBottom: 20 
  },
  actions: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: '#1e1e1e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  action: { 
    color: 'limegreen',
    fontSize: 14,
    fontWeight: '500',
  },
  tracksContainer: {
    marginTop: 10,
  },
  tracksTitle: {
    fontSize: 18,
    color: 'limegreen',
    marginBottom: 15,
    fontWeight: 'bold',
  },
});