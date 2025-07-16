// hooks/useFirebaseUpload.js
import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const useFirebaseUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadFiles = async (files, roomId, uploaderUsername) => {
        setUploading(true);
        try {
            const uploadPromises = files.map(async (file) => {
              const uniqueFilename = `${uuidv4()}-${file.name}`;
              const storageRef = ref(storage, `uploads/${roomId}/${uploaderUsername}/${uniqueFilename}`);
              await uploadBytes(storageRef, file);
              return await getDownloadURL(storageRef);
              
            });
          const fileUrls = await Promise.all(uploadPromises);
          return fileUrls;
          
        } catch (err) {
          setError('Failed to upload files:'+ err);
          throw err;
          
        } finally {
          setUploading(false);
        }
    };

    return { uploading, error, uploadFiles };
};

export default useFirebaseUpload;