const express = require('express');
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const repositoryService = require('../services/repositoryService');
const Repository = require('../models/Repository');
const { logger } = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

/**
 * @route   GET /api/repositories
 * @desc    Get all repositories for authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const repositories = await Repository.findByUser(req.user._id);
    
    res.json({
      repositories: repositories.map(repo => repo.getSummary())
    });
  } catch (error) {
    logger.error('Error fetching repositories:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch repositories',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/repositories/:id
 * @desc    Get repository details
 * @access  Private
 */
router.get('/:id', authenticate, authorize('repository'), async (req, res) => {
  try {
    res.json({
      repository: req.resource
    });
  } catch (error) {
    logger.error('Error fetching repository:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch repository',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/repositories/github
 * @desc    Connect GitHub repository
 * @access  Private
 */
router.post('/github', authenticate, async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        error: {
          message: 'Repository URL is required',
          status: 400
        }
      });
    }

    const repository = await repositoryService.connectGitHub(
      req.user._id,
      repoUrl,
      req.user.accessToken
    );

    res.status(201).json({
      message: 'Repository connected successfully',
      repository: repository.getSummary()
    });
  } catch (error) {
    logger.error('Error connecting GitHub repository:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to connect repository',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/repositories/upload
 * @desc    Upload repository as ZIP file
 * @access  Private
 */
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          message: 'ZIP file is required',
          status: 400
        }
      });
    }

    const repository = await repositoryService.uploadZip(req.user._id, req.file);

    res.status(201).json({
      message: 'Repository uploaded successfully',
      repository: repository.getSummary()
    });
  } catch (error) {
    logger.error('Error uploading repository:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to upload repository',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/repositories/git-url
 * @desc    Clone repository from Git URL
 * @access  Private
 */
router.post('/git-url', authenticate, async (req, res) => {
  try {
    const { gitUrl } = req.body;

    if (!gitUrl) {
      return res.status(400).json({
        error: {
          message: 'Git URL is required',
          status: 400
        }
      });
    }

    const repository = await repositoryService.cloneGitUrl(req.user._id, gitUrl);

    res.status(201).json({
      message: 'Repository cloned successfully',
      repository: repository.getSummary()
    });
  } catch (error) {
    logger.error('Error cloning repository:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to clone repository',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/repositories/:id/files
 * @desc    Get repository file structure
 * @access  Private
 */
router.get('/:id/files', authenticate, authorize('repository'), async (req, res) => {
  try {
    res.json({
      fileStructure: req.resource.fileStructure
    });
  } catch (error) {
    logger.error('Error fetching file structure:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch file structure',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/repositories/:id/files/:path
 * @desc    Get file content
 * @access  Private
 */
router.get('/:id/files/*', authenticate, authorize('repository'), async (req, res) => {
  try {
    const filePath = req.params[0]; // Get everything after /files/

    if (!filePath) {
      return res.status(400).json({
        error: {
          message: 'File path is required',
          status: 400
        }
      });
    }

    const content = await repositoryService.getFileContent(req.params.id, filePath);

    res.json({
      path: filePath,
      content
    });
  } catch (error) {
    logger.error('Error fetching file content:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch file content',
        status: 500
      }
    });
  }
});

/**
 * @route   DELETE /api/repositories/:id
 * @desc    Delete repository
 * @access  Private
 */
router.delete('/:id', authenticate, authorize('repository'), async (req, res) => {
  try {
    await repositoryService.deleteRepository(req.params.id);

    res.json({
      message: 'Repository deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting repository:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete repository',
        status: 500
      }
    });
  }
});

module.exports = router;

// Made with Bob
