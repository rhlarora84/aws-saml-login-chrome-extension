# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAMLify for AWS is a Chrome extension that improves the AWS SAML login page experience for users with multiple accounts and roles. It provides sorted account lists, favorites, account ID copying, and search filtering.

## Build Commands

```bash
npm run build    # Production build (outputs to ./dist)
npm run watch    # Watch mode for development
```

## Loading the Extension for Development

1. Open Chrome → Extensions (chrome://extensions/)
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder

## Architecture

**Content Script Pattern**: The extension uses a single content script entry point that injects a React application into the AWS SAML login page (`https://signin.aws.amazon.com/saml`).

**Key Flow**:
1. `src/content/index.tsx` - Entry point that parses the existing AWS SAML page DOM to extract account/role data, then replaces the page body with the React app
2. `src/content/App.tsx` - Main React component managing search state
3. `src/components/AccountListComponent.tsx` - Renders account cards with favorites (persisted via Chrome storage API) and role selection
4. `src/components/NavBarComponent.tsx` - Navigation bar with search
5. `src/components/SearchComponent.tsx` - Search input component

**Data Types** (`src/content/types.ts`):
- `Account`: accountName, accountId, roles[]
- `Role`: roleName, roleArn

**Tech Stack**: React 18, TypeScript, TailwindCSS, Webpack, Chrome Extension Manifest V3

**Chrome APIs Used**: `chrome.storage.sync` for persisting favorite accounts across sessions
