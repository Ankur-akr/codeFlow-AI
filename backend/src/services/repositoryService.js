const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const simpleGit = require('simple-git');
const Repository = require('../models/Repository');
const { logger } = require('../config/database');

class RepositoryService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.ignoreList = [
      'node_modules',
      '.git',
      '.vscode',
      '.idea',
      'dist',
      'build',
      '.next',
      '__pycache__',
      'venv',
      '.env',
      'coverage',
      '.DS_Store',
      'Thumbs.db'
    ];
  }

  /**
   * Connect GitHub repository
   */
  async connectGitHub(userId, repoUrl, accessToken) {
    try {
      logger.info(`Connecting GitHub repository: ${repoUrl}`);

      // Extract repo name from URL
      const repoName = repoUrl.split('/').pop().replace('.git', '');
      const localPath = path.join(this.uploadDir, userId.toString(), repoName);

      // Create directory
      await fs.mkdir(path.dirname(localPath), { recursive: true });

      // Clone repository
      const git = simpleGit();
      await git.clone(repoUrl, localPath);

      logger.info(`Repository cloned to: ${localPath}`);

      // Create repository record
      const repository = new Repository({
        userId,
        name: repoName,
        source: 'github',
        sourceUrl: repoUrl,
        localPath
      });

      await repository.save();

      // Parse and analyze
      await this.parseRepository(repository._id);

      return repository;
    } catch (error) {
      logger.error('Error connecting GitHub repository:', error);
      throw new Error(`Failed to connect GitHub repository: ${error.message}`);
    }
  }

  /**
   * Upload ZIP file
   */
  async uploadZip(userId, file) {
    try {
      logger.info(`Uploading ZIP file: ${file.originalname}`);

      const repoName = path.parse(file.originalname).name;
      const localPath = path.join(this.uploadDir, userId.toString(), repoName);

      // Create directory
      await fs.mkdir(localPath, { recursive: true });

      // Extract ZIP
      const zip = new AdmZip(file.buffer);
      zip.extractAllTo(localPath, true);

      logger.info(`ZIP extracted to: ${localPath}`);

      // Create repository record
      const repository = new Repository({
        userId,
        name: repoName,
        source: 'upload',
        localPath
      });

      await repository.save();

      // Parse and analyze
      await this.parseRepository(repository._id);

      return repository;
    } catch (error) {
      logger.error('Error uploading ZIP:', error);
      throw new Error(`Failed to upload ZIP: ${error.message}`);
    }
  }

  /**
   * Clone from Git URL
   */
  async cloneGitUrl(userId, gitUrl) {
    try {
      logger.info(`Cloning from Git URL: ${gitUrl}`);

      const repoName = gitUrl.split('/').pop().replace('.git', '');
      const localPath = path.join(this.uploadDir, userId.toString(), repoName);

      // Create directory
      await fs.mkdir(path.dirname(localPath), { recursive: true });

      // Clone repository
      const git = simpleGit();
      await git.clone(gitUrl, localPath);

      logger.info(`Repository cloned to: ${localPath}`);

      // Create repository record
      const repository = new Repository({
        userId,
        name: repoName,
        source: 'git-url',
        sourceUrl: gitUrl,
        localPath
      });

      await repository.save();

      // Parse and analyze
      await this.parseRepository(repository._id);

      return repository;
    } catch (error) {
      logger.error('Error cloning Git URL:', error);
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  /**
   * Parse repository structure and metadata
   */
  async parseRepository(repoId) {
    try {
      logger.info(`Parsing repository: ${repoId}`);

      const repository = await Repository.findById(repoId);
      if (!repository) {
        throw new Error('Repository not found');
      }

      // Build file tree
      const fileStructure = await this.buildFileTree(repository.localPath);

      // Extract metadata
      const metadata = await this.extractMetadata(repository.localPath, fileStructure);

      // Update repository
      repository.fileStructure = fileStructure;
      repository.metadata = metadata;
      await repository.save();

      logger.info(`Repository parsed successfully: ${repoId}`);

      return { fileStructure, metadata };
    } catch (error) {
      logger.error('Error parsing repository:', error);
      throw new Error(`Failed to parse repository: ${error.message}`);
    }
  }

  /**
   * Build file tree structure
   */
  async buildFileTree(dirPath, basePath = '') {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const tree = {};

      for (const item of items) {
        // Skip ignored items
        if (this.shouldIgnore(item.name)) continue;

        const itemPath = path.join(dirPath, item.name);
        const relativePath = path.join(basePath, item.name);

        if (item.isDirectory()) {
          tree[item.name] = await this.buildFileTree(itemPath, relativePath);
        } else {
          const stats = await fs.stat(itemPath);
          tree[item.name] = {
            type: 'file',
            path: relativePath,
            extension: path.extname(item.name),
            size: stats.size
          };
        }
      }

      return tree;
    } catch (error) {
      logger.error('Error building file tree:', error);
      return {};
    }
  }

  /**
   * Extract repository metadata
   */
  async extractMetadata(dirPath, fileStructure) {
    try {
      const files = this.flattenFileTree(fileStructure);

      // Detect primary language
      const language = this.detectPrimaryLanguage(files);

      // Detect framework
      const framework = await this.detectFramework(dirPath);

      // Count total lines
      let totalLines = 0;
      let totalSize = 0;

      for (const file of files) {
        totalSize += file.size || 0;
        
        try {
          const content = await fs.readFile(
            path.join(dirPath, file.path),
            'utf-8'
          );
          totalLines += content.split('\n').length;
        } catch (error) {
          // Skip binary files or files that can't be read
        }
      }

      return {
        language,
        framework,
        totalFiles: files.length,
        totalLines,
        size: totalSize
      };
    } catch (error) {
      logger.error('Error extracting metadata:', error);
      return {
        language: 'Unknown',
        framework: 'Unknown',
        totalFiles: 0,
        totalLines: 0,
        size: 0
      };
    }
  }

  /**
   * Detect primary programming language
   */
  detectPrimaryLanguage(files) {
    const languageMap = {
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.cs': 'C#',
      '.cpp': 'C++',
      '.c': 'C',
      '.rs': 'Rust',
      '.swift': 'Swift',
      '.kt': 'Kotlin'
    };

    const languageCounts = {};
    
    files.forEach(file => {
      const lang = languageMap[file.extension];
      if (lang) {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      }
    });

    // Return language with most files
    const sortedLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1]);

    return sortedLanguages.length > 0 ? sortedLanguages[0][0] : 'Unknown';
  }

  /**
   * Detect framework
   */
  async detectFramework(dirPath) {
    try {
      // Check for package.json (Node.js projects)
      const packageJsonPath = path.join(dirPath, 'package.json');
      try {
        const packageJson = await fs.readFile(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(packageJson);
        
        if (pkg.dependencies) {
          if (pkg.dependencies.react) return 'React';
          if (pkg.dependencies.vue) return 'Vue';
          if (pkg.dependencies['@angular/core']) return 'Angular';
          if (pkg.dependencies.express) return 'Express';
          if (pkg.dependencies.next) return 'Next.js';
          if (pkg.dependencies.nuxt) return 'Nuxt.js';
          if (pkg.dependencies.svelte) return 'Svelte';
        }
      } catch (error) {
        // No package.json
      }

      // Check for requirements.txt (Python projects)
      const requirementsPath = path.join(dirPath, 'requirements.txt');
      try {
        const requirements = await fs.readFile(requirementsPath, 'utf-8');
        if (requirements.includes('django')) return 'Django';
        if (requirements.includes('flask')) return 'Flask';
        if (requirements.includes('fastapi')) return 'FastAPI';
      } catch (error) {
        // No requirements.txt
      }

      // Check for pom.xml (Java/Maven projects)
      const pomPath = path.join(dirPath, 'pom.xml');
      try {
        await fs.access(pomPath);
        return 'Maven';
      } catch (error) {
        // No pom.xml
      }

      // Check for go.mod (Go projects)
      const goModPath = path.join(dirPath, 'go.mod');
      try {
        await fs.access(goModPath);
        return 'Go Modules';
      } catch (error) {
        // No go.mod
      }

      return 'Unknown';
    } catch (error) {
      logger.error('Error detecting framework:', error);
      return 'Unknown';
    }
  }

  /**
   * Flatten file tree to array
   */
  flattenFileTree(tree, result = []) {
    for (const [name, value] of Object.entries(tree)) {
      if (value.type === 'file') {
        result.push(value);
      } else {
        this.flattenFileTree(value, result);
      }
    }
    return result;
  }

  /**
   * Check if file/directory should be ignored
   */
  shouldIgnore(name) {
    return this.ignoreList.includes(name) || name.startsWith('.');
  }

  /**
   * Get file content
   */
  async getFileContent(repoId, filePath) {
    try {
      const repository = await Repository.findById(repoId);
      if (!repository) {
        throw new Error('Repository not found');
      }

      const fullPath = path.join(repository.localPath, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');

      return content;
    } catch (error) {
      logger.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Delete repository
   */
  async deleteRepository(repoId) {
    try {
      const repository = await Repository.findById(repoId);
      if (!repository) {
        throw new Error('Repository not found');
      }

      // Delete files
      await fs.rm(repository.localPath, { recursive: true, force: true });

      // Delete database record
      await Repository.deleteOne({ _id: repoId });

      logger.info(`Repository deleted: ${repoId}`);
    } catch (error) {
      logger.error('Error deleting repository:', error);
      throw new Error(`Failed to delete repository: ${error.message}`);
    }
  }
}

module.exports = new RepositoryService();

// Made with Bob
