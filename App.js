import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FirebaseScreen from './screens/FirebaseScreen';
import firebaseConfig from './screens/firebaseConfig';
import UserListScreen from './screens/UserListScreen'; 
import axios from 'axios'; // Import axios

import firebase from '@react-native-firebase/app';
import FirebaseListScreen from './screens/FirebaseListScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FirebaseScreen">
        {/* <Stack.Screen name="FirebaseScreen" component={FirebaseScreen} />
        <Stack.Screen name="Users" component={UserListScreen} /> */}
        <Stack.Screen name="FirebaseScreen" component={FirebaseListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
