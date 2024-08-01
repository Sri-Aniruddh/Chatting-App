import { useAppStore } from '@/store';
import React from 'react';

export default function ContactList({ contacts = [], isChannel = false }) {
    const {
        selectedChatData,
        setSelectedChatData,
        selectedChatType,
        setSelectedChatType,
        setSelectedChatMessages,
    } = useAppStore((state) => ({
        selectedChatData: state.selectedChatData,
        setSelectedChatData: state.setSelectedChatData,
        selectedChatType: state.selectedChatType,
        setSelectedChatType: state.setSelectedChatType,
        setSelectedChatMessages: state.setSelectedChatMessages,
    }));

    const handleClick = (contact) => {
        if (isChannel) {
            setSelectedChatType("channel");
        } else {
            setSelectedChatType("contact");
        }
        setSelectedChatData(contact);
        if (selectedChatData && selectedChatData._id !== contact._id) {
            setSelectedChatMessages([]);
        }
    };

    return (
        <div className="mt-5">
            {contacts.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No contacts available</div>
            ) : (
                contacts.map((contact) => (
                    <div
                        key={contact._id}
                        className={`pl-4 py-2 transition-all duration-300 cursor-pointer ${
                            selectedChatData && selectedChatData._id === contact._id
                                ? "bg-[#8417ff] text-white"
                                : "hover:bg-gray-100"
                        } flex items-center gap-4 rounded-lg`}
                        onClick={() => handleClick(contact)}
                    >
                        
                        {isChannel && (
                            <div className='bg-[#ffffff22] h-8 w-8 flex items-center justify-center rounded-full'>
                                #
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium text-lg">{contact.name || contact.username || contact.email}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
