import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const GOOGLE_FONTS_API = 'https://www.googleapis.com/webfonts/v1/webfonts';
const API_KEY = process.env.REACT_APP_GOOGLE_FONTS_API_KEY;

const FontPicker = () => {
  const [fonts, setFonts] = useState([]);
  const [selectedHeadingFont, setSelectedHeadingFont] = useState('');
  const [selectedBodyFont, setSelectedBodyFont] = useState('');

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
    )}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  };

  const handleHeadingFontChange = (font) => {
    setSelectedHeadingFont(font);
    loadFontToDocument(font);
  };

  const handleBodyFontChange = (font) => {
    setSelectedBodyFont(font);
    loadFontToDocument(font);
  };

  return (
    <Container>
      <Header>
        <h2>Font Picker</h2>
      </Header>
      <FontSection>
        <FontGroup>
          <Label>Heading Font</Label>
          <Select
            value={selectedHeadingFont}
            onChange={(e) => handleHeadingFontChange(e.target.value)}
          >
            <option value="">Select a heading font</option>
            {fonts.map((font) => (
              <option key={font.family} value={font.family}>
                {font.family}
              </option>
            ))}
          </Select>
          <Preview style={{ fontFamily: selectedHeadingFont }}>
            The quick brown fox jumps over the lazy dog
          </Preview>
        </FontGroup>

        <FontGroup>
          <Label>Body Font</Label>
          <Select
            value={selectedBodyFont}
            onChange={(e) => handleBodyFontChange(e.target.value)}
          >
            <option value="">Select a body font</option>
            {fonts.map((font) => (
              <option key={font.family} value={font.family}>
                {font.family}
              </option>
            ))}
          </Select>
          <Preview style={{ fontFamily: selectedBodyFont }}>
            The quick brown fox jumps over the lazy dog
          </Preview>
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

const Label = styled('label')`
  font-weight: 500;
  color: #333;
`;

const Select = styled('select')`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
`;

const Preview = styled('div')`
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 1.25rem;
  min-height: 100px;
  display: flex;
  align-items: center;
`;

export default FontPicker;
