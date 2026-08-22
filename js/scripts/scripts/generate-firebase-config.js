import fs from "fs";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${key}`);
  }
}

const fileContent = `
export async function loadFirebaseConfig() {
  return ${JSON.stringify(firebaseConfig, null, 2)};
}
`;

fs.writeFileSync("firebase-config.js", fileContent);

console.log("Firebase config generated successfully.");