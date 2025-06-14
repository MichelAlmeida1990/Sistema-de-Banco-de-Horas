// src/js/firebase.js
// This file now just exports the global Firebase instances that are initialized in index.html

// Export the global instances
export const app = window.firebase;
export const auth = window.auth;
export const db = window.db;

// Log confirmation
console.log('✅ Firebase exports configured');
