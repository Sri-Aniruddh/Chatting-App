import { useSocket } from '@/context/SocketContext';
import { useAppStore } from '@/store';
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';

export function MessageBar() {
  const emojiRef = useRef();
  const fileInputRef = useRef(); // Ref to trigger file input
  const selectedChatType = useAppStore((state) => state.selectedChatType);
  const selectedChatData = useAppStore((state) => state.selectedChatData);
  const userInfo = useAppStore((state) => state.userInfo);
  const addMessage = useAppStore((state) => state.addMessage);
  const socket = useSocket();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    if (!socket) {
      console.error('Socket not initialized');
      return;
    }

    const newMessage = {
      sender: userInfo.id,
      content: message,
      recipient: selectedChatData._id,
      messageType: file ? "file" : "text",
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      timestamp: new Date().toISOString(),
    };

    const newChannelMessage = {
      sender: userInfo.id,
      content: message,
      messageType: file ? "file" : "text",
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      timestamp: new Date().toISOString(),
      channelId: selectedChatData._id,
    };

    const handleFileUpload = async (messageToSend) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:7052/add-attachment-files', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const responseData = await response.json();

        if (responseData.fileUrl) {
          messageToSend.fileUrl = responseData.fileUrl;
          socket.emit(selectedChatType === "contact" ? "sendMessage" : "send-channel-message", messageToSend);
          addMessage(messageToSend);
        } else {
          console.error('File upload failed:', responseData.error);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    };

    if (file) {
      await handleFileUpload(selectedChatType === "contact" ? newMessage : newChannelMessage);
    } else {
      socket.emit(selectedChatType === "contact" ? "sendMessage" : "send-channel-message", selectedChatType === "contact" ? newMessage : newChannelMessage);
      addMessage(selectedChatType === "contact" ? newMessage : newChannelMessage);
    }

    setMessage("");
    setFile(null);
  };

  const handleFileuploading = () => {
    fileInputRef.current.click(); // Trigger the file input dialog
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <div className='h-[10vh] bg-[#1c1d25] flex items-center justify-between px-4 md:px-8 mb-6 gap-4 md:gap-6'>
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-3 md:gap-5 pr-3 md:pr-5">
        <input 
          type="text"
          className='flex-1 p-3 md:p-5 bg-transparent rounded-md focus:outline-none focus:border-none'
          placeholder='Enter Message'
          value={message}
          onChange={(e) => setMessage(e.target.value)} 
        />
        <button 
          className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
          onClick={handleFileuploading}
        >
          <GrAttachment className='text-xl md:text-2xl' />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="relative">
          <button 
            onClick={() => setEmojiPickerOpen(true)}
            className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'>
            <RiEmojiStickerLine className='text-xl md:text-2xl' />
          </button>
          {emojiPickerOpen && (
            <div ref={emojiRef} className="absolute bottom-16 right-0">
              <EmojiPicker
                onEmojiClick={handleAddEmoji}
                autoFocusSearch={false}
                theme='dark'
              />
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleSendMessage}
        className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'>
        <IoSend className='text-xl md:text-2xl' />
      </button>
    </div>
  );
}
