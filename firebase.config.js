// Firebase configuration object containing keys and identifiers for the app
var firebaseConfig = {
    apiKey: "AIzaSyAwBKZbj7SrsQbLLH9T3Dr3eA_mXu54E3k",
    authDomain: "quizapp-4ce34.firebaseapp.com",
    projectId: "quizapp-4ce34",
    storageBucket: "quizapp-4ce34.appspot.com",
    messagingSenderId: "1039516347141",
    appId: "1:1039516347141:web:22637abe16ba8f4c11a56c"
};

// Initialize Firebase only if it hasn't been initialized yet
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export the authentication instance for use in other files

const auth = firebase.auth();
const db = firebase.firestore();
