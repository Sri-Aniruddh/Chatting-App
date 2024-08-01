import React from 'react'
import { ChatHeader } from './components/chat-header/ChatHeader'
import { MessageBar } from './components/message-bar/MessageBar'
import { MessageContainer } from './components/message-container/MessageConatiner'

export function ChatContainer(props) {
    

    return (
        <div className='flex flex-col h-full w-full md:w-[50vw] bg-[#1a1b22] border-r-[#2f303b]'>
            <ChatHeader />
            <MessageContainer />
            <MessageBar />
        </div>
    )
}
