import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyBSQgBOiZ7Z_KXKGvqtYOdqvLZvA4P_ZUg",
  authDomain: "traderizz.firebaseapp.com",
  projectId: "traderizz",
  storageBucket: "traderizz.appspot.com",
  messagingSenderId: "68426459927",
  appId: "1:68426459927:web:b1c90c87e6687405342552",
  measurementId: "G-6KVV7Q1LJQ"
};

//const app = initializeApp(firebaseConfig);

//export { app, auth, db };

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { db, auth };