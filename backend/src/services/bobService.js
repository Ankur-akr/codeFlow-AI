const axios = require('axios');
const { logger } = require('../config/database');

class BobService {
  constructor() {
    this.apiKey = process.env.BOB_API_KEY;
    this.endpoint = process.env.BOB_API_ENDPOINT;
    this.model = process.env.BOB_MODEL || 'bob-default';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Send a request to IBM Bob
   * @param {string} prompt - The prompt to send to Bob
   * @param {string} mode - Bob's mode (code, ask, plan, advanced, orchestrator)
   * @param {object} context - Additional context for Bob
   * @returns {Promise<object>} Bob's response
   */
  async sendRequest(prompt, mode = 'code', context = {}) {
    try {
      logger.info(`Sending request to IBM Bob in ${mode} mode`);

      const response = await axios.post(
        `${this.endpoint}/generate`,
        {
          prompt,
          mode,
          context: {
            ...context,
            repository: context.repositoryName,
            files: context.fileStructure,
            language: context.primaryLanguage
          },
          model: this.model,
          tools: this.getToolsForMode(mode)
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      logger.info('Received response from IBM Bob');

      return {
        success: true,
        content: response.data.content || response.data.generated_text || response.data.text,
        mode: response.data.mode || mode,
        metadata: response.data.metadata || {}
      };
    } catch (error) {
      logger.error('Bob API Error:', error.message);
      
      // Handle specific error cases
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error('Invalid IBM Bob API key');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later');
        } else if (status === 503) {
          throw new Error('IBM Bob service temporarily unavailable');
        }
      }
      
      throw new Error(`Failed to get response from Bob: ${error.message}`);
    }
  }

  /**
   * Get available tools for a specific mode
   */
  getToolsForMode(mode) {
    const tools = {
      code: ['read_file', 'write_file', 'apply_diff', 'execute_command'],
      ask: ['read_file', 'search_files', 'list_files'],
      plan: ['read_file', 'list_files', 'search_files'],
      advanced: ['read_file', 'write_file', 'apply_diff', 'execute_command', 'mcp_tools'],
      orchestrator: ['all']
    };

    return tools[mode] || tools.code;
  }

  /**
   * Analyze repository with Bob (Plan mode)
   */
  async analyzeRepository(repoData) {
    const prompt = `Analyze this repository and provide a comprehensive summary:

Repository: ${repoData.name}
Language: ${repoData.metadata.language}
Framework: ${repoData.metadata.framework}
Total Files: ${repoData.metadata.totalFiles}
Total Lines: ${repoData.metadata.totalLines}

File Structure:
${JSON.stringify(repoData.fileStructure, null, 2)}

Provide:
1. High-level architecture summary (2-3 paragraphs)
2. Key modules and their purposes
3. Technology stack analysis
4. Main workflows and data flow
5. Potential improvement areas

Format your response in markdown.`;

    return await this.sendRequest(prompt, 'plan', {
      repositoryName: repoData.name,
      fileStructure: repoData.fileStructure,
      primaryLanguage: repoData.metadata.language
    });
  }

  /**
   * Explain code with Bob (Ask mode)
   */
  async explainCode(code, fileContext) {
    const prompt = `Explain this code clearly and concisely:

File: ${fileContext.filePath}
Language: ${fileContext.language}

\`\`\`${fileContext.language}
${code}
\`\`\`

Provide:
1. What does this code do? (high-level purpose)
2. How does it work? (key logic)
3. Important patterns or best practices used
4. Any potential issues or improvements

Keep explanations clear and beginner-friendly.`;

    return await this.sendRequest(prompt, 'ask', {
      filePath: fileContext.filePath,
      language: fileContext.language,
      repositoryName: fileContext.repositoryName
    });
  }

  /**
   * Generate documentation with Bob (Code mode)
   */
  async generateDocumentation(code, fileContext) {
    const prompt = `Generate comprehensive documentation for this code:

File: ${fileContext.filePath}
Language: ${fileContext.language}

\`\`\`${fileContext.language}
${code}
\`\`\`

Generate:
1. Function/class descriptions
2. Parameters and return values
3. Usage examples
4. Important notes or warnings

Format as ${this.getDocFormat(fileContext.language)} comments appropriate for ${fileContext.language}.`;

    return await this.sendRequest(prompt, 'code', {
      filePath: fileContext.filePath,
      language: fileContext.language,
      action: 'document'
    });
  }

  /**
   * Generate tests with Bob (Code mode)
   */
  async generateTests(code, fileContext) {
    const testFramework = fileContext.testFramework || this.getDefaultTestFramework(fileContext.language);
    
    const prompt = `Generate comprehensive unit tests for this code:

File: ${fileContext.filePath}
Language: ${fileContext.language}
Test Framework: ${testFramework}

\`\`\`${fileContext.language}
${code}
\`\`\`

Generate:
1. Test cases for normal scenarios
2. Edge cases
3. Error handling tests
4. Mock data if needed

Provide complete, runnable test code using ${testFramework}.`;

    return await this.sendRequest(prompt, 'code', {
      filePath: fileContext.filePath,
      language: fileContext.language,
      testFramework: testFramework,
      action: 'test'
    });
  }

  /**
   * Refactor code with Bob (Code mode)
   */
  async refactorCode(code, fileContext, goals = []) {
    const goalsText = goals.length > 0 
      ? goals.map(g => `- ${g}`).join('\n')
      : '- Improve readability\n- Improve performance\n- Improve maintainability';

    const prompt = `Refactor this code to improve:
${goalsText}

File: ${fileContext.filePath}
Language: ${fileContext.language}

Current code:
\`\`\`${fileContext.language}
${code}
\`\`\`

Provide:
1. Refactored code
2. Explanation of changes made
3. Benefits of the refactoring
4. Any trade-offs or considerations`;

    return await this.sendRequest(prompt, 'code', {
      filePath: fileContext.filePath,
      language: fileContext.language,
      action: 'refactor',
      goals
    });
  }

  /**
   * Chat with Bob (Ask mode by default, can switch)
   */
  async chat(message, chatContext) {
    const contextPrompt = this.buildChatContext(chatContext);
    
    const prompt = `${contextPrompt}

User: ${message}

Bob:`;

    return await this.sendRequest(prompt, chatContext.mode || 'ask', {
      repositoryName: chatContext.repositoryName,
      conversationHistory: chatContext.history,
      currentFile: chatContext.currentFile
    });
  }

  /**
   * Build context for chat conversations
   */
  buildChatContext(chatContext) {
    let context = `You are IBM Bob, an AI SDLC partner helping with software development.\n\n`;
    context += `Repository: ${chatContext.repositoryName}\n`;
    
    if (chatContext.language) {
      context += `Primary Language: ${chatContext.language}\n`;
    }
    
    if (chatContext.currentFile) {
      context += `Current File: ${chatContext.currentFile}\n`;
    }
    
    if (chatContext.history && chatContext.history.length > 0) {
      context += '\nRecent Conversation:\n';
      chatContext.history.slice(-5).forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Bob';
        context += `${role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
      });
    }
    
    return context;
  }

  /**
   * Get documentation format for language
   */
  getDocFormat(language) {
    const formats = {
      javascript: 'JSDoc',
      typescript: 'TSDoc',
      python: 'docstring',
      java: 'Javadoc',
      go: 'GoDoc',
      ruby: 'RDoc',
      php: 'PHPDoc',
      csharp: 'XML documentation',
      cpp: 'Doxygen'
    };

    return formats[language.toLowerCase()] || 'inline';
  }

  /**
   * Get default test framework for language
   */
  getDefaultTestFramework(language) {
    const frameworks = {
      javascript: 'Jest',
      typescript: 'Jest',
      python: 'pytest',
      java: 'JUnit',
      go: 'testing',
      ruby: 'RSpec',
      php: 'PHPUnit',
      csharp: 'NUnit',
      cpp: 'Google Test'
    };

    return frameworks[language.toLowerCase()] || 'standard testing library';
  }

  /**
   * Generate README with Bob (Code mode)
   */
  async generateReadme(repoData) {
    const prompt = `Generate a comprehensive README.md file for this repository:

Repository: ${repoData.name}
Language: ${repoData.metadata.language}
Framework: ${repoData.metadata.framework}

File Structure:
${JSON.stringify(repoData.fileStructure, null, 2)}

Include:
1. Project title and description
2. Features
3. Installation instructions
4. Usage examples
5. Project structure
6. Contributing guidelines
7. License information

Format in markdown.`;

    return await this.sendRequest(prompt, 'code', {
      repositoryName: repoData.name,
      action: 'readme'
    });
  }
}

module.exports = new BobService();

// Made with Bob
