const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const validator = require("email-validator");
const LocalStrategy = require('passport-local').Strategy;
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
// Configurazione middleware


//middleware utilizzato per condividere la sessione tra express-session e socket.io
const sessionMiddleware = session({
    secret: 'segreto', // Questa è una chiave segreta per la firma della sessione, sostituiscila con una stringa sicura
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false // Imposta su true se stai usando HTTPS, altrimenti lascialo false
    }
});

app.use(sessionMiddleware);


//configurazione cors
app.use(cors({
    origin: 'http://localhost:3000', // Sostituisci con l'URL del tuo client React
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Metodi HTTP che desideri consentire
    credentials: false // Imposta su true se il front-end deve inviare cookies e headers di autenticazione
}));


//configurazione socket.io

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Consenti l'accesso dal client React
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

//configurazione express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// configurazione passport
app.use(passport.initialize());
app.use(passport.session());

//configurazione della local strategy per passport



console.log("middlewares inizializzati!");



passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    (email, password, done) => {
        findUserByEmail(email)
            .then(user => {
                if (!user) {
                    console.log("email non trovata");
                    return done(null, false, { message: 'Email non trovata' });
                }
                // Verifica la password qui
                if (!isValidPassword(user, password)) {
                    return done(null, false, { message: 'Password errata' });
                }
                console.log("email trovata");
                return done(null, user);
            })
            .catch(err => done(err));
    }
));

//configurazione della sessione utente

passport.serializeUser((user, done) => {
    done(null, user.email); // Serializzi l'email dell'utente
});

passport.deserializeUser((email, done) => {
    findUserByEmail(email).then(user => {
        done(null, user); // Deserializzi usando la stesso email
    }).catch(err => {
        done(err, null);
    });
});
function findUserByEmail(email) {
    return User.findOne({ email: email }).exec(); // Restituisce una promessa
}

function isValidPassword(user, password) {
    if (user.password === password) {
        return true;
    }
    return false;
}


//configurazione mongoose
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,

    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    friends: {
        type: [String],
        required: true
    }
});

const User = mongoose.model('User', userSchema);

//connessione al database
try {
    mongoose.connect('mongodb://localhost:27017/yel');
    console.log('Connesso a MongoDB');
} catch (error) {
    console.error('Errore di connessione a MongoDB:', error.message);
}







//gestione socket
//condivisione sessione tra socket ed express-session
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});


//gestione socket.io
const usersInRooms = {};

io.on('connection', (socket) => {
    socket.roomsJoined = [];

    // Gestione signaling: inoltro delle offerte, risposte e ICE candidates
    socket.on('offer', (data) => {
        const { offer, to } = data;
        console.log(`offerta inviata da: ${socket.id} verso: ${to}`);
        // Inoltra l'offerta al peer specificato nella stessa stanza
        socket.to(to).emit('offer', { from: socket.id, offer : offer });
    });

    socket.on('answer', (data) => {
        const { answer, to } = data;

        console.log('risposta inviata: ', answer, ' verso il client: ', to)
        // Inoltra la risposta al peer specificato nella stessa stanza
        socket.to(to.id).emit('answer', { from: socket.id, answer : answer });
    });


    socket.on('ice-candidate', (data) => {
        const { candidate, to } = data;
        console.log('on ice candidate da: ', socket.id, 'verso: ', to)
        // Inoltra il candidato ICE al peer specificato
        socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('new_peer', (data) => {
        console.log('new peer da: ', socket.id, 'verso: ', data.roomId);
        socket.to(data.roomId).emit('new_peer', { id: socket.id });
    });
    //gestione richiesta chiamate-videochiamate

    socket.on('request_videocall', (data) => {
        console.log(`nuova richiesta di videochiamata da: ${socket.request.session.passport?.user} alla stanza ${data.roomId}`);
        socket.to(data.roomId).emit('request_videocall', { user: socket.request.session.passport?.user, roomId: data.roomId});
    });

    socket.on('request_call', (roomId) => {
        console.log(`nuova richiesta di chiamata da: ${socket.request.session.passport?.user} alla stanza ${roomId}`)
        socket.to(roomId).emit('request_call', { user: socket.request.session.passport?.user, roomId: roomId }); // Invia roomId e msg a tutti nella stanza tranne il mittente
    });



    socket.on('join room', (roomId) => {
        const userId = socket.request.session.passport?.user;
        console.log(userId);

        // Filtra l'ID della stanza per estrarre informazioni significative
        const filteredRoomId = roomId.split("_");

        if (filteredRoomId.includes(userId)) {
            socket.join(roomId);

            // Aggiorna il registro degli utenti per stanza
            if (!usersInRooms[roomId]) {
                usersInRooms[roomId] = [];
            }
            usersInRooms[roomId].push(socket.id);

            // Controlla la presenza di altri utenti nella stanza
            if (usersInRooms[roomId].length > 1) {
                // Notifica entrambi gli utenti della presenza dell'altro
                console.log(usersInRooms);
                io.to(roomId).emit('user presence', { roomId: roomId });
            } else {
                // Informa l'utente che la stanza è vuota
                socket.emit('room empty', { roomId: roomId });
            }

            // Notifica dell'avvenuto join

            socket.roomsJoined.push(roomId);
            console.log(`Utente connesso alla stanza: ${roomId}`);
            console.log(`new user joined: ${userId}`);
            console.log(socket.roomsJoined);
        }
    });
    
    

    socket.on('chat message', (roomId, msg) => {
        console.log(`nuovo messaggio da: ${socket.request.session.passport?.user} alla stanza ${roomId}= ${msg}`)
        socket.to(roomId).emit('chat message', roomId, msg); // Invia roomId e msg a tutti nella stanza tranne il mittente
    });



    socket.on('leave room', (roomId) => {
        const userr = socket.request.session.passport?.user;
        socket.to(roomId).emit('user left', {id: roomId});
        socket.leave(roomId);
        socket.roomsJoined = socket.roomsJoined.filter(room => room !== roomId); // Rimuovi la stanza dall'elenco
        console.log(`Utente disconnesso dalla stanza: ${roomId}`);
        console.log(socket.roomsJoined);
    });

    socket.on('disconnect', () => {
        socket.roomsJoined.forEach(roomId => {
            // Notifica gli altri utenti nella stanza
            socket.to(roomId).emit('user left', { roomId: roomId });

            // Rimuovi l'utente dall'elenco degli utenti nella stanza
            if (usersInRooms[roomId]) {
                usersInRooms[roomId] = usersInRooms[roomId].filter(id => id !== socket.id);

                //rimuiovo il valore da usersinrooms
                if (usersInRooms[roomId].length === 0) {
                    delete usersInRooms[roomId];
                    console.log(`La stanza ${roomId} è ora vuota.`);
                }
            }
            // Aggiornamento dell'array roomsJoined
            socket.roomsJoined = socket.roomsJoined.filter(room => room !== roomId);
        });

        console.log(`Utente disconnesso: ${socket.id}`);
    });
});




// Route per testare il server


app.get('/home', (req, res) => {
    if (req.isAuthenticated()) {
        res.send('Benvenuto nella tua area personale!');
    }
});


app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: false // Opzionale: imposta su true per utilizzare i messaggi flash
}));



