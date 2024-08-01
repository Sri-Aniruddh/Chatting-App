export const createChatSlice = (set, get) => ({
  currentUser: undefined,
  setCurrentuser: (user) => set({ currentUser: user }),
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  
  directMessageContacts: [],
  setDirectMessageContacts: (contacts) => set({ directMessageContacts: contacts }),
  
  channels:[],
  setChannels:(channels)=>set({channels}),

  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
  
  addChannel:(channel)=>{
    const channels=get().channels;
    set({channels:[channel,...channels]});
  },
  
  closeChat: () => set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
  }),
  addMessage: (message) => {
      const { selectedChatMessages, selectedChatType } = get();

      // Optional: Check for duplicate messages
      const isDuplicate = selectedChatMessages.some(
          (msg) => msg._id === message._id
      );

      if (!isDuplicate) {
          set({
              selectedChatMessages: [
                  ...selectedChatMessages,
                  {
                      ...message,
                      recipient: selectedChatType === "channel" ? message.recipient : message.recipient._id,
                      sender: selectedChatType === "channel" ? message.sender : message.sender._id
                  }
              ]
          });
      }
  },
});
