import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SongCard from '../components/SongCard';
import { albums, otherSongs } from '../data/songs';
import { useAudio } from '../context/AudioProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [randomSongs, setRandomSongs] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { setPlaylistAndPlay, currentTrack, isPlaying, pause, resume } = useAudio();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    loadFavorites();
    selectRandomSongs();
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

  // Funkcja do losowania 5 utworów z otherSongs
  const selectRandomSongs = () => {
    const shuffled = [...otherSongs].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(5, otherSongs.length));
    setRandomSongs(selected);
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

  // Po kliknięciu albumu przechodzimy do AlbumDetail i przekazujemy album
  const goToAlbum = (album) => {
    navigation.navigate('AlbumDetail', { album });
  };

  // Lista widocznych wszystkich utworów (albumy + otherSongs) - przydatne do odtwarzania
  const visibleSongs = [
    ...albums.flatMap(album => album.songs),
    ...otherSongs,
  ];

  return (
    <SafeAreaView style={styles.wrapper} edges={['left', 'right', 'top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            currentTrack && { paddingBottom: 20 },
          ]}
        >
          <Text style={styles.title}>Welcome to MusicSpot</Text>

          {/* Sekcja Albumy - pokazujemy dwa albumy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Albumy</Text>
            <View style={styles.albumsContainer}>
              {albums.map(album => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.albumCard}
                  onPress={() => goToAlbum(album)}
                >
                  <Image source={album.cover} style={styles.albumCover} />
                  <Text style={styles.albumTitle}>{album.title}</Text>
                  <Text style={styles.albumCount}>{album.songs.length} songs</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Losowe utwory z sekcji "Inne" */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Odkryj nowe</Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={selectRandomSongs}
              >
                <Text style={styles.refreshButtonText}>🎲 Losuj ponownie</Text>
              </TouchableOpacity>
            </View>
            {randomSongs.map(song => (
              <SongCard
                key={song.id}
                title={song.title}
                cover={song.cover}
                isFavorite={favorites.includes(song.title)}
                onPress={() => {
                  const index = visibleSongs.findIndex(s => s.id === song.id);
                  if (index >= 0) setPlaylistAndPlay(visibleSongs, index);
                }}
                toggleFavorite={() => toggleFavorite(song.title)}
              />
            ))}
            {randomSongs.length === 0 && (
              <Text style={styles.noSongsText}>Brak dostępnych utworów</Text>
            )}
          </View>

          {/* Ulubione */}
          {favorites.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ulubione</Text>
              {favorites.map((title, index) => {
                const song =
                  albums.flatMap(album => album.songs).find(s => s.title === title) ||
                  otherSongs.find(s => s.title === title);
                if (!song) return null;
                return (
                  <SongCard
                    key={index}
                    title={song.title}
                    cover={song.cover}
                    isFavorite={true}
                    onPress={() => {
                      const idx = visibleSongs.findIndex(s => s.id === song.id);
                      if (idx >= 0) setPlaylistAndPlay(visibleSongs, idx);
                    }}
                    toggleFavorite={() => toggleFavorite(song.title)}
                  />
                );
              })}
            </View>
          )}

          {/* Aktualnie grane */}
          {currentTrack && (
            <View style={styles.currentlyPlayingContainer}>
              <Text style={styles.currentlyPlayingLabel}>Aktualnie grane:</Text>
              <View style={styles.currentTrackInfo}>
                {currentTrack.cover && (
                  <Image source={currentTrack.cover} style={styles.currentTrackCover} />
                )}
                <View style={styles.currentTrackText}>
                  <Text style={styles.currentTrackTitle}>{currentTrack.title}</Text>
                  <TouchableOpacity 
                    onPress={() => (isPlaying ? pause() : resume())}
                    style={styles.playPauseButton}
                  >
                    <Text style={styles.playPauseText}>
                      {isPlaying ? 'Pause' : 'Play'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#121212' },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 20,
  },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: 'limegreen', marginBottom: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  refreshButtonText: {
    color: 'limegreen',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noSongsText: {
    color: 'gray',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  albumsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  albumCard: {
    flex: 1,
    backgroundColor: '#222',
    marginRight: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 10,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  albumCount: {
    marginTop: 5,
    color: 'gray',
    fontSize: 12,
    textAlign: 'center',
  },
  currentlyPlayingContainer: {
    marginTop: 30,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
  },
  currentlyPlayingLabel: {
    color: 'limegreen',
    fontSize: 16,
    marginBottom: 10,
  },
  currentTrackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentTrackCover: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  currentTrackText: {
    flex: 1,
  },
  currentTrackTitle: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  playPauseButton: {
    backgroundColor: 'limegreen',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  playPauseText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  },
});