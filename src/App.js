import React from 'react';
import styled from 'styled-components';
import ColorPalette from './components/ColorPalette';
import FontPicker from './components/FontPicker';
import Auth from './components/Auth';

function App() {
  return (
    <AppContainer>
      <Header>
        <Title>HueHarmony</Title>
        <Auth />
      </Header>
      <Main>
        <ColorPalette />
        <FontPicker />
      </Main>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  color: #333;
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

export default App;
