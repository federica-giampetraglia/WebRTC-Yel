import React, { useState, useRef, useEffect } from 'react';
import { Chat, MyMessage, Message, MessageInputContainer, Input, SendButton } from '../stili/ChatStyle';

const ChatComponent = ({ chatData, onUpdateChat }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            const messageToSend = { text: newMessage, isMine: true };
            onUpdateChat(chatData.id, messageToSend);
            setNewMessage('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
            event.preventDefault(); // Evita l'invio del form
        }
    };

    const scrollToBottom = () => {
        if (chatRef.current) {
            const { scrollHeight, clientHeight } = chatRef.current;
            chatRef.current.scrollTop = scrollHeight - clientHeight;
        }
    };
    const chatRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
        // Aggiungi un listener per il ridimensionamento della finestra
        window.addEventListener('resize', scrollToBottom);

        // Rimuovi il listener quando il componente viene smontato
        return () => window.removeEventListener('resize', scrollToBottom);
    }, [chatData]); // Aggiorna lo scroll ogni volta che i messaggi cambiano


    return (
        <>  
            <Chat ref={chatRef}>
                {chatData && chatData.messages && chatData.messages.map((msg, index) => (
                    msg.isMine ?
                        <MyMessage key={index}>{msg.text}</MyMessage> :
                        <Message key={index}>{msg.text}</Message>
                ))}
            </Chat>
            <MessageInputContainer>
                <Input
                    type="text"
                    placeholder="Scrivi un messaggio..."
                    value={newMessage}
                    onChange={handleNewMessageChange}
                    onKeyPress={handleKeyPress}
                />
                <SendButton onClick={handleSendMessage}>Invia Messaggio</SendButton>
            </MessageInputContainer>
        </>
    );
};



export default ChatComponent;
