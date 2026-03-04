# Too Long, Didn't Read (Your Tests)

A Chrome extension that automatically marks test files as "Viewed" when reviewing pull requests on GitHub.

When you open the **Files changed** tab on a PR, the extension detects test files and clicks the "Viewed" checkbox for you so you can focus on the actual code changes.

## Matched patterns

Files matching any of these are auto-marked as viewed:

- `*.spec.*` (e.g. `button.spec.tsx`)
- `*.test.*` (e.g. `utils.test.js`)
- `__tests__/**` (e.g. `__tests__/api.js`)
- `test/**` (e.g. `test/helpers.js`)

## Install

1. Clone this repo:
   ```bash
   git clone https://github.com/joswayski/tldryt.git
   ```
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the `tldryt` folder you just cloned
5. Navigate to any GitHub PR's "Files changed" tab — test files will be auto-marked

## Usage

- The extension runs automatically on any `github.com/*/*/pull/*/files` page
- Click the extension icon in the toolbar to toggle it on/off
- A toast notification appears in the bottom right showing how many files were marked

## Adding icons (optional)

Drop `icon16.png`, `icon48.png`, and `icon128.png` into an `icons/` folder and add this to `manifest.json`:

```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```
