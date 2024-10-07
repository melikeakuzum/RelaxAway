import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

const BackgroundImageSlider = () => {
  const images = [require('../src/BackgroundImages/2.jpg'), require('../src/BackgroundImages/3.jpg')];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [opacity, setOpacity] = useState(new Animated.Value(1));

  useEffect(() => {
    const intervalId = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 10000, // 10 saniyelik toplam süre
        useNativeDriver: true,
      }).start(() => {
        // Geçiş tamamlandığında
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        opacity.setValue(1); // Opaklık değerini tekrar 1 yap
      });
    }, 10000); // Her 10 saniyede bir resim değiştir

    return () => clearInterval(intervalId);
  }, [opacity, currentImageIndex]);

  return (
    <View style={styles.container}>
      {images.map((image, index) => (
        <Animated.Image
          key={index}
          source={image}
          style={[
            styles.image,
            {
              opacity: currentImageIndex === index ? opacity : 1,
              zIndex: currentImageIndex === index ? 1 : 0,
            },
          ]}
          resizeMode="cover"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default BackgroundImageSlider;
