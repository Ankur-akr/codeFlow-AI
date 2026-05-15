const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    enum: ['github', 'upload', 'git-url'],
    required: true
  },
  sourceUrl: {
    type: String,
    default: null
  },
  localPath: {
    type: String,
    required: true
  },
  fileStructure: {
    type: Object,
    default: {}
  },
  metadata: {
    language: {
      type: String,
      default: 'Unknown'
    },
    framework: {
      type: String,
      default: 'Unknown'
    },
    totalFiles: {
      type: Number,
      default: 0
    },
    totalLines: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      default: 0
    }
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending'
  },
  analysis: {
    summary: {
      type: String,
      default: null
    },
    architecture: {
      type: String,
      default: null
    },
    dependencies: [{
      type: String
    }],
    keyModules: [{
      name: String,
      path: String,
      description: String
    }],
    generatedAt: {
      type: Date,
      default: null
    }
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

// Compound index for user and repository name
repositorySchema.index({ userId: 1, name: 1 });

// Index for analysis status
repositorySchema.index({ analysisStatus: 1 });

// Method to update analysis status
repositorySchema.methods.updateAnalysisStatus = function(status) {
  this.analysisStatus = status;
  return this.save();
};

// Method to set analysis results
repositorySchema.methods.setAnalysis = function(analysisData) {
  this.analysis = {
    ...analysisData,
    generatedAt: new Date()
  };
  this.analysisStatus = 'completed';
  return this.save();
};

// Method to get summary
repositorySchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    source: this.source,
    language: this.metadata.language,
    framework: this.metadata.framework,
    totalFiles: this.metadata.totalFiles,
    analysisStatus: this.analysisStatus,
    createdAt: this.createdAt
  };
};

// Static method to find by user
repositorySchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find pending analysis
repositorySchema.statics.findPendingAnalysis = function() {
  return this.find({ analysisStatus: 'pending' });
};

const Repository = mongoose.model('Repository', repositorySchema);

module.exports = Repository;

// Made with Bob
