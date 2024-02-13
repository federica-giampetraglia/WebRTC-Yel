import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LoginForm from './LoginForm';
import { DefaultGlobalStyle } from './stili/GlobalStyles'; // Assicurati che il percorso sia corretto
import ChatPage from './chat/sheet';
import { SocketProvider } from './chat/contexts/SocketContext'; // Aggiorna con il percorso corretto
import { CallProvider } from './chat/contexts/CallContext'; // Aggiorna con il percorso corretto

function App() {
    return (
        <AuthProvider>
            <DefaultGlobalStyle />
            <Router>
                <Routes>
                    <Route path="/" element={<LoginForm />} />
                    <Route path="/home" element={
                        <SocketProvider>
                            <CallProvider>
                                <ChatPage />
                            </CallProvider>
                        </SocketProvider>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
