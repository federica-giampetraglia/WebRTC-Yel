import React, { useContext } from 'react';
import { ContactInfo, CallButton, VideoCallButton, IncomingCallAlert } from '../stili/ChatStyle';
import { useCallContext } from './contexts/CallContext';
import { useSocket } from './contexts/SocketContext'; 
import { AuthContext } from '../AuthContext';
//fatto
const CallManager = ({
    activeChatId,
    setShowChatComponent,
    setActiveChatId,
}) => {
    const {  localstream, setUserInCall, setStreams } = useCallContext();
    const { socket, incomingCall, setIncomingCall, incomingVideoCall, setIncomingVideoCall } = useSocket();
    const { userDetails,} = useContext(AuthContext);

    // Funzioni per gestire le chiamate, simili a quelle che avevi nel componente ChatPage

    function avvia_chiamata() {
        // Specifica che vuoi accedere solo all'audio
        const constraints = { audio: true, video: false };
        const currentUser = userDetails.email; // Assumendo che l'email possa essere usata come ID

        // Accedi all'audio
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                // Qui puoi fare qualcosa con lo stream, come assegnarlo a un elemento audio
                // Ad esempio, assegnarlo a un elemento audio locale

                setStreams(prevStreams => ({
                    ...prevStreams,
                    [currentUser]: stream
                }));
                localstream.current = stream;
                setUserInCall([userDetails.email]);
                setShowChatComponent(false);
                // Invia un messaggio di inizio chiamata alla stanza specificata in activeChatId
                // Assicurati che il sistema di signaling sia già configurato e connesso
                socket.emit('request_call', activeChatId);
            }).catch((error) => {
                console.error('Errore nell\'acquisizione del media stream:', error);
            });
    }


    function avvia_videochiamata() {
        const constraints = { audio: true, video: true };
        const currentUser = userDetails.email; // Assumendo che l'email possa essere usata come ID

        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                if (stream.getTracks().length > 0) {
                    // Aggiungi lo stream locale allo stato usando l'ID dell'utente corrente come chiave
                    setStreams(prevStreams => ({
                        ...prevStreams,
                        [currentUser]: stream
                    }));
                    setShowChatComponent(false);
                    localstream.current = stream;
                    socket.emit('request_videocall', { roomId: activeChatId });
                    setUserInCall([userDetails.email]);

                }
            })
            .catch((error) => {
                console.error('Errore nell\'acquisizione del media stream:', error);
            });
    }

    //handler bottoni accetta rifiuta
    function handleAcceptVideoCall(roomId) {
        const constraints = { audio: true, video: true };
        const currentUser = userDetails.email; // Assumendo che l'email possa essere usata come ID

        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                if (stream.getTracks().length > 0) {
                    setActiveChatId(roomId);
                    // Aggiungi lo stream locale allo stato usando l'ID dell'utente corrente come chiave
                    localstream.current = stream;
                    setStreams(prevStreams => ({
                        ...prevStreams,
                        [currentUser]: stream
                    }));
                    setShowChatComponent(false);
                    socket.emit('new_peer', { roomId: roomId });
                    setUserInCall([userDetails.email]);

                }
            })
            .catch((error) => {
                console.error('Errore nell\'acquisizione del media stream:', error);
            });
        setIncomingVideoCall({ ...incomingVideoCall, show: false }); // Nascondi l'avviso

    }



    function handleAcceptCall(roomId) {
        const constraints = { audio: true, video: false };
        const currentUser = userDetails.email; // Assumendo che l'email possa essere usata come ID

        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                if (stream.getTracks().length > 0) {
                    setActiveChatId(roomId);
                    // Aggiungi lo stream locale allo stato usando l'ID dell'utente corrente come chiave
                    localstream.current = stream;
                    setStreams(prevStreams => ({
                        ...prevStreams,
                        [currentUser]: stream
                    }));
                    setShowChatComponent(false);
                    socket.emit('new_peer', { roomId: roomId });
                    setUserInCall([userDetails.email]);

                }
            })
            .catch((error) => {
                console.error('Errore nell\'acquisizione del media stream:', error);
            });
        setIncomingCall({ ...incomingVideoCall, show: false }); // Nascondi l'avviso

    }

    function handleRejectCall() {
        // Logica per rifiutare la chiamata
        // Potresti anche voler notificare al chiamante il rifiuto
        setIncomingVideoCall({ ...incomingVideoCall, show: false }); // Nascondi l'avviso
    }

    


    // Qui puoi inserire eventuali elementi dell'interfaccia utente legati alla gestione delle chiamate
    // Ad esempio, pulsanti per accettare/rifiutare chiamate, ecc.

    return (
        <div>
            <ContactInfo>
                {activeChatId != null ? `Contatto ${activeChatId + 1}` : 'Seleziona una chat'}
                {activeChatId != null && (
                    <div style={{ float: 'right' }}>
                        <CallButton onClick={avvia_chiamata}>
                            Chiamata
                        </CallButton>
                        <VideoCallButton onClick={avvia_videochiamata}>
                            Videochiamata
                        </VideoCallButton>
                    </div>
                )}
            </ContactInfo>
            {incomingVideoCall.show && (
                <IncomingCallAlert>
                    <p>Videochiamata in arrivo da {incomingVideoCall.user}</p>
                    <p>Stanza: {incomingVideoCall.roomId}</p>
                    <button onClick={() => handleAcceptVideoCall(incomingVideoCall.roomId)}>Accetta</button>
                    <button onClick={handleRejectCall}>Rifiuta</button>
                </IncomingCallAlert>
            )}
            {incomingCall.show && (
                <IncomingCallAlert>
                    <p>Chiamata in arrivo da {incomingCall.user}</p>
                    <p>Stanza: {incomingCall.roomId}</p>
                    <button onClick={() => handleAcceptCall(incomingCall.roomId)}>Accetta</button>
                    <button onClick={handleRejectCall}>Rifiuta</button>
                </IncomingCallAlert>
            )}
        </div>
    );
};

export default CallManager;
