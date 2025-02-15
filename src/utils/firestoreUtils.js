import { collection, doc, setDoc, getDocs, deleteDoc, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';

export const savePalette = async (userId, palette) => {
  try {
    const userPalettesRef = collection(db, 'users', userId, 'palettes');
    const q = query(userPalettesRef);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.size >= 5) {
      throw new Error('Maximum number of palettes (5) reached');
    }

    const newPaletteRef = doc(userPalettesRef);
    await setDoc(newPaletteRef, {
      ...palette,
      createdAt: new Date().toISOString(),
    });
    return newPaletteRef.id;
  } catch (error) {
    console.error('Error saving palette:', error);
    throw error;
  }
};

export const getUserPalettes = async (userId) => {
  try {
    const userPalettesRef = collection(db, 'users', userId, 'palettes');
    const q = query(userPalettesRef, limit(5));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting palettes:', error);
    throw error;
  }
};

export const deletePalette = async (userId, paletteId) => {
  try {
    const paletteRef = doc(db, 'users', userId, 'palettes', paletteId);
    await deleteDoc(paletteRef);
  } catch (error) {
    console.error('Error deleting palette:', error);
    throw error;
  }
};
