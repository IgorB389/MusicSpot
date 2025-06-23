import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SongCard from '../components/SongCard';
import { albums, otherSongs } from '../data/songs';
import { useAudio } from '../context/AudioProvider';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const { setPlaylistAndPlay } = useAudio();

  // Pobierz wszystkie utwory przy załadowaniu komponentu
  useEffect(() => {
    const getAllSongs = () => {
      const albumSongs = albums.flatMap(album => album.songs);
      const combined = [...albumSongs, ...otherSongs];
      setAllSongs(combined);
    };

    getAllSongs();
    loadFavorites();
  }, []);

  // Wyszukiwanie w czasie rzeczywistym
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = allSongs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery, allSongs]);

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

  const playSong = (song) => {
    const songIndex = allSongs.findIndex(s => s.id === song.id);
    if (songIndex >= 0) {
      setPlaylistAndPlay(allSongs, songIndex);
    }
  };

  const getRandomSuggestions = () => {
    const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  const suggestions = getRandomSuggestions();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wyszukaj</Text>
      
      {/* Pole wyszukiwania */}
      <TextInput 
        style={styles.input} 
        placeholder="Wpisz tytuł utworu..." 
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false}
      />

      {/* Wyniki wyszukiwania */}
      {searchQuery.trim() !== '' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Wyniki wyszukiwania ({searchResults.length})
          </Text>
          {searchResults.length > 0 ? (
            searchResults.map(song => (
              <SongCard
                key={song.id}
                title={song.title}
                cover={song.cover}
                isFavorite={favorites.includes(song.title)}
                onPress={() => playSong(song)}
                toggleFavorite={() => toggleFavorite(song.title)}
              />
            ))
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>
                Brak wyników dla "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Sugestie gdy brak wyszukiwania */}
      {searchQuery.trim() === '' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Odkryj coś nowego</Text>
          {suggestions.map((song) => (
            <SongCard
              key={song.id}
              title={song.title}
              cover={song.cover}
              isFavorite={favorites.includes(song.title)}
              onPress={() => playSong(song)}
              toggleFavorite={() => toggleFavorite(song.title)}
            />
          ))}
        </View>
      )}

      {/* Statystyki */}
      {searchQuery.trim() === '' && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Dostępnych utworów: {allSongs.length}
          </Text>
          <Text style={styles.statsText}>
            Albumów: {albums.length}
          </Text>
          <Text style={styles.statsText}>
            Pojedynczych utworów: {otherSongs.length}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212', 
    padding: 16 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 16 
  },
  input: { 
    backgroundColor: '#1e1e1e', 
    color: 'white', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 20,
    fontSize: 16
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: { 
    fontSize: 18, 
    color: 'limegreen', 
    marginBottom: 15,
    fontWeight: 'bold'
  },
  noResults: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  noResultsText: {
    color: 'gray',
    fontSize: 16,
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  statsText: {
    color: 'gray',
    fontSize: 14,
    marginBottom: 5,
  },
});