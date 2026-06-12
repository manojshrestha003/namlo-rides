
import {initializeApp} from 'firebase/app'
import {getDatabase} from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCKvpP4eVgVsUr-JS2lyrxw4Pcprig6PQY",
  authDomain: "namlo-rides.firebaseapp.com",
  databaseURL: "https://namlo-rides-default-rtdb.firebaseio.com/",
  projectId: "namlo-rides",
  storageBucket: "namlo-rides.firebasestorage.app",
  messagingSenderId: "595122403138",
  appId: "1:595122403138:web:28f3964ba969e542023adb"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app)