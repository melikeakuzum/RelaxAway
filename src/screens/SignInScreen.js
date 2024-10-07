import { StyleSheet, TextInput, Text, View, KeyboardAvoidingView, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { useNavigation } from '@react-navigation/native';

export default function SignInScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    useEffect( ()=> {
        auth.onAuthStateChanged(user => {
            if(user){
                navigation.navigate('HomeScreen');
            }
        })
    })

    const handleSignIn = () => {
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                if (user.email === "admin@admin.com") {
                    alert("Signed in!");
                    console.log('User sign in:', user.email);
                    console.log(user.getIdToken);
                    navigation.navigate('AdminHomeScreen'); // Redirect to AdminHomeScreen
                } else {
                    alert("Signed in!");
                    console.log('User sign in:', user.email);
                    console.log(user.getIdToken);
                    navigation.navigate('HomeScreen'); // Redirect to HomeScreen for non-admin users
                }
            })
            .catch(error => alert("Wrong! Check your email and password please."));
    }
    

    const navigate = () => {
        navigation.navigate('SignUpScreen'); // Navigate to SignUpScreen
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior='padding'>
                <View>
                <Image source={require('./../icons/logo-black.png')} style={{ width: 200, height: 200, marginBottom:50, marginTop:-50 }} />
                </View>
            <View style={styles.inputContainer}>
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
                    onPress={handleSignIn}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={navigate}
                    style={[styles.button, styles.outlineButton]}>
                    <Text style={styles.outlineButtonText}>Sign Up</Text>
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
