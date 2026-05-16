const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const bobService = require('../services/bobService');
const Repository = require('../models/Repository');
const { logger } = require('../config/database');

const router = express.Router();

/**
 * @route   POST /api/bob/analyze/:repoId
 * @desc    Analyze repository with IBM Bob
 * @access  Private
 */
router.post('/analyze/:repoId', authenticate, authorize('repository'), async (req, res) => {
  try {
    const repository = req.resource;

    // Update status to analyzing
    await repository.updateAnalysisStatus('analyzing');

    // Analyze with Bob
    const analysis = await bobService.analyzeRepository(repository);

    // Save analysis results
    await repository.setAnalysis({
      summary: analysis.content,
      architecture: analysis.content,
      dependencies: [],
      keyModules: []
    });

    res.json({
      message: 'Repository analyzed successfully',
      analysis: analysis.content
    });
  } catch (error) {
    logger.error('Error analyzing repository:', error);
    
    // Update status to failed
    if (req.resource) {
      await req.resource.updateAnalysisStatus('failed');
    }

    res.status(500).json({
      error: {
        message: error.message || 'Failed to analyze repository',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/bob/explain
 * @desc    Explain code with IBM Bob
 * @access  Private
 */
router.post('/explain', authenticate, async (req, res) => {
  try {
    const { code, filePath, language, repositoryName } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: {
          message: 'Code and language are required',
          status: 400
        }
      });
    }

    const explanation = await bobService.explainCode(code, {
      filePath: filePath || 'unknown',
      language,
      repositoryName: repositoryName || 'unknown'
    });

    res.json({
      explanation: explanation.content,
      mode: explanation.mode
    });
  } catch (error) {
    logger.error('Error explaining code:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to explain code',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/bob/document
 * @desc    Generate documentation with IBM Bob
 * @access  Private
 */
router.post('/document', authenticate, async (req, res) => {
  try {
    const { code, filePath, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: {
          message: 'Code and language are required',
          status: 400
        }
      });
    }

    const documentation = await bobService.generateDocumentation(code, {
      filePath: filePath || 'unknown',
      language
    });

    res.json({
      documentation: documentation.content,
      mode: documentation.mode
    });
  } catch (error) {
    logger.error('Error generating documentation:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to generate documentation',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/bob/generate-tests
 * @desc    Generate tests with IBM Bob
 * @access  Private
 */
router.post('/generate-tests', authenticate, async (req, res) => {
  try {
    const { code, filePath, language, testFramework } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: {
          message: 'Code and language are required',
          status: 400
        }
      });
    }

    const tests = await bobService.generateTests(code, {
      filePath: filePath || 'unknown',
      language,
      testFramework
    });

    res.json({
      tests: tests.content,
      mode: tests.mode
    });
  } catch (error) {
    logger.error('Error generating tests:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to generate tests',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/bob/refactor
 * @desc    Refactor code with IBM Bob
 * @access  Private
 */
router.post('/refactor', authenticate, async (req, res) => {
  try {
    const { code, filePath, language, goals } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: {
          message: 'Code and language are required',
          status: 400
        }
      });
    }

    const refactored = await bobService.refactorCode(code, {
      filePath: filePath || 'unknown',
      language
    }, goals || []);

    res.json({
      refactored: refactored.content,
      mode: refactored.mode
    });
  } catch (error) {
    logger.error('Error refactoring code:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to refactor code',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/bob/readme/:repoId
 * @desc    Generate README with IBM Bob
 * @access  Private
 */
router.post('/readme/:repoId', authenticate, authorize('repository'), async (req, res) => {
  try {
    const repository = req.resource;

    const readme = await bobService.generateReadme(repository);

    res.json({
      readme: readme.content,
      mode: readme.mode
    });
  } catch (error) {
    logger.error('Error generating README:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to generate README',
        status: 500
      }
    });
  }
});

module.exports = router;

// Made with Bob
