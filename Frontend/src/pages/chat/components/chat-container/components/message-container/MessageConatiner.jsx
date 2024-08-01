import { useAppStore } from '@/store';
import moment from 'moment';
import React, { useEffect, useRef, useCallback } from 'react';

export function MessageContainer() {
  const scrollRef = useRef();
  const selectedChatMessages = useAppStore((state) => state.selectedChatMessages);
  const selectedChatData = useAppStore((state) => state.selectedChatData);
  const selectedChatType = useAppStore((state) => state.selectedChatType);
  const setSelectedChatMessages = useAppStore((state) => state.setSelectedChatMessages);
  const userInfo = useAppStore((state) => state.userInfo);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await fetch("http://localhost:7052/get-messages", {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ id: selectedChatData._id }),
        });

        const responseData = await response.json();

        if (responseData.messages) {
          setSelectedChatMessages(responseData.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    if (selectedChatData._id) {
      getMessage();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    handleScroll();
  }, [selectedChatMessages, handleScroll]);

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      if (selectedChatType === 'contact') {
        return renderDm(message, index, showDate);
      } else if (selectedChatType === 'channel') {
        return renderChannelMessage(message, index, showDate);
      }
      return null;
    });
  };

  const renderDm = (message, index, showDate) => {
    const isSender = message.sender === userInfo.id;

    return (
      <div key={index} className={`relative mb-4 ${isSender ? "text-right" : "text-left"}`}>
        {showDate && (
          <div className='text-center text-gray-500 my-2'>
            {moment(message.timestamp).format("LL")}
          </div>
        )}
        <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
          <div className={`inline-block p-4 rounded my-1 max-w-[60%] break-words relative
            ${isSender
              ? "bg-blue-500 text-white border-blue-300"
              : "bg-gray-700 text-white border-gray-500"}
            border
          `}>
            {message.messageType === 'file' && message.fileUrl && (
              <div className="relative">
                <img
                  src={message.fileUrl}
                  alt="file preview"
                  className="w-full h-32 object-cover rounded-md cursor-pointer"
                  style={{ objectFit: 'cover' }}
                  onClick={() => window.open(message.fileUrl, '_blank')}
                />
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2 rounded-b-md">
                  <span>File</span>
                </div>
              </div>
            )}
            {message.messageType === 'text' && message.content}
            <div className={`text-xs text-gray-600 absolute bottom-0 ${isSender ? "right-0" : "left-0"} m-1`}>
              {moment(message.timestamp).format("LT")}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChannelMessage = (message, index, showDate) => {
    const isSender = message.sender._id === userInfo.id;

    return (
      <div key={index} className="relative mb-4">
        {showDate && (
          <div className='text-center text-gray-500 my-2'>
            {moment(message.timestamp).format("LL")}
          </div>
        )}
        <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
          <div className={`inline-block p-4 rounded my-1 max-w-[60%] break-words relative
            ${isSender
              ? "bg-blue-500 text-white border-blue-300"
              : "bg-gray-700 text-white border-gray-500"}
            border
          `}>
            {message.messageType === 'file' && message.fileUrl && (
              <div className="relative">
                <img
                  src={message.fileUrl}
                  alt="file preview"
                  className="w-full h-32 object-cover rounded-md cursor-pointer"
                  style={{ objectFit: 'cover' }}
                  onClick={() => window.open(message.fileUrl, '_blank')}
                />
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2 rounded-b-md">
                  <span>File</span>
                </div>
              </div>
            )}
            {message.messageType === 'text' && message.content}
            <div className="text-xs text-gray-600 absolute bottom-0 left-0 m-1">
              {moment(message.timestamp).format("LT")}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8" style={{ width: '50vw', margin: '0 auto' }}>
      {renderMessages()}
      <div ref={scrollRef} />
    </div>
  );
}
