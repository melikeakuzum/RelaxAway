import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Modal, TextInput, FlatList, Alert, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import { auth } from '../../firebase';

import pianoImage from '../images/piano.jpg';
import celloImage from '../images/cello.jpg';
import oboeImage from '../images/oboe.jpg';
import violaImage from '../images/viola.jpg';

const instrumentImages = {
  Piano: pianoImage,
  Cello: celloImage,
  Oboe: oboeImage,
  Viola: violaImage,
};

const instrumentNames = Object.keys(instrumentImages);

const MusicScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [title, setTitle] = useState('');
  const [singer, setSinger] = useState('');
  const [musicUri, setMusicUri] = useState(null);
  const [showInstrumentList, setShowInstrumentList] = useState(false);
  const [musicDuration, setMusicDuration] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

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

      if (res && res.length > 0 && res[0].uri) {
        let uri = res[0].uri;

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
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error selecting file:', err);
      }
    }
  };

  const saveMusic = async () => {
    if (!selectedInstrument) {
      Alert.alert('Error', 'Please select an instrument.');
      return;
    }
    if (!musicUri) {
      Alert.alert('Error', 'Please select a music file.');
      return;
    }

    try {
      await firestore().collection('music').add({
        instrument: selectedInstrument,
        title,
        singer,
        musicUri,
        duration: parseFloat(musicDuration.replace(':', '.')),
      });
      setModalVisible(false);
      setTitle('');
      setSinger('');
      setSelectedInstrument('');
      setMusicUri(null);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const renderInstrumentItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.instrumentItem, { backgroundColor: selectedInstrument === item ? '#dc9239' : 'white', }]}
      onPress={() => {
        setSelectedInstrument(item);
        setShowInstrumentList(false);
      }}
    >
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  const renderInstrument = (imageSource, instrumentName) => (
    <TouchableOpacity onPress={() => navigateToInstrumentScreen(instrumentName)} key={instrumentName}>
      <View style={styles.instrumentContainer}>
        <Image source={imageSource} style={styles.image} />
        <View style={styles.overlay}>
          <Text style={styles.instrumentText}>{instrumentName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const navigateToInstrumentScreen = (instrument) => {
    navigation.navigate(`${instrument}Screen`);
  };
  return (
    <View style={styles.container}>
      {auth.currentUser.uid=='I72C1DOFpNPfTTCtPzIG8TFPcOc2' && (
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add Music</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Music</Text>
            <TouchableOpacity onPress={() => setShowInstrumentList(!showInstrumentList)} style={styles.chooseTypeButton}>
              <Text style={styles.buttonTextBrown}>Choose a Type</Text>
            </TouchableOpacity>
            {showInstrumentList && (
              <FlatList
                data={instrumentNames}
                renderItem={renderInstrumentItem}
                keyExtractor={(item) => item}
                style={styles.flatlist}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Singer"
              value={singer}
              onChangeText={setSinger}
            />
            <TouchableOpacity onPress={selectMusicFile} style={styles.chooseTypeButton}>
              <Text style={styles.buttonTextBrown}>Select Music File</Text>
            </TouchableOpacity>
            {musicUri && <Text>Music selected!</Text>}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={{ ...styles.button, backgroundColor: '#553610' }} onPress={saveMusic}>
                <Text style={styles.buttonTextWhite}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ ...styles.button, backgroundColor: '#553610', }} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonTextWhite}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.row}>
        {instrumentNames.slice(0, 2).map(name => renderInstrument(instrumentImages[name], name))}
      </View>
      <View style={styles.row}>
        {instrumentNames.slice(2).map(name => renderInstrument(instrumentImages[name], name))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#efece5',
  },
  addButton: {
    backgroundColor: '#553610',
    padding: 15,
    borderRadius: 5,
    width: '83%',
    alignItems:'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  instrumentContainer: {
    position: 'relative',
  },
  button: {
    height: 40,
    width: '30%',
    marginBottom: 10,
    marginHorizontal: 18,
    padding: 10,
    color: '#fff',
    textAlign: 'center',
    justifyContent: 'center',
    borderColor: '#674113',
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 200,
    borderRadius: 5,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-25deg' }],
    backgroundColor:'#efece5',
    height:25,
    marginTop:100,
  },
  instrumentText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    position: 'absolute',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'#553610',
  },
  input: {
    width: 250,
    height: 40,
    borderColor: '#553610',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  chooseTypeButton: {
    height: 40,
    width: '80%',
    borderRadius:8,
    marginBottom: 10,
    backgroundColor: '#f1d4b1',
    padding: 10,
    color: '#fff',
    borderColor: '#553610',
    borderWidth: 1,
  },
  buttonTextWhite: {
    color: '#fff',
  },
  buttonTextDark:{
  color:'#491c97',
  },
  buttonTextBrown:{
    color:'#553610',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  flatlist: {
    width: '80%',
    maxHeight: 222,
    backgroundColor:'#553610',
    paddingTop:20,
    padding:10,
    marginBottom:10,
    borderRadius:8,
    marginTop:-10
  },
  instrumentItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#553610',
  },
});

export default MusicScreen;
