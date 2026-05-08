// Content script - injects the comment bubble into pages

let commentBubble = null;
let hideTimeout = null;
let chatWidget = null;
let chatOpen = false;
let chatHistory = [];

// Initialize persistent chat widget on page load
initializeChatWidget();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showComment') {
    generateAndShowComment(request.context);
  }
});

function initializeChatWidget() {
  // Don't initialize multiple times
  if (chatWidget) return;
  
  // Create persistent chat widget
  chatWidget = document.createElement('div');
  chatWidget.className = 'paa-chat-widget';
  chatWidget.innerHTML = `
    <div class="paa-chat-toggle" id="paaChatToggle">
      <span class="paa-chat-emoji">🤨</span>
    </div>
    <div class="paa-chat-panel" id="paaChatPanel">
      <div class="paa-chat-header">
        <span class="paa-chat-title">💬 Ask Me Anything</span>
        <button class="paa-chat-close" id="paaChatClose">×</button>
      </div>
      <div class="paa-chat-messages" id="paaChatMessages">
        <div class="paa-chat-message paa-assistant-message">
          Hey. I'm watching your browsing. Want me to roast you about something specific? Or just chat?
        </div>
      </div>
      <div class="paa-chat-input-container">
        <input type="text" class="paa-chat-input" id="paaChatInput" placeholder="Ask me to roast something...">
        <button class="paa-chat-send" id="paaChatSend">Send</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(chatWidget);
  
  // Setup event listeners
  setupChatListeners();
}

function setupChatListeners() {
  const toggle = document.getElementById('paaChatToggle');
  const panel = document.getElementById('paaChatPanel');
  const closeBtn = document.getElementById('paaChatClose');
  const sendBtn = document.getElementById('paaChatSend');
  const input = document.getElementById('paaChatInput');
  
  // Toggle chat panel
  toggle.addEventListener('click', () => {
    chatOpen = !chatOpen;
    if (chatOpen) {
      panel.classList.add('paa-chat-panel-open');
      input.focus();
    } else {
      panel.classList.remove('paa-chat-panel-open');
    }
  });
  
  // Close button
  closeBtn.addEventListener('click', () => {
    chatOpen = false;
    panel.classList.remove('paa-chat-panel-open');
  });
  
  // Send message
  sendBtn.addEventListener('click', () => sendChatMessage());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
}

async function sendChatMessage() {
  const input = document.getElementById('paaChatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message to chat
  addMessageToChat(message, 'user');
  input.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Get settings for personality
  const { settings } = await chrome.storage.local.get('settings');
  const personality = settings?.personality || 'brutally_honest';
  
  // Request stats for context
  chrome.runtime.sendMessage({ action: 'getStats' }, (data) => {
    // Generate AI response
    generateChatResponse(message, personality, data);
  });
}

function addMessageToChat(message, sender) {
  const messagesContainer = document.getElementById('paaChatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `paa-chat-message paa-${sender}-message`;
  messageDiv.textContent = message;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  chatHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content: message });
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('paaChatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'paa-chat-message paa-assistant-message paa-typing';
  typingDiv.id = 'paaTyping';
  typingDiv.innerHTML = '<span class="paa-typing-dot"></span><span class="paa-typing-dot"></span><span class="paa-typing-dot"></span>';
  
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById('paaTyping');
  if (typing) typing.remove();
}

async function generateChatResponse(userMessage, personality, stats) {
  // Try to get AI response first, fallback to scripted
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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', // ← ADD YOUR KEY HERE
        'HTTP-Referer': 'https://github.com/yourusername/passive-aggressive-assistant',
        'X-Title': 'Passive-Aggressive Assistant'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet:beta',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `You are a ${personality.replace('_', ' ')} AI assistant that judges people's browsing habits. 

User's browsing stats:
- Tab switches today: ${stats?.dailyStats?.tabSwitches || 'unknown'}
- Sites visited: ${JSON.stringify(stats?.dailyStats?.sitesVisited || {})}

User message: "${userMessage}"

Respond in character (max 2 sentences). Be witty and judgmental but not mean. Reference their browsing stats if relevant.`
          }
        ]
      })
    });
    
    const data = await response.json();
    
    // Debug log
    console.log('OpenRouter Chat Response:', data);
    
    removeTypingIndicator();
    
    // Check if we got a valid response
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      addMessageToChat(data.choices[0].message.content, 'assistant');
    } else if (data.error) {
      console.error('OpenRouter API Error:', data.error);
      const fallbackResponse = getScriptedChatResponse(userMessage, personality, stats);
      addMessageToChat(fallbackResponse, 'assistant');
    } else {
      console.error('Unexpected response format:', data);
      const fallbackResponse = getScriptedChatResponse(userMessage, personality, stats);
      addMessageToChat(fallbackResponse, 'assistant');
    }
    
  } catch (error) {
    console.error('Chat API Error:', error);
    // Fallback to scripted responses
    removeTypingIndicator();
    const fallbackResponse = getScriptedChatResponse(userMessage, personality, stats);
    addMessageToChat(fallbackResponse, 'assistant');
  }
}

function getScriptedChatResponse(userMessage, personality, stats) {
  const msg = userMessage.toLowerCase();
  const tabSwitches = stats?.dailyStats?.tabSwitches || 0;
  
  // Detect what they're asking about
  if (msg.includes('roast') || msg.includes('judge') || msg.includes('comment')) {
    const responses = {
      brutally_honest: [
        `With ${tabSwitches} tab switches today? Oh, I have plenty of material.`,
        "You want a roast? Just look at your browser history. It roasts itself.",
        "I've been watching. Trust me, the roast writes itself."
      ],
      disappointed_parent: [
        `I've been keeping track of your ${tabSwitches} tab switches. We need to talk.`,
        "I don't want to roast you, I want you to succeed. But... we both know what you've been up to.",
        "Roasting implies I'm angry. I'm not angry. I'm just... disappointed."
      ],
      corporate_hr: [
        "Based on your browsing metrics, I have some constructive feedback to share.",
        `Your tab switching velocity is ${tabSwitches} today. Let's circle back on optimization strategies.`,
        "I'd like to schedule a sync to discuss your digital productivity KPIs."
      ],
      documentary: [
        `And here, the human requests judgment. Having observed ${tabSwitches} tab switches, the material is... abundant.`,
        "The subject asks to be roasted. In nature, the prey rarely requests the hunt.",
        "Fascinating. The human seeks critique. The data suggests they already know the answer."
      ]
    };
    
    const personalityResponses = responses[personality] || responses.brutally_honest;
    return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
  }
  
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
    return personality === 'documentary' 
      ? "And so, the human initiates contact. The dance begins."
      : "Hey. Still procrastinating I see.";
  }
  
  if (msg.includes('help') || msg.includes('what can you do')) {
    return "I watch your browsing and judge you. That's it. That's the whole thing. Want me to roast something specific?";
  }
  
  if (msg.includes('stats') || msg.includes('how many')) {
    return `You've switched tabs ${tabSwitches} times today. Make of that what you will.`;
  }
  
  // Default responses by personality
  const defaults = {
    brutally_honest: [
      "Interesting question. Wrong person to ask though.",
      "I'm here to judge, not to help. But go on.",
      "Bold of you to ask me that."
    ],
    disappointed_parent: [
      "I'm not sure what you want me to say to that.",
      "You know what you should be doing instead of asking me questions?",
      "I believe in you. But this? This isn't it."
    ],
    corporate_hr: [
      "Let me table that and circle back with strategic insights.",
      "I'll need to sync with stakeholders on that query.",
      "That's not in my current scope of deliverables."
    ],
    documentary: [
      "The human speaks. The assistant observes. Meaning remains elusive.",
      "An interesting query. In the wild, such questions rarely find answers.",
      "And now, the subject seeks wisdom from their digital observer. Bold."
    ]
  };
  
  const defaultResponses = defaults[personality] || defaults.brutally_honest;
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

