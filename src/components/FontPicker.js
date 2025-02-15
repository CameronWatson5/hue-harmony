import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const GOOGLE_FONTS_API = 'https://www.googleapis.com/webfonts/v1/webfonts';
const API_KEY = process.env.REACT_APP_GOOGLE_FONTS_API_KEY;

const FontPicker = () => {
  const [fonts, setFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState('');

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const response = await fetch(
          `${GOOGLE_FONTS_API}?key=${API_KEY}&sort=popularity`
        );
        const data = await response.json();
        setFonts(data.items.slice(0, 50)); // Get top 50 popular fonts
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };

    loadFonts();
  }, []);

  const loadFontToDocument = (fontFamily) => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
      ' ',
      '+'
    )}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  };

  const handleFontChange = (fontFamily) => {
    setSelectedFont(fontFamily);
    loadFontToDocument(fontFamily);
  };

  const handleRandomFont = () => {
    const randomIndex = Math.floor(Math.random() * fonts.length);
    const randomFont = fonts[randomIndex].family;
    handleFontChange(randomFont);
  };

  return (
    <Container>
      <Header>
        <h2>Font Picker</h2>
      </Header>
      <FontSection>
        <FontGroup>
          <SelectionContainer>
            <SelectWrapper>
              <Label>Select Font</Label>
              <Select
                value={selectedFont}
                onChange={(e) => handleFontChange(e.target.value)}
              >
                <option value="">Select a font</option>
                {fonts.map((font) => (
                  <option key={font.family} value={font.family}>
                    {font.family}
                  </option>
                ))}
              </Select>
            </SelectWrapper>
            <RandomButton onClick={handleRandomFont}>
              Random Font
            </RandomButton>
          </SelectionContainer>

          {selectedFont && (
            <PreviewContainer>
              <PreviewTitle>Font Styles Preview</PreviewTitle>
              <Preview style={{ fontFamily: selectedFont, fontWeight: 400 }}>
                Regular - The quick brown fox jumps over the lazy dog
              </Preview>
              <Preview style={{ fontFamily: selectedFont, fontWeight: 700 }}>
                Bold - The quick brown fox jumps over the lazy dog
              </Preview>
              <Preview style={{ fontFamily: selectedFont, fontWeight: 400, fontStyle: 'italic' }}>
                Italic - The quick brown fox jumps over the lazy dog
              </Preview>
              <Preview style={{ fontFamily: selectedFont, fontWeight: 700, fontStyle: 'italic' }}>
                Bold Italic - The quick brown fox jumps over the lazy dog
              </Preview>
            </PreviewContainer>
          )}
        </FontGroup>
      </FontSection>
    </Container>
  );
};

const Container = styled('div')`
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

const Header = styled('div')`
  margin-bottom: 2rem;

  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
`;

const FontSection = styled('div')`
  display: grid;
  gap: 2rem;
`;

const FontGroup = styled('div')`
  display: grid;
  gap: 1rem;
`;

const SelectionContainer = styled('div')`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
`;

const SelectWrapper = styled('div')`
  flex: 1;
`;

const Label = styled('label')`
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 0.5rem;
`;

const Select = styled('select')`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
`;

const RandomButton = styled('button')`
  padding: 0.75rem 1.5rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #357abd;
  }
`;

const PreviewContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const PreviewTitle = styled('h3')`
  margin: 0;
  font-size: 1.2rem;
  color: #333;
`;

const Preview = styled('div')`
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 1.1rem;
`;

export default FontPicker;
