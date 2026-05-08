// Background service worker - tracks behavior patterns

let activeTabData = {
  url: '',
  title: '',
  startTime: null,
  tabSwitchCount: 0
};

let behaviorLog = [];
let dailyStats = {
  tabSwitches: 0,
  sitesVisited: {},
  timeByCategory: {},
  lastReset: new Date().toDateString()
};

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabSwitch(tab);
});

// Track URL changes in same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    handleTabSwitch(tab);
  }
});

function handleTabSwitch(tab) {
  if (!tab.url) return;
  
  // Save previous tab time
  if (activeTabData.url && activeTabData.startTime) {
    const timeSpent = Date.now() - activeTabData.startTime;
    logBehavior({
      type: 'time_on_site',
      url: activeTabData.url,
      title: activeTabData.title,
      duration: timeSpent,
      timestamp: Date.now()
    });
  }
  
  // Update active tab
  activeTabData = {
    url: tab.url,
    title: tab.title,
    startTime: Date.now(),
    tabSwitchCount: activeTabData.tabSwitchCount + 1
  };
  
  dailyStats.tabSwitches++;
  
  // Categorize the site
  const category = categorizeSite(tab.url);
  dailyStats.sitesVisited[category] = (dailyStats.sitesVisited[category] || 0) + 1;
  
  // Check if we should trigger a comment
  checkForCommentTrigger(tab);
  
  // Save stats
  chrome.storage.local.set({ dailyStats, behaviorLog });
}

function categorizeSite(url) {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com') || 
      urlLower.includes('facebook.com') || urlLower.includes('instagram.com') ||
      urlLower.includes('tiktok.com') || urlLower.includes('reddit.com')) {
    return 'social_media';
  }
  if (urlLower.includes('youtube.com') || urlLower.includes('netflix.com') ||
      urlLower.includes('twitch.tv')) {
    return 'entertainment';
  }
  if (urlLower.includes('amazon.com') || urlLower.includes('ebay.com') ||
      urlLower.includes('shop') || urlLower.includes('store')) {
    return 'shopping';
  }
  if (urlLower.includes('zillow.com') || urlLower.includes('realtor.com') ||
      urlLower.includes('redfin.com')) {
    return 'real_estate';
  }
  if (urlLower.includes('linkedin.com')) {
    return 'professional';
  }
  if (urlLower.includes('gmail.com') || urlLower.includes('outlook.com') ||
      urlLower.includes('mail.')) {
    return 'email';
  }
  if (urlLower.includes('github.com') || urlLower.includes('stackoverflow.com') ||
      urlLower.includes('dev.to')) {
    return 'coding';
  }
  
  return 'other';
}

function logBehavior(event) {
  behaviorLog.push(event);
  
  // Keep only last 100 events to avoid storage bloat
  if (behaviorLog.length > 100) {
    behaviorLog = behaviorLog.slice(-100);
  }
}

function checkForCommentTrigger(tab) {
  const category = categorizeSite(tab.url);
  const recentBehavior = getRecentBehavior(category);
  
  // Trigger conditions
  const triggers = {
    socialMediaSpam: recentBehavior.socialMedia > 5,
    tabSwitchingAddiction: dailyStats.tabSwitches > 20 && dailyStats.tabSwitches % 10 === 0,
    shoppingWithoutBuying: recentBehavior.shopping > 3,
    realEstateFantasy: recentBehavior.realEstate > 2,
    linkedInPerformance: recentBehavior.professional > 2,
    emailAvoidance: recentBehavior.email > 3
  };
  
  // Send trigger to content script
  if (Object.values(triggers).some(t => t)) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showComment',
      context: {
        category,
        stats: dailyStats,
        recentBehavior,
        triggers,
        currentUrl: tab.url,
        currentTitle: tab.title
      }
    }).catch(() => {
      // Content script might not be ready, that's fine
    });
  }
}

