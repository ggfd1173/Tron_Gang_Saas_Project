// Popup script - handles settings and stats display

document.addEventListener('DOMContentLoaded', async () => {
  loadStats();
  loadSettings();
  setupEventListeners();
});

async function loadStats() {
  const { dailyStats } = await chrome.storage.local.get('dailyStats');
  
  if (dailyStats) {
    // Update tab switches
    document.getElementById('tabSwitches').textContent = dailyStats.tabSwitches || 0;
    
    // Find most visited category
    const categories = dailyStats.sitesVisited || {};
    const topCategory = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory) {
      const categoryNames = {
        social_media: 'Social Media 📱',
        shopping: 'Shopping 🛍️',
        real_estate: 'Real Estate 🏠',
        professional: 'LinkedIn 💼',
        email: 'Email 📧',
        entertainment: 'Entertainment 🎬',
        coding: 'Coding 💻',
        other: 'Other'
      };
      
      document.getElementById('topCategory').textContent = 
        categoryNames[topCategory[0]] || topCategory[0];
    }
  }
}

async function loadSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  
  if (settings) {
    document.getElementById('personality').value = settings.personality || 'brutally_honest';
    document.getElementById('colorTheme').value = settings.colorTheme || 'purple';
    
    const toggle = document.querySelector('.toggle-switch');
    if (settings.enabled) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }
}

function setupEventListeners() {
  // Personality selector
  document.getElementById('personality').addEventListener('change', async (e) => {
    const { settings } = await chrome.storage.local.get('settings');
    settings.personality = e.target.value;
    await chrome.storage.local.set({ settings });
  });
  
  // Color theme selector
  document.getElementById('colorTheme').addEventListener('change', async (e) => {
    const { settings } = await chrome.storage.local.get('settings');
    settings.colorTheme = e.target.value;
    await chrome.storage.local.set({ settings });
  });
  
  // Enable/disable toggle
  document.getElementById('enableToggle').addEventListener('click', async () => {
    const toggle = document.querySelector('.toggle-switch');
    const { settings } = await chrome.storage.local.get('settings');
    
    settings.enabled = !settings.enabled;
    await chrome.storage.local.set({ settings });
    
    if (settings.enabled) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  });
  
  // Weekly report button
  document.getElementById('weeklyReport').addEventListener('click', async () => {
    const btn = document.getElementById('weeklyReport');
    btn.textContent = '⏳ Generating your roast...';
    btn.disabled = true;
    
    // Get all data
    const { dailyStats, behaviorLog } = await chrome.storage.local.get(['dailyStats', 'behaviorLog']);
    
    // Generate report (for now, just open a new tab with summary)
    // In production, this would call Claude API to generate a full report
    setTimeout(() => {
      alert(`🎯 Your Weekly Roast Report\n\n` +
            `Tab Switches: ${dailyStats.tabSwitches}\n` +
            `Most Visited: ${JSON.stringify(dailyStats.sitesVisited)}\n\n` +
            `The AI is judging you... heavily. 🤨`);
      
      btn.textContent = '📊 Generate Weekly Roast Report';
      btn.disabled = false;
    }, 1500);
  });
}

// Refresh stats every 2 seconds while popup is open
setInterval(loadStats, 2000);
