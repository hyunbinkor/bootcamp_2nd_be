import admin from 'firebase-admin';
import serviceAccount from '../../firebaseconfig.json';
import { storeBucketName } from '../constant/env';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: storeBucketName
});
export const db = admin.firestore();
export const auth = admin.auth(admin);
export const storage = admin.storage(admin);