function getRecentBehavior(currentCategory) {
  const recent = behaviorLog.slice(-20); // Last 20 events
  const counts = {
    socialMedia: 0,
    shopping: 0,
    realEstate: 0,
    professional: 0,
    email: 0,
    entertainment: 0
  };
  
  recent.forEach(event => {
    const cat = categorizeSite(event.url || '');
    if (cat === 'social_media') counts.socialMedia++;
    if (cat === 'shopping') counts.shopping++;
    if (cat === 'real_estate') counts.realEstate++;
    if (cat === 'professional') counts.professional++;
    if (cat === 'email') counts.email++;
    if (cat === 'entertainment') counts.entertainment++;
  });
  
  return counts;
}

// Reset daily stats at midnight
chrome.alarms.create('resetDaily', { periodInMinutes: 1440 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'resetDaily') {
    const today = new Date().toDateString();
    if (dailyStats.lastReset !== today) {
      dailyStats = {
        tabSwitches: 0,
        sitesVisited: {},
        timeByCategory: {},
        lastReset: today
      };
      chrome.storage.local.set({ dailyStats });
    }
  }
});

// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    dailyStats,
    behaviorLog: [],
    settings: {
      personality: 'brutally_honest',
      colorTheme: 'purple',
      aggressionLevel: 5,
      enabled: true
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    chrome.storage.local.get(['dailyStats', 'behaviorLog'], (data) => {
      sendResponse(data);
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'generateComment') {
    generateAIComment(request.context).then(comment => {
      sendResponse({ comment });
    });
    return true;
  }
});

async function generateAIComment(context) {
  try {
    // Call OpenRouter API to access Claude
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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', // ← ADD YOUR KEY HERE
        'HTTP-Referer': 'https://github.com/yourusername/passive-aggressive-assistant', // Optional
        'X-Title': 'Passive-Aggressive Assistant' // Optional
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet:beta', // Using Claude via OpenRouter
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `You are a passive-aggressive AI assistant that judges users' browsing habits. Generate a short, witty, slightly judgy comment (max 2 sentences) based on this behavior:

Current site: ${context.currentTitle}
Category: ${context.category}
Tab switches today: ${context.stats.tabSwitches}
Recent behavior: ${JSON.stringify(context.recentBehavior)}

Personality: ${context.personality || 'brutally_honest'}

Be clever, sarcastic, and make them feel slightly called out but in a funny way. Don't be mean, just hilariously observant.`
        }]
      })
    });
    
    const data = await response.json();
    
    // Debug log to see what we got
    console.log('OpenRouter Response:', data);
    
    // Check if we got a valid response
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content;
    } else if (data.error) {
      console.error('OpenRouter API Error:', data.error);
      return getFallbackComment(context);
    } else {
      console.error('Unexpected response format:', data);
      return getFallbackComment(context);
    }
  } catch (error) {
    console.error('Failed to generate comment:', error);
    // Fallback to hardcoded comments
    return getFallbackComment(context);
  }
}