app.post('/register', (req, res) => {
    console.log("richiesta di registrazione effettuata per l'utente: ")
    console.log(req.body);
    // Utilizza il metodo validate() del pacchetto email-validator
    if (validator.validate(req.body.email)) {
        console.log(`${req.body.email} è un indirizzo email valido.`);
        user = new User(req.body);
        user.save(user)
            .then(() => res.send("Utente creato con successo!"))
            .catch(error => {
                console.error(error);
                res.status(401).send("utente non creato!");
            });
    } else {
        console.log(`${req.body.email} NON è un indirizzo email valido.`);
        res.status(401).send("email non corretta!");
    }

});



app.get('/api/auth/check', (req, res) => {
    if (req.isAuthenticated()) { // `isAuthenticated` è una funzione fornita da Passport
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});

app.get('/api/auth/getuser', (req, res) => {
    if (req.isAuthenticated()) { // `isAuthenticated` è una funzione fornita da Passport
        res.json({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            friends: req.user.friends
        });
    } else {
        res.status(401).send("utente non autenticato!");
    }
});


app.post('/api/friends/add', async (req, res) => {
    const currentUser = req.user;
    const friendEmail = req.body.email;

    try {
        // Verifica che l'email dell'amico esista
        const friend = await User.findOne({ email: friendEmail });

        if (!friend) {

            return res.status(404).send('Amico non trovato');
        }

        // Controlla se l'amico è già nella lista di entrambi
        if (currentUser.friends.includes(friend.email) && friend.friends.includes(currentUser.email)) {
            return res.status(400).send('Amico già nella lista');
        }
        console.log(friend);
        // Aggiungi l'email dell'amico alla lista degli amici dell'utente corrente
        currentUser.friends.push(friend.email);
        // Aggiungi l'email dell'utente corrente alla lista degli amici dell'amico
        friend.friends.push(currentUser.email);

        // Salva l'utente corrente aggiornato nel database
        await currentUser.save();
        // Salva anche l'amico aggiornato nel database
        await friend.save();

        res.send('Amico aggiunto con successo a entrambe le friendlist');
    } catch (err) {
        res.status(500).send('Errore del server');
    }
});


app.post('/api/friends/remove', async (req, res) => {
    const currentUser = req.user;
    const friendEmail = req.body.email;

    try {
        // Verifica che l'email dell'amico esista
        const friend = await User.findOne({ email: friendEmail });

        if (!friend) {
            return res.status(404).send('Amico non trovato');
        }

        // Controlla se l'amico è nella lista di entrambi
        if (!currentUser.friends.includes(friend.email) || !friend.friends.includes(currentUser.email)) {
            return res.status(400).send('Amico non nella lista');
        }

        // Rimuovi l'email dell'amico dalla lista degli amici dell'utente corrente
        currentUser.friends = currentUser.friends.filter(email => email !== friend.email);

        // Rimuovi l'email dell'utente corrente dalla lista degli amici dell'amico
        friend.friends = friend.friends.filter(email => email !== currentUser.email);

        // Salva l'utente corrente aggiornato nel database
        await currentUser.save();

        // Salva anche l'amico aggiornato nel database
        await friend.save();

        res.send('Amico rimosso con successo da entrambe le friendlist');
    } catch (err) {
        res.status(500).send('Errore del server');
    }
});


app.get('/api/friends/list', (req, res) => {
    const currentUser = req.user;

    // Verifica che l'utente sia autenticato
    if (!currentUser) {
        return res.status(401).send('Utente non autenticato');
    }

    // Trova l'utente corrente nel database per ottenere l'elenco aggiornato degli amici
    User.findById(currentUser._id, (err, user) => {
        if (err) {
            return res.status(500).send('Errore del server');
        }
        if (!user) {
            return res.status(404).send('Utente non trovato');
        }

        // Restituisci l'elenco degli amici
        res.json({ friends: user.friends });
    });
});


const PORT = process.env.PORT || 3030;
server.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});