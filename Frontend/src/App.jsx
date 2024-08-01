import React, { useEffect, useState } from "react";
import Auth from "./pages/auth/Auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/chat/Chat";
import Profile from "./pages/profile/Profile";
import { useAppStore } from "./store";
import { apiClient } from "./lib/app-client";

const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthnticated = !!userInfo;
  return isAuthnticated ? children : <Navigate to="/auth" />
}

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthnticated = !!userInfo;
  return isAuthnticated ? <Navigate to="/chat" /> : children;
}

const App = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get('http://localhost:7052/user-info', {
          withCredentials: true,
        });
        if (response.status === 200 && response.data.id) {
          setUserInfo(response.data);
        }else{
          setUserInfo(undefined);
        }
      } catch (error) {
        setUserInfo(undefined)
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  )

};
export default App