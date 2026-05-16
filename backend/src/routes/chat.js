const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const bobService = require('../services/bobService');
const ChatSession = require('../models/ChatSession');
const Repository = require('../models/Repository');
const { logger } = require('../config/database');

const router = express.Router();

/**
 * @route   GET /api/chat/sessions
 * @desc    Get all chat sessions for authenticated user
 * @access  Private
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await ChatSession.findByUser(req.user._id)
      .populate('repositoryId', 'name metadata');

    res.json({
      sessions: sessions.map(session => session.getSummary())
    });
  } catch (error) {
    logger.error('Error fetching chat sessions:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch chat sessions',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/chat/sessions
 * @desc    Create new chat session
 * @access  Private
 */
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const { repositoryId, title } = req.body;

    if (!repositoryId) {
      return res.status(400).json({
        error: {
          message: 'Repository ID is required',
          status: 400
        }
      });
    }

    // Verify repository exists and belongs to user
    const repository = await Repository.findOne({
      _id: repositoryId,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        error: {
          message: 'Repository not found',
          status: 404
        }
      });
    }

    const session = new ChatSession({
      userId: req.user._id,
      repositoryId,
      title: title || `Chat - ${repository.name}`,
      context: {
        mode: 'ask'
      }
    });

    await session.save();

    res.status(201).json({
      message: 'Chat session created successfully',
      session: session.getSummary()
    });
  } catch (error) {
    logger.error('Error creating chat session:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create chat session',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/chat/sessions/:sessionId
 * @desc    Get chat session details
 * @access  Private
 */
router.get('/sessions/:sessionId', authenticate, authorize('chat'), async (req, res) => {
  try {
    const session = await req.resource.populate('repositoryId', 'name metadata');

    res.json({
      session: {
        ...session.toObject(),
        repository: session.repositoryId
      }
    });
  } catch (error) {
    logger.error('Error fetching chat session:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch chat session',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/chat/sessions/:sessionId/messages
 * @desc    Send message to IBM Bob
 * @access  Private
 */
router.post('/sessions/:sessionId/messages', authenticate, authorize('chat'), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: {
          message: 'Message is required',
          status: 400
        }
      });
    }

    const session = req.resource;
    const repository = await Repository.findById(session.repositoryId);

    if (!repository) {
      return res.status(404).json({
        error: {
          message: 'Repository not found',
          status: 404
        }
      });
    }

    // Build chat context
    const chatContext = {
      repositoryName: repository.name,
      language: repository.metadata.language,
      mode: session.context.mode || 'ask',
      history: session.getRecentMessages(10),
      currentFile: session.context.currentFile
    };

    // Get response from Bob
    const response = await bobService.chat(message, chatContext);

    // Save conversation
    await session.addConversation(message, response.content, {
      mode: response.mode
    });

    res.json({
      message: 'Message sent successfully',
      response: {
        content: response.content,
        mode: response.mode,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to send message',
        status: 500
      }
    });
  }
});

/**
 * @route   PUT /api/chat/sessions/:sessionId/mode
 * @desc    Switch Bob's mode
 * @access  Private
 */
router.put('/sessions/:sessionId/mode', authenticate, authorize('chat'), async (req, res) => {
  try {
    const { mode } = req.body;

    if (!mode) {
      return res.status(400).json({
        error: {
          message: 'Mode is required',
          status: 400
        }
      });
    }

    const validModes = ['code', 'ask', 'plan', 'advanced', 'orchestrator'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        error: {
          message: `Invalid mode. Must be one of: ${validModes.join(', ')}`,
          status: 400
        }
      });
    }

    const session = req.resource;
    await session.switchMode(mode);

    res.json({
      message: `Switched to ${mode} mode`,
      mode
    });
  } catch (error) {
    logger.error('Error switching mode:', error);
    res.status(500).json({
      error: {
        message: 'Failed to switch mode',
        status: 500
      }
    });
  }
});

/**
 * @route   PUT /api/chat/sessions/:sessionId/context
 * @desc    Update chat context
 * @access  Private
 */
router.put('/sessions/:sessionId/context', authenticate, authorize('chat'), async (req, res) => {
  try {
    const { currentFile, customContext } = req.body;

    const session = req.resource;
    const contextUpdate = {};

    if (currentFile !== undefined) {
      contextUpdate.currentFile = currentFile;
    }

    if (customContext !== undefined) {
      contextUpdate.customContext = customContext;
    }

    await session.updateContext(contextUpdate);

    res.json({
      message: 'Context updated successfully',
      context: session.context
    });
  } catch (error) {
    logger.error('Error updating context:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update context',
        status: 500
      }
    });
  }
});

/**
 * @route   DELETE /api/chat/sessions/:sessionId
 * @desc    Delete chat session
 * @access  Private
 */
router.delete('/sessions/:sessionId', authenticate, authorize('chat'), async (req, res) => {
  try {
    await ChatSession.deleteOne({ _id: req.params.sessionId });

    res.json({
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting chat session:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete chat session',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/chat/repository/:repoId/sessions
 * @desc    Get all chat sessions for a repository
 * @access  Private
 */
router.get('/repository/:repoId/sessions', authenticate, async (req, res) => {
  try {
    // Verify repository belongs to user
    const repository = await Repository.findOne({
      _id: req.params.repoId,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        error: {
          message: 'Repository not found',
          status: 404
        }
      });
    }

    const sessions = await ChatSession.findByUserAndRepository(
      req.user._id,
      req.params.repoId
    );

    res.json({
      sessions: sessions.map(session => session.getSummary())
    });
  } catch (error) {
    logger.error('Error fetching repository chat sessions:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch chat sessions',
        status: 500
      }
    });
  }
});

module.exports = router;

// Made with Bob
