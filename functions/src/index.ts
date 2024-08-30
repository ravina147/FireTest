import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

exports.fetchDataAndStoreInFirestore = functions.https.onRequest(async (req, res) => {
  try {
    // Fetch data from the external API
    const response = await axios.get('https://us-central1-cnraildemo.cloudfunctions.net/getProdOrderConfirmation');
    const data = response.data;

    if (data && data.d && Array.isArray(data.d.results)) {
      // Extract the 'results' array from the data
      const resultsArray = data.d.results;

      // Handle or store the extracted 'results' array (example of storing in Firestore)
      const batch = db.batch();
      resultsArray.forEach((order:any) => {
          const docRef = db.collection('maintenanceOrders').doc(`${order.MaintOrderConf}`);
          batch.set(docRef, order);
      });
      await batch.commit();

      // Send a success response with the 'results' array
      res.status(200).send({ 
        message: 'Data fetched and stored successfully', 
        results: resultsArray 
      });
    } else {
      // Send an error response if the expected data structure is not found
      res.status(400).send({ error: 'Unexpected data structure received from the API.' });
    }
  } 
  catch (error) {
    console.error('Error fetching data or storing in Firestore:', error);
    res.status(500).send({ error: 'Failed to fetch and store data'+error });
  }
});
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

    // Send the response data back to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching data from SAP:", error);
    res.status(500).send("Internal Server Error");
  }
});
