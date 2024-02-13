import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  width: 100vw; // Larghezza pari alla larghezza della viewport
  height: 100vh; // Altezza pari all'altezza della viewport
  background-color: #2D2D2D;
  overflow: hidden; // Nascondi il contenuto che fuoriesce
`;

export const LeftColumn = styled.div`
  width: 250px; // Larghezza fissa della colonna
  height: 100vh; // Altezza completa della viewport
  overflow-y: auto; // Scrollbar se necessario
  padding: 10px;
  border-right: 1px solid #ccc;
  float: left; // Allinea a sinistra

`;

export const ChatBox = styled.div`
border-radius: 10px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  padding: 10px;
  cursor: pointer;
  background-color: #F1C232;
`;

export const RightColumn = styled.div`
  width: calc(100% - 250px); // Resto della larghezza della viewport
  height: 100vh;
  float: left; // Allinea a sinistra (accanto alla colonna sinistra)
  display: flex;
  flex-direction: column;

`;

export const ContactInfo = styled.div`
 border-radius: 10px;
 margin-top: 10px;
  border-bottom: 1px solid #ccc;
  padding: 12px;
  background-color: #F1C232;
`;

export const Chat = styled.div`
border-radius: 10px;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 10px - 32px);
`;
export const Message = styled.div`

  margin: 5px 0;
  margin-left: 10px;
  padding: 5px;
  border-radius: 5px;
  max-width: 60%;
  background-color: #6992b9;
  align-self: flex-start;
`;

// Stile per i tuoi messaggi
export const MyMessage = styled.div`
  margin: 5px 0;
  margin-right: 10px;
  padding: 5px;
  border-radius: 5px;
  max-width: 60%;
  background-color: #d1b651 ;
  align-self: flex-end;
`;


export const MessageInputContainer = styled.div`

  display: flex; 
  margin-top: 10px;
`;

export const Input = styled.input`
border-radius: 10px;
  flex: 1; 
  padding: 10px; 
  border: 1px solid #ccc; 
  margin-right: 5px;
`;

export const SendButton = styled.button`
border-radius: 10px;
  padding: 10px;
`;

export const Button = styled.button`
  padding: 5px 10px;
  margin-left: 10px;
`;


export const Toolbar = styled.div`
border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #ccc;
  background-color: #F1C232;
  display: flex;
  justify-content: space-around; // Distribuisce equamente lo spazio tra i bottoni
`;


export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  color: #2D2D2D; // Cambia il colore a piacere

  &:hover {
    color: #f1c232; // Cambia il colore al passaggio del mouse
  }

  // Dimensione dell'icona
  svg {
    font-size: 20px; // o qualsiasi altra dimensione
  }
`;

export const CallButton = styled.button`
  padding: 5px 10px;
  margin-right: 10px;
  background-color: #4CAF50; // Colore verde per il bottone chiamata
  color: white;
  border: none;
  border-radius: 5px;
`;

 export const VideoCallButton = styled.button`
  padding: 5px 10px;
  background-color: #008CBA; // Colore blu per il bottone videochiamata
  color: white;
  border: none;
  border-radius: 5px;
`;



export const IncomingCallAlert = styled.div`
  position: fixed; // O absolute, a seconda delle tue esigenze
  top: 20px;
  right: 20px;
  background-color: white;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000; // Assicurati che sia sopra gli altri elementi della pagina

  p {
    margin: 10px 0;
  }

  button {
    padding: 10px 15px;
    margin-right: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;

    &:first-child {
      background-color: #4CAF50; // Verde per il bottone "Accetta"
      color: white;
    }

    &:last-child {
      background-color: #f44336; // Rosso per il bottone "Rifiuta"
      color: white;
    }
  }
`;

export const VideoAndButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center; // Centra orizzontalmente
    justify-content: center; // Centra verticalmente
    height: 100vh; // Assicurati che il div occupi l'intera altezza della viewport
`;
export const TopContainer = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: #F1C232; // Puoi adattare il colore di sfondo se necessario
`;

export const ContentContainer = styled.div`
    display: flex;
    width: 100%;
  height: calc(100vh - 50px); // Sottrai l'altezza di TopContainer
`;
export const CenteredDiv = styled.div`
    display: flex;
    justify-content: center; // Centra orizzontalmente
    align-items: center; // Centra verticalmente
    height: 100vh; // Assicurati che il div occupi l'intera altezza della viewport
`;

// Stili opzionali per il bottone
export const StyledButton = styled.button`
    padding: 10px 20px;
    margin: 10px;
    font-size: 16px;
    cursor: pointer;
    // Aggiungi qui altri stili per il bottone se necessario
`;