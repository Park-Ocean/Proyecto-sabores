// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { 
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    serverTimestamp,
    orderBy,
    setDoc,
    deleteDoc
} from "firebase/firestore";

import { getFunctions, httpsCallable } from "firebase/functions";
// -----------------------------

const firebaseConfig = {
  apiKey: "AIzaSyBY2v5ip4Ozmqp3Qc4ZIyDOoJceo_SwVBs",
  authDomain: "sabores-web.firebaseapp.com",
  projectId: "sabores-web",
  storageBucket: "sabores-web.firebasestorage.app",
  messagingSenderId: "726699207665",
  appId: "1:726699207665:web:c5acc57103eb5c4c297250",
};
const app = initializeApp(firebaseConfig);

// Instancias
export const auth = getAuth(app);
export const db = getFirestore(app);

export const functions = getFunctions(app);

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    console.error("Error en login:", error.code, error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log("Usuario deslogueado exitosamente");
  } catch (error) {
    console.error("Error en logout:", error.code, error.message);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  const userDocRef = doc(db, "usuarios", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data();
  } else {
    console.error("No existe perfil de usuario para el UID:", uid);
    return null;
  }
};


export const registerClient = async (email, password, additionalData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userDocRef = doc(db, "usuarios", user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      rol: "cliente",
      ...additionalData,
      rol: "cliente",
      ...additionalData,
    };
    await setDoc(userDocRef, userData);
    return userCredential;
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.error("Error: El correo electrónico ya está en uso.");
    } else if (error.code === "auth/weak-password") {
      console.error("Error: La contraseña es demasiado débil.");
    } else {
      console.error(
        "Error en el registro de cliente:",
        error.code,
        error.message
      );
    }
    throw error;
  }
};


export const onAuthStateChangedHelper = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// --- Platos ---
export const getAllPlatos = async () => {
  const platosCollectionRef = collection(db, "platos");
  const querySnapshot = await getDocs(platosCollectionRef);

  const platos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return platos;
};

export const getPlatosDisponibles = async () => {
  // Fuente de verdad: isDisponible === true
  const ref = collection(db, "platos");
  const qIs = query(ref, where("isDisponible", "==", true));
  const qs = await getDocs(qIs);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createPlato = async (platoData) => {
  const ref = collection(db, "platos");
  try {
    const isDisp =
      typeof platoData?.isDisponible === "boolean"
        ? platoData.isDisponible
        : false;

    const nuevoPlato = {
      ...platoData,
      isDisponible: isDisp,
      // espejo por compatibilidad con datos antiguos:
      disponible: isDisp,
    };

    const docRef = await addDoc(ref, nuevoPlato);
    console.log("Nuevo plato creado con ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error al crear el plato:", error);
    throw error;
  }
};

/**
 * (Para Luciano/Admin) Elimina permanentemente un plato de la colección 'platos'.
 * @param {string} platoId - El ID del documento del plato a eliminar.
 * @returns {Promise<void>}
 */
export const deletePlato = async (platoId) => {
  // 1. Apunta al documento específico en la colección 'platos'
  const platoDocRef = doc(db, "platos", platoId);
  try {
    // 2. Llama a la función para eliminar el documento
    await deleteDoc(platoDocRef);
    console.log("Plato eliminado exitosamente:", platoId);
  } catch (error) {
    console.error("Error al eliminar el plato:", error);
    throw error; // Lanza el error para que el panel de admin lo atrape
  }
};

export const updateDisponibilidad = async (platoId, estado) => {
  const platoDocRef = doc(db, "platos", platoId);
  try {
    await updateDoc(platoDocRef, {
      isDisponible: estado,
      // espejo por compatibilidad:
      disponible: estado,
    });
    console.log("Disponibilidad actualizada para el plato:", platoId);
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    throw error;
  }
};

// --- Pedidos ---
export const createPedido = async (pedido) => {
  const ref = collection(db, "pedidos");
  try {
    const docRef = await addDoc(ref, {
      ...pedido,
      estado: "Pendiente",
      fechaCreacion: serverTimestamp(),
    });
    console.log("Pedido creado con ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw error;
  }
};

export const updatePedidoEstado = async (pedidoId, nuevoEstado) => {
  const pedidoDocRef = doc(db, "pedidos", pedidoId);
  try {
    await updateDoc(pedidoDocRef, { estado: nuevoEstado });
    console.log("Estado del pedido actualizado:", pedidoId, "a", nuevoEstado);
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    throw error;
  }
};

export const getPedidos = async () => {
  const ref = collection(db, "pedidos");
  const q = query(ref, orderBy("fechaCreacion", "desc"));
  const qs = await getDocs(q);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};
