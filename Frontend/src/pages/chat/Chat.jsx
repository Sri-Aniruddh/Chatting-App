import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { ContactContainer } from './components/contacts-container/ContactContainer';
import { EmptyChat } from './components/empty-chat-container/EmptyChat';
import { ChatContainer } from './components/chat-container/ChatContainer';

export default function Chat(props) {
    const userInfo = useAppStore((state) => state.userInfo);
    const selectedChatType=useAppStore((state)=>state.selectedChatType);
    const selectedChatData=useAppStore((state)=>state.selectedChatData);
    const navigate = useNavigate();


    useEffect(() => {
        if (!userInfo.profileSetup) {
            toast('Please setup profile to continue.');
            navigate("/profile");
        }
    }, [userInfo, navigate]);



    return (

        <div className='flex h-[100vh] text-white overflow-hidden'>

            <ContactContainer />
            {
                selectedChatType === undefined ? <EmptyChat/> : <ChatContainer/>
            }
            
        </div>

    );
}
