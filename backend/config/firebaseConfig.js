// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCR3H8h7gexTi7slzbJNrEoFnjNKxrWTT8",
  authDomain: "shopapp-c05e2.firebaseapp.com",
  databaseURL:
    "https://shopapp-c05e2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shopapp-c05e2",
  storageBucket: "shopapp-c05e2.firebasestorage.app",
  messagingSenderId: "490305766896",
  appId: "1:490305766896:web:7ab3a2d27d0ce5408a4935",
  measurementId: "G-QY0D5ZW1GQ",
};

// Initialize Firebase
export const firebaseapp = initializeApp(firebaseConfig);
//export const analytics = getAnalytics(firebaseapp);
