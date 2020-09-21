import * as firebase from "firebase/app";
import "firebase/database";
import "firebase/firebase-auth";

const firebaseConfig = {
    apiKey: "AIzaSyDR8C1T68nY7LLjd4FiKVfuWrN87agFF-4",
    authDomain: "olek-phbook.firebaseapp.com",
    databaseURL: "https://olek-phbook.firebaseio.com",
    projectId: "olek-phbook",
    storageBucket: "olek-phbook.appspot.com",
    messagingSenderId: "258750302214",
    appId: "1:258750302214:web:c3edf517537415eab6db87",
    measurementId: "G-VRHTTC0T9G"
  };
  
firebase.initializeApp(firebaseConfig);

export const firebaseDb = firebase.database();
export const firebaseAuth = firebase.auth();

