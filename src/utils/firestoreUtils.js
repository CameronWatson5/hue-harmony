import { collection, doc, setDoc, getDocs, deleteDoc, query, where, limit, getDoc } from 'firebase/firestore';
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

export const saveFont = async (userId, font) => {
  try {
    // We'll store only one font per user, so we'll use a fixed document ID
    const userFontRef = doc(db, 'users', userId, 'preferences', 'font');
    await setDoc(userFontRef, {
      fontFamily: font,
      updatedAt: new Date().toISOString(),
    });
    return 'font';
  } catch (error) {
    console.error('Error saving font:', error);
    throw error;
  }
};

export const getUserFont = async (userId) => {
  try {
    const userFontRef = doc(db, 'users', userId, 'preferences', 'font');
    const fontDoc = await getDoc(userFontRef); // getDoc instead of getDocs
    
    if (fontDoc.exists()) {
      return fontDoc.data().fontFamily;
    }
    return null;
  } catch (error) {
    console.error('Error getting font:', error);
    throw error;
  }
};
