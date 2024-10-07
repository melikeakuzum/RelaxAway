import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Image, StyleSheet, ActivityIndicator, Dimensions, Animated, Alert, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../../firebase';

const { width, height } = Dimensions.get('window');

const generateStars = (count) => {
  let stars = [];
  for (let i = 0; i < count; i++) {
    let left = Math.random() * width;
    let top = Math.random() * height;
    let size = Math.random() * 3 + 1;
    let delay = Math.random() * 5;

    stars.push({ left, top, size, delay });
  }
  return stars;
};

const Star = ({ left, top, size, delay }) => {
  const animation = new Animated.Value(0);
  const translateX = new Animated.Value(left);
  const translateY = new Animated.Value(top);

  useEffect(() => {
    const animationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          delay: delay * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const positionLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: left + Math.random() * 20 - 10,
          duration: 2000,
          delay: delay * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: left,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: top + Math.random() * 20 - 10,
          duration: 2000,
          delay: delay * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: top,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    animationLoop.start();
    positionLoop.start();

    return () => {
      animationLoop.stop();
      positionLoop.stop();
    };
  }, [animation, delay, left, top, translateX, translateY]);

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    />
  );
};

const BreathingExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const snapshot = await firestore()
          .collection('meditationExercises')
          .where('style', '==', 'Breathing Exercises')
          .get();

        const exercisesList = snapshot.docs.map(doc => ({
          docId: doc.id, // Firestore belgesinin otomatik oluşturulan ID'si
          ...doc.data(),
        }));

        setExercises(exercisesList);
      } catch (error) {
        console.error('Error fetching exercises: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const playExercise = (item) => {
    navigation.navigate('ExercisePlayScreen', { exercise: item });
  };

  const toggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const deleteExercise = (id) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this exercise?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`Deleting exercise with id: ${id}`);
              
              // id'ye göre belgeyi sorgula
              const querySnapshot = await firestore()
                .collection('meditationExercises')
                .where('id', '==', id)
                .get();

              if (!querySnapshot.empty) {
                // İlgili belgeyi bul ve sil
                const docId = querySnapshot.docs[0].id;
                await firestore()
                  .collection('meditationExercises')
                  .doc(docId)
                  .delete();
                console.log(`Exercise with id: ${id} deleted`);

                // Egzersiz silindikten sonra exercises listesini güncelleyin
                setExercises(prevExercises => prevExercises.filter(exercise => exercise.id !== id));
                Alert.alert("Success", "Exercise deleted successfully.");
              } else {
                console.error('No document found with the given id');
                Alert.alert("Error", "No exercise found with the given ID.");
              }
            } catch (error) {
              console.error('Error deleting exercise: ', error);
              Alert.alert("Error", "Failed to delete exercise. Please try again.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7600bc" />
      </View>
    );
  }

  const filteredExercises = exercises.filter(exercise =>
    exercise.title.toLowerCase().includes(searchText.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedExercises = filter === 'time' ?
    [...filteredExercises].sort((a, b) => a.time.localeCompare(b.time)) :
    filter === 'alphabetical' ?
    [...filteredExercises].sort((a, b) => a.title.localeCompare(b.title)) :
    filteredExercises;

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.duration}>{item.time}</Text>
        <View style={styles.actionRow}>
          <Pressable onPress={() => toggleDetails(item.id)}>
            <Text style={styles.detailsText}>Details</Text>
          </Pressable>
          {auth.currentUser.uid === "I72C1DOFpNPfTTCtPzIG8TFPcOc2" && (
            <Pressable onPress={() => deleteExercise(item.id)}>
              <Text style={styles.deleteText}>Delete
              </Text>
            </Pressable>
          )}
        </View>
        {expandedId === item.id && (
          <Text style={styles.description}>{item.description}</Text>
        )}
      </View>
      <Pressable onPress={() => playExercise(item)}>
        <Image
          source={require('../../../src/icons/icon-next.png')}
          style={styles.icon}
        />
      </Pressable>
    </View>
  );

  const stars = generateStars(200);

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        {stars.map((star, index) => (
          <Star key={index} {...star} />
        ))}
      </View>

      <Text style={styles.titleText}>Breathing Exercises</Text>

      <View style={styles.searchFilterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.filterContainer}>
          <Text style={styles.filterText}>Filter by:</Text>
          <Pressable onPress={() => setFilter('time')}>
            <Text style={[styles.filterOption, filter === 'time' && styles.activeFilter]}>Time</Text>
          </Pressable>
          <Pressable onPress={() => setFilter('alphabetical')}>
            <Text style={[styles.filterOption, filter === 'alphabetical' && styles.activeFilter]}>Alphabetical</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={sortedExercises}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#003',
  },
  list: {
    paddingBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#efd4f7',
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color:'#1c2d7d',
  },
  duration: {
    fontSize: 14,
    color: '#555',
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  deleteText: {
    fontSize: 14,
    color: 'red',
  },
  detailsText: {
    fontSize: 14,
    color: '#7600bc',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFF',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginVertical: 20,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor:'#efd4f7',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginRight: 10,
    color: 'black',
  },
  filterOption: {
    color: 'black',
    marginRight: 10,
  },
  activeFilter: {
    fontWeight: 'bold',
  },
});

export default BreathingExercises;
