import { createGlobalStyle } from 'styled-components';

export const DefaultGlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: 'Jost', sans-serif;
    background: #FFFFFF; // Colore di sfondo predefinito
  }
`;

export const LoginFormGlobalStyle = createGlobalStyle`
  body {
    background: #2D2D2D;
  }
`;