import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
// Initialize Firestore
admin.initializeApp();

import SyncManager from './SyncManager';

//const db = admin.firestore();

// exports.fetchDataAndStoreInFirestore = functions.https.onRequest(async (req, res) => {
//   try {
//     // Fetch data from the external API
//     const response = await axios.get('https://us-central1-cnraildemo.cloudfunctions.net/getProdOrderConfirmation');
//     const data = response.data;

//     if (data && data.d && Array.isArray(data.d.results)) {
//       // Extract the 'results' array from the data
//       const resultsArray = data.d.results;

//       // Handle or store the extracted 'results' array (example of storing in Firestore)
//       const batch = db.batch();
//       resultsArray.forEach((order:any) => {
//           const docRef = db.collection('maintenanceOrders').doc(`${order.MaintOrderConf}`);
//           batch.set(docRef, order);
//       });
//       await batch.commit();

//       // Send a success response with the 'results' array
//       res.status(200).send({ 
//         message: 'Data fetched and stored successfully', 
//         results: resultsArray 
//       });
//     } else {
//       // Send an error response if the expected data structure is not found
//       res.status(400).send({ error: 'Unexpected data structure received from the API.' });
//     }
//   } 
//   catch (error) {
//     console.error('Error fetching data or storing in Firestore:', error);
//     res.status(500).send({ error: 'Failed to fetch and store data'+error });
//   }
// });
// exports.getProdOrderConfirmation = functions.https.onRequest(async (req: Request, res: Response) => {
//   try {
//     // URL of the SAP OData service
//     const url: string = "https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_MAINTORDERCONFIRMATION/MaintOrderConfirmation";

//     // Query parameters
//     const params: Record<string, string | number> = {
//       "$inlinecount": "allpages",
//       "$top": 10,
//     };

//     // HTTP GET request to the SAP OData service with API Key
//     const response: AxiosResponse = await axios.get(url, {
//       headers: {
//         "Content-Type": "application/json",
//         "APIKey": "2TsJRAbwZelXAl0ivyYAGZA2xBNCaMhp", // Replace with your actual SAP API key
//       },
//       params: params,
//     });

//     // Send the response data back to the client
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Error fetching data from SAP:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

exports.getProdOrderConfirmation = functions.https.onRequest(async (req: Request, res: Response) => {
  try {
    // URL of the SAP OData service
    const url: string = "https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_MAINTORDERCONFIRMATION/MaintOrderConfirmation";

    // Query parameters
    const params: Record<string, string | number> = {
      "$inlinecount": "allpages",
      "$top": 10,
    };

    // HTTP GET request to the SAP OData service with API Key
    const response: AxiosResponse = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "APIKey": "2TsJRAbwZelXAl0ivyYAGZA2xBNCaMhp", // Replace with your actual SAP API key
      },
      params: params,
    });

    const db = admin.firestore();
    const data = response.data;

    // Check if the data contains the expected structure (data.d.results)
    if (data && data.d && Array.isArray(data.d.results)) {
      const resultsArray = data.d.results;

      // Use a batch to store data in Firestore
      const batch = db.batch();

      // Iterate over the results array
      resultsArray.forEach((order: any) => {
        // Create a document reference using the MaintOrderConf as the document ID
        const docRef = db.collection('maintenanceOrders').doc(`${order.MaintOrderConf}`);

        // Set the document with the order data
        batch.set(docRef, order);
      });

      // Commit the batch to Firestore
      await batch.commit();

      // Send a success response with the results array
      res.status(200).send({
        message: 'Data fetched and stored successfully',
        results: resultsArray
      });
    } else {
      // Send an error response if the data structure is not as expected
      res.status(400).send({ error: 'Unexpected data structure received from the API.' });
    }
  }
  catch (error) {
    console.error('Error fetching data or storing in Firestore:', error);
    res.status(500).send({ error: 'Failed to fetch and store data: ' });
  }
});

// Cloud Function to handle HTTP GET request
// fetch systems data from Firestore
export const getLocomotiveSystems =
  functions.https.onRequest(async (req, res) => {
    try {
      if (req.method !== "GET") {
        res.status(405).send("Method Not Allowed");
        return;
      }
      const hash = await SyncManager.getHash();
      if (hash === req.query.hash &&  hash !== "") {
        res.status(201).header({ hashCode: hash }).json({ hashmatch: true });
      } else {
        const db = admin.firestore();
        // Reference to the Firestore collection
        const locomotiveSystemsRef = db.collection("locomotiveSystems");

        // Fetch documents from the collection
        const snapshot = await locomotiveSystemsRef.get();

        if (snapshot.empty) {
          res.status(404).json({ message: "No locomotive systems found" });
          return;
        }

        // Parse Firestore documents into a JSON array
        const locomotiveSystems: Array<any> = [];
        snapshot.forEach((doc) => {
          locomotiveSystems.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Convert the fetched data to a JSON string
        const jsonString = JSON.stringify(locomotiveSystems);



        await SyncManager.computeHash(jsonString);
        res.status(200).header({ hashCode: hash }).json(locomotiveSystems);
      }

    } catch (error) {
      console.error("Error fetching locomotive systems:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
// Firestore trigger to listen to any write operation (create, update, delete) in the 'locomotiveSystems' collection
exports.observeLocomotiveSystemsChanges = functions.firestore
  .document('locomotiveSystems/{docId}')
  .onWrite(async (change, context) => {
    try {
      const db = admin.firestore();
      // Fetch all documents in 'locomotiveSystems' collection
      const snapshot = await db.collection('locomotiveSystems').get();

      // Initialize an array to store all document data
      let locomotiveSystems: any = [];

      // Iterate through all Firestore documents in the collection
      snapshot.forEach(doc => {
        locomotiveSystems.push({
          id: doc.id,
          ...doc.data()
        });
      });

      await SyncManager.computeHash(JSON.stringify(locomotiveSystems));

      // Log the hash code or store it somewhere

      console.log('Updated Hash Code of Locomotive Systems Collection:', await SyncManager.getHash());

    } catch (error) {
      console.error('Error computing hash for locomotiveSystems collection:', error);
    }
  });