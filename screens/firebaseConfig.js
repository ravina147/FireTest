import 'firebase/firestore'; 
import firebase from '@react-native-firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyC0hKo5SPN_7QbAAUG5iKSi2NTcI6u8Ru8",
    authDomain: "cnraildemo.firebaseapp.com",
    databaseURL: "https://cnraildemo-default-rtdb.firebaseio.com",
    projectId: "cnraildemo",
    storageBucket: "cnraildemo.appspot.com",
    messagingSenderId: "29109327480",
    appId: "1:29109327480:web:ec83cd599b8ef38accff8d",
    measurementId: "G-78G8JTC9L9"
  };

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export the Firestore instance to use elsewhere in your app
const db = firebase.firestore();

export { db };

export default firebaseConfig;

