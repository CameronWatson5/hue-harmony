import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { generatePalette } from '../utils/colorUtils';

const ColorPalette = () => {
  const [palette, setPalette] = useState(() => generatePalette());

  const generateNewPalette = useCallback(() => {
    setPalette(generatePalette());
  }, []);

  const copyToClipboard = async (color) => {
    try {
      await navigator.clipboard.writeText(color);
      // TODO: Add toast notification
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  return (
    <Container>
      <Header>
        <h2>Color Palette</h2>
        <GenerateButton onClick={generateNewPalette}>
          Generate New Palette
        </GenerateButton>
      </Header>
      <PaletteGrid>
        {palette?.colors.map((color, index) => (
          <ColorCard key={index} $backgroundColor={color}>
            <ColorInfo onClick={() => copyToClipboard(color)}>
              <span>{color}</span>
            </ColorInfo>
          </ColorCard>
        ))}
      </PaletteGrid>
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

  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
`;

const GenerateButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #357abd;
  }
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const ColorCard = styled.div`
  position: relative;
  padding-bottom: 100%;
  background-color: ${props => props.$backgroundColor};
  border-radius: 8px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const ColorInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem;
  text-align: center;
  font-family: monospace;
  font-size: 0.875rem;
  cursor: pointer;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

export default ColorPalette;
