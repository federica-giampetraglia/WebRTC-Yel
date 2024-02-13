import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageContainer, LeftColumn, ChatBox, RightColumn, Toolbar, IconButton} from '../stili/ChatStyle';
import ChatComponent from './ChatComponent';
import { FaSignOutAlt, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import axios from 'axios';
import VideoComponent from './VideoComponent';
import { useSocket }  from './contexts/SocketContext'; 
import { useCallContext } from './contexts/CallContext';
import CallManager from './CallManager'; 

const ChatPage = () => {
    //setto i contesti ed inizializzo navigate
    const { socket, chats, setChats, chatStatus } = useSocket();
    const { usersInCall } = useCallContext();
    let navigate = useNavigate();
    const { isLoggedIn, userDetails, setUserDetails, setIsLoggedIn } = useContext(AuthContext);

    /* VARIABILI DI STATO */
    //variabile di stato utilizzata per tenere traccia dell'ultima chat aperta
    const [activeChatId, setActiveChatId] = useState(null);
    //variabile di stato utilizzata per ricordare in quale stanze abbiamo effettuato l'accesso
    const [joinedRooms, setJoinedRooms] = useState([]);
    //variabile di stato utilizzata per sapere da che momento é possibile salvare le chat
    const [SaveChat, setSaveChat] = useState(false);
    //variabile di stato utilizzata per sapere quando l'authcontext é stato caricato e quindi controllare scrivere o meno la nuova mail nel localstorage
    const [Writenewemail, SetWritenewemail] = useState(false);
    //variabile di stato utilizzata per tenere traccia da chi arriva la chiamata, in quale stanza e per visualizzare l'avviso di chiamata
    const [showChatComponent, setShowChatComponent] = useState(true);
    //variabile utilizzata per indicare che la lettura delle chat da localstorage é terminata
    const [isChatsLoadedFromLocalStorage, setIsChatsLoadedFromLocalStorage] = useState(false);


    //ricarico le chat da localstorage
    useEffect(() => {
        const savedChats = localStorage.getItem('chats');
        const savedEmail = localStorage.getItem('userEmail');
        if (userDetails != null) {
            if (Writenewemail === false && savedChats != null && userDetails != null && userDetails.email === savedEmail) {
                setChats(JSON.parse(savedChats));
                setIsChatsLoadedFromLocalStorage(true); // Aggiorna il flag dopo aver caricato le chat
            }
            else {
                SetWritenewemail(true);
                setIsChatsLoadedFromLocalStorage(true); // Aggiorna il flag dopo aver caricato le chat
            }
        }
    }, [userDetails]); 


    // useEffect che permette la scrittura dal localstorage
    useEffect(() => {
        if (Writenewemail) {
            localStorage.setItem('userEmail', userDetails.email);
        }
    }, [Writenewemail]);
    


    useEffect(() => {
        //se non é stato necessario riscrivere la mail nel localstorage allora ho caricato le chat dal localstorage di conseguenza devo fare il join in ogni chat
        if (!Writenewemail) {
            if (socket && chats.length > 0) {
                chats.forEach((chat) => {
                    socket.emit('join room', chat.id);
                });
            }
        }
    }, [isChatsLoadedFromLocalStorage]);



    //useeffect utilizzato per salvare i messaggi all'interno di localstorage
    useEffect(() => {
        if (SaveChat) {
            localStorage.setItem('chats', JSON.stringify(chats));
        }
    }, [chats, SaveChat]); // viene eseguito ogni volta che un messaggio viene ricevuto e che la pagina viene caricata correttamente

    //use effect utilizzato per creare nuove chats
    useEffect(() => {
        // Esegui questo useEffect solo se isChatsLoadedFromLocalStorage è true
        if (isChatsLoadedFromLocalStorage && socket && userDetails && userDetails.friends) {
            const newChats = [];
            const newRooms = [];
            userDetails.friends.forEach(friendEmail => {
                const friendRoomId = [userDetails.email, friendEmail].sort().join('_');
                if (!joinedRooms.includes(friendRoomId) && !chats.some(chat => chat.id === friendRoomId)) {
                    socket.emit('join room', friendRoomId);
                    newChats.push(createNewChat(friendRoomId, friendEmail));
                    newRooms.push(friendRoomId);
                }
            });

            if (newRooms.length > 0) {
                setJoinedRooms(prevRooms => [...prevRooms, ...newRooms]);
            }
            if (newChats.length > 0) {
                setChats(prevChats => [...prevChats, ...newChats]);
            }
        }
    }, [socket, userDetails, joinedRooms, chats, isChatsLoadedFromLocalStorage]);


    //controllo sul login
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);



    const createNewChat = (roomId, friendEmail) => {
        return { id: roomId, messages: [], user: friendEmail };
    };


    const handleChatBoxClick = (chatId) => {
        setActiveChatId(chatId);
    };


    //mando un messaggio
    const updateChatMessages = (chatId, messageObj) => {
        if (!SaveChat) {
            setSaveChat(true);
        }
        if (socket && messageObj && messageObj.text.trim() !== '') {
            socket.emit('chat message', chatId, messageObj.text);
            setChats(chats =>
                chats.map(chat =>
                    chat.id === chatId ? { ...chat, messages: [...chat.messages, messageObj] } : chat
                )
            );
        }
    };

    const handleLogout = () => {
        axios.get('/logout')
            .then(response => {
                setIsLoggedIn(false);
                setUserDetails(null);
            })
            .catch(() => {
                setIsLoggedIn(false);
                setUserDetails(null);
            });
    };


    const handleAddFriend = () => {
        const friendEmail = prompt("Inserisci l'email dell'amico da aggiungere:");
        if (friendEmail) {
            axios.post('/api/friends/add', { email: friendEmail })
                .then(response => {
                    // Gestisci la risposta positiva
                    axios.get('/api/auth/getuser')
                        .then(response => {
                            if (response.status === 200) {
                                setUserDetails(response.data);
                            }
                        })
                        .catch(error => {
                            alert(error);
                            console.error('Errore nel recupero delle informazioni utente:', error);
                        });
                    alert('Richiesta inviata con successo!');
                })
                .catch(error => {
                    // Gestisci l'errore
                    console.error('Si è verificato un errore', error);
                    alert('Errore nell\'invio della richiesta');
                });
        }
    };
        
    const handleDeleteFriend = () => {
        const friendEmail = prompt("Inserisci l'email dell'amico da aggiungere:");
        if (friendEmail) {
            axios.post('/api/friends/remove', { email: friendEmail })
                .then(response => {
                    // Gestisci la risposta positiva
                    setChats(chats => chats.filter(chat => chat.user !== friendEmail));
                    alert('Richiesta inviata con successo!');
                })
                .catch(error => {
                    // Gestisci l'errore
                    console.error('Si è verificato un errore', error);
                    alert('Errore nell\'invio della richiesta');
                });
        }
        // Logica per eliminare un amico
    };
      
    return (
        <PageContainer>
            <LeftColumn>
                <Toolbar>
                    <IconButton onClick={handleLogout}><FaSignOutAlt /></IconButton>
                    <IconButton onClick={handleDeleteFriend}><FaUserMinus /></IconButton>
                    <IconButton onClick={handleAddFriend}><FaUserPlus /></IconButton>
                </Toolbar>
                {chats.map((chat) => (
                    <ChatBox
                        key={chat.id}
                        onClick={() => handleChatBoxClick(chat.id)}
                        style={{ backgroundColor: activeChatId === chat.id ? '#f9e6ad' : '#f1c232' }}
                    >
                        <p>{chat.user} ({chatStatus[chat.id] ? 'Online' : 'Offline'})</p>
                    </ChatBox>
                ))}
            </LeftColumn>
            <RightColumn>
                <CallManager
                    activeChatId={activeChatId}
                    setShowChatComponent={setShowChatComponent}
                    setActiveChatId={setActiveChatId}
                />
                {activeChatId != null && (
                    showChatComponent ? (
                        <ChatComponent
                            chatData={chats.find(chat => chat.id === activeChatId)}
                            onUpdateChat={(chatId, messageObj) => updateChatMessages(activeChatId, messageObj)}
                        />
                    ) : (
                            <VideoComponent
                                userIDs={usersInCall}
                                setShowChatComponent={setShowChatComponent}
                            />                                
                    )
                )}
            </RightColumn>
        </PageContainer>
    );


}


export default ChatPage;
/*


*/