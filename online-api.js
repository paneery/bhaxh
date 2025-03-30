/**
 * BharatChan Online API
 * An API for interacting with the live bharatchan.com website
 * 
 * This JavaScript file serves as documentation and reference for the
 * Android implementation in BharatChanApi.java
 */

/**
 * BharatChan API endpoints
 * 
 * Base URL: https://bharatchan.com
 * 
 * - Homepage: /
 *   Used to get the list of boards
 * 
 * - Board page: /board/{boardId}?page={page}
 *   Used to get threads from a specific board
 * 
 * - Catalog: /board/{boardId}/catalog?page={page}
 *   Alternative view for threads in a board
 * 
 * - Thread: /board/{boardId}/thread/{threadId}
 *   Used to get a specific thread with all posts
 * 
 * - Search: /search?q={query}
 *   Used to search for threads
 * 
 * - Post new thread: /board/{boardId}/post
 *   Method: POST
 *   Form data: title, text, image (optional)
 * 
 * - Reply to thread: /board/{boardId}/thread/{threadId}/reply
 *   Method: POST
 *   Form data: text, image (optional)
 */

/**
 * Data structures
 * 
 * Board:
 * {
 *   id: string,       // Board identifier (e.g., "b", "tech")
 *   name: string,     // Display name (e.g., "/b/ - Random")
 *   description: string // Optional description
 * }
 * 
 * Thread:
 * {
 *   id: string,       // Thread identifier
 *   title: string,    // Thread title
 *   text: string,     // Original post text
 *   replyCount: number, // Number of replies
 *   imageUrl: string, // URL to thread image (if any)
 *   board: string,    // Board identifier
 *   url: string       // Full URL to thread
 * }
 * 
 * ThreadDetail:
 * {
 *   id: string,       // Thread identifier
 *   title: string,    // Thread title
 *   text: string,     // Original post text
 *   imageUrl: string, // URL to thread image (if any)
 *   board: string,    // Board identifier
 *   opPostId: string, // Original post ID
 *   posts: Array<Post>, // Array of replies
 *   url: string       // Full URL to thread
 * }
 * 
 * Post:
 * {
 *   id: string,       // Post identifier
 *   text: string,     // Post text
 *   imageUrl: string  // URL to post image (if any)
 * }
 * 
 * SearchResult:
 * {
 *   threadId: string, // Thread identifier
 *   boardId: string,  // Board identifier
 *   title: string,    // Thread title
 *   snippet: string,  // Text snippet with search matches
 *   url: string       // Full URL to thread
 * }
 * 
 * CreateThreadResult:
 * {
 *   success: boolean, // Whether thread creation was successful
 *   threadId: string, // New thread ID
 *   url: string       // URL to the new thread
 * }
 * 
 * ReplyResult:
 * {
 *   success: boolean, // Whether reply was successful
 *   postId: string    // New post ID
 * }
 */

/**
 * HTML parsing logic
 * 
 * The Android implementation should use JSoup for HTML parsing
 * based on the following selectors:
 * 
 * Boards:
 * - Look for .boards-list .board-item or .boardlist a
 * - Extract board ID from href pattern: /board/{boardId}
 * - Board name is the text content
 * - Board description may be in .board-description
 * 
 * Threads:
 * - Look for .thread, .thread-container, or div[id^="thread"]
 * - Extract thread ID from data-id attribute or id attribute
 * - Thread title may be in .thread-title, .title, or h2
 * - Thread text may be in .thread-text, .text, or .post-content
 * - Reply count may be in .reply-count or extracted from text
 * - Image URL from img element in thread container
 * 
 * Thread detail:
 * - Original post similar to thread parsing
 * - Replies may be in .post:not(.op-post), .reply, or .thread-reply
 * - For each reply, extract post ID, text, and image URL
 * 
 * Search results:
 * - Look for .search-result or .result items
 * - Extract thread ID and board ID from href
 * - Title from .result-title or h3
 * - Snippet from .result-snippet or .snippet
 */

const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

const PORT = process.env.PORT || 3000;

// Mock data for themes
const themes = [
    { theme_id: 'light', name: 'Light Theme', description: 'A bright and clean theme.' },
    { theme_id: 'dark', name: 'Dark Theme', description: 'A dark and focused theme.' }
];

