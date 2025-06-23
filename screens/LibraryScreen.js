import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  Alert,
  Image,
  FlatList 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { albums, otherSongs, getAllSongs } from '../data/songs';
import SongCard from '../components/SongCard';
import { useAudio } from '../context/AudioProvider';

export default function LibraryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('playlists');
  const [playlists, setPlaylists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [showPlaylistDetailModal, setShowPlaylistDetailModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setPlaylistAndPlay, isPlaying, currentSong } = useAudio();

  useEffect(() => {
    loadPlaylists();
    loadFavorites();
  }, []);

  const loadPlaylists = async () => {
    try {
      const stored = await AsyncStorage.getItem('playlists');
      const parsed = stored ? JSON.parse(stored) : [];
      setPlaylists(parsed);
    } catch (e) {
      console.error('Błąd podczas wczytywania playlist', e);
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const parsed = stored ? JSON.parse(stored) : [];
      setFavorites(parsed);
    } catch (e) {
      console.error('Błąd podczas wczytywania ulubionych', e);
    }
  };

  // Optimized play function with better error handling
  const playWithErrorHandling = useCallback(async (songs, index) => {
    if (isLoading) return; // Prevent multiple simultaneous calls
    
    setIsLoading(true);
    try {
      // Validate songs array and index
      if (!songs || !Array.isArray(songs) || songs.length === 0) {
        throw new Error('Invalid songs array');
      }
      
      if (index < 0 || index >= songs.length) {
        throw new Error('Invalid song index');
      }

      // Validate song structure
      const song = songs[index];
      if (!song || !song.id || !song.audio) {
        throw new Error('Invalid song structure');
      }

      console.log('Playing song:', song.title, 'at index:', index);
      await setPlaylistAndPlay(songs, index);
      
    } catch (error) {
      console.error('Error playing song:', error);
      Alert.alert(
        'Błąd odtwarzania', 
        'Nie udało się odtworzyć utworu. Spróbuj ponownie.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [setPlaylistAndPlay, isLoading]);

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Błąd', 'Nazwa playlisty nie może być pusta');
      return;
    }

    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      songs: [],
      createdAt: new Date().toISOString(),
    };

    try {
      const updatedPlaylists = [...playlists, newPlaylist];
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
      setNewPlaylistName('');
      setShowCreateModal(false);
      Alert.alert('Sukces', 'Playlista została utworzona');
    } catch (e) {
      console.error('Błąd podczas tworzenia playlisty', e);
      Alert.alert('Błąd', 'Nie udało się utworzyć playlisty');
    }
  };

  const renamePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Błąd', 'Nazwa playlisty nie może być pusta');
      return;
    }

    try {
      const updatedPlaylists = playlists.map(p => 
        p.id === selectedPlaylist.id 
          ? { ...p, name: newPlaylistName.trim() }
          : p
      );
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
      setNewPlaylistName('');
      setShowRenameModal(false);
      setSelectedPlaylist(null);
      Alert.alert('Sukces', 'Nazwa playlisty została zmieniona');
    } catch (e) {
      console.error('Błąd podczas zmiany nazwy playlisty', e);
      Alert.alert('Błąd', 'Nie udało się zmienić nazwy playlisty');
    }
  };

  const addSongsToPlaylist = async (selectedSongs) => {
    try {
      const updatedPlaylists = playlists.map(p => 
        p.id === selectedPlaylist.id 
          ? { ...p, songs: [...p.songs, ...selectedSongs] }
          : p
      );
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
      setShowAddSongsModal(false);
      setSelectedPlaylist(null);
      Alert.alert('Sukces', `Dodano ${selectedSongs.length} utworów do playlisty`);
    } catch (e) {
      console.error('Błąd podczas dodawania utworów', e);
      Alert.alert('Błąd', 'Nie udało się dodać utworów');
    }
  };

  const removeSongFromPlaylist = async (playlistId, songIndex) => {
    try {
      const updatedPlaylists = playlists.map(p => 
        p.id === playlistId 
          ? { ...p, songs: p.songs.filter((_, index) => index !== songIndex) }
          : p
      );
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
    } catch (e) {
      console.error('Błąd podczas usuwania utworu', e);
    }
  };

  const deletePlaylist = async (playlistId) => {
    Alert.alert(
      'Usuń playlistę',
      'Czy na pewno chcesz usunąć tę playlistę?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
              await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
              setPlaylists(updatedPlaylists);
              if (expandedPlaylist === playlistId) {
                setExpandedPlaylist(null);
              }
            } catch (e) {
              console.error('Błąd podczas usuwania playlisty', e);
            }
          },
        },
      ]
    );
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

  const getArtists = useCallback(() => {
    const allSongs = getAllSongs();
    const artists = {};
    
    allSongs.forEach(song => {
      const parts = song.title.split(' - ');
      if (parts.length > 1) {
        const artist = parts[0];
        if (!artists[artist]) {
          artists[artist] = [];
        }
        artists[artist].push(song);
      }
    });
    
    return Object.entries(artists).map(([name, songs]) => ({
      name,
      songs,
      songCount: songs.length
    }));
  }, []);

  const AddSongsModal = () => {
    const [selectedSongs, setSelectedSongs] = useState([]);
    const allSongs = getAllSongs();
    const playlistSongIds = selectedPlaylist?.songs.map(s => s.id) || [];
    const availableSongs = allSongs.filter(song => !playlistSongIds.includes(song.id));

    const toggleSongSelection = (song) => {
      setSelectedSongs(prev => {
        const isSelected = prev.find(s => s.id === song.id);
        if (isSelected) {
          return prev.filter(s => s.id !== song.id);
        } else {
          return [...prev, song];
        }
      });
    };

    return (
      <Modal
        visible={showAddSongsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddSongsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <Text style={styles.modalTitle}>
              Dodaj utwory do "{selectedPlaylist?.name}"
            </Text>
            
            <ScrollView style={styles.songsList}>
              {availableSongs.length === 0 ? (
                <Text style={styles.emptyText}>Wszystkie utwory są już w playliście</Text>
              ) : (
                availableSongs.map(song => {
                  const isSelected = selectedSongs.find(s => s.id === song.id);
                  return (
                    <TouchableOpacity
                      key={song.id}
                      style={[styles.songItem, isSelected && styles.selectedSongItem]}
                      onPress={() => toggleSongSelection(song)}
                    >
                      <Image source={song.cover} style={styles.songCover} />
                      <Text style={[styles.songTitle, isSelected && styles.selectedSongTitle]}>
                        {song.title}
                      </Text>
                      <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddSongsModal(false);
                  setSelectedSongs([]);
                }}
              >
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createModalButton, 
                  selectedSongs.length === 0 && styles.disabledButton]}
                onPress={() => {
                  if (selectedSongs.length > 0) {
                    addSongsToPlaylist(selectedSongs);
                    setSelectedSongs([]);
                  }
                }}
                disabled={selectedSongs.length === 0}
              >
                <Text style={styles.createModalButtonText}>
                  Dodaj ({selectedSongs.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderPlaylistsTab = () => (
    <View>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createButtonText}>+ Utwórz nową playlistę</Text>
      </TouchableOpacity>

      {playlists.length === 0 ? (
        <Text style={styles.emptyText}>Brak playlist. Utwórz pierwszą!</Text>
      ) : (
        playlists.map(playlist => (
          <View key={playlist.id} style={styles.playlistContainer}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => {
                if (expandedPlaylist === playlist.id) {
                  setExpandedPlaylist(null);
                } else {
                  setExpandedPlaylist(playlist.id);
                }
              }}
            >
              <View style={styles.cardContent}>
                <View style={styles.playlistHeader}>
                  <View>
                    <Text style={styles.cardText}>{playlist.name}</Text>
                    <Text style={styles.cardSubtext}>
                      {playlist.songs.length} utworów
                    </Text>
                  </View>
                  <View style={styles.playlistActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedPlaylist(playlist);
                        setNewPlaylistName(playlist.name);
                        setShowRenameModal(true);
                      }}
                    >
                      <Text style={styles.actionButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedPlaylist(playlist);
                        setShowAddSongsModal(true);
                      }}
                    >
                      <Text style={styles.actionButtonText}>➕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deletePlaylist(playlist.id)}
                    >
                      <Text style={styles.actionButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.cardDate}>
                  {new Date(playlist.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>

            {expandedPlaylist === playlist.id && (
              <View style={styles.expandedContent}>
                {playlist.songs.length === 0 ? (
                  <Text style={styles.emptyPlaylistText}>
                    Playlista jest pusta. Dodaj utwory!
                  </Text>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.playAllButton, isLoading && styles.disabledButton]}
                      onPress={() => {
                        if (playlist.songs.length > 0 && !isLoading) {
                          playWithErrorHandling(playlist.songs, 0);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <Text style={styles.playAllButtonText}>
                        {isLoading ? '⏳ Ładowanie...' : '▶️ Odtwórz wszystkie'}
                      </Text>
                    </TouchableOpacity>
                    
                    {playlist.songs.map((song, index) => (
                      <View key={`${song.id}-${index}`} style={styles.playlistSongItem}>
                        <TouchableOpacity
                          style={[
                            styles.playlistSong,
                            currentSong?.id === song.id && styles.currentSong
                          ]}
                          onPress={() => playWithErrorHandling(playlist.songs, index)}
                          disabled={isLoading}
                        >
                          <Image source={song.cover} style={styles.songCover} />
                          <Text style={[
                            styles.playlistSongTitle,
                            currentSong?.id === song.id && styles.currentSongTitle
                          ]}>
                            {song.title}
                            {currentSong?.id === song.id && isPlaying && ' 🎵'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.removeSongButton}
                          onPress={() => {
                            Alert.alert(
                              'Usuń utwór',
                              'Czy chcesz usunąć ten utwór z playlisty?',
                              [
                                { text: 'Anuluj', style: 'cancel' },
                                {
                                  text: 'Usuń',
                                  style: 'destructive',
                                  onPress: () => removeSongFromPlaylist(playlist.id, index),
                                },
                              ]
                            );
                          }}
                        >
                          <Text style={styles.removeSongButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderArtistsTab = () => {
    const artists = getArtists();
    
    return (
      <View>
        {artists.length === 0 ? (
          <Text style={styles.emptyText}>Brak wykonawców</Text>
        ) : (
          artists.map((artist, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.card, isLoading && styles.disabledButton]}
              onPress={() => {
                if (!isLoading) {
                  playWithErrorHandling(artist.songs, 0);
                }
              }}
              disabled={isLoading}
            >
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.cardText}>{artist.name}</Text>
                  <Text style={styles.cardSubtext}>
                    {artist.songCount} utworów
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  const renderSongsTab = () => {
    const allSongs = getAllSongs();
    
    return (
      <View>
        <Text style={styles.subsectionTitle}>Wszystkie utwory ({allSongs.length})</Text>
        {allSongs.map(song => (
          <SongCard
            key={song.id}
            title={song.title}
            cover={song.cover}
            isFavorite={favorites.includes(song.title)}
            onPress={() => {
              if (!isLoading) {
                const index = allSongs.findIndex(s => s.id === song.id);
                if (index >= 0) {
                  playWithErrorHandling(allSongs, index);
                }
              }
            }}
            toggleFavorite={() => toggleFavorite(song.title)}
            isCurrentSong={currentSong?.id === song.id}
            isPlaying={isPlaying}
            disabled={isLoading}
          />
        ))}
      </View>
    );
  };

  const renderAlbumsTab = () => (
    <View>
      {albums.map(album => (
        <TouchableOpacity 
          key={album.id} 
          style={styles.albumCard}
          onPress={() => navigation.navigate('AlbumDetail', { album })}
        >
          <Image source={album.cover} style={styles.albumCover} />
          <View style={styles.albumInfo}>
            <Text style={styles.cardText}>{album.title}</Text>
            <Text style={styles.cardSubtext}>{album.songs.length} utworów</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biblioteka</Text>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'playlists' && styles.activeTab]}
          onPress={() => setActiveTab('playlists')}
        >
          <Text style={[styles.tab, activeTab === 'playlists' && styles.activeTabText]}>
            Playlisty
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'artists' && styles.activeTab]}
          onPress={() => setActiveTab('artists')}
        >
          <Text style={[styles.tab, activeTab === 'artists' && styles.activeTabText]}>
            Wykonawcy
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'albums' && styles.activeTab]}
          onPress={() => setActiveTab('albums')}
        >
          <Text style={[styles.tab, activeTab === 'albums' && styles.activeTabText]}>
            Albumy
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'songs' && styles.activeTab]}
          onPress={() => setActiveTab('songs')}
        >
          <Text style={[styles.tab, activeTab === 'songs' && styles.activeTabText]}>
            Utwory
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'playlists' && renderPlaylistsTab()}
        {activeTab === 'artists' && renderArtistsTab()}
        {activeTab === 'albums' && renderAlbumsTab()}
        {activeTab === 'songs' && renderSongsTab()}
      </ScrollView>

      {/* Modal tworzenia playlisty */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Utwórz nową playlistę</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nazwa playlisty"
              placeholderTextColor="#666"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createModalButton]}
                onPress={createPlaylist}
              >
                <Text style={styles.createModalButtonText}>Utwórz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal zmiany nazwy playlisty */}
      <Modal
        visible={showRenameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Zmień nazwę playlisty</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nowa nazwa playlisty"
              placeholderTextColor="#666"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowRenameModal(false);
                  setNewPlaylistName('');
                  setSelectedPlaylist(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createModalButton]}
                onPress={renamePlaylist}
              >
                <Text style={styles.createModalButtonText}>Zmień</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AddSongsModal />
    </View>
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
  tabs: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 20 
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  activeTab: {
    backgroundColor: 'limegreen',
  },
  tab: { 
    color: 'limegreen', 
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeTabText: {
    color: 'black',
  },
  content: {
    flex: 1,
  },
  createButton: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'limegreen',
    borderStyle: 'dashed',
  },
  createButtonText: {
    color: 'limegreen',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  playlistContainer: {
    marginBottom: 8,
  },
  card: { 
    backgroundColor: '#1e1e1e', 
    padding: 16, 
    borderRadius: 10,
  },
  cardContent: {
    flexDirection: 'column',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playlistActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    padding: 6,
  },
  actionButtonText: {
    fontSize: 16,
  },
  cardText: { 
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtext: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  cardDate: {
    color: '#666',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  expandedContent: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  emptyPlaylistText: {
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  playAllButton: {
    backgroundColor: 'limegreen',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  playAllButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  playlistSongItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playlistSong: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
  },
  currentSong: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: 'limegreen',
  },
  playlistSongTitle: {
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  currentSongTitle: {
    color: 'limegreen',
  },
  removeSongButton: {
    padding: 8,
  },
  removeSongButtonText: {
    color: '#ff4444',
    fontSize: 16,
  },
  albumCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  albumInfo: {
    flex: 1,
  },
  subsectionTitle: {
    fontSize: 16,
    color: 'limegreen',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  disabledButton: {
    opacity: 0.6,
  },

  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  createModalButton: {
    backgroundColor: 'limegreen',
  },
  createModalButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.6,
  },
  
  // Add songs modal styles
  songsList: {
    flex: 1,
    marginBottom: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#333',
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedSongItem: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: 'limegreen',
  },
  songCover: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  songTitle: {
    color: 'white',
    flex: 1,
  },
  selectedSongTitle: {
    color: 'limegreen',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: 'limegreen',
    borderColor: 'limegreen',
  },
  checkmark: {
    color: 'black',
    fontWeight: 'bold',
  },
});