import Message from '../models/messageModel.js';
import DirectChat from '../models/directChatModel.js';
import Group from '../models/Group.js';

export const setupSocketHandlers = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New socket connection attempt');
    
    if (!socket.user || !socket.user._id) {
      console.error('Socket connection rejected: No user data');
      socket.disconnect();
      return;
    }

    const userId = socket.user._id.toString();
    console.log(`User connected: ${userId}`);
    
    // Add user to connected users map
    connectedUsers.set(userId, socket.id);
    
    // Emit online users to all clients
    io.emit('user_status_update', {
      onlineUsers: Array.from(connectedUsers.keys())
    });

    // Handle get_group event
    socket.on('get_group', async ({ groupId }, callback) => {
      try {
        console.log(`Fetching group data for ID: ${groupId}`);
        const group = await Group.findById(groupId)
          .populate('members.user', 'name profilePicture')
          .populate('members.role');

        if (!group) {
          if (typeof callback === 'function') {
            callback({ error: 'Group not found' });
          }
          return;
        }

        if (typeof callback === 'function') {
          callback({ data: group });
        }
      } catch (error) {
        console.error('Error fetching group:', error);
        if (typeof callback === 'function') {
          callback({ error: 'Failed to fetch group data' });
        }
      }
    });

    // Handle get_group_messages event
    socket.on('get_group_messages', async ({ groupId }, callback) => {
      try {
        console.log(`Fetching messages for group: ${groupId}`);
        const messages = await Message.find({ chat: groupId, chatType: 'group' })
          .populate('sender', 'name profilePicture')
          .sort({ createdAt: 1 });

        if (typeof callback === 'function') {
          callback({ messages });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (typeof callback === 'function') {
          callback({ error: 'Failed to fetch messages' });
        }
      }
    });

    // Handle group_message event
    socket.on('group_message', async ({ groupId, content, type, imageUrl }, callback) => {
      try {
        console.log(`User ${userId} sending message to group ${groupId}`);
        
        const group = await Group.findById(groupId);
        if (!group) {
          if (typeof callback === 'function') {
            callback({ error: 'Group not found' });
          }
          return;
        }

        const isMember = group.members.some(m => m.user.toString() === userId);
        if (!isMember) {
          if (typeof callback === 'function') {
            callback({ error: 'Not authorized to send message to this group' });
          }
          return;
        }

        const message = await Message.create({
          sender: userId,
          content,
          type,
          imageUrl,
          chatType: 'group',
          chat: groupId,
          chatModel: 'Group',
          readBy: [{ user: userId }]
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name profilePicture')
          .populate('readBy.user', 'name profilePicture');

        io.to(groupId).emit('group_message', populatedMessage);
        if (typeof callback === 'function') {
          callback({ success: true, message: populatedMessage });
        }
      } catch (error) {
        console.error('Send message error:', error);
        if (typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Handle join_group event
    socket.on('join_group', async ({ groupId }) => {
      try {
        console.log(`User ${userId} joining group: ${groupId}`);
        
        const group = await Group.findById(groupId);
        if (!group) {
          socket.emit('group_error', { message: 'Group not found' });
          return;
        }

        const isMember = group.members.some(m => m.user.toString() === userId);
        if (!isMember) {
          socket.emit('group_error', { message: 'Not authorized to join this group' });
          return;
        }

        socket.join(groupId);
        socket.to(groupId).emit('user_joined', {
          userId,
          userName: socket.user.name
        });
      } catch (error) {
        console.error('Error joining group:', error);
        socket.emit('group_error', { message: 'Error joining group' });
      }
    });

    // Handle leave_group event
    socket.on('leave_group', ({ groupId }) => {
      console.log(`User ${userId} leaving group: ${groupId}`);
      socket.leave(groupId);
      socket.to(groupId).emit('user_left', {
        userId,
        userName: socket.user.name
      });
    });

    // Send message to room
    socket.on('send_message', async ({ roomId, chatType, content, attachments = [] }) => {
      try {
        if (!roomId || !chatType || !content) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        console.log(`User ${userId} sending message to room ${roomId}`);
        
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
        console.log(`Message sent to room ${roomId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle typing status
    socket.on('typing', ({ roomId, isTyping }) => {
      if (!roomId) {
        socket.emit('error', { message: 'Room ID is required' });
        return;
      }

      socket.to(roomId).emit('user_typing', {
        userId,
        userName: socket.user.name,
        isTyping
      });
    });

    // Mark messages as read
    socket.on('mark_as_read', async ({ messageId }) => {
      try {
        if (!messageId) {
          socket.emit('error', { message: 'Message ID is required' });
          return;
        }

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