# DevToolkit

[![CI Build](https://github.com/cottonstartiet/DevToolkit/actions/workflows/build.yml/badge.svg)](https://github.com/cottonstartiet/DevToolkit/actions/workflows/build.yml)
[![Release](https://github.com/cottonstartiet/DevToolkit/actions/workflows/release.yml/badge.svg)](https://github.com/cottonstartiet/DevToolkit/actions/workflows/release.yml)
[![GitHub Release](https://img.shields.io/github/v/release/cottonstartiet/DevToolkit)](https://github.com/cottonstartiet/DevToolkit/releases/latest)

A fully offline desktop developer utility app. All tools run locally — no network access required.

## Download

| Platform | Download |
|----------|----------|
| Windows  | [DevToolkit-Windows-Setup.exe](https://github.com/cottonstartiet/DevToolkit/releases/latest) |
| macOS    | [DevToolkit-Mac-Installer.dmg](https://github.com/cottonstartiet/DevToolkit/releases/latest) |
| Linux    | [DevToolkit-Linux.AppImage](https://github.com/cottonstartiet/DevToolkit/releases/latest) |

## Tools (21)

| Tool | Description |
|------|-------------|
| GUID / UUID Generator | Generate GUIDs and UUIDs v4 instantly |
| JSON Formatter | Format, minify, and validate JSON |
| JSON Compare | Compare two JSON objects side by side |
| YAML ↔ JSON Converter | Convert between YAML and JSON formats |
| XML ↔ JSON Converter | Convert between XML and JSON formats |
| Base64 Encoder/Decoder | Encode and decode Base64 strings |
| Markdown to PDF | Convert Markdown to downloadable PDF |
| JWT Decoder | Decode and inspect JWT header, payload, and claims |
| URL Encoder/Decoder | Encode and decode URL components |
| Regex Tester | Write regex, test against input, see matches live |
| Cron Expression Parser | Describe cron schedules in plain English |
| Number Base Converter | Convert between Decimal, Hex, Octal, and Binary |
| Color Converter | Convert between HEX, RGB, and HSL with visual picker |
| String Case Converter | Convert between camelCase, snake_case, PascalCase, etc. |
| Text Diff | Compare two text blocks and highlight differences |
| Character / Word Counter | Count characters, words, lines, sentences |
| Slug Generator | Convert text into URL-friendly slugs |
| Hash Generator | Generate MD5, SHA-1, SHA-256, and SHA-512 hashes |
| Unix Timestamp Converter | Convert between Unix timestamps and dates |
| HTTP Status Code Reference | Searchable list of HTTP status codes |
| CIDR / Subnet Calculator | Calculate network ranges and host counts |

## Development

```bash
npm install        # Install dependencies
npm run dev        # Start dev server with hot reload
npm run lint       # Lint with zero warnings policy
npm run build      # TypeScript check → Vite build → electron-builder package
```

## Tech Stack

Electron · React · TypeScript · Tailwind CSS v4 · SQLite

## License

© Aseem Gaurav
