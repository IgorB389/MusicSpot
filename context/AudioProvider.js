// context/AudioProvider.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);
  const isLoading = useRef(false);

  const currentTrack = currentIndex >= 0 ? playlist[currentIndex] : null;

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    });
  }, []);

  const loadAndPlay = async (track) => {
    if (isLoading.current) return;
    isLoading.current = true;

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (!track?.file) return;

      const { sound } = await Audio.Sound.createAsync(
        typeof track.file === 'string' ? { uri: track.file } : track.file
      );
      soundRef.current = sound;

      soundRef.current.setOnPlaybackStatusUpdate(status => {
        if (!status.isLoaded) {
          if (status.error) {
            console.error('Playback error:', status.error);
          }
          return;
        }

        if (status.didJustFinish) {
          playNextTrack();
        } else {
          setIsPlaying(status.isPlaying);
        }
      });

      await soundRef.current.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading or playing sound:', error);
    } finally {
      isLoading.current = false;
    }
  };

  useEffect(() => {
    if (currentTrack) {
      loadAndPlay(currentTrack);
    } else {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(false);
    }
  }, [currentIndex]);

  const playTrack = (track) => {
    const index = playlist.findIndex(t => t.title === track.title);
    if (index >= 0) {
      setCurrentIndex(index);
    } else {
      setPlaylist(prev => {
        const newPlaylist = [...prev, track];
        setCurrentIndex(newPlaylist.length - 1);
        return newPlaylist;
      });
    }
  };

  const pause = async () => {
    if (soundRef.current && isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resume = async () => {
    if (soundRef.current && !isPlaying) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  const playNextTrack = () => {
    if (playlist.length === 0) return;
    setCurrentIndex(prevIndex => (prevIndex + 1) % playlist.length);
  };

  const playPrevTrack = () => {
    if (playlist.length === 0) return;
    setCurrentIndex(prevIndex => (prevIndex - 1 + playlist.length) % playlist.length);
  };

  const setPlaylistAndPlay = (list, index) => {
    setPlaylist(list);
    setCurrentIndex(index);
  };

  return (
    <AudioContext.Provider value={{
      playlist,
      setPlaylist,
      currentTrack,
      isPlaying,
      playTrack,
      pause,
      resume,
      togglePlayPause,
      playNextTrack,
      playPrevTrack,
      setPlaylistAndPlay,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
