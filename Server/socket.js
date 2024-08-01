import { Server as SocketIoServer } from "socket.io";
import Message from "./models/Messagemodel.js"; // Ensure this model has fields: sender, recipient, content, timestamp, and read
import Channel from "./models/ChannelModel.js";

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN || 'http://localhost:5173',
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  const userSocketMap = new Map();

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    try {
      const createdMessage = await Message.create(message);

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email username")
        .populate("recipient", "id email username");

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receivedMessage", messageData);
      }
      
      if (senderSocketId && senderSocketId !== recipientSocketId) {
        io.to(senderSocketId).emit("receivedMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;
  
    try {
      const createdMessage = await Message.create({
        sender,
        recipient: null,  // Explicitly set recipient to null for channel messages
        content,
        messageType,
        timestamp: new Date(),
        fileUrl,
      });
  
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email username image")
        .exec();
  
      await Channel.findByIdAndUpdate(channelId, {
        $push: { messages: createdMessage._id },
      });
  
      const channel = await Channel.findById(channelId).populate("members");
  
      const finalData = { ...messageData._doc, channelId: channel._id };
  
      if (channel && channel.members) {
        channel.members.forEach((member) => {
          const memberSocketId = userSocketMap.get(member._id.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("received-channel-message", finalData);
          }
        });
  
        const adminSocketId = userSocketMap.get(channel.admin._id.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit("received-channel-message", finalData);
        }
      }
    } catch (error) {
      console.error("Error sending channel message:", error);
    }
  };
  

  io.on("connection", async (socket) => {
    const userID = socket.handshake.query.userID;

    if (userID) {
      userSocketMap.set(userID, socket.id);
    }

    socket.on("sendMessage", async (message) => {
      await sendMessage(message);
    });

    socket.on("send-channel-message", async (message) => {
      await sendChannelMessage(message);
    });

    socket.on("disconnect", () => {
      userSocketMap.forEach((value, key) => {
        if (value === socket.id) {
          userSocketMap.delete(key);
        }
      });
    });
  });
};

export default setupSocket;
