// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBw3u5X8ijtgXPAGxitGDq5cHeAita6cqY',
  authDomain: 'robosnap-6be23.firebaseapp.com',
  projectId: 'robosnap-6be23',
  storageBucket: 'robosnap-6be23.appspot.com',
  messagingSenderId: '988410923552',
  appId: '1:988410923552:web:5949e8f06475f7a64e8a45',
  measurementId: 'G-TC6CDQLSHL',
  databaseURL: 'https://robosnap-6be23-default-rtdb.europe-west1.firebasedatabase.app',
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize the database
const db = getDatabase(app);

export { app, db };
