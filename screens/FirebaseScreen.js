import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import jsonData from '../data/temp.json';
import Toast from 'react-native-toast-message';


const FirebaseScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    // Enable offline persistence
    firestore().settings({
      persistence: true,
    });

    const subscriber = firestore()
      .collection('users')
      .onSnapshot(querySnapshot => {
        const users = [];
        querySnapshot.forEach(documentSnapshot => {
          users.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setUserData(users);
      });

    return () => subscriber();
  }, []);

  const writeUserData = () => {
    setLoading(true);
    firestore()
      .collection('users')
      .add({
        name: name,
        age: age,
      })
      .then(() => {
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Data added successfully!',
        });
        setName('');
        setAge('');
        setUserData(null); // Clear displayed user data
      })
      .catch(error => {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Error adding data',
          text2: error.message,
        });
      });
  };

  const updateUserDataFromJson = async () => {
    setLoading(true);
  
    try {
      const promises = jsonData.map(item => {
        return firestore()
          .collection('users')
          .add(item)
          .then(() => {
            console.log(`Added ${item.name}`);
          })
          .catch(error => {
            console.error(`Error adding document for ${item.name}:`, error);
            Toast.show({
              type: 'error',
              text1: 'Error adding document',
              text2: `Error for ${item.name}: ${error.message}`,
            });
            return null;
          });
      });
      await Promise.all(promises);
      const querySnapshot = await firestore().collection('users').get();
  
      const users = [];
      querySnapshot.forEach(documentSnapshot => {
        users.push({
          ...documentSnapshot.data(),
          id: documentSnapshot.id,
        });
      });
  
      // Navigate to UserListScreen with user data
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'All data added successfully!',
      });
      navigation.navigate('UserListScreen', { users });
  
    } catch (error) {
      setLoading(false);
      console.error("Error in updateUserDataFromJson:", error);
      Toast.show({
        type: 'error',
        text1: 'Error updating data',
        text2: error.message,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        style={styles.input}
      />
       <TouchableOpacity style={styles.button} onPress={writeUserData} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={updateUserDataFromJson} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update from JSON</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginBottom :10,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  userDataContainer: {
    marginTop: 20,
  },
  userDataItem: {
    marginTop: 10,
  },
  userDataBottom: {
    marginBottom: 15,
  },
});

export default FirebaseScreen;
