import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  writeBatch,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { loadFirebaseConfig } from './firebase-config.js';

const MESSAGES_COLLECTION = 'contact_messages';
let db = null;

try {
  const firebaseConfig = await loadFirebaseConfig();
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase contact-message setup failed:', error);
}

// CONTACT MESSAGES: Save public enquiries in Firestore.
async function createContactMessage(messageData) {
  if (!db) throw new Error('Firestore is not available');

  const message = {
    name: messageData.name || '',
    email: messageData.email || '',
    subject: messageData.subject || '',
    message: messageData.message || '',
    status: 'unread',
    createdAt: new Date().toISOString()
  };
  const messageRef = await addDoc(collection(db, MESSAGES_COLLECTION), message);
  return { id: messageRef.id, ...message };
}

// CONTACT MESSAGES: Read enquiries for the admin dashboard.
async function getContactMessages() {
  if (!db) throw new Error('Firestore is not available');

  const messagesSnapshot = await getDocs(
    query(collection(db, MESSAGES_COLLECTION), orderBy('createdAt', 'desc'))
  );
  return messagesSnapshot.docs.map(messageDoc => ({
    id: messageDoc.id,
    ...messageDoc.data()
  }));
}

// CONTACT MESSAGES: Mark an enquiry as read.
async function markMessageAsRead(messageId) {
  if (!db) throw new Error('Firestore is not available');
  await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), { status: 'read' });
}

// CONTACT MESSAGES: Delete one enquiry from Firestore.
async function deleteContactMessage(messageId) {
  if (!db) throw new Error('Firestore is not available');
  await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
}

// CONTACT MESSAGES: Delete all enquiries from Firestore.
async function clearContactMessages() {
  if (!db) throw new Error('Firestore is not available');
  const messagesSnapshot = await getDocs(collection(db, MESSAGES_COLLECTION));
  const batch = writeBatch(db);
  messagesSnapshot.forEach(messageDoc => batch.delete(messageDoc.ref));
  await batch.commit();
}

window.ContactMessagesDB = {
  createContactMessage,
  getContactMessages,
  markMessageAsRead,
  deleteContactMessage,
  clearContactMessages
};

// CONTACT MESSAGES: Keep existing page calls connected to Firestore.
function patchGlobalDB() {
  if (!window.DB) return;
  window.DB.createContactMessage = createContactMessage;
  window.DB.getContactMessages = getContactMessages;
  window.DB.markMessageAsRead = markMessageAsRead;
  window.DB.deleteContactMessage = deleteContactMessage;
  window.DB.clearContactMessages = clearContactMessages;
}

patchGlobalDB();
