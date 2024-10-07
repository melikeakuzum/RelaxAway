import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, Image, Pressable, Alert } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import Slider from 'react-native-slider';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../../../firebase';

const OboeScreen = () => {
  const navigation = useNavigation();

  const [musicList, setMusicList] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { position, duration } = useProgress();

  useEffect(() => {
    const fetchMusic = async () => {
      const musicCollection = await firestore()
        .collection('music')
        .where('instrument', '==', 'Oboe')
        .get();
      const musicData = musicCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMusicList(musicData);
      await TrackPlayer.setupPlayer({});
      await TrackPlayer.updateOptions({ stopWithApp: true });
      await TrackPlayer.add(musicData.map(track => ({
        id: track.id,
        url: track.musicUri,
        title: track.title,
        artist: track.singer,
        duration: track.duration,
      })));
    };
    fetchMusic();
  }, []);

  useEffect(() => {
    const onStateChange = async () => {
      const state = await TrackPlayer.getState();
      setIsPlaying(state === TrackPlayer.STATE_PLAYING);
    };

    const subscription = TrackPlayer.addEventListener('playback-state', onStateChange);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const onTrackChange = async (data) => {
      if (data.type === 'playback-track-changed' && data.nextTrack) {
        setCurrentTrack(data.nextTrack);
      }
    };

    const subscription = TrackPlayer.addEventListener('playback-track-changed', onTrackChange);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, []);

  const startMusic = async (track) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: track.id,
        url: track.musicUri,
        title: track.title,
        artist: track.singer,
        duration: track.duration,
      });
      await TrackPlayer.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing music:', error);
    }
  };

  const stopMusic = async () => {
    try {
      await TrackPlayer.stop();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping music:', error);
    }
  };

  const togglePlayback = async () => {
    if (currentTrack) {
      if (isPlaying) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else {
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    }
  };

  const skipToPrevious = async () => {
    if (currentTrack) {
      const currentIndex = musicList.findIndex(item => item.id === currentTrack.id);
      if (currentIndex > 0) {
        await startMusic(musicList[currentIndex - 1]);
      }
    }
  };

  const skipToNext = async () => {
    if (currentTrack) {
      const currentIndex = musicList.findIndex(item => item.id === currentTrack.id);
      if (currentIndex < musicList.length - 1) {
        await startMusic(musicList[currentIndex + 1]);
      }
    }
  };

  const deleteMusic = async (id) => {
    try {
      await firestore().collection('music').doc(id).delete();
      setMusicList(musicList.filter(item => item.id !== id));
      Alert.alert('Success', 'Music deleted successfully.');
    } catch (error) {
      console.error('Error deleting music:', error);
      Alert.alert('Error', 'Failed to delete music.');
    }
  };
  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 0.7, borderColor: '#674113', backgroundColor: currentTrack && currentTrack.id === item.id ? '#e1d8c2' : 'transparent' }}>
      <TouchableOpacity style={{ width: '80%', padding: '10' }} onPress={() => startMusic(item)}>
        <View style={{ width: '100%', padding: '10' }}>
          <Text style={{ fontSize: 16, color: currentTrack && currentTrack.id === item.id ? 'black' : 'black' }}>{item.title}</Text>
          <Text style={{ fontSize: 14, color: 'black' }}>{item.singer}</Text>
          <Text style={{ fontSize: 14, color: '#888' }}>{item.duration}</Text>
        </View>
      </TouchableOpacity>
      {auth.currentUser.uid == 'I72C1DOFpNPfTTCtPzIG8TFPcOc2' && (
        <Pressable onPress={() => deleteMusic(item.id)}>
          <Text style={{ color: 'red', fontWeight: 'bold' }}>Delete</Text>
        </Pressable>
      )}
    </View>
  );


  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const onSlidingComplete = async (value) => {
    if (currentTrack) {
      await TrackPlayer.seekTo(value);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#efece5' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', padding: 10, textAlign: 'center', width: '100%' }}>Oboe</Text>
      <FlatList
        data={musicList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 150 }} // Ensure enough space for the fixed footer
      />
      {currentTrack && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#d1c8b2', padding: 10 }}>
          <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 10, fontSize: 18 }}>{currentTrack.title}</Text>
          <Slider
            value={position}
            minimumValue={0}
            maximumValue={duration}
            onSlidingComplete={onSlidingComplete}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            thumbTintColor="#e0b0ff"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#000' }}>{formatDuration(position)}</Text>
            <Text style={{ color: '#000' }}>{formatDuration(duration)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            <Pressable onPress={skipToPrevious}>
              <Image source={require('../../icons/icon-prev.png')} style={{ width: 30, height: 30, marginLeft: 20 }} />
            </Pressable>
            <Pressable onPress={togglePlayback}>
              <Image source={isPlaying ? require('../../icons/icon-pause.png') : require('../../icons/icon-play.png')} style={{ width: 30, height: 30, marginLeft: 20 }} />
            </Pressable>
            <Pressable onPress={skipToNext}>
              <Image source={require('../../icons/icon-next.png')} style={{ width: 30, height: 30, marginLeft: 20 }} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

export default OboeScreen;
