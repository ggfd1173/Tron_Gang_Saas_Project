# 🔑 OpenRouter API Setup Guide

## Quick Setup (5 Minutes)

Your extension is now configured to use **OpenRouter** instead of direct Anthropic API. This means you can use your OpenRouter key to access Claude!

---

## Step 1: Get Your OpenRouter Key

You mentioned you already have an OpenRouter key - great! If not:

1. Go to https://openrouter.ai/
2. Sign in
3. Navigate to "Keys" section
4. Copy your API key (starts with `sk-or-v1-...`)

---

## Step 2: Add Your Key to the Extension

You need to add your OpenRouter key in **TWO files**:

### File 1: `background.js`

1. Open `background.js` in a text editor
2. Find line ~218 (search for `YOUR_OPENROUTER_KEY_HERE`)
3. Replace with your actual key:

```javascript
'Authorization': 'Bearer sk-or-v1-YOUR_ACTUAL_KEY_HERE',
```

**Example:**
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer sk-or-v1-abc123xyz789...', // ← Your key here
  'HTTP-Referer': 'https://github.com/yourusername/passive-aggressive-assistant',
  'X-Title': 'Passive-Aggressive Assistant'
}
```

### File 2: `content.js`

1. Open `content.js` in a text editor
2. Find line ~145 (search for `YOUR_OPENROUTER_KEY_HERE`)
3. Replace with the **same key**:

```javascript
'Authorization': 'Bearer sk-or-v1-YOUR_ACTUAL_KEY_HERE',
```

---

## Step 3: Reload the Extension

1. Go to `chrome://extensions/`
2. Find "Passive-Aggressive Assistant"
3. Click the **reload icon** (circular arrow)
4. Done!

---

## Step 4: Test It

1. **Browse some sites** (Twitter, Amazon, etc.)
2. **Wait for a comment** - if it's AI-generated, you'll notice it's more contextual
3. **Or click the 🤨 chat button**
4. **Type "Roast me"**
5. **If you see a typing indicator** then get a smart response → IT'S WORKING! ✅

---

## How to Know It's Using AI vs. Fallback

### ✅ AI-Powered (OpenRouter Working):
- Comments reference specific numbers ("You've switched tabs 47 times...")
- More varied and contextual responses
- Never repeats the exact same comment
- Typing indicator in chat works

### ⚠️ Fallback Mode (Key Not Working):
- Uses pre-written comments
- Same comments repeat sometimes
- Still funny, just not as smart
- Chat responses follow keyword patterns

---

## Troubleshooting

### "No response in chat"
- Check you added the key to **both** `background.js` AND `content.js`
- Make sure you clicked the reload button on the extension
- Try refreshing the webpage

### "Getting error messages"
- Check your OpenRouter key is valid
- Make sure you have credits on OpenRouter
- Check the browser console (F12) for error details

### "Still using fallback comments"
- That's fine! The extension works great without AI too
- Add the key when you're ready
- Fallbacks are still witty and personality-aware

---

## Cost with OpenRouter

OpenRouter charges per token usage. For Claude 3.5 Sonnet:
- **Input**: ~$3 per million tokens
- **Output**: ~$15 per million tokens

**Your usage estimate:**
- Each comment: ~150 tokens = $0.002 (0.2 cents)
- Heavy saasathon use: ~200 comments = $0.40
- **Your credits will last the entire event easily**

---

## Optional: Change the Model

Don't want to use Claude? OpenRouter supports many models!

In both files, change:
```javascript
model: 'anthropic/claude-3.5-sonnet',
```

To one of these:
- `'anthropic/claude-3-opus'` - Smarter, slower, pricier
- `'anthropic/claude-3-haiku'` - Faster, cheaper
- `'openai/gpt-4-turbo'` - Use GPT-4 instead
- `'google/gemini-pro'` - Use Google's model

See all models at: https://openrouter.ai/models

---

## Summary

1. ✅ Extension already configured for OpenRouter
2. ✅ Just add your key in 2 places
3. ✅ Reload extension
4. ✅ Test and you're done!

**Without the key**: Extension still works with smart fallback comments  
**With the key**: Extension uses real AI for contextual responses

---

**You're all set! The extension works great either way.** 🚀
