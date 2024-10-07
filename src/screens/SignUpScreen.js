import { StyleSheet, TextInput, Text, View, KeyboardAvoidingView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../../firebase';
import firestore from '@react-native-firebase/firestore';

export default function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSignUp = async () => {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create a user document in Firestore
            await firestore().collection('users').doc(user.uid).set({
                userId: user.uid,
                username: username,
                userImage: '', // You can set this later when uploading the image
                email: email,
            });

            alert("Account created! Please sign in.");

            console.log('User:', user.email);
            console.log(user.getIdToken);

            // Sign out the user after account creation
            await auth.signOut();
            
            // Navigate to SignInScreen
            navigation.navigate('SignInScreen');
        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior='padding'>
            <View>
                <Image source={require('./../icons/logo-black.png')} style={{ width: 200, height: 200, marginBottom: 50, }} />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    value={username}
                    onChangeText={text => setUsername(text)}
                    placeholder='Username'
                    style={styles.input}
                />
                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}
                />
                <TextInput
                    secureTextEntry
                    value={password}
                    onChangeText={text => setPassword(text)}
                    placeholder='Password'
                    style={styles.input}
                />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate('SignInScreen')}
                    style={[styles.button, styles.outlineButton]}>
                    <Text style={styles.outlineButtonText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#76ee00',
        margin: "8%",
        borderRadius: 10,
    },
    inputContainer: {
        width: '80%',
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 5,
        borderRadius: 10,
    },
    buttonContainer: {
        width: '80%',
        marginTop: 40,
    },
    button: {
        backgroundColor: '#006400',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    },
    outlineButton: {
        backgroundColor: 'white',
    },
    outlineButtonText: {
        color: "#006400",
    },
});
