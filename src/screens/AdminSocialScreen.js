import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal, TextInput, Button, Alert, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebase';
import PostCard from '../../components/PostCard';
import { profileUsername } from './ProfileScreen';
import { launchImageLibrary } from 'react-native-image-picker';

const AdminSocialScreen = () => {
  const [posts, setPosts] = useState([]);
  const [modalVisible0, setModalVisible0] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState('');
  const [userName, setUserName] = useState('');

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    fetchUserName();
    fetchPosts();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchPosts, 5000); // Her 10 saniyede bir fetchPosts fonksiyonunu çağır

    return () => clearInterval(interval); // Component unmount olduğunda interval'i temizle
  }, []);

  const fetchUserName = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem('username');
      if (savedUsername !== null) {
        setUserName(savedUsername);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .orderBy('postTime', 'desc') // postTime'a göre sırala
        .get();

      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleAddPost = () => {
    setModalVisible(true);
  };

  const handlePostImagePicker = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel) {
        setPostImage(response.assets[0].uri);
      }
    });
  };

  const handlePost = async () => {
    try {
      const postRef = firestore().collection('posts');
      const newPostRef = await postRef.add({
        userName: profileUsername,
        userImg: await AsyncStorage.getItem('profileImage') || 'https://example.com/user.jpg',
        postTime: new Date().getTime(), // Unix zaman damgası olarak kaydet
        post: postText,
        postImg: postImage !== '' ? postImage : 'none',
        liked: false,
        likes: 0,
        comments: 0,
        userId: auth.currentUser.uid,
      });

      const newPostId = newPostRef.id;

      // Yeni postu en başa ekleyerek en son eklenenin en üstte görünmesini sağla
      setPosts([{
        id: newPostId,
        userName: profileUsername,
        userImg: await AsyncStorage.getItem('profileImage') || 'https://example.com/user.jpg',
        postTime: new Date().getTime(),
        post: postText,
        postImg: postImage !== '' ? postImage : 'none',
        liked: false,
        likes: 0,
        comments: 0,
        userId: auth.currentUser.uid
      }, ...posts]);

      setModalVisible(false);
      setModalVisible0(false);
      setPostText('');
      setPostImage('');

      Alert.alert('Success', 'Post added successfully');
    } catch (error) {
      console.error('Error adding post:', error);
      Alert.alert('Error', 'Failed to add post. Please try again.');
    }
  };

  const handleDeletePost = async (item) => {
    try {
      // Delete post from Firestore
      await firestore().collection('posts').doc(item.id).delete();
  
      // Remove the deleted post from the state
      setPosts(posts => posts.filter(post => post.id !== item.id));
  
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post. Please try again.');
    }
  };
  

  const closeModal = () => {
    setSelectedImage('');
    setModalVisible0(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.addButtonContainer}>
        <Text style={styles.title}>RelaxAwaySocial</Text>

        <TouchableOpacity style={styles.addButton} onPress={handleAddPost}>
          <Text style={styles.buttonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          
            <PostCard item={item} onDelete={handleDeletePost} />

        )}
        keyExtractor={(item) => item.id}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible0}
        onRequestClose={() => setModalVisible0(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            {selectedImage !== '' && <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Adding New Post</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Write your post here..."
              value={postText}
              onChangeText={(text) => setPostText(text)}
              multiline={true}
            />
            <TouchableOpacity style={styles.imagePickerButton} onPress={handlePostImagePicker}>
              <Text style={styles.imagePickerButtonText}>Select Image</Text>
            </TouchableOpacity>
            {postImage !== '' && <Image source={{ uri: postImage }} style={{ width: 200, height: 200, borderRadius: 10, marginTop: 10 }} />}
            <View style={styles.buttonContainer}>
        <Button title="Post" onPress={handlePost} color='#6327ce' />
      </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

AdminSocialScreen.navigationOptions = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
    margin: 20,
  },
  addButton: {
    backgroundColor: '#6327ce',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color:'#6327ce',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    marginRight: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6327ce',
  },
  input: {
    width: '100%',
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 3,
    marginTop: 20,
    marginBottom:20,
    width:'80%',
    borderColor: '#6327ce',
    borderWidth: 1,
    
  },
  imagePickerButtonText: {
    color: '#6327ce',
    fontSize: 16,
    textAlign:'center',
  },
  buttonContainer: {
    width: '80%',
    borderRadius: 10,
  },
});

export default AdminSocialScreen;
