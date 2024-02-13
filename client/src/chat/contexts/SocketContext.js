import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';



//    const { socket, setSocket, chats, setChats, chatStatus, incomingCall, setIncomingCall, incomingVideoCall, setIncomingVideoCall } = useSocket();


const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [chats, setChats] = useState([]); // Stato per gestire le chat
    const [chatStatus, setChatStatus] = useState({}); // Stato per tenere traccia dello stato delle chat (es. online/offline)
    const [incomingCall, setIncomingCall] = useState({ user: null, roomId: null, show: false }); //stato utilizzato per poter gestire l'avviso di chiamata
    const [incomingVideoCall, setIncomingVideoCall] = useState({ user: null, roomId: null, show: false }); //stato utilizzato per poter gestire l'avviso di videochiamata

    useEffect(() => {
        const newSocket = io('http://localhost:3030', { withCredentials: true });
        setSocket(newSocket);

        // Funzione per gestire l'arrivo di un nuovo messaggio
        const handleNewMessage = (roomId, msg) => {
            const receivedMessage = { text: msg, isMine: false };
            setChats(chats =>
                chats.map(chat =>
                    chat.id === roomId ? { ...chat, messages: [...chat.messages, receivedMessage] } : chat
                )
            );
        };

        // Funzione per gestire la presenza dell'utente
        const handleUserPresence = (data) => {
            if (data.roomId) {
                setChatStatus(prev => ({ ...prev, [data.roomId]: true }));
            }
        };

        // Funzione per gestire l'uscita dell'utente o la stanza vuota
        const handleUserLeftOrRoomEmpty = (data) => {
            if (data.roomId) {
                setChatStatus(prev => ({ ...prev, [data.roomId]: false }));
            }
        };

        // Registrazione degli event listener sul socket
        newSocket.on('chat message', handleNewMessage);
        newSocket.on('user presence', handleUserPresence);
        newSocket.on('user left', handleUserLeftOrRoomEmpty);
        newSocket.on('room empty', handleUserLeftOrRoomEmpty);

        newSocket.on('request_videocall', (data) => {
            setIncomingVideoCall({ user: data.user, roomId: data.roomId, show: true });
        });

        newSocket.on('request_call', (data) => {
            setIncomingCall({ user: data.user, roomId: data.roomId, show: true });
        });

        return () => {
            // Rimozione degli event listener e disconnessione al momento del cleanup
            newSocket.off('chat message', handleNewMessage);
            newSocket.off('user presence', handleUserPresence);
            newSocket.off('user left', handleUserLeftOrRoomEmpty);
            newSocket.off('room empty', handleUserLeftOrRoomEmpty);
            newSocket.off('request_videocall');
            newSocket.off('request_call');
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, setSocket, chats, setChats, chatStatus, setChatStatus, incomingCall, setIncomingCall, incomingVideoCall, setIncomingVideoCall }}>
            {children}
        </SocketContext.Provider>
    );
};
