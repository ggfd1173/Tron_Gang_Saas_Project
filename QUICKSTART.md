# ⚡ QUICK START - Get Running in 2 Minutes

## Immediate Testing (No API Key Needed)

1. **Load Extension**:
   ```
   1. Open Chrome
   2. Go to chrome://extensions/
   3. Enable "Developer mode" (top-right toggle)
   4. Click "Load unpacked"
   5. Select the passive-aggressive-assistant folder
   ```

2. **Test It Right Now**:
   - Open Twitter/X or any social media site
   - Switch tabs a few times (open/close 5+ tabs quickly)
   - Visit Amazon or any shopping site
   - Look for the purple comment bubble in bottom-right! 🤨

3. **Check Your Stats**:
   - Click the extension icon (🤨) in Chrome toolbar
   - See your tab switches and browsing patterns

## It's Working When You See:

✅ Purple gradient bubble appears in bottom-right corner (for random comments)
✅ Floating 🤨 chat button always visible in bottom-right
✅ Click chat button to open conversation panel
✅ Type messages to get personalized roasts
✅ Witty/sarcastic comments about your browsing
✅ Auto-hide bubbles after 8 seconds
✅ Stats update in the extension popup

## Fallback Comments (No API Key Required)

The extension works immediately with these pre-written comments:

**Social Media**:
- "Back to social media? Shocking."
- "Just checking if anyone liked your post from 3 minutes ago?"
- "The doomscroll is strong with this one."

**Shopping**:
- "Adding to cart or just window shopping again?"
- "Pro tip: The checkout button still works."

**LinkedIn**:
- "LinkedIn again? Networking or just pretending to be productive?"

**Email**:
- "Marking as unread isn't the same as responding, but you knew that."

## Optional: Enable AI Comments

Want smarter, contextually-aware comments? Add Claude API:

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Open `background.js`
3. Find line ~250 (the fetch to api.anthropic.com)
4. Add to headers:
   ```javascript
   'x-api-key': 'YOUR_API_KEY_HERE'
   ```
5. Reload extension

## Troubleshooting

**No comments appearing?**
- Check if extension is enabled in popup
- Try switching tabs more (needs 5-10 switches to trigger)
- Visit obvious sites (Twitter, Amazon, LinkedIn)

**Popup not opening?**
- Refresh the extension (reload button on chrome://extensions/)
- Make sure you clicked the extension icon

**Comments too frequent/rare?**
- Edit `content.js` line 42: change `0.7` to adjust (lower = more frequent)

## Demo Script for Judges

1. **Show empty stats** (fresh install)
2. **Point out the floating 🤨 button** → "This is always here, watching"
3. **Browse aggressively**: Twitter → Amazon → LinkedIn → back to Twitter
4. **Wait for auto comments** (should trigger within 30 seconds)
5. **Click the 🤨 chat button** → show conversation panel
6. **Type "Roast me"** → get instant personalized judgment
7. **Open popup** → show live stats updating
8. **Switch personalities** → chat again, show different tones
9. **Change color theme** → show visual customization
10. **Explain**: "AI that tells you the truth, and you can talk to it anytime"

---

**Time from download to first judgmental comment: < 2 minutes** ⚡
