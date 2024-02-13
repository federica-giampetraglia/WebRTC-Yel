import React, { useRef, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../AuthContext';
import { VideoAndButtonContainer, CenteredDiv, StyledButton } from '../stili/ChatStyle';
import { FaPhoneSlash } from 'react-icons/fa';
import { useCallContext } from './contexts/CallContext';
//fatto
const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  width: 100%;
  height: 100%;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  border: 1px solid #ccc;
`;


const VideoComponent = ({ userIDs, setShowChatComponent }) => {
    const videoRefs = useRef(new Array(userIDs.length));
    const { userDetails } = useContext(AuthContext);
    const { peersRef, localstream, setUserInCall, streams, setStreams } = useCallContext();
    // Imposta gli stream ogni volta che userIDs o streams cambiano
    useEffect(() => {
        userIDs.forEach((userID, index) => {
            const videoRef = videoRefs.current[index];
            if (videoRef && streams[userID] && streams[userID] instanceof MediaStream) {
                videoRef.srcObject = streams[userID];
            } else {
                console.log("Stream non valido:", streams[userID]);
            }

        });
    }, [userIDs, streams]);

    const handleEndCall = () => {
        // Chiudi tutte le connessioni peer
        Object.values(peersRef.current).forEach(peerConnection => {
            peerConnection.close();
        });



        // Chiudi lo stream locale, se aperto
        if (localstream.current) {
            localstream.current.getTracks().forEach(track => track.stop());
        }

        // Aggiorna i tuoi stati
        peersRef.current = {};
        setStreams({});
        setUserInCall([userDetails.email]);
        setShowChatComponent(true);
        // Gestisci eventuali altre pulizie o aggiornamenti dello stato qui
        // Ad esempio, puoi navigare l'utente lontano dalla pagina della chiamata o nascondere il componente della chiamata
    };


    return (
        <VideoAndButtonContainer>
            <VideoGrid>
                {userIDs.map((id, index) => (
                    <Video
                        key={id}
                        ref={el => videoRefs.current[index] = el}
                        autoPlay
                        muted={id === userDetails.email} // Muta solo se l'ID corrisponde all'email dell'utente
                    />
                ))}
            </VideoGrid>
            <CenteredDiv>
                <StyledButton onClick={handleEndCall}>
                    <FaPhoneSlash />
                </StyledButton>
            </CenteredDiv>
        </VideoAndButtonContainer >
    );

};

export default VideoComponent;