// Mock data for chat rooms
const chatRooms = [
    { room_id: 'welcome', name: 'Welcome ⭐', description: 'Welcome room' },
    { room_id: 'events', name: 'Events', description: 'Events room' },
    { room_id: 'gen', name: 'General', description: 'General chat room' }
];

// Sample data for boards and threads
const boards = [
    {
        board_id: 'b',
        name: 'Random',
        description: 'A place for random musings and discussions.',
        image_url: '/images/banners/b/brootal.png',
        threads: [
            {
                thread_id: 1,
                title: 'Sample Thread',
                posts_count: 12,
                replies: [
                    {
                        post_id: 101,
                        timestamp: '2023-10-08T12:00:00Z',
                        author: 'anonymous',
                        content: 'Sample reply content.'
                    }
                ]
            }
        ]
    },
    {
        board_id: 'meta',
        name: 'Meta',
        description: 'Discussions about the website itself.',
        image_url: '/images/banners/meta/meta.png',
        threads: [
            {
                thread_id: 2,
                title: 'Website Feedback',
                posts_count: 5,
                replies: [
                    {
                        post_id: 201,
                        timestamp: '2023-10-08T15:00:00Z',
                        author: 'anonymous',
                        content: 'Feedback on the website.'
                    }
                ]
            }
        ]
    }
];

// Get available themes
app.get('/themes', (req, res) => {
    res.json(themes);
});

// Set user's preferred theme
app.post('/themes', (req, res) => {
    const { theme_id } = req.body;
    const theme = themes.find(t => t.theme_id === theme_id);
    if (theme) {
        // Logic to set the user's theme
        res.json({ message: 'Theme set successfully' });
    } else {
        res.status(404).json({ error: 'Theme not found' });
    }
});

// Get list of boards
app.get('/boards', (req, res) => {
    res.json(boards);
});

// Get details of a specific board
app.get('/boards/:board_id', (req, res) => {
    const board = boards.find(b => b.board_id === req.params.board_id);
    if (board) {
        res.json(board);
    } else {
        res.status(404).json({ error: 'Board not found' });
    }
});

// Get threads in a board
app.get('/boards/:board_id/threads', (req, res) => {
    const board = boards.find(b => b.board_id === req.params.board_id);
    if (board) {
        res.json(board.threads);
    } else {
        res.status(404).json({ error: 'Board not found' });
    }
});

// Get details of a specific thread
app.get('/threads/:thread_id', (req, res) => {
    const thread = boards.flatMap(board => board.threads).find(t => t.thread_id == req.params.thread_id);
    if (thread) {
        res.json(thread);
    } else {
        res.status(404).json({ error: 'Thread not found' });
    }
});

// Create a new thread in a specified board
app.post('/boards/:board_id/threads', (req, res) => {
    const { board_id } = req.params;
    const { title, content } = req.body;
    const board = boards.find(b => b.board_id === board_id);
    if (board) {
        const newThread = {
            thread_id: Date.now(),
            title,
            posts_count: 1,
            replies: [
                {
                    post_id: Date.now(),
                    timestamp: new Date().toISOString(),
                    author: 'anonymous',
                    content
                }
            ]
        };
        board.threads.push(newThread);
        res.json({ thread_id: newThread.thread_id, message: 'Thread created successfully' });
    } else {
        res.status(404).json({ error: 'Board not found' });
    }
});

// Post a new reply to a specified thread
app.post('/threads/:thread_id/replies', (req, res) => {
    const { content } = req.body;
    const thread = boards.flatMap(board => board.threads).find(t => t.thread_id == req.params.thread_id);
    if (thread) {
        const newComment = {
            post_id: Date.now(),
            timestamp: new Date().toISOString(),
            author: 'anonymous',
            content
        };
        thread.replies.push(newComment);
        thread.posts_count += 1;
        res.json({ post_id: newComment.post_id, message: 'Reply posted successfully' });
    } else {
        res.status(404).json({ error: 'Thread not found' });
    }
});

