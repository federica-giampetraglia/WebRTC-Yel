import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSocket } from './SocketContext'; // Importa il hook useSocket dal tuo SocketContext

const CallContext = createContext();




//    const { peersRef, localstream, usersInCall, setUserInCall, streams, setStreams } = useCallContext();


export const useCallContext = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
    const { socket: socketInstance } = useSocket(); // Destruttura per ottenere l'istanza del socket
    const peersRef = useRef({});
    const [usersInCall, setUserInCall] = useState([]);
    const [streams, setStreams] = useState({});
    const localstream = useRef(new MediaStream());

    // Funzione per creare una nuova peer connection
    const createPeerConnection = (peerId) => {
        const normalizedPeerId = typeof peerId === 'object' ? peerId.id : peerId;
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.antisip.com:3478' }]
        });

        // Gestione dei candidati ICE
        peerConnection.onicecandidate = event => {
            if (event.candidate && socketInstance) {
                socketInstance.emit('ice-candidate', { candidate: event.candidate, to: normalizedPeerId });
            }
        };

        // Gestione degli stream remoti
        peerConnection.ontrack = event => {
            const remoteStream = event.streams[0];
            setUserInCall(prevUsers => (!prevUsers.includes(peerId) ? [...prevUsers, peerId] : prevUsers));
            setStreams(prevStreams => ({ ...prevStreams, [peerId]: remoteStream }));
        };

        // Aggiunta degli stream locali alla connessione
        localstream.current.getTracks().forEach(track => {
            peerConnection.addTrack(track, localstream.current);
        });

        // Gestione della disconnessione
        peerConnection.oniceconnectionstatechange = () => {
            if (['disconnected', 'failed', 'closed'].includes(peerConnection.iceConnectionState)) {
                setStreams(prevStreams => {
                    const updatedStreams = { ...prevStreams };
                    delete updatedStreams[normalizedPeerId];
                    return updatedStreams;
                });
                setUserInCall(prevUsers => prevUsers.filter(user => user !== normalizedPeerId));
                if (peersRef.current[normalizedPeerId]) {
                    delete peersRef.current[normalizedPeerId];
                }
            }
        };

        return peerConnection;
    };

   

    useEffect(() => {
        // Definizioni degli handler per i vari eventi

        // Gestione di un nuovo peer
        const handleNewPeer = (data) => {
            if (!peersRef.current[data.id]) {
                const peerConnection = createPeerConnection(data.id);
                peerConnection.createOffer()
                    .then(offer => peerConnection.setLocalDescription(offer))
                    .then(() => {
                        peersRef.current[data.id] = peerConnection;
                        if (socketInstance) {
                            socketInstance.emit('offer', { offer: peerConnection.localDescription, to: data.id });
                        }
                    });
            } else {
                console.log(`Connessione già esistente con il peer ${data.id}`);
            }
        };


        // Gestione di un nuovo candidato ICE
        const handleIceCandidate = (data) => {
            const peerConnection = peersRef.current[data.from];
            if (peerConnection) {
                peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        };

        // Gestione di un'offerta ricevuta
        const handleOffer = (data) => {
            console.log('data.from: ', data.from);
            const peerConnection = createPeerConnection(data.from);
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
                .then(() => peerConnection.createAnswer())
                .then(answer => peerConnection.setLocalDescription(answer))
                .then(() => {
                    socketInstance.emit('answer', { answer: peerConnection.localDescription, to: { id: data.from } });
                });
            peersRef.current[data.from] = peerConnection;
        };

        // Gestione di una risposta ricevuta
        const handleAnswer = (data) => {
            const peerConnection = peersRef.current[data.from];
            if (peerConnection) {
                peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        };

        if (socketInstance) {
            socketInstance.on('ice-candidate', handleIceCandidate);
            socketInstance.on('offer', handleOffer);
            socketInstance.on('answer', handleAnswer);
            socketInstance.on('new_peer', handleNewPeer);

            return () => {
                socketInstance.off('ice-candidate', handleIceCandidate);
                socketInstance.off('offer', handleOffer);
                socketInstance.off('answer', handleAnswer);
                socketInstance.off('new_peer', handleNewPeer);
            };
        }
    }, [socketInstance]); // Usa socketInstance come dipendenza







    return (
        <CallContext.Provider value={{ peersRef, localstream, createPeerConnection, usersInCall, setUserInCall, streams, setStreams }}>
            {children}
        </CallContext.Provider>
    );
};
