import React, { useContext,useState, useEffect} from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { LoginFormGlobalStyle } from './stili/GlobalStyles';
import { useNavigate } from 'react-router-dom';
import { Main, Signup, StyledLabellog, StyledLabelreg, StyledInput, StyledButton, Login } from './stili/LoginFormStyle'; // Importa i componenti stilizzati

function LoginForm() {
    let navigate = useNavigate();
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const { UserDetails, setUserDetails } = useContext(AuthContext);
    const [isChecked, setIsChecked] = useState(true);
    //CHECK AUTENTICAZIONE


    useEffect(() => {
        console.log(isLoggedIn)
        if (isLoggedIn) {
            navigate('/home');
        }
    }, [isLoggedIn, navigate]);
    
    //LOGIN
    const handleLoginSubmit = (event) => {
        event.preventDefault();
        axios.post('/login', { email: loginEmail, password: loginPassword })
            .then(response => {
                console.log(response.data);
                axios.get('/api/auth/getuser')
                    .then(response => {
                        if (response.status === 200) {
                            setIsLoggedIn(true);
                            setUserDetails(response.data);
                            console.log(response.data.email);
                            navigate('/home');
                        }
                    })
                    .catch(error => {
                        console.error('Errore nel recupero delle informazioni utente:', error);
                        alert("email o password errati!");
                    });
                
            })
            .catch(error => {
                console.error('Errore di login:', error.response ? error.response.data : error.message);
                // Gestione degli errori qui
            });
    };




    //REGISTRAZIONE
    const handleRegisterSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/register', { email: registerEmail, username: registerUsername, password: registerPassword, friends: [] });
            console.log(response.data);
            navigate('/');
            setIsChecked(true);
        } catch (error) {
            alert('Errore nella mail!');
        }
    };

    return (
        <>
            <LoginFormGlobalStyle />
            <Main>
                <input
                    type="checkbox"
                    id="chk"
                    style={{ display: 'none' }}
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                />

                <Signup as="form" onSubmit={handleRegisterSubmit}>
                    <StyledLabelreg htmlFor="chk">Registrati</StyledLabelreg>
                    <StyledInput
                        type="text"
                        id="mail"
                        name="email"
                        placeholder="Email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                    <StyledInput
                        type="text"
                        id="user"
                        name="username"
                        placeholder="Nome Utente"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                    />
                    <StyledInput
                        type="password"
                        id="pass"
                        name="password"
                        placeholder="Password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <StyledButton type="submit">Invia</StyledButton>
                </Signup>

                <Login style={{ transform: isChecked ? 'translateY(-500px)' : 'translateY(-180px)' }}>
                    <form onSubmit={handleLoginSubmit}>
                        <StyledLabellog htmlFor="chk" aria-hidden="true">Login</StyledLabellog>
                        <StyledInput
                            type="text"
                            id="mail"
                            name="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                        />
                        <StyledInput
                            type="password"
                            id="pass"
                            name="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <StyledButton type="submit">Invia</StyledButton>
                    </form>
                </Login>
            </Main>
        </>
    );
}

export default LoginForm;