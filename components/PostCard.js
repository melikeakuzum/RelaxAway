import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../firebase';

const PostCard = ({ item, onDelete, onPress }) => {
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [likes, setLikes] = useState(item.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedPostText, setUpdatedPostText] = useState(item.post);

  useEffect(() => {
    const fetchUserProfileImage = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(item.userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserProfileImage(userData.userImageURL);
        }
      } catch (error) {
        console.error('Error fetching user profile image:', error);
      }
    };

    fetchUserProfileImage();
  }, [item.userId]);

  useEffect(() => {
    const checkLikedStatus = async () => {
      try {
        const likeSnapshot = await firestore().collection('likes')
          .where('postId', '==', item.id)
          .where('userId', '==', auth.currentUser.uid)
          .get();
        if (!likeSnapshot.empty) {
          setHasLiked(true);
        } else {
          setHasLiked(false);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    if (auth.currentUser) {
      checkLikedStatus();
    }
  }, [item.id, auth.currentUser]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(auth.currentUser.uid).get();
        if (userDoc.exists) {
          setIsAdmin(auth.currentUser.uid === "I72C1DOFpNPfTTCtPzIG8TFPcOc2");
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    if (auth.currentUser) {
      checkAdminStatus();
    }
  }, [auth.currentUser]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const checkLikedStatus = async () => {
          try {
            const likeSnapshot = await firestore().collection('likes')
              .where('postId', '==', item.id)
              .where('userId', '==', user.uid)
              .get();
            if (!likeSnapshot.empty) {
              setHasLiked(true);
            } else {
              setHasLiked(false);
            }
          } catch (error) {
            console.error('Error checking like status:', error);
          }
        };

        checkLikedStatus();
      } else {
        setHasLiked(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async () => {
    try {
      const likeSnapshot = await firestore()
        .collection('likes')
        .where('postId', '==', item.id)
        .where('userId', '==', auth.currentUser.uid)
        .get();

      if (!likeSnapshot.empty) {
        const likeDoc = likeSnapshot.docs[0];
        await likeDoc.ref.delete();
        setLikes((prevLikes) => prevLikes - 1);
        setHasLiked(false);
      } else {
        await firestore().collection('likes').add({ userId: auth.currentUser.uid, postId: item.id });
        setLikes((prevLikes) => prevLikes + 1);
        setHasLiked(true);
      }

      await firestore().collection('posts').doc(item.id).update({ likes: likes + (hasLiked ? -1 : 1) });
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if ((item.userId !== auth.currentUser.uid) && !isAdmin) {
        Alert.alert('Unauthorized', 'You are not authorized to delete this post');
        return;
      }
      Alert.alert(
        'Confirm Delete',
        'Are you sure to delete this post?',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          {
            text: 'Yes',
            onPress: async () => {
              try {
                await firestore().collection('posts').doc(item.id).delete();
                onDelete(item);
                Alert.alert('Success', 'Post deleted successfully');
              } catch (error) {
                console.error('Error deleting post:', error);
                Alert.alert('Error', 'Failed to delete post. Please try again.');
              }
            }
          }
        ],
        { cancelable: false }
      );

    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await firestore().collection('posts').doc(item.id).update({ post: updatedPostText });
      setIsEditing(false);
      Alert.alert('Success', 'Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post. Please try again.');
    }
  };

  const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.userInfoInside}>
          {userProfileImage && (
            <Image source={{ uri: userProfileImage }} style={styles.userImg} />
          )}
          <TouchableOpacity onPress={onPress}>
            <Text style={styles.userName}>{item.userName}</Text>
          </TouchableOpacity>
        </View>
        {((item.userId === currentUserId) || isAdmin) && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.postContent}>
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={updatedPostText}
            onChangeText={setUpdatedPostText}
          />
        ) : (
          <Text style={styles.postDescription}>{item.post}</Text>
        )}
        {item.postImg !== 'none' && (
          <Image source={{ uri: item.postImg }} style={styles.postImg} />
        )}
      </View>
      {isEditing && (
        <View style={styles.editActions}>
          <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.postFooter}>
        <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
          <Text style={[styles.likeText, { color: hasLiked ? 'red' : 'black' }]}>{hasLiked ? '❤️' : '🖤'} Like</Text>
        </TouchableOpacity>
        <Text style={styles.likes}>{likes} likes</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
  userInfoInside: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
    padding: 5,
    width: '100%',
  },
  userImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  postContent: {},
  postDescription: {
    fontSize: 14,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  postImg: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeText: {
    marginLeft: 5,
    fontSize: 16,
  },
  deleteButton: {
    marginRight: 10,
  },
  deleteButtonText: {
    color: 'red',
    fontWeight: 'bold',
  },
  editButton: {
    marginRight: 10,
  },
  editButtonText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  likes: {
    fontSize: 16,
  },
  editInput: {
    fontSize: 14,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    marginRight: 10,
  },
  saveButtonText: {
    color: 'green',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginRight: 10,
  },
  cancelButtonText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default PostCard;
