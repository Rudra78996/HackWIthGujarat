import Message from '../models/messageModel.js';
import DirectChat from '../models/directChatModel.js';
import Group from '../models/groupModel.js';

export const setupSocketHandlers = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected: ${userId}`);
    
    // Add user to connected users map
    connectedUsers.set(userId, socket.id);
    
    // Emit online users to all clients
    io.emit('user_status_update', {
      onlineUsers: Array.from(connectedUsers.keys())
    });

    // Join room
    socket.on('join_room', ({ roomId }) => {
      console.log(`User ${userId} joined room: ${roomId}`);
      socket.join(roomId);
    });

    // Leave room
    socket.on('leave_room', ({ roomId }) => {
      console.log(`User ${userId} left room: ${roomId}`);
      socket.leave(roomId);
    });

    // Send message to room
    socket.on('send_message', async ({ roomId, chatType, content, attachments = [] }) => {
      try {
        let chatModel;
        let chat;

        // Validate the room exists
        if (chatType === 'direct') {
          chatModel = 'DirectChat';
          chat = await DirectChat.findById(roomId);
          
          // Check if user is part of this chat
          if (!chat || !chat.participants.includes(userId)) {
            socket.emit('error', { message: 'Not authorized to send message to this chat' });
            return;
          }
        } else if (chatType === 'group') {
          chatModel = 'Group';
          chat = await Group.findById(roomId);
          
          // Check if user is member of this group
          const isMember = chat?.members.some(m => m.user.toString() === userId);
          if (!chat || !isMember) {
            socket.emit('error', { message: 'Not authorized to send message to this group' });
            return;
          }
        } else {
          socket.emit('error', { message: 'Invalid chat type' });
          return;
        }

        // Create message
        const message = await Message.create({
          sender: userId,
          content,
          chatType,
          chat: roomId,
          chatModel,
          attachments,
          readBy: [{ user: userId }]
        });

        // Populate sender details
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name profilePicture')
          .populate('readBy.user', 'name profilePicture');

        // Update last message in chat
        if (chatType === 'direct') {
          await DirectChat.findByIdAndUpdate(roomId, { lastMessage: message._id });
        }

        // Emit message to room
        io.to(roomId).emit('new_message', populatedMessage);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle typing status
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('user_typing', {
        userId,
        userName: socket.user.name,
        isTyping
      });
    });

    // Mark messages as read
    socket.on('mark_as_read', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user already marked as read
        const alreadyRead = message.readBy.some(read => read.user.toString() === userId);
        
        if (!alreadyRead) {
          message.readBy.push({
            user: userId,
            readAt: new Date()
          });
          
          await message.save();
          
          // Emit read status update to chat room
          io.to(message.chat.toString()).emit('message_read', {
            messageId,
            userId,
            readAt: new Date()
          });
        }
      } catch (error) {
        console.error('Mark as read error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      
      // Remove from connected users
      connectedUsers.delete(userId);
      
      // Emit updated online users
      io.emit('user_status_update', {
        onlineUsers: Array.from(connectedUsers.keys())
      });
    });
  });
};