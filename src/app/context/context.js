'use client'
import react, { useState, createContext } from "react";

const ChatContext = createContext();


const ChatProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [ userData, setUserData] = useState({});

    return <ChatContext.Provider value={{ isLoggedIn, setIsLoggedIn, canLoadMore, setCanLoadMore, userData, setUserData }}>
        {children}
    </ChatContext.Provider>
}

export  { ChatProvider, ChatContext };