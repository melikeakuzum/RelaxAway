import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Sound from 'react-native-sound';
import Slider from 'react-native-slider';
import BackgroundImageSlider from '../../../components/BackgroundImageSlider';
import BackgroundImageSliderSky from '../../../components/BackgroundImageSliderSky';
import BackgroundImageSliderNight from '../../../components/BackgroundImageSliderNight';

const ExercisePlayScreen = ({ route }) => {
  const { exercise } = route.params;
  const { musicUri, title, time, style } = exercise;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const sound = new Sound(musicUri, null, (error) => {
      if (error) {
        console.error('Failed to load the sound', error);
        return;
      }
      setDuration(sound.getDuration());
    });
    setCurrentSound(sound);

    return () => {
      if (sound) {
        sound.stop();
        sound.release();
      }
    };
  }, [musicUri]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (currentSound) {
        currentSound.stop();
        setIsPlaying(false);
      }
    });

    return unsubscribe;
  }, [navigation, currentSound]);

  useEffect(() => {
    let interval = null;
    if (isPlaying && currentSound) {
      interval = setInterval(() => {
        currentSound.getCurrentTime((seconds) => {
          setCurrentPosition(seconds);
        });
      }, 1000);
    } else if (!isPlaying) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSound]);

  const togglePlayPause = () => {
    if (currentSound) {
      if (isPlaying) {
        currentSound.pause();
      } else {
        currentSound.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onSlidingComplete = (value) => {
    if (currentSound) {
      try {
        const clampedValue = Math.min(value, duration);
        currentSound.setCurrentTime(clampedValue);
        setCurrentPosition(clampedValue);
      } catch (error) {
        console.error('Error setting current time:', error);
      }
    }
  };

  const renderBackground = () => {
    switch (style) {
      case 'Breathing Exercise':
        return <BackgroundImageSlider />;
      case 'Sleep Exercises':
        return <BackgroundImageSliderNight />;
      case 'Visualization and Imagination':
        return <BackgroundImageSlider />;
      case 'Affirmations and Mantras':
        return <BackgroundImageSliderNight />;
      case 'Yoga and Movement':
        return <BackgroundImageSlider />;
      case 'Nature Sounds and Music':
        return <BackgroundImageSliderNight />;
      default:
        return <BackgroundImageSliderSky />;
    }
  };

  return (
    <View style={styles.container}>
      {renderBackground()}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.style}>{style}</Text>
      </View>
      <Slider
        style={styles.slider}
        value={currentPosition}
        minimumValue={0}
        maximumValue={duration}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
        thumbTintColor="#e0b0ff"
      />
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
      <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
        <Image
          source={isPlaying ? require('../../../src/icons/icon-pause.png') : require('../../../src/icons/icon-play.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  style: {
    fontSize: 18,
    color: '#555',
  },
  slider: {
    width: '80%',
    height: 40,
    marginTop:250,
  },
  timeContainer: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeText: {
    color: '#555',
  },
  playPauseButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0b0ff',
    opacity: 0.5,
  },
  icon: {
    width: 50,
    height: 50,
  },
});

export default ExercisePlayScreen;
