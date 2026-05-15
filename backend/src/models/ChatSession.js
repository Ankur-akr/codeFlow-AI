const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    codeSnippet: String,
    filePath: String,
    action: String,
    mode: String
  }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema],
  context: {
    mode: {
      type: String,
      enum: ['code', 'ask', 'plan', 'advanced', 'orchestrator'],
      default: 'ask'
    },
    currentFile: String,
    recentFiles: [String],
    customContext: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for user and repository
chatSessionSchema.index({ userId: 1, repositoryId: 1 });

// Index for recent sessions
chatSessionSchema.index({ updatedAt: -1 });

// Method to add message
chatSessionSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    metadata,
    timestamp: new Date()
  });
  this.updatedAt = new Date();
  return this.save();
};

// Method to add user and assistant messages
chatSessionSchema.methods.addConversation = function(userMessage, assistantMessage, metadata = {}) {
  this.messages.push(
    {
      role: 'user',
      content: userMessage,
      metadata,
      timestamp: new Date()
    },
    {
      role: 'assistant',
      content: assistantMessage,
      metadata,
      timestamp: new Date()
    }
  );
  this.updatedAt = new Date();
  return this.save();
};

// Method to update context
chatSessionSchema.methods.updateContext = function(contextUpdate) {
  this.context = {
    ...this.context,
    ...contextUpdate
  };
  return this.save();
};

// Method to switch mode
chatSessionSchema.methods.switchMode = function(newMode) {
  this.context.mode = newMode;
  return this.save();
};

// Method to get recent messages
chatSessionSchema.methods.getRecentMessages = function(count = 10) {
  return this.messages.slice(-count);
};

// Method to get summary
chatSessionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    repositoryId: this.repositoryId,
    messageCount: this.messages.length,
    mode: this.context.mode,
    lastMessage: this.messages.length > 0 ? this.messages[this.messages.length - 1].content.substring(0, 100) : null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find by user
chatSessionSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ updatedAt: -1 });
};

// Static method to find by repository
chatSessionSchema.statics.findByRepository = function(repositoryId) {
  return this.find({ repositoryId }).sort({ updatedAt: -1 });
};

// Static method to find by user and repository
chatSessionSchema.statics.findByUserAndRepository = function(userId, repositoryId) {
  return this.find({ userId, repositoryId }).sort({ updatedAt: -1 });
};

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;

// Made with Bob