function getFallbackComment(context) {
  const personality = context.personality || 'brutally_honest';
  
  // Comments organized by personality type
  const personalityComments = {
    brutally_honest: {
      social_media: [
        "Back to social media? Shocking.",
        "Just checking if anyone liked your post from 3 minutes ago?",
        "The doomscroll is strong with this one."
      ],
      shopping: [
        "Adding to cart or just window shopping again?",
        "Your 'saved for later' list is basically a graveyard at this point.",
        "Pro tip: The checkout button still works."
      ],
      real_estate: [
        "Ah yes, the daily house hunting for properties you can't afford.",
        "Just browsing... for the 47th time this week.",
        "That's a nice $3M house. Very aspirational."
      ],
      professional: [
        "LinkedIn again? Networking or just pretending to be productive?",
        "Updating your profile won't make the job applications write themselves.",
        "The 'Open to Work' badge is getting lonely."
      ],
      email: [
        "Marking as unread isn't the same as responding, but you knew that.",
        "That's 8 times you've checked email in the last hour. Expecting something?",
        "The emails will still be there in 5 minutes. Promise."
      ],
      entertainment: [
        "Should you be working right now? Just asking.",
        "One more video turned into 45 minutes. Classic.",
        "Entertainment or escapism? You decide."
      ]
    },
    disappointed_parent: {
      social_media: [
        "I'm not angry, just... disappointed you're back here again.",
        "We talked about this. Remember our conversation about screen time?",
        "You had such potential before you opened that app."
      ],
      shopping: [
        "Another shopping site? Is this what we're doing with our time now?",
        "I thought you were saving for something important.",
        "Your mother and I had such high hopes."
      ],
      real_estate: [
        "Looking at houses again instead of working toward one?",
        "Dreaming is fine, but action is better, sweetheart.",
        "You know, when I was your age..."
      ],
      professional: [
        "I'm proud you're on LinkedIn, but maybe actually apply somewhere?",
        "Networking is good, but results are better.",
        "Your potential is unlimited. Are you using it?"
      ],
      email: [
        "Just reply to them. It's not that hard.",
        "Avoiding it won't make it go away, you know.",
        "I raised you better than to ghost people."
      ],
      entertainment: [
        "Another video? What happened to your goals?",
        "I'm not mad. I'm just concerned about your priorities.",
        "Is this really the best use of your time?"
      ]
    },
    corporate_hr: {
      social_media: [
        "Per our last conversation, we discussed limiting social media during work hours.",
        "This behavior is not aligned with our productivity objectives.",
        "I'd like to circle back on your time management strategy."
      ],
      shopping: [
        "Let's touch base about online shopping during company time.",
        "This falls outside our acceptable use policy guidelines.",
        "Moving forward, we should leverage focus more effectively."
      ],
      real_estate: [
        "While we support work-life balance, this seems... aspirational.",
        "Let's table this discussion and focus on deliverables.",
        "I'm sensing some career path misalignment here."
      ],
      professional: [
        "Great to see you leveraging LinkedIn! Synergy!",
        "Your personal brand optimization is showing strong growth.",
        "Let's ideate on how to maximize your networking ROI."
      ],
      email: [
        "We need to establish better communication cadence here.",
        "Your response rate is not meeting our SLA expectations.",
        "Let's sync on your inbox management best practices."
      ],
      entertainment: [
        "This content consumption doesn't ladder up to our Q4 goals.",
        "We value wellness, but let's ensure work-life integration.",
        "Can we pivot this time block toward high-impact activities?"
      ]
    },
    documentary: {
      social_media: [
        "And here we observe the human, returning once again to the digital watering hole.",
        "The cycle continues. Like salmon to spawning grounds, but sadder.",
        "In their natural habitat, the internet user refreshes... endlessly."
      ],
      shopping: [
        "The modern hunter-gatherer adds another item to cart. They will not purchase it.",
        "And so begins the ritual of browsing. It will end, as always, without transaction.",
        "Observe: the species has entered window-shopping mode. No predators, no prey, no point."
      ],
      real_estate: [
        "The subject dreams of dwellings beyond their means. It is... predictable.",
        "Another property viewed. Another dream deferred. Nature is healing.",
        "In the wild, we see the human engaging in aspirational browsing behavior."
      ],
      professional: [
        "The LinkedIn scroll. A mating dance of sorts, but all participants are just watching.",
        "Here, the subject performs 'networking.' Results: pending. Hope: eternal.",
        "The professional observes other professionals. Nothing is accomplished. The circle of life."
      ],
      email: [
        "The inbox remains. The human remains. Neither will move first.",
        "Observe the standoff between human and unread messages. A tale as old as Gmail.",
        "The subject marks email as unread. This is not a strategy. This is avoidance."
      ],
      entertainment: [
        "And now, the subject seeks refuge in digital content. The work remains undone.",
        "Procrastination, in its purest form. Magnificent. Destructive. Very human.",
        "The YouTube algorithm feeds. The human consumes. The tasks pile higher."
      ]
    }
  };
  
  const categoryComments = personalityComments[personality]?.[context.category] || 
                          personalityComments.brutally_honest[context.category] ||
                          ["Interesting choice.", "Bold move."];
  
  return categoryComments[Math.floor(Math.random() * categoryComments.length)];
}
