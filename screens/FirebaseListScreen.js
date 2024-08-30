import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Card, Button,Title, Paragraph } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios'; // Import axios
import firebase from '@react-native-firebase/app';
import firebaseConfig from './firebaseConfig';


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const FirebaseListScreen = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);


  const initFirebase = async () => {
    if (!firebase.apps.length) {
      await firebase.initializeApp(firebaseConfig);
    }
  };

  const fetchData = async () => {
    try {
      const snapshot = await firestore().collection('maintenanceOrders').get();
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDataList(list);
    } catch (error) {
      console.error('Error fetching data: ', error);
    } finally {
      setLoading(false);
    }
  };

  // Call Cloud Function to fetch and store data in Firestore
const fetchDataFromCloudFunction = async () => {
  try {
    const response = await axios.get('https://us-central1-cnraildemo.cloudfunctions.net/fetchDataAndStoreInFirestore');
    console.log('Cloud Function Response:', response.data);
    // Optionally, refresh the Firestore data after calling the cloud function
    fetchData();
  } catch (error) {
    console.error('Error calling Cloud Function:', error);
  }
};

  // Fetch data from Firestore collection when component mounts
  useEffect(() => {

    initFirebase();
    fetchData();
  }, []);

  // Render each item as a card
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Maintenance Order: {item.MaintenanceOrder}</Title>
        <Paragraph>Order Confirmation: {item.MaintOrderConf}</Paragraph>
        <Paragraph>Actual Work Quantity: {item.ActualWorkQuantity}</Paragraph>
        {/* Add more fields as necessary */}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={fetchDataFromCloudFunction} style={styles.syncButton}>
        Sync
      </Button>
      <FlatList
        data={dataList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 4,
    padding: 8,
  },
  syncButton: {
    marginBottom: 16,
  },
});

export default FirebaseListScreen;
