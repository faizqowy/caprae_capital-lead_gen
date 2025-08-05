
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB0IbVUUe000bEcez0Nf0YkEWBp62mBa70",
  authDomain: "caprea-e969f.firebaseapp.com",
  projectId: "caprea-e969f",
  storageBucket: "caprea-e969f.appspot.com",
  messagingSenderId: "518008650878",
  appId: "1:518008650878:web:9db1b51ab15d05aedd6c2f",
  measurementId: "G-87L400EYJJ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, db, analytics };
