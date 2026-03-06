# Announcing DevToolkit v1.0 — 21 Developer Tools, Completely Offline

**TL;DR:** We built a free, open-source desktop app with 21 developer utilities that runs entirely offline. No accounts. No telemetry. No data leaving your machine. Download it today.

---

## Why We Built DevToolkit

Every developer has a collection of browser bookmarks for small utility tasks — a JSON formatter here, a Base64 decoder there, a JWT inspector on yet another tab. These tools are scattered across dozens of websites, each with their own quirks: some inject ads, some require sign-ups, and almost all of them process your data on a remote server.

We asked a simple question: **What if all of these tools lived in one app on your desktop, and none of your data ever left your machine?**

That question became DevToolkit.

## What Is DevToolkit?

DevToolkit is a desktop application for Windows, macOS, and Linux that bundles **21 essential developer utilities** into a single, beautiful interface. It's built with Electron, React, TypeScript, and Tailwind CSS — and it works completely offline.

No internet connection is needed. No accounts. No telemetry. Every byte of data you paste into DevToolkit stays on your local filesystem.

## The Tools

We focused on the tools developers actually reach for every day:

**Data wrangling** — Format JSON, compare JSON objects, convert between YAML/XML/JSON, parse cron expressions, and export Markdown to PDF. These cover the daily back-and-forth of working with APIs, configs, and documentation.

**Encoding and decoding** — Base64, URL encoding, JWT inspection, number base conversion (hex, octal, binary), and color format conversion (HEX, RGB, HSL). The bread and butter of debugging and data inspection.

**Text manipulation** — Regex testing with live match highlighting, case conversion across 7 formats, side-by-side text diff, character/word counting, and slug generation. Small tasks that add up to hours of saved time.

**Security-conscious hashing** — Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text input. All computed locally using the Web Crypto API (and js-md5 for MD5), so your input never touches a network.

**Reference tools** — A searchable HTTP status code reference with 38 status codes grouped by category, and a CIDR/subnet calculator for quick network math.

**Time conversion** — A Unix timestamp converter with a live clock, bidirectional epoch-to-date conversion, and timezone awareness.

Every tool launches with **sample data pre-loaded** so you can see exactly how it works before pasting in your own input. And every tool output has a **copy button** for instant clipboard access.

## Privacy as a Feature, Not a Marketing Line

This isn't a tool that "respects your privacy" while silently phoning home. DevToolkit makes **zero network requests**. The Electron app loads from local files. There is no update check, no crash reporter, no analytics SDK. Audit the source code yourself — it's all open.

This makes DevToolkit ideal for:

- **Working with production data** — Decode that JWT from prod without worrying about where it ends up
- **Air-gapped environments** — Works on machines with no internet access
- **Security-conscious teams** — No third-party data processing, ever
- **Regulated industries** — Keep sensitive data processing strictly local

## Designed for Developer Workflows

### Dark-First UI

We're developers too. Dark mode is the default. The interface uses semantic design tokens — `bg-primary`, `text-muted-foreground`, `border-border` — ensuring a consistent look across all 21 tools. Light mode is a toggle away for those who prefer it.

### Favourites

Click the star on any tool to pin it to the top of the sidebar. Your favourites persist across sessions in a local SQLite database. No cloud sync — just fast, local preferences.

### Quick Search

The home screen includes a search bar that filters tools in real time as you type. It matches against both tool names and descriptions. A clear button appears when text is entered, keeping the interaction crisp.

### Consistent UX Patterns

Every tool follows the same interaction pattern: input on the left, output on the right (or top/bottom), with clear and copy buttons in consistent positions. If you know how to use one tool, you know how to use all of them.

## The Tech Stack

We chose a modern, proven stack:

- **Electron** provides the cross-platform desktop shell
- **React 18** powers the component-based UI
- **TypeScript** enforces type safety across the entire codebase
- **Tailwind CSS v4** handles styling with the `@theme` directive and CSS custom properties
- **Vite** delivers sub-second hot reload during development
- **SQLite** (via `better-sqlite3`) stores favourites and preferences locally
- **HashRouter** ensures correct routing under Electron's `file://` protocol

The architecture is simple by design: each tool is a standalone page component in `src/pages/`, with a route in `App.tsx`, an entry in the sidebar, and a card on the home page. Adding a new tool is a 4-file change.

## Open Source, MIT Licensed

DevToolkit is released under the MIT license. You can:

- **Use it** — at work, at home, on any machine
- **Fork it** — build your own internal version with custom tools
- **Extend it** — add tools that fit your team's workflow
- **Contribute** — PRs are welcome for new tools, bug fixes, and improvements

## Get Started

### Download

Grab the installer for your platform:

- 🪟 **Windows** — [Download .exe](#)
- 🍎 **macOS** — [Download .dmg](#)
- 🐧 **Linux** — [Download .AppImage](#)

### Build from Source

```bash
git clone https://github.com/AseemGaurav/DevToolkit.git
cd DevToolkit
npm install
npm run dev
```

The dev server launches with hot reload. Make changes, see them instantly.

## What's Coming Next

DevToolkit v1.0 ships with 21 tools, but we're already planning more:

- **Lorem Ipsum Generator** — Configurable placeholder text
- **QR Code Generator** — Create QR codes offline
- **JSON Schema Validator** — Validate JSON against schemas
- **SQL Formatter** — Pretty-print SQL queries
- **CSV ↔ JSON Converter** — Tabular data conversion

We're also exploring plugin architecture for community-contributed tools.

Have an idea? [Open an issue on GitHub](#) — we genuinely want to hear what tools you wish existed.

---

## Try It Today

DevToolkit is free, offline, and open source. Download it, pin it to your taskbar, and stop pasting sensitive data into random websites.

👉 [**Download DevToolkit →**](#)
👉 [**View on GitHub →**](#)

---

*DevToolkit is maintained by [Aseem Gaurav](https://github.com/AseemGaurav) and contributors. Built with ❤️ for the developer community.*
