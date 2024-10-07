import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MusicScreen from './../screens/MusicScreen';
import RecipesScreen from './RecipesScreen';
import ExerciseScreen from './../screens/ExerciseScreen';
import ProfileScreen from './ProfileScreen';
import SocialScreen from './SocialScreen';

const Tab = createBottomTabNavigator();

const socialIcon = require('../icons/icon-social-black.png');
const socialIconGreen = require('../icons/icon-social-green.png');

const recipesIcon = require('../icons/icon-recipes-black.jpg');
const recipesIconGreen = require('../icons/icon-recipes-green.jpg');

const exerciseIcon = require('../icons/icon-exercise-black.png');
const exerciseIconGreen = require('../icons/icon-exercise-green.png');

const musicIcon = require('../icons/icon-music-black.png');
const musicIconGreen = require('../icons/icon-music-green.png');

const profileIcon = require('../icons/icon-profile-black.png');
const profileIconGreen = require('../icons/icon-profile-green.png');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({headerShown:false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'SocialScreen':
                iconName = focused ? socialIconGreen : socialIcon;
                break;
              case 'RecipesScreen':
                iconName = focused ? recipesIconGreen : recipesIcon;
                break;
              case 'ExerciseScreen':
                iconName = focused ? exerciseIconGreen : exerciseIcon;
                break;
              case 'MusicScreen':
                iconName = focused ? musicIconGreen : musicIcon;
                break;
              case 'ProfileScreen':
                iconName = focused ? profileIconGreen : profileIcon;
                break;
              default:
                iconName = null;
            }
            // Customize size and color of icons
            const iconSize = route.name === 'ExerciseScreen' ? size + 10 : size; // Increase size for ExerciseScreen
            const marginBottom = route.name === 'ExerciseScreen' ? 10 : 0; // Add marginBottom for ExerciseScreen
            return <Image source={iconName} style={{ width: iconSize, height: iconSize, marginBottom: marginBottom }} />;
          },
        })}
        tabBarOptions={{
          showLabel: false, // Hide tab labels
          style: { 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0,
            borderTopWidth: 0, // Remove top border
            elevation: 0, // Remove shadow on Android
          } // TabBar at the bottom
        }}
      >
        <Tab.Screen name="SocialScreen" component={SocialScreen} />
        <Tab.Screen name="RecipesScreen" component={RecipesScreen} />
        <Tab.Screen name="ExerciseScreen" component={ExerciseScreen} />
        <Tab.Screen name="MusicScreen" component={MusicScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
