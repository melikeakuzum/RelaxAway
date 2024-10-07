import * as React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

import MusicScreen from './src/screens/MusicScreen';
import PianoScreen from './src/screens/MusicListScreens/PianoScreen';
import HomeScreen from './src/screens/HomeScreen';
import CelloScreen from './src/screens/MusicListScreens/CelloScreen';
import OboeScreen from './src/screens/MusicListScreens/OboeScreen';
import ViolaScreen from './src/screens/MusicListScreens/ViolaScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import AdminExerciseScreen from './src/screens/AdminExerciseScreen';
import BreathingExercises from './src/screens/AllExerciseScreen.js/BreathingExercises';
import NatureSoundsAndMusic from './src/screens/AllExerciseScreen.js/NatureSoundsAndMusic';
import SleepExercises from './src/screens/AllExerciseScreen.js/SleepExercises';
import VisualizationAndImagination from './src/screens/AllExerciseScreen.js/VisualizationAndImagination';
import YogaAndMovement from './src/screens/AllExerciseScreen.js/YogaAndMovement';
import AffirmationsAndMantras from './src/screens/AllExerciseScreen.js/AffirmationsAndMantras';
import ExercisePlayScreen from './src/screens/AllExerciseScreen.js/ExercisePlayScreen';

const Stack = createNativeStackNavigator();

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

const getToken = async () => {
  const token = await messaging().getToken()
  console.log("Token =  ", token)
}

function App() {
  useEffect(() => {
    async function initializeMessaging() {
      await requestUserPermission();
      getToken();
    }
    initializeMessaging();
  }, []);

  const renderTitle = (screen) => (
    <View style={screen === 'HomeScreen' || screen === 'AdminHomeScreen' || screen === 'SignInScreen' || screen === 'SignUpScreen' ? styles.headerTitleContainerHome : styles.headerTitleContainerMusic}>
      <Text style={styles.titleText}>Relax</Text>
      <Image source={require('./src/icons/logo-basic.png')} style={styles.logo} />
      <Text style={styles.titleText}>Away</Text>
    </View>
  );

  const commonHeaderOptions = (screen) => ({
    headerTitle: () => renderTitle(screen),
    headerShown: true,
    headerStyle: {
      backgroundColor: '#76ee00',
    },
    headerTintColor: 'black',
  });

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          contentStyle: {
            backgroundColor: '#76ee00',
            flexGrow: 1,
          },
        }}
      >
        <Stack.Screen
          name="RelaxAway"
          component={SignInScreen}
          options={commonHeaderOptions("RelaxAway")}
        />
        <Stack.Screen name="SignInScreen" component={SignInScreen} options={{
          ...commonHeaderOptions("SignInScreen"),
          headerLeft: () => null,
          headerBackVisible: false,
        }} 
        
        />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{
          ...commonHeaderOptions("SignUpScreen"),
          headerLeft: () => null,
          headerBackVisible: false,
        }} />
        <Stack.Screen name="PianoScreen" component={PianoScreen} options={commonHeaderOptions("PianoScreen")} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{
          ...commonHeaderOptions("HomeScreen"),
          headerLeft: () => null,
          headerBackVisible: false,
        }} />
        <Stack.Screen name="CelloScreen" component={CelloScreen} options={commonHeaderOptions("CelloScreen")} />
        <Stack.Screen name="OboeScreen" component={OboeScreen} options={commonHeaderOptions("OboeScreen")} />
        <Stack.Screen name="ViolaScreen" component={ViolaScreen} options={commonHeaderOptions("ViolaScreen")} />
        <Stack.Screen name="MusicScreen" component={MusicScreen} options={commonHeaderOptions("MusicScreen")} />
        <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} options={{
          ...commonHeaderOptions("AdminHomeScreen"),
          headerLeft: () => null,
          headerBackVisible: false,
        }} />
        <Stack.Screen name="AdminExerciseScreen" component={AdminExerciseScreen} options={commonHeaderOptions("AdminExerciseScreen")} />
        <Stack.Screen name="AffirmationsAndMantras" component={AffirmationsAndMantras} options={commonHeaderOptions("AffirmationsAndMantras")} />
        <Stack.Screen name="BreathingExercises" component={BreathingExercises} options={commonHeaderOptions("BreathingExercises")} />
        <Stack.Screen name="NatureSoundsAndMusic" component={NatureSoundsAndMusic} options={commonHeaderOptions("NatureSoundsAndMusic")} />
        <Stack.Screen name="SleepExercises" component={SleepExercises} options={commonHeaderOptions("SleepExercises")} />
        <Stack.Screen name="VisualizationAndImagination" component={VisualizationAndImagination} options={commonHeaderOptions("VisualizationAndImagination")} />
        <Stack.Screen name="YogaAndMovement" component={YogaAndMovement} options={commonHeaderOptions("YogaAndMovement")} />
        <Stack.Screen name="ExercisePlayScreen" component={ExercisePlayScreen} options={commonHeaderOptions("ExercisePlayScreen")} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerTitleContainerHome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginLeft: -15,
  },
  headerTitleContainerMusic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -50,  // Shift more to the left for music-related screens
    width: '100%',
  },
  titleText: {
    color: 'white',
    fontFamily: 'Cochin',
    fontSize: 19,
  },
  logo: {
    width: 50,
    height: 50,
    marginHorizontal: 10,
  },
});

export default App;
