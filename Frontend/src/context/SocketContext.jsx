import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAppStore } from '@/store';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const userInfo = useAppStore((state) => state.userInfo);
  const addMessage = useAppStore((state) => state.addMessage);

  useEffect(() => {
    if (userInfo) {
      const newSocket = io('http://localhost:7052', {
        withCredentials: true,
        query: { userID: userInfo.id },
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });

      newSocket.on('receivedMessage', (message) => {
        console.log('Received message:', message);
        addMessage(message); // Update Zustand store with the received message
      });

      newSocket.on('received-channel-message', (message) => {
        console.log('Received channel message:', message);
        addMessage(message); // Update Zustand store with the received channel message
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [userInfo, addMessage]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
