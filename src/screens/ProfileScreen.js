import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, FlatList } from 'react-native';
import { auth } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import MyPosts from './../../components/MyPosts'; // Import MyPosts component

export let profileUsername = ''; // Define profileUsername as a global variable

const profileImages = [
  require('../../src/images/profils/girl.jpg'),
  require('../../src/images/profils/girl2.jpg'),
  require('../../src/images/profils/girl3.jpg'),
  require('../../src/images/profils/girl4.jpg'),
  require('../../src/images/profils/girl5.jpg'),
  require('../../src/images/profils/girl6.jpg'),
  require('../../src/images/profils/girl7.jpg'),
  require('../../src/images/profils/boy.jpg'),
  require('../../src/images/profils/boy2.jpg'),
  require('../../src/images/profils/boy3.jpg'),
  require('../../src/images/profils/boy4.jpg'),
  require('../../src/images/profils/boy5.jpg'),
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [username, setUsername] = useState('');
  const [userImageURL, setUserImageURL] = useState(''); // State for user image URL
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [myPostsModalVisible, setMyPostsModalVisible] = useState(false); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchUsername(user.uid); // Using UID instead of userId
      }
    });

    return unsubscribe;
  }, []);

  const fetchUsername = async (uid) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setUsername(userData.username);
        profileUsername = userData.username; // Set profileUsername to the fetched username
        if (userData.userImageURL) {
          setUserImageURL(userData.userImageURL); // Set userImageURL to the fetched URL
        }
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  const updateProfileImage = async (imageURL) => {
    try {
      await firestore().collection('users').doc(currentUser.uid).update({
        userImageURL: imageURL,
      });
      setUserImageURL(imageURL); // Update the local state with the new image URL
      setModalVisible(false); // Close the modal after selection
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  const logout = () => {
    auth.signOut()
      .then(() => navigation.navigate('SignInScreen'))
      .catch(error => alert(error.message));
  };
  const renderProfileImage = ({ item }) => (
    <TouchableOpacity onPress={() => updateProfileImage(item.uri)}>
      <Image source={item} style={styles.modalProfileImage} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 40 }}>
      <View style={styles.profileContainer}>
        <Image
          source={userImageURL ? { uri: userImageURL } : require('../../src/icons/icon-profile-black.png')}
          style={styles.profileImage}
        />
        
      </View><TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      <View style={styles.insideContainer}>
        <Text style={styles.textContainer}>Email: {currentUser?.email}</Text>
        <Text style={styles.textContainer}>Username: {username}</Text>
      </View>
      <View style={styles.insideContainer}> 
      <TouchableOpacity
        style={styles.myPostsButton}
        onPress={() => setMyPostsModalVisible(true)}
      >
        <Text style={styles.myPostsButtonText}>My Posts</Text>
      </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <FlatList
              data={profileImages.map((image, index) => ({ id: index, uri: Image.resolveAssetSource(image).uri }))}
              renderItem={renderProfileImage}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              contentContainerStyle={styles.profileImageList}
            />
          </View>
        </View>
      </Modal>
      
      

      {/* MyPosts Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={myPostsModalVisible}
        onRequestClose={() => {
          setMyPostsModalVisible(!myPostsModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMyPostsModalVisible(!myPostsModalVisible)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <MyPosts />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  myPostsButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
    marginTop:30,
    width: '50%'
  },
  myPostsButtonText: {
    color: '#006400',
    fontSize: 16,
  },
  profileContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative', // Required for the button positioning
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    position: 'absolute',
    right:130,
    top: 130,
    backgroundColor: '#006400',
    borderRadius: 15,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  insideContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#006400',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    width: '50%'
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: '10%',
    paddingHorizontal: '6%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#006400',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  modalProfileImage: {
    width: 80,
    height: 80,
    margin: 8,
  },
  profileImageList: {
    alignItems: 'center',
  },
  textContainer:{
    fontSize:18,
    color:'black'
  }
});

