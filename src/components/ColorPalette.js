import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { generatePalette } from '../utils/colorUtils';
import { savePalette, getUserPalettes, deletePalette } from '../utils/firestoreUtils';
import { auth } from '../firebase';

const ColorPalette = () => {
  const [currentPalette, setCurrentPalette] = useState(() => generatePalette());
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const palettes = await getUserPalettes(user.uid);
          setSavedPalettes(palettes);
        } catch (error) {
          console.error('Error loading palettes:', error);
          showNotification('Error loading palettes', 'error');
        }
      } else {
        setSavedPalettes([]); // Clear palettes when signed out
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []); // Only run once on mount

  const generateNewPalette = useCallback(() => {
    setCurrentPalette(generatePalette());
  }, []);

  const copyToClipboard = async (color) => {
    try {
      await navigator.clipboard.writeText(color);
      showNotification(`Copied ${color} to clipboard!`, 'success');
    } catch (err) {
      showNotification('Failed to copy color', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSavePalette = async () => {
    if (!auth.currentUser) {
      showNotification('Please log in to save palettes', 'error');
      return;
    }

    if (savedPalettes.length >= 5) {
      showNotification('Maximum number of palettes (5) reached', 'error');
      return;
    }

    try {
      const id = await savePalette(auth.currentUser.uid, currentPalette);
      setSavedPalettes([...savedPalettes, { ...currentPalette, id }]);
      showNotification('Palette saved successfully!', 'success');
    } catch (error) {
      showNotification('Error saving palette', 'error');
    }
  };

  const handleDeletePalette = async (paletteId) => {
    try {
      await deletePalette(auth.currentUser.uid, paletteId);
      setSavedPalettes(savedPalettes.filter(p => p.id !== paletteId));
      showNotification('Palette deleted successfully!', 'success');
    } catch (error) {
      showNotification('Error deleting palette', 'error');
    }
  };

  return (
    <Container>
      <Header>
        <h2>Color Palette</h2>
        <ButtonGroup>
          <Button onClick={generateNewPalette}>Generate New</Button>
          <Button onClick={handleSavePalette} disabled={!auth.currentUser || savedPalettes.length >= 5}>
            Save Palette
          </Button>
        </ButtonGroup>
      </Header>

      <Section>
        <h3>Current Palette</h3>
        <SchemeInfo>Color Scheme: {currentPalette?.metadata?.scheme}</SchemeInfo>
        <PaletteGrid>
          {currentPalette?.colors.map((color, index) => (
            <ColorCard key={index} $backgroundColor={color}>
              <ColorInfo onClick={() => copyToClipboard(color)}>
                <span>{color}</span>
                <CopyIcon>📋</CopyIcon>
              </ColorInfo>
            </ColorCard>
          ))}
        </PaletteGrid>
      </Section>

      {auth.currentUser && (
        <Section>
          <h3>Saved Palettes ({savedPalettes.length}/5)</h3>
          {savedPalettes.map((palette, paletteIndex) => (
            <SavedPalette key={palette.id}>
              <PaletteGrid>
                {palette.colors.map((color, colorIndex) => (
                  <ColorCard key={colorIndex} $backgroundColor={color} $small>
                    <ColorInfo onClick={() => copyToClipboard(color)}>
                      <span>{color}</span>
                      <CopyIcon>📋</CopyIcon>
                    </ColorInfo>
                  </ColorCard>
                ))}
              </PaletteGrid>
              <DeleteButton onClick={() => handleDeletePalette(palette.id)}>
                Delete
              </DeleteButton>
            </SavedPalette>
          ))}
        </Section>
      )}

      {notification && (
        <Notification $type={notification.type}>
          {notification.message}
        </Notification>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4a90e2;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SchemeInfo = styled.p`
  margin: 0.5rem 0;
  color: #666;
  font-style: italic;
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ColorCard = styled.div`
  position: relative;
  padding-bottom: 100%;
  background-color: ${props => props.$backgroundColor};
  border-radius: 8px;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }

  ${props => props.$small && `
    padding-bottom: 60%;
  `}
`;

const ColorInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.8rem;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;

  ${ColorCard}:hover & {
    opacity: 1;
  }
`;

const CopyIcon = styled.span`
  font-size: 1rem;
`;

const SavedPalette = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  padding: 0.25rem 0.5rem;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${SavedPalette}:hover & {
    opacity: 1;
  }
`;

const Notification = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem;
  border-radius: 4px;
  color: white;
  background: ${props => {
    switch (props.$type) {
      case 'error':
        return '#ff4444';
      case 'success':
        return '#4CAF50';
      default:
        return '#4a90e2';
    }
  }};
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default ColorPalette;
