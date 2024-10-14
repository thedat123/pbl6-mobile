// import { getFirebaseApp } from '../firebaseHelper';
// import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, initializeAuth, signInWithRedirect, connectAuthEmulator } from 'firebase/auth';
// import { child, getDatabase, ref, set, update } from 'firebase/database';
// import { authenticate, logout } from '../../store/authSlice';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getUserData } from './userActions';
// import { getApp, getApps } from 'firebase/app';
// import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';

// let timer;

// export const signUp = (userName, email, password) => {
//     return async (dispatch) => {
//         let app, auth;

//         try {
//             // Initialize Firebase App and Auth
//             if (!getApps().length) {
//                 app = getFirebaseApp();
//                 auth = initializeAuth(app, {
//                     persistence: getReactNativePersistence(AsyncStorage),
//                 });
//             } else {
//                 app = getApp();
//                 auth = getAuth(app);
//             }

//             // Create user with email and password
//             const result = await createUserWithEmailAndPassword(auth, email, password);
//             const { uid, stsTokenManager } = result.user;
//             const { accessToken, expirationTime } = stsTokenManager;

//             const expiryDate = new Date(expirationTime);
//             const timeNow = new Date();
//             const millisecondsUntilExpiry = expiryDate - timeNow;

//             const userData = await createUser(userName, email, uid);

//             dispatch(authenticate({ token: accessToken, userData }));
//             saveDataToStorage(accessToken, uid, expiryDate);

//             // Set up auto-logout timer
//             timer = setTimeout(() => {
//                 dispatch(userLogout());
//             }, millisecondsUntilExpiry);
//         } catch (error) {
//             console.log("Error during sign-up: ", error);

//             const errorCode = error.code;
//             let message = "Something went wrong.";

//             if (errorCode === "auth/email-already-in-use") {
//                 message = "This email is already in use";
//             } else if (errorCode === "auth/network-request-failed") {
//                 message = "Network request failed. Please check your connection.";
//             } else if (errorCode === "auth/emulator-config-failed") {
//                 message = "Emulator configuration failed. Ensure that the emulator is running and correctly configured.";
//             }

//             throw new Error(message);
//         }
//     };
// };


// export const signIn = (email, password) => {
//     return async (dispatch) => {
//         let app, auth;
//         try {
//             if (!getApps().length) {
//                 app = getFirebaseApp();
//                 auth = initializeAuth(app, {
//                     persistence: getReactNativePersistence(AsyncStorage),
//                 });
//             } else {
//                 app = getApp();
//                 auth = getAuth(app);
//             }

//             // Sign in user with email and password
//             const result = await signInWithEmailAndPassword(auth, email, password);
//             const { uid, stsTokenManager } = result.user;
//             const { accessToken, expirationTime } = stsTokenManager;

//             const expiryDate = new Date(expirationTime);
//             const timeNow = new Date();
//             const millisecondsUntilExpiry = expiryDate - timeNow;

//             const userData = await getUserData(uid);

//             dispatch(authenticate({ token: accessToken, userData }));
//             saveDataToStorage(accessToken, uid, expiryDate);

//             timer = setTimeout(() => {
//                 dispatch(userLogout());
//             }, millisecondsUntilExpiry);

//         } catch (error) {
//             const errorCode = error.code;

//             let message = "Something went wrong.";

//             if (errorCode === "auth/wrong-password" || errorCode === "auth/user-not-found") {
//                 message = "The username or password was incorrect";
//             }

//             throw new Error(message);
//         }
//     };
// };

// export const userLogout = () => {
//     return async (dispatch) => {
//         try {
//             await AsyncStorage.clear();
//             clearTimeout(timer);
//             dispatch(logout()); // Ensure this action is defined
//         } catch (error) {
//             console.error("Failed to clear storage or logout:", error);
//         }
//     };
// };

// export const updateSignedInUserData = async (userId, newData) => {
//     if (newData.userName) {
//         const firstLast = `${newData.userName}`.toLowerCase();
//         newData.firstLast = firstLast;
//     }

//     const dbRef = ref(getDatabase());
//     const childRef = child(dbRef, `users/${userId}`);
//     await update(childRef, newData);
// };

// const createUser = async (userName, email, userId) => {
//     const firstLast = `${userName}`.toLowerCase();
//     const userData = {
//         firstLast,
//         email,
//         userId,
//         signUpDate: new Date().toISOString(),
//     };

//     const dbRef = ref(getDatabase());
//     const childRef = child(dbRef, `users/${userId}`);
//     await set(childRef, userData);
//     return userData;
// };

// const saveDataToStorage = async (token, userId, expiryDate) => {
//     try {
//         await AsyncStorage.setItem("userData", JSON.stringify({
//             token,
//             userId,
//             expiryDate: expiryDate.toISOString(),
//         }));
//     } catch (error) {
//         console.error("Failed to save data to storage:", error);
//     }
// };