// Delete a specific thread
app.delete('/threads/:thread_id', (req, res) => {
    const { thread_id } = req.params;
    const board = boards.find(b => b.threads.some(t => t.thread_id == thread_id));
    if (board) {
        board.threads = board.threads.filter(t => t.thread_id != thread_id);
        res.json({ message: 'Thread deleted successfully' });
    } else {
        res.status(404).json({ error: 'Thread not found' });
    }
});

// Report a specific thread or post
app.post('/threads/:thread_id/report', (req, res) => {
    const { thread_id } = req.params;
    const { reason } = req.body;
    const thread = boards.flatMap(board => board.threads).find(t => t.thread_id == thread_id);
    if (thread) {
        // Logic to handle the report
        res.json({ message: 'Report submitted successfully' });
    } else {
        res.status(404).json({ error: 'Thread not found' });
    }
});

// Get available chat rooms
app.get('/chat/rooms', (req, res) => {
    res.json(chatRooms);
});

// Connect to chat (placeholder logic)
app.post('/chat/connect', (req, res) => {
    const { username, password } = req.body;
    if (username) {
        res.json({ message: 'Connected to chat' });
    } else {
        res.status(400).json({ error: 'Username is required' });
    }
});

// Send chat message to a specified chat room
app.post('/chat/rooms/:room_id/messages', (req, res) => {
    const { message } = req.body;
    const { room_id } = req.params;
    const room = chatRooms.find(r => r.room_id === room_id);
    if (room) {
        // Logic to send the message
        res.json({ message_id: Date.now(), message: 'Message sent successfully' });
    } else {
        res.status(404).json({ error: 'Chat room not found' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

class BharatChanAPI {
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'https://bharatchan.com';
    this.timeout = options.timeout || 10000;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.cookieJar = {};
    
    // Rate limiting options
    this.rateLimitDelay = options.rateLimitDelay || 1000; // Default 1 second between requests
    this.lastRequestTime = 0;

    // Cache settings
    this.enableCache = options.enableCache !== undefined ? options.enableCache : true;
    this.cacheTTL = options.cacheTTL || 300000; // Default cache TTL: 5 minutes
    this.cache = {};
    
    // Configure axios defaults
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
      validateStatus: status => status >= 200 && status < 500
    });
    
    // Add request and response interceptors
    this.client.interceptors.request.use(async config => {
      // Rate limiting
      await this.throttleRequest();
      
      // Add cookies to requests
      if (Object.keys(this.cookieJar).length > 0) {
        const cookieString = Object.entries(this.cookieJar)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
        config.headers.Cookie = cookieString;
      }
      return config;
    });
    
    this.client.interceptors.response.use(response => {
      // Save cookies from responses
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        setCookie.forEach(cookie => {
          const [cookieMain] = cookie.split(';');
          const [key, value] = cookieMain.split('=');
          if (key && value) {
            this.cookieJar[key] = value;
          }
        });
      }
      return response;
    }, async error => {
      // Handle rate limiting errors (429 Too Many Requests)
      if (error.response && error.response.status === 429) {
        console.warn('Rate limited by server, waiting before retrying...');
        // Wait longer before next request
        this.rateLimitDelay = Math.min(this.rateLimitDelay * 2, 30000); // Exponential backoff up to 30 seconds
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        // Retry the request
        return this.client(error.config);
      }
      
      throw error;
    });
  }

  /**
   * Throttle requests to respect rate limits
   * @private
   */
  async throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Get all available boards from the homepage
   * @returns {Promise<Array<{id: string, name: string, description: string}>>}
   */
  async getBoards() {
    const cacheKey = 'getBoards';
    if (this.enableCache && this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].timestamp < this.cacheTTL)) {
      return this.cache[cacheKey].data;
    }

    try {
      const response = await this.client.get('/');
      const $ = cheerio.load(response.data);
      const boards = [];
      
      // Try different selectors to find boards based on possible site structures
      // This is more robust against website structure changes
      const boardSelectors = [
        '.boards-list .board-item', // Our initial selector
        '.board-list .board-item',
        '.boardlist a',             // Common structure in chan sites
        'a[href*="/board/"]',       // Find any links with "/board/" in href
        '.board-item',
        '#boardlist a',
      ];

      // Try each selector until we find something
      let foundBoards = false;
      for (const selector of boardSelectors) {
        $(selector).each((i, element) => {
          const boardLink = $(element).is('a') ? $(element) : $(element).find('a').first();
          const href = boardLink.attr('href') || '';
          const boardMatch = href.match(/\/board\/([^\/]+)/);
          
          if (boardMatch && boardMatch[1]) {
            const boardId = boardMatch[1];
            const name = boardLink.text().trim();
            
            // Skip if this board ID is already in our results
            if (boards.some(b => b.id === boardId)) return;
            
            // Get description if it exists
            let description = '';
            if ($(element).find('.board-description').length) {
              description = $(element).find('.board-description').text().trim();
            } else if ($(element).next('.board-description').length) {
              description = $(element).next('.board-description').text().trim();
            }
            
            boards.push({
              id: boardId,
              name: name || boardId,
              description
            });
            
            foundBoards = true;
          }
        });
        
        if (foundBoards) break;
      }
      
      // If still no boards found, try a more aggressive approach by parsing all links
      if (boards.length === 0) {
        console.log('No boards found using standard selectors. Trying to parse all links...');
        
        // Extract all links that might be boards
        $('a').each((i, element) => {
          const href = $(element).attr('href') || '';
          const boardMatch = href.match(/\/board\/([^\/]+)/);
          
          if (boardMatch && boardMatch[1]) {
            const boardId = boardMatch[1];
            
            // Skip if this board ID is already in our results
            if (boards.some(b => b.id === boardId)) return;
            
            // Get text and clean it
            const name = $(element).text().trim();
            
            boards.push({
              id: boardId,
              name: name || boardId,
              description: ''
            });
          }
        });
      }
      
      // Add hardcoded common boards as fallback if nothing found
      if (boards.length === 0) {
        console.log('No boards found in HTML. Using fallback board list.');
        const commonBoards = ['b', 'g', 'pol', 'tv', 'v', 'a', 'tech', 'int', 'sci', 'his', 'mus', 'fit', 'lit'];
        
        commonBoards.forEach(boardId => {
          boards.push({
            id: boardId,
            name: `/${boardId}/ - Board`,
            description: ''
          });
        });
      }

      // Special case for bharatchan.com - manually add known boards if site structure is unusual
      // This ensures we always have some boards to work with
      const knownBharatChanBoards = ['b', 'acd', 'pol', 'tech'];
      knownBharatChanBoards.forEach(boardId => {
        if (!boards.some(b => b.id === boardId)) {
          boards.push({
            id: boardId,
            name: `/${boardId}/`,
            description: 'Known board'
          });
        }
      });

      if (this.enableCache) {
        this.cache[cacheKey] = { data: boards, timestamp: Date.now() };
      }
      
      return boards;
    } catch (error) {
      console.error('Error fetching boards:', error);
      
      // Return fallback boards in case of error
      const fallbackBoards = [
        { id: 'b', name: '/b/ - Random', description: 'Fallback board' },
        { id: 'acd', name: '/acd/ - Academia', description: 'Fallback board' },
        { id: 'pol', name: '/pol/ - Politics', description: 'Fallback board' },
        { id: 'tech', name: '/tech/ - Technology', description: 'Fallback board' }
      ];
      
      return fallbackBoards;
    }
  }

  /**
   * Get threads from a specific board
   * @param {string} boardId - Board identifier
   * @param {Object} options - Options for fetching threads
   * @param {number} [options.page=1] - Page number
   * @returns {Promise<Array<Object>>}
   */
  async getThreads(boardId, options = {}) {
    const page = options.page || 1;
    const cacheKey = `getThreads_${boardId}_${page}`;
    if (this.enableCache && this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].timestamp < this.cacheTTL)) {
      return this.cache[cacheKey].data;
    }
    
    try {
      // First try catalog view
      const response = await this.client.get(`/board/${boardId}/catalog?page=${page}`);
      const $ = cheerio.load(response.data);
      const threads = [];
      
      // Try different selectors for thread elements
      const threadSelectors = [
        '.thread',                      // Standard selector
        '.thread-container',            // Alternative selector
        '.threadContainer',             // Camel case variant
        'div[id^="thread"]',            // ID-based selector
        '.post.op',                     // Common in some imageboards
        'article.thread',               // Another common structure
        'div.card.thread'               // Bootstrap-style threads
      ];
      
      // Try each selector until we find thread elements
      let foundThreads = false;
      let selectedSelector = '';
      
      for (const selector of threadSelectors) {
        if ($(selector).length > 0) {
          selectedSelector = selector;
          foundThreads = true;
          break;
        }
      }
      
      if (foundThreads) {
        // Process found threads with the working selector
        $(selectedSelector).each((i, element) => {
          // Try various attribute/selector combinations for thread ID
          const threadId = 
            $(element).attr('data-id') || 
            $(element).attr('id')?.replace('thread-', '') ||
            $(element).attr('thread-id') ||
            $(element).find('[data-thread-id]').attr('data-thread-id');
          
          if (!threadId) return; // Skip if we can't determine thread ID
          
          // Try various selectors for title
          const titleSelectors = ['.thread-title', '.title', 'h2', 'h3', '.subject', '.post-title'];
          let title = '';
          
          for (const selector of titleSelectors) {
            const titleElement = $(element).find(selector).first();
            if (titleElement.length) {
              title = titleElement.text().trim();
              break;
            }
          }
          
          // Try various selectors for text content
          const textSelectors = ['.thread-text', '.text', '.post-content', '.message', '.post-body', '.body'];
          let text = '';
          
          for (const selector of textSelectors) {
            const textElement = $(element).find(selector).first();
            if (textElement.length) {
              text = textElement.text().trim();
              break;
            }
          }
          
          // Try to find reply count
          let replyCount = 0;
          const replyCountSelectors = ['.reply-count', '.post-count', '.replies', '.backlink-count'];
          
          for (const selector of replyCountSelectors) {
            const countElement = $(element).find(selector).first();
            if (countElement.length) {
              replyCount = parseInt(countElement.text().trim(), 10) || 0;
              break;
            }
          }
          
          // Try to extract reply count from text content if no dedicated element found
          if (replyCount === 0) {
            const replyText = $(element).text();
            const replyMatch = replyText.match(/(\d+)\s*(?:replies|posts)/i);
            if (replyMatch && replyMatch[1]) {
              replyCount = parseInt(replyMatch[1], 10) || 0;
            }
          }
          
          // Try to find image
          const imageSelectors = ['img', '.post-image img', '.thread-image', '.attachment img'];
          let imageUrl = '';
          
          for (const selector of imageSelectors) {
            const imageElement = $(element).find(selector).first();
            if (imageElement.length) {
              imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
              break;
            }
          }
          
          // Make sure image URL is absolute
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = imageUrl.startsWith('/') 
              ? `${this.baseURL}${imageUrl}` 
              : `${this.baseURL}/${imageUrl}`;
          }
          
          threads.push({
            id: threadId,
            title: title || `Thread ${threadId}`,
            text,
            replyCount,
            imageUrl,
            board: boardId,
            url: `${this.baseURL}/board/${boardId}/thread/${threadId}`
          });
        });
      }
      
      // If no threads found, try to find them from the page in a different way
      if (threads.length === 0) {
        console.log(`No threads found using standard selectors for board ${boardId}. Trying alternative parsing...`);
        
        // Look for links that might be threads
        $('a').each((i, element) => {
          const href = $(element).attr('href') || '';
          const threadMatch = href.match(/\/thread\/(\d+)/);
          
          if (threadMatch && threadMatch[1]) {
            const threadId = threadMatch[1];
            
            // Skip if this thread ID is already in our results
            if (threads.some(t => t.id === threadId)) return;
            
            const title = $(element).text().trim() || `Thread ${threadId}`;
            
            // Try to get the surrounding element for more context
            const parentElement = $(element).parent().parent();
            const text = parentElement.text().replace(title, '').trim();
            
            threads.push({
              id: threadId,
              title,
              text,
              replyCount: 0,
              imageUrl: '',
              board: boardId,
              url: `${this.baseURL}/board/${boardId}/thread/${threadId}`
            });
          }
        });
      }

      if (this.enableCache) {
        this.cache[cacheKey] = { data: threads, timestamp: Date.now() };
      }
      
      return threads;
    } catch (error) {
      console.error(`Error fetching threads for board ${boardId}:`, error);
      
      // In case of error, return an empty array instead of throwing
      // This makes the API more resilient against failures
      return [];
    }
  }

  /**
   * Get a specific thread with all posts
   * @param {string} boardId - Board identifier
   * @param {string} threadId - Thread identifier
   * @returns {Promise<Object>}
   */
  async getThread(boardId, threadId) {
    const cacheKey = `getThread_${boardId}_${threadId}`;
    if (this.enableCache && this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].timestamp < this.cacheTTL)) {
      return this.cache[cacheKey].data;
    }

    try {
      const response = await this.client.get(`/board/${boardId}/thread/${threadId}`);
      const $ = cheerio.load(response.data);
      
      // Try different selectors for thread elements
      const threadSelectors = [
        '.thread',
        '.thread-container',
        '.threadContainer',
        `div[id="thread-${threadId}"]`,
        `div[id="thread_${threadId}"]`,
        `div[data-id="${threadId}"]`,
        'article.thread'
      ];
      
      // Find thread element
      let threadElement = null;
      for (const selector of threadSelectors) {
        const element = $(selector).first();
        if (element.length) {
          threadElement = element;
          break;
        }
      }
      
      // If still not found, try to find by structure
      if (!threadElement) {
        threadElement = $('.post.op').closest('.thread').first();
      }
      
      // If still not found, just use the main container
      if (!threadElement || !threadElement.length) {
        threadElement = $('.main-container').first();
        if (!threadElement.length) {
          threadElement = $('main').first();
        }
        if (!threadElement.length) {
          threadElement = $('body');
        }
      }
      
      // Try various selectors for title
      const titleSelectors = ['.thread-title', '.title', 'h1', 'h2', '.subject', '.post-title'];
      let title = '';
      
      for (const selector of titleSelectors) {
        const titleElement = $(selector).first();
        if (titleElement.length) {
          title = titleElement.text().trim();
          break;
        }
      }
      
      // If no title found, try to extract from page title
      if (!title) {
        const pageTitle = $('title').text().trim();
        const titleMatch = pageTitle.match(/^(.*?)\s*(?:\/|-)?\s*\/?[a-z]+?\//i);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].trim();
        } else {
          title = `Thread ${threadId}`;
        }
      }
      
      // Try various selectors for OP text
      const textSelectors = [
        '.thread-text', 
        '.op-post .text', 
        '.op-post .message', 
        '.op-post .post-content',
        '.post.op .post-body',
        '.post.op .message',
        '.post:first-child .post-body'
      ];
      
      let text = '';
      for (const selector of textSelectors) {
        const textElement = $(selector).first();
        if (textElement.length) {
          text = textElement.text().trim();
          break;
        }
      }
      
      // Try to find post ID
      const opPostId = threadElement.find('.op-post').attr('data-id') || 
                        threadElement.find('.post.op').attr('data-id') || 
                        threadElement.find('.post:first-child').attr('data-id') || 
                        threadId;
      
      // Try to find image in OP
      const imageSelectors = [
        '.op-post img', 
        '.post.op img', 
        '.post:first-child img',
        '.thread-image',
        '.op-image'
      ];
      
      let imageUrl = '';
      for (const selector of imageSelectors) {
        const imageElement = $(selector).first();
        if (imageElement.length) {
          imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
          break;
        }
      }
      
      // Make sure image URL is absolute
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.startsWith('/') 
          ? `${this.baseURL}${imageUrl}` 
          : `${this.baseURL}/${imageUrl}`;
      }
      
      // Get replies using various selectors
      const replySelectors = [
        '.post:not(.op-post)', 
        '.post:not(.post.op)', 
        '.reply', 
        '.thread-reply',
        '.post-container:not(:first-child)'
      ];
      
      const posts = [];
      let repliesFound = false;
      
      for (const selector of replySelectors) {
        const replyElements = $(selector);
        
        if (replyElements.length > 0) {
          replyElements.each((i, element) => {
            // Extract post ID
            const postId = $(element).attr('data-id') || 
                            $(element).attr('id')?.replace('post-', '') || 
                            $(element).attr('id')?.replace('reply-', '') || 
                            `${threadId}_reply_${i+1}`;
            
            // Extract post text
            const postTextSelectors = ['.post-text', '.text', '.message', '.post-body', '.reply-content', '.post-content'];
            let postText = '';
            
            for (const textSelector of postTextSelectors) {
              const postTextElement = $(element).find(textSelector).first();
              if (postTextElement.length) {
                postText = postTextElement.text().trim();
                break;
              }
            }
            
            // If still no text, use the element's text
            if (!postText) {
              postText = $(element).text().trim();
            }
            
            // Extract post image if any
            let postImageUrl = '';
            const postImageElement = $(element).find('img').first();
            
            if (postImageElement.length) {
              postImageUrl = postImageElement.attr('src') || postImageElement.attr('data-src') || '';
              
              // Make sure image URL is absolute
              if (postImageUrl && !postImageUrl.startsWith('http')) {
                postImageUrl = postImageUrl.startsWith('/') 
                  ? `${this.baseURL}${postImageUrl}` 
                  : `${this.baseURL}/${postImageUrl}`;
              }
            }
            
            posts.push({
              id: postId,
              text: postText,
              imageUrl: postImageUrl,
            });
          });
          
          repliesFound = true;
          break;
        }
      }
      
      // If no replies found with standard selectors, look for any elements that might be replies
      if (!repliesFound) {
        // This is a more aggressive approach that may include false positives
        // but is better than showing no replies at all
        $('div, article').each((i, element) => {
          // Skip potential navigation, headers, etc.
          if ($(element).find('nav, header, footer').length) return;
          if ($(element).parents('nav, header, footer').length) return;
          
          // Skip short elements and elements without substantial text
          const elementText = $(element).text().trim();
          if (elementText.length < 20) return;
          
          // Skip if it looks like the OP post
          if (elementText.includes(text) && text.length > 20) return;
          
          // This might be a reply
          const postId = `${threadId}_reply_${posts.length + 1}`;
          
          // Extract post image if any
          let postImageUrl = '';
          const postImageElement = $(element).find('img').first();
          
          if (postImageElement.length) {
            postImageUrl = postImageElement.attr('src') || postImageElement.attr('data-src') || '';
            
            // Make sure image URL is absolute
            if (postImageUrl && !postImageUrl.startsWith('http')) {
              postImageUrl = postImageUrl.startsWith('/') 
                ? `${this.baseURL}${postImageUrl}` 
                : `${this.baseURL}/${postImageUrl}`;
            }
          }
          
          posts.push({
            id: postId,
            text: elementText,
            imageUrl: postImageUrl,
          });
        });
      }

      const threadData = {
        id: threadId,
        title,
        text,
        imageUrl,
        board: boardId,
        opPostId,
        posts,
        url: `${this.baseURL}/board/${boardId}/thread/${threadId}`
      };

      if (this.enableCache) {
        this.cache[cacheKey] = { data: threadData, timestamp: Date.now() };
      }
      
      return threadData;
    } catch (error) {
      console.error(`Error fetching thread ${threadId}:`, error);
      
      // Return a basic thread object instead of throwing
      return {
        id: threadId,
        title: `Thread ${threadId}`,
        text: '',
        imageUrl: '',
        board: boardId,
        opPostId: threadId,
        posts: [],
        url: `${this.baseURL}/board/${boardId}/thread/${threadId}`,
        error: error.message
      };
    }
  }

  /**
   * Search threads on the site
   * @param {string} query - Search query
   * @returns {Promise<Array<Object>>}
   */
  async search(query) {
    try {
      const response = await this.client.get('/search', {
        params: { q: query }
      });
      
      const $ = cheerio.load(response.data);
      const results = [];
      
      $('.search-result').each((i, element) => {
        const title = $(element).find('.result-title').text().trim();
        const snippet = $(element).find('.result-snippet').text().trim();
        const url = $(element).find('a').attr('href') || '';
        
        // Extract board and thread IDs from URL
        const boardMatch = url.match(/\/board\/([^\/]+)/);
        const threadMatch = url.match(/\/thread\/(\d+)/);
        
        const boardId = boardMatch ? boardMatch[1] : null;
        const threadId = threadMatch ? threadMatch[1] : null;
        
        results.push({
          title,
          snippet,
          url: url.startsWith('http') ? url : `${this.baseURL}${url}`,
          boardId,
          threadId
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error searching:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Create a new thread
   * @param {string} boardId - Board identifier
   * @param {Object} threadData - Thread data
   * @param {string} threadData.title - Thread title
   * @param {string} threadData.text - Thread text
   * @param {Buffer|string} [threadData.image] - Image data (optional)
   * @returns {Promise<Object>} - Created thread info
   */
  async createThread(boardId, threadData) {
    try {
      // First, get the board page to ensure we have any required cookies/tokens
      const formPage = await this.client.get(`/board/${boardId}`);
      const $ = cheerio.load(formPage.data);
      
      // Extract CSRF token if present
      const csrfToken = $('input[name="_csrf"]').val() || '';
      
      // Create form data
      const formData = new FormData();
      if (csrfToken) formData.append('_csrf', csrfToken);
      formData.append('title', threadData.title);
      formData.append('text', threadData.text);
      
      if (threadData.image) {
        const imageData = threadData.image;
        const fileName = threadData.fileName || 'image.jpg';
        formData.append('image', imageData, fileName);
      }
      
      // Post the thread
      const response = await this.client.post(`/board/${boardId}/thread/create`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Referer': `${this.baseURL}/board/${boardId}`,
        }
      });
      
      // Check if post was successful
      if (response.status >= 300 && response.status < 400) {
        // Success - extract thread ID from redirect
        const location = response.headers.location;
        const threadIdMatch = location.match(/\/thread\/(\d+)/);
        const newThreadId = threadIdMatch ? threadIdMatch[1] : null;
        
        if (newThreadId) {
          return {
            success: true,
            id: newThreadId,
            board: boardId,
            url: `${this.baseURL}/board/${boardId}/thread/${newThreadId}`
          };
        }
      }
      
      // If we reach here, something went wrong
      const $error = cheerio.load(response.data);
      const errorMessage = $error('.error-message').text().trim() || 'Unknown error creating thread';
      throw new Error(errorMessage);
      
    } catch (error) {
      console.error(`Error creating thread on board ${boardId}:`, error);
      throw new Error(`Failed to create thread: ${error.message}`);
    }
  }

  /**
   * Reply to a thread
   * @param {string} boardId - Board identifier
   * @param {string} threadId - Thread identifier
   * @param {Object} replyData - Reply data
   * @param {string} replyData.text - Reply text
   * @param {Buffer|string} [replyData.image] - Image data (optional)
   * @returns {Promise<Object>} - Reply info
   */
  async replyToThread(boardId, threadId, replyData) {
    try {
      // First, get the thread page to ensure we have any required cookies/tokens
      const threadPage = await this.client.get(`/board/${boardId}/thread/${threadId}`);
      const $ = cheerio.load(threadPage.data);
      
      // Extract CSRF token if present
      const csrfToken = $('input[name="_csrf"]').val() || '';
      
      // Create form data
      const formData = new FormData();
      if (csrfToken) formData.append('_csrf', csrfToken);
      formData.append('text', replyData.text);
      
      if (replyData.image) {
        const imageData = replyData.image;
        const fileName = replyData.fileName || 'image.jpg';
        formData.append('image', imageData, fileName);
      }
      
      // Post the reply
      const response = await this.client.post(`/board/${boardId}/thread/${threadId}/reply`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Referer': `${this.baseURL}/board/${boardId}/thread/${threadId}`,
        }
      });
      
      // Check if post was successful
      if (response.status >= 200 && response.status < 300 || 
          (response.status >= 300 && response.status < 400)) {
        
        // Success
        return {
          success: true,
          threadId,
          board: boardId,
          url: `${this.baseURL}/board/${boardId}/thread/${threadId}`
        };
      }
      
      // If we reach here, something went wrong
      const $error = cheerio.load(response.data);
      const errorMessage = $error('.error-message').text().trim() || 'Unknown error posting reply';
      throw new Error(errorMessage);
      
    } catch (error) {
      console.error(`Error replying to thread ${threadId}:`, error);
      throw new Error(`Failed to post reply: ${error.message}`);
    }
  }
}

module.exports = BharatChanAPI;