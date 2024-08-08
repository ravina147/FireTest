import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FirebaseScreen from './screens/FirebaseScreen';
import firebaseConfig from './screens/firebaseConfig';
import UserListScreen from './screens/UserListScreen'; 

import firebase from '@react-native-firebase/app';

const Stack = createNativeStackNavigator();

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const App = () => {
  useEffect(() => {
    const initFirebase = async () => {
      if (!firebase.apps.length) {
        await firebase.initializeApp(firebaseConfig);
      }
    };
    initFirebase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FirebaseScreen">
        <Stack.Screen name="FirebaseScreen" component={FirebaseScreen} />
        <Stack.Screen name="Users" component={UserListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
