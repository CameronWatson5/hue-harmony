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
    const userFontsRef = collection(db, 'users', userId, 'fonts');
    const q = query(userFontsRef);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.size >= 5) {
      throw new Error('Maximum number of fonts (5) reached');
    }

    const newFontRef = doc(userFontsRef);
    await setDoc(newFontRef, {
      fontFamily: font,
      createdAt: new Date().toISOString(),
    });
    return newFontRef.id;
  } catch (error) {
    console.error('Error saving font:', error);
    throw error;
  }
};

export const getUserFonts = async (userId) => {
  try {
    const userFontsRef = collection(db, 'users', userId, 'fonts');
    const q = query(userFontsRef, limit(5));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      fontFamily: doc.data().fontFamily,
      createdAt: doc.data().createdAt
    }));
  } catch (error) {
    console.error('Error getting fonts:', error);
    throw error;
  }
};

export const deleteFont = async (userId, fontId) => {
  try {
    const fontRef = doc(db, 'users', userId, 'fonts', fontId);
    await deleteDoc(fontRef);
  } catch (error) {
    console.error('Error deleting font:', error);
    throw error;
  }
};
