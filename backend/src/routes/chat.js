const express = require('express');
const { checkJwt } = require('../middleware/auth');
const Chat = require('../models/Chat');
const router = express.Router();

// Get user's chat history
router.get('/', checkJwt, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.auth.sub })
      .sort({ lastUpdated: -1 })
      .limit(10);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Send a message and get AI response
router.post('/', checkJwt, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // For now, just echo the message back
    // TODO: Integrate with actual AI service
    const response = `Echo: ${message}`;

    // Save the chat
    const chat = await Chat.findOneAndUpdate(
      { userId: req.auth.sub },
      {
        $push: {
          messages: [
            {
              role: 'user',
              content: message,
            },
            {
              role: 'assistant',
              content: response,
            },
          ],
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json({ response, chatId: chat._id });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

module.exports = router; 