import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Alert, Platform, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import { useNavigation } from '@react-navigation/native';

const exerciseStyles = [
  { name: "Breathing Exercises", screen: "BreathingExercises" },
  { name: "Visualization and Imagination", screen: "VisualizationAndImagination" },
  { name: "Affirmations And Mantras", screen: "AffirmationsAndMantras" },
  { name: "Nature Sounds and Music", screen: "NatureSoundsAndMusic" },
  { name: "Yoga and Movement", screen: "YogaAndMovement" },
  { name: "Sleep Exercises", screen: "SleepExercises" }
];

function generateUniqueID() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return timestamp + '-' + randomStr;
}

function AdminExerciseScreen() {
  const [exerciseTitle, setExerciseTitle] = useState('');
  const [exerciseDescription, setExerciseDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [musicUri, setMusicUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStyleList, setShowStyleList] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [musicDuration, setMusicDuration] = useState(0);

  const navigation = useNavigation(); 

  useEffect(() => {
    if (musicUri) {
      getAudioDuration(musicUri);
    }
  }, [musicUri]);

  const getAudioDuration = async (uri) => {
    const sound = new Sound(uri, '', (error) => {
      if (error) {
        console.error('Error loading sound:', error);
        setMusicDuration('0:00');
      } else {
        const duration = sound.getDuration();
        const minutes = Math.floor(duration / 60);
        const seconds = Math.round(duration % 60);
        const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        setMusicDuration(formattedDuration);
      }
    });
  };

  const selectMusicFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });

      console.log('DocumentPicker result:', res);

      if (res && res.length > 0 && res[0].uri) {
        let uri = res[0].uri;

        // For Android, the URI might start with "content://"
        if (Platform.OS === 'android' && uri.startsWith('content://')) {
          const destPath = `${RNFS.TemporaryDirectoryPath}${res[0].name}`;
          await RNFS.copyFile(uri, destPath);
          uri = destPath;
        }

        setMusicUri(uri);
        console.log('Music URI:', uri);
        console.log('Music Name:', res[0].name);
        console.log('Music Type:', res[0].type);
      } else {
        console.log('No file selected');
      }
    } catch (err) {
      console.log('Error:', err);
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.log('Error selecting file:', err);
      }
    }
  };

  const saveExercise = async () => {
    if (!selectedStyle) {
      Alert.alert('Error', 'Please select an exercise style.');
      return;
    }
    if (!musicUri) {
      Alert.alert('Error', 'Please select a music file.');
      return;
    }
  
    setLoading(true);
    try {
      const exerciseId = generateUniqueID();
      const storageRef = storage().ref(`meditationExercises/${exerciseId}`);
      await storageRef.putFile(musicUri);
      const downloadURL = await storageRef.getDownloadURL();
  
      const exerciseData = {
        time: musicDuration,
        title: exerciseTitle,
        description: exerciseDescription,
        style: selectedStyle,
        id: exerciseId,
        musicUri: downloadURL
      };
  
      await firestore().collection('meditationExercises').add(exerciseData);
      setExerciseTitle('');
      setExerciseDescription('');
      setSelectedStyle('');
      setMusicUri(null);
      setLoading(false);
      setModalVisible(false);
      Alert.alert('Success', 'Exercise saved successfully!');
    } catch (error) {
      console.error('Error saving exercise: ', error);
      setLoading(false);
      Alert.alert('Error', 'An error occurred while saving the exercise. Please try again.', error.message);
    }
  };

  const renderExerciseStyleItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.exerciseStyleItem, { backgroundColor: selectedStyle === item.name ? 'lightgray' : 'white' }]}
      onPress={() => {
        setSelectedStyle(item.name);
        setShowStyleList(false);
      }}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.buttonText}> + Add Exercise</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Add New Exercise</Text>
              <TextInput
                style={styles.input}
                onChangeText={setExerciseTitle}
                value={exerciseTitle}
                placeholder="Enter exercise title"
              />
              <TextInput
                style={styles.descriptionInput}
                onChangeText={setExerciseDescription}
                value={exerciseDescription}
                placeholder="Enter exercise description"
                multiline
              />
              <TouchableOpacity onPress={selectMusicFile} disabled={loading} style={styles.button}>
                <Text style={styles.buttonTextWhite}>Select Music</Text>
              </TouchableOpacity>
              {musicUri && <Text>Music selected!</Text>}
              <TouchableOpacity onPress={() => setShowStyleList(!showStyleList)} style={styles.chooseTypeButton}>
                <Text style={styles.buttonTextWhite}>Choose a Type</Text>
              </TouchableOpacity>
              {showStyleList && (
                <FlatList
                  data={exerciseStyles}
                  renderItem={renderExerciseStyleItem}
                  keyExtractor={(item) => item.name}
                  style={styles.flatlist}
                />
              )}
              <TouchableOpacity title="Save Exercise" onPress={saveExercise} disabled={!musicUri || !selectedStyle || loading} style={styles.button}>
                <Text style={styles.buttonTextWhite}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ ...styles.button, backgroundColor: '#7600bc' }}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.buttonTextClose}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.filterContainer}>
          {exerciseStyles.map((style, index) => (
            <TouchableOpacity
              key={index}
              style={styles.styleCard}
              onPress={() => navigation.navigate(style.screen)}
            >
              <Text style={styles.styleText}>{style.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    height: '100%',
  },
  text: {
    fontSize: 20,
    marginBottom: 10,
  },
  buttonText: {
    borderRadius: 5,
    padding: 15,
    color: '#7600bc',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#e5daf8',
  },
  buttonTextWhite: {
    color: '#7600bc',
  },
  buttonTextClose: {
    color: '#e5daf8',
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: '#7600bc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  descriptionInput: {
    height: 80,
    width: '90%',
    borderColor: '#7600bc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
  },
  flatlist: {
    marginBottom: 15,
    width: '90%',
    maxHeight: 180,
    backgroundColor: '#FFC5ED',
    padding: 20,
    marginTop: -10,
    paddingBottom: 20,
  },
  exerciseStyleItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#7600bc',
  },
  chooseTypeButton: {
    height: 40,
    width: '90%',
    marginBottom: 10,
    backgroundColor: '#e1d4f7',
    padding: 10,
    color: '#fff',
  },
  button: {
    height: 40,
    width: '90%',
    marginBottom: 10,
    backgroundColor: '#e1d4f7',
    padding: 10,
    color: '#fff',
    textAlign: 'center',
    justifyContent: 'center',
  },
  addButton: {
    marginBottom: 20,
    backgroundColor: '#f1eafa',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#491c97',
    color: '#491c97',
    width: '90%',
    marginTop: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    width: '90%',
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    color: '#000',
  },
  filterContainer: {
    width: '95%',
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  styleCard: {
    width: '48%',
    height: 150,
    backgroundColor: '#451b90',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  styleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AdminExerciseScreen;
