import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Modal, FlatList } from 'react-native';
import { auth } from '../firebase';
import firestore from '@react-native-firebase/firestore';

export default function MyPosts() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [userPosts, setUserPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserPosts(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserPosts = async (uid) => {
    try {
      const userPostsRef = firestore().collection('posts').where('userId', '==', uid);
      const userPostsSnapshot = await userPostsRef.get();
      const userPostsData = userPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserPosts(userPostsData);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const deletePost = async (postId) => {
    try {
      await firestore().collection('posts').doc(postId).delete();
      setUserPosts(userPosts.filter(post => post.id !== postId));
      Alert.alert('Success', 'Post deleted successfully.');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'An error occurred while deleting the post.');
    }
  };

  const handleImagePress = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View key={item.id} style={styles.postContainer}>
      {item.postImg && (
        <TouchableOpacity onPress={() => handleImagePress(item.postImg)}>
          <Image source={{ uri: item.postImg }} style={styles.postImage} />
        </TouchableOpacity>
      )}
      {item.post && (
        <>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.postText}>{item.post}</Text>
          <View style={styles.postDetails}>
            <Text style={styles.likes}>{item.likes} Likes</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deletePost(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <FlatList
      data={userPosts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  postContainer: {
    width: 250,
    backgroundColor: '#AFD89D',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postImage: {
    width: 70,
    height: 70,
    marginBottom: 10,
    borderRadius: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
    marginBottom: 5,
  },
  postDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likes: {
    marginRight: 10,
  },
  likeButton: {
    backgroundColor: 'lightblue',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  likeText: {
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#345427',
    padding: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'purple',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});
