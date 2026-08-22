import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  getDocs,
  writeBatch,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { loadFirebaseConfig } from './firebase-config.js';

const APPLICATIONS_COLLECTION = 'applications';

let db = null;

try {
  const firebaseConfig = await loadFirebaseConfig();
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase application storage setup failed:', error);
  db = null;
}

function normalizeApplication(app = {}, id = '') {
  return {
    id: app.id || id || app.id || '',
    studentName: app.studentName || '',
    dob: app.dob || '',
    gender: app.gender || '',
    parentName: app.parentName || '',
    parentPhone: app.parentPhone || '',
    email: app.email || '',
    address: app.address || '',
    classApplying: app.classApplying || app.class || '',
    prevSchool: app.prevSchool || 'N/A',
    docName: app.docName || app.documentName || 'not_uploaded.pdf',
    docType: app.docType || 'application/pdf',
    docSize: Number(app.docSize || 0),
    status: app.status || 'pending',
    createdAt: app.createdAt || new Date().toISOString(),
    updatedAt: app.updatedAt || new Date().toISOString()
  };
}

async function addApplication(appData) {
  const payload = normalizeApplication({ ...appData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

  if (!db) throw new Error('Firestore is not available');

  try {
    const appsRef = collection(db, APPLICATIONS_COLLECTION);
    const docRef = doc(appsRef);
    payload.id = docRef.id;
    await setDoc(docRef, payload);
    return payload;
  } catch (error) {
    console.error('Firestore addApplication failed:', error);
    throw error;
  }
}

async function getApplications() {
  if (!db) throw new Error('Firestore is not available');

  try {
    const appsRef = collection(db, APPLICATIONS_COLLECTION);
    const q = query(appsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const firestoreApps = [];
    snapshot.forEach((docSnap) => {
      firestoreApps.push(normalizeApplication(docSnap.data(), docSnap.id));
    });

    return firestoreApps;
  } catch (error) {
    console.error('Unable to load applications from Firestore:', error);
    throw error;
  }
}

async function getApplicationById(id) {
  if (!id) return null;
  if (!db) throw new Error('Firestore is not available');

  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = normalizeApplication(snap.data(), snap.id);
    return data;
  } catch (error) {
    console.error('Firestore getApplicationById failed:', error);
    throw error;
  }
}

async function updateApplicationStatus(id, newStatus) {
  if (!id) return null;

  if (!db) throw new Error('Firestore is not available');

  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, id);
    const updatedAt = new Date().toISOString();
    await updateDoc(docRef, { status: newStatus, updatedAt });
    return { id, status: newStatus, updatedAt };
  } catch (error) {
    console.error('Firestore updateApplicationStatus failed:', error);
    throw error;
  }
}

async function clearApplications() {
  if (!db) throw new Error('Firestore is not available');

  try {
    const appsRef = collection(db, APPLICATIONS_COLLECTION);
    const snapshot = await getDocs(appsRef);
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
    return [];
  } catch (error) {
    console.error('Firestore clearApplications failed:', error);
    throw error;
  }
}

// APPLICATIONS: Expose Firestore methods to existing page code.
window.ApplicationDB = {
  addApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  clearApplications
};

function patchGlobalDB() {
  if (!window.DB) return;

  // Only patch methods that exist on the global DB
  if (typeof window.ApplicationDB.addApplication === 'function') {
    window.DB.createApplication = window.ApplicationDB.addApplication;
  }
  if (typeof window.ApplicationDB.getApplications === 'function') {
    window.DB.getApplications = window.ApplicationDB.getApplications;
  }
  if (typeof window.ApplicationDB.getApplicationById === 'function') {
    window.DB.getApplicationById = window.ApplicationDB.getApplicationById;
  }
  if (typeof window.ApplicationDB.updateApplicationStatus === 'function') {
    window.DB.updateApplicationStatus = window.ApplicationDB.updateApplicationStatus;
  }
  if (typeof window.ApplicationDB.clearApplications === 'function') {
    window.DB.clearApplications = window.ApplicationDB.clearApplications;
  }
}

patchGlobalDB();
