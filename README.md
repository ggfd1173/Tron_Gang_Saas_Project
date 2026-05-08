# 🤨 Passive-Aggressive Assistant

An AI-powered Chrome extension that judges your browsing habits with wit and sarcasm.

## What It Does

The Passive-Aggressive Assistant watches your browsing behavior and delivers cleverly sarcastic comments when it notices patterns:

- 📱 **Social Media Addiction**: "Back to Twitter? Shocking."
- 🛍️ **Shopping Cart Syndrome**: "Adding to cart or just window shopping again?"
- 🏠 **Real Estate Fantasy**: "Ah yes, the daily house hunting for properties you can't afford."
- 💼 **LinkedIn Performance**: "Networking or just pretending to be productive?"
- 📧 **Email Avoidance**: "Marking as unread isn't the same as responding, but you knew that."

## Features

- **💬 Always-On Chat Widget**: Floating 🤨 button for on-demand conversations
  - Ask for roasts anytime
  - Get personalized responses based on your actual browsing
  - Full conversation history
  - Always visible, always judging
- **Random Pop-up Comments**: Surprise judgment based on browsing patterns
- **Real-time Behavior Tracking**: Monitors tab switches, time spent, and site categories
- **🎨 8 Color Themes**: Purple, Blue, Green, Red, Orange, Pink, Dark Mode, Minimal White
- **🎭 4 Unique Personalities**: Each with completely different comment styles
  - **Brutally Honest Friend**: Direct, witty, no filter
  - **Disappointed Parent**: Caring but guilt-inducing
  - **Corporate HR**: Professional business jargon
  - **Documentary Narrator**: David Attenborough-style observations
- **72+ Unique Comments**: Different responses for each personality × site category combination
- **AI-Generated Responses** (Optional): Uses Claude API for contextually aware conversations
- **Daily Stats Dashboard**: See your tab switches and most visited categories
- **Weekly Roast Reports**: Get a comprehensive breakdown of your browsing shame
- **Fully Customizable**: Change colors and personality on the fly

## Installation (Developer Mode)

1. **Download/Clone this folder**

2. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the `passive-aggressive-assistant` folder

4. **Pin the extension** (optional but recommended):
   - Click the puzzle piece icon in Chrome toolbar
   - Pin the Passive-Aggressive Assistant

## Setup for AI Comments (Optional)

To enable AI-generated comments (recommended for best experience):

1. **Get Anthropic API Access**:
   - Sign up at [console.anthropic.com](https://console.anthropic.com)
   - Get your API key from the dashboard

2. **Add API Key to Extension**:
   - Open `background.js`
   - Find the `generateAIComment` function
   - Add your API key in the headers:
   ```javascript
   headers: {
     'Content-Type': 'application/json',
     'anthropic-version': '2023-06-01',
     'x-api-key': 'YOUR_API_KEY_HERE'  // Add this line
   }
   ```

**Note**: Without an API key, the extension uses fallback comments (still funny, but less contextually aware).

## Usage

1. **Browse normally** - The extension runs in the background
2. **Get judged** - When it detects patterns (tab switching, site revisits), a comment bubble appears
3. **Check your stats** - Click the extension icon to see your daily dashboard
4. **Adjust settings** - Change personality or disable comments temporarily

## How It Works

- **Background Service Worker** (`background.js`): Tracks tab activity and categorizes sites
- **Content Script** (`content.js`): Injects the comment bubble into web pages
- **Trigger System**: Detects patterns like:
  - 5+ social media visits in recent history
  - Every 10th tab switch
  - 3+ shopping sites without checkout
  - 2+ real estate browsing sessions
  - Multiple email checks without responses

## Customization

### Adjust Comment Frequency
In `content.js`, change the probability threshold:
```javascript
if (request.action === 'showComment' && Math.random() > 0.7) {
  return; // Currently shows 30% of triggered comments
}
```

### Add Custom Site Categories
In `background.js`, expand the `categorizeSite` function:
```javascript
if (urlLower.includes('yoursite.com')) {
  return 'your_custom_category';
}
```

### Create Custom Fallback Comments
In `background.js`, add to the `getFallbackComment` function:
```javascript
your_custom_category: [
  "First witty comment",
  "Second sarcastic observation",
  "Third judgy remark"
]
```

## Demo Tips (For Saasathon)

1. **Quick Demo Flow**:
   - Open extension popup → show clean UI and stats
   - Visit Twitter 3 times → trigger social media comment
   - Open Amazon, browse products → trigger shopping comment
   - Show multiple tab switches → trigger tab addiction comment

2. **Highlight Features**:
   - Personality switcher
   - Real-time stats
   - Beautiful gradient UI
   - Non-intrusive comments that auto-hide

3. **Pitch Angle**:
   - "Every AI tries to help you be productive. We tell you the truth about your habits."
   - "Accountability through sarcasm"
   - "The AI assistant that's actually honest with you"

## File Structure

```
passive-aggressive-assistant/
├── manifest.json         # Extension configuration
├── background.js         # Behavior tracking & AI logic
├── content.js           # Comment bubble injection
├── content.css          # Bubble styling
├── popup.html           # Settings dashboard UI
├── popup.js             # Dashboard logic
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Future Ideas

- **Weekly email reports** with graphs and insights
- **Achievement system** ("Opened Twitter 100 times without posting")
- **Social features** (compare stats with friends)
- **Custom trigger rules** (user-defined judgment conditions)
- **Voice comments** (text-to-speech with sarcastic tone)
- **Browser history analysis** ("You've visited this job posting 47 times. Just apply.")

## Tech Stack

- Chrome Extension Manifest V3
- Claude API (Anthropic)
- Vanilla JavaScript (no frameworks for speed)
- Local Storage for data persistence

## License

MIT - Feel free to judge people's browsing habits as you see fit.

---

**Built for Saasathon 2024** - Using AI in a creative way: not to boost productivity, but to hold up a mirror to your digital behavior. 🤨
