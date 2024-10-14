import { initializeApp } from "firebase/app";

export const getFirebaseApp = () => {
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyCANfH6hXex6yZ6MQYqz2RkrLFL4hLgbUQ",
        authDomain: "whatsapp-6fae4.firebaseapp.com",
        databaseURL: "https://whatsapp-6fae4-default-rtdb.firebaseio.com",
        projectId: "whatsapp-6fae4",
        storageBucket: "whatsapp-6fae4.appspot.com",
        messagingSenderId: "682990716898",
        appId: "1:682990716898:web:a1ee271929ef6292105bbb",
        measurementId: "G-188M7TC0H6"
    };
    
    // Initialize Firebase
    return initializeApp(firebaseConfig);
}
