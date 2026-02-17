const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');

// @route   POST api/chat
// @desc    Create a new chat or send message to existing chat
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, orderId, content, messageType = 'text' } = req.body;

    // Validate required fields
    if (!receiverId || !content) {
      return res.status(400).json({ msg: 'Receiver and content are required' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ msg: 'Receiver not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, receiverId] },
      orderId: orderId || null
    });

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [req.userId, receiverId],
        orderId,
        messages: []
      });
    }

    // Add new message
    const newMessage = {
      senderId: req.userId,
      receiverId,
      orderId,
      content,
      messageType,
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = {
      content,
      senderId: req.userId,
      timestamp: new Date()
    };

    await chat.save();

    // Populate sender and receiver info
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', ['name', 'location', 'userType'])
      .populate('messages.senderId', ['name'])
      .populate('messages.receiverId', ['name']);

    res.json(populatedChat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/chat
// @desc    Get all chats for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ 
      participants: req.userId,
      isActive: true 
    })
    .populate('participants', ['name', 'location', 'userType', 'ratings'])
    .populate('orderId', ['orderId', 'status'])
    .populate('lastMessage.senderId', ['name'])
    .sort({ 'lastMessage.timestamp': -1 });

    res.json(chats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/chat/:id
// @desc    Get specific chat with messages
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', ['name', 'location', 'userType', 'phone'])
      .populate('orderId', ['orderId', 'status', 'quantity', 'totalPrice']);

    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === req.userId)) {
      return res.status(401).json({ msg: 'Not authorized to view this chat' });
    }

    // Mark messages as read (except those sent by current user)
    chat.messages.forEach(message => {
      if (message.receiverId.toString() === req.userId && !message.isRead) {
        message.isRead = true;
        message.readAt = new Date();
      }
    });

    await chat.save();

    // Populate message details
    const populatedChat = await Chat.findById(chat._id)
      .populate('messages.senderId', ['name', 'userType'])
      .populate('messages.receiverId', ['name', 'userType']);

    res.json(populatedChat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/chat/:id/read
// @desc    Mark all messages in chat as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === req.userId)) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Mark unread messages as read
    chat.messages.forEach(message => {
      if (message.receiverId.toString() === req.userId && !message.isRead) {
        message.isRead = true;
        message.readAt = new Date();
      }
    });

    await chat.save();
    res.json({ msg: 'Messages marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;