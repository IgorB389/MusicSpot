import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function SongCard({ title, cover, onPress, toggleFavorite, isFavorite }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Okładka lub zielone kółko jako fallback */}
      {cover ? (
        <Image source={cover} style={styles.coverImage} />
      ) : (
        <View style={styles.circle} />
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      {/* Przycisk ulubionych */}
      <TouchableOpacity onPress={toggleFavorite} style={styles.heartButton}>
        <Text style={styles.heart}>{isFavorite ? '💚' : '🤍'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  coverImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'limegreen',
    marginRight: 16,
  },
  title: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  heartButton: {
    paddingHorizontal: 8,
  },
  heart: {
    fontSize: 22,
  },
});