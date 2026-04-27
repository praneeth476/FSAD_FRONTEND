import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage OR sessionStorage dynamically
        const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken, rememberMe = false) => {
        setUser(userData);
        if (authToken) setToken(authToken);

        // Wipe standard stores initially
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");

        // Dictate persistence layer based on user preference
        const storageMechanism = rememberMe ? localStorage : sessionStorage;

        storageMechanism.setItem("user", JSON.stringify(userData));
        if (authToken) {
            storageMechanism.setItem("token", authToken);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user
    };

    if (loading) {
        return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}>Authenticating Session...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
