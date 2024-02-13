// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        axios.get('/api/auth/check')
            .then(response => {
                if (response.data.isLoggedIn) {
                    setIsLoggedIn(true);
                    // Una volta verificato che l'utente è loggato, recupera i dettagli
                    fetchUserDetails();
                } else {
                    setIsLoggedIn(false);
                    setUserDetails(null);
                }
            })
            .catch(() => {
                setIsLoggedIn(false);
                setUserDetails(null);
            });
        const fetchUserDetails = () => {
            axios.get('/api/auth/getuser')
                .then(response => {
                    if (response.status === 200) {
                        setUserDetails(response.data);
                    }
                })
        };

    }, []);

    
    return (
        <AuthContext.Provider value={{ isLoggedIn, userDetails, setUserDetails, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
