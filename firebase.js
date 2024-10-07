// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAYEjkZRur3Weu4W6-gnBZr8FhIo3yfh4w",
  authDomain: "demoproject-4e897.firebaseapp.com",
  projectId: "demoproject-4e897",
  storageBucket: "demoproject-4e897.appspot.com",
  messagingSenderId: "103052042421",
  appId: "1:103052042421:web:6e9bbd4bd5e77de60a9efc",
  measurementId: "G-3LFTEZ9SNT"
};
if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}
const auth= firebase.auth();
export {auth};