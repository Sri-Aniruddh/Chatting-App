import { useAppStore } from '@/store';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import React from 'react';
import { RiCloseFill } from 'react-icons/ri';

export function ChatHeader(props) {
    const closeChat = useAppStore((state) => state.closeChat);
    const selectedChatData = useAppStore((state) => state.selectedChatData);
    const selectedChatType = useAppStore((state) => state.selectedChatType); // Fixed prop name

    return (
        <div className='h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-4 md:px-10 lg:px-20'>
            <div className="flex items-center gap-3 md:gap-5">
                <div className='w-10 h-10 md:w-12 md:h-12 relative'>
                    {selectedChatType === "contact" ? (
                        <Avatar className='h-full w-full rounded-full overflow-hidden'>
                            {selectedChatData.image ? (
                                <AvatarImage
                                    src={`http://localhost:7052/${selectedChatData.image}`}
                                    alt='profile'
                                    className='object-cover w-full h-full bg-black rounded-full'
                                />
                            ) : (
                                <div className='uppercase h-full w-full text-lg border border-gray-300 flex items-center justify-center rounded-full bg-gray-600 text-white'>
                                    {selectedChatData.username ? selectedChatData.username.charAt(0) : selectedChatData.email?.charAt(0)}
                                </div>
                            )}
                        </Avatar>
                    ) : (
                        <div className='bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full'>#</div>
                    )}
                </div>
                {selectedChatType === "channel" && selectedChatData.name}
                <div className='flex flex-col text-white'>
                    <span className='text-base md:text-lg'>{selectedChatData.username}</span>
                    <span className='text-sm md:text-base text-neutral-400'>{selectedChatData.email}</span>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3 md:gap-5">
                <button
                    onClick={closeChat}
                    className='text-neutral-500 hover:text-white focus:border-none focus:outline-none duration-300 transition-all'>
                    <RiCloseFill className='text-2xl md:text-3xl' />
                </button>
            </div>
        </div>
    );
}