async function generateAndShowComment(context) {
  // Check if extension is enabled
  const { settings } = await chrome.storage.local.get('settings');
  if (!settings || !settings.enabled) return;
  
  // Request AI-generated comment from background script
  chrome.runtime.sendMessage({
    action: 'generateComment',
    context: { ...context, personality: settings.personality }
  }, (response) => {
    if (response && response.comment) {
      showCommentBubble(response.comment, settings.colorTheme || 'purple');
    }
  });
}

function showCommentBubble(comment, colorTheme = 'purple') {
  // Remove existing bubble if any
  if (commentBubble) {
    commentBubble.remove();
  }
  
  // Clear existing timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
  
  // Create bubble element
  commentBubble = document.createElement('div');
  commentBubble.className = 'paa-bubble';
  commentBubble.setAttribute('data-theme', colorTheme);
  commentBubble.innerHTML = `
    <div class="paa-bubble-content">
      <div class="paa-bubble-icon">🤨</div>
      <div class="paa-bubble-text">${escapeHtml(comment)}</div>
      <button class="paa-bubble-close">×</button>
    </div>
  `;
  
  document.body.appendChild(commentBubble);
  
  // Add close button listener
  const closeBtn = commentBubble.querySelector('.paa-bubble-close');
  closeBtn.addEventListener('click', () => {
    commentBubble.classList.add('paa-bubble-hiding');
    setTimeout(() => {
      if (commentBubble) commentBubble.remove();
    }, 300);
  });
  
  // Animate in
  setTimeout(() => {
    commentBubble.classList.add('paa-bubble-visible');
  }, 100);
  
  // Auto-hide after 8 seconds
  hideTimeout = setTimeout(() => {
    if (commentBubble) {
      commentBubble.classList.add('paa-bubble-hiding');
      setTimeout(() => {
        if (commentBubble) commentBubble.remove();
      }, 300);
    }
  }, 8000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add some randomness to prevent comment fatigue
// Only show comments 30% of the time when triggered
const originalListener = chrome.runtime.onMessage.addListener;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showComment' && Math.random() > 0.7) {
    return; // Skip this comment
  }
});
