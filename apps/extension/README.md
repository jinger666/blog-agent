# AI Blog Assistant - Chrome Extension

## Development

To run the extension in development mode:

```bash
pnpm dev:extension
```

Or from the extension directory:

```bash
cd apps/extension
pnpm dev
```

## Building

To build the extension for production:

```bash
pnpm --filter @ai-blog/extension run build
```

## Loading in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3-dev` folder (for development) or `.output/chrome-mv3-prod` folder (for production)

## Features

- 🤖 AI-powered content enhancement
- ✨ Generate catchy blog titles
- 📝 Create content outlines
- 🔍 SEO optimization
- 🎯 CSDN formatting support
- 📱 Side panel interface

## Structure

- `entrypoints/content/` - Content scripts that run on web pages
- `entrypoints/background.ts` - Background service worker
- `entrypoints/sidepanel.html` - Side panel UI
- `entrypoints/index.html` - Popup UI
