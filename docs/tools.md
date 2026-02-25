# DevToolkit — Tool Ideas

Additional developer tools to add to DevToolkit. All tools are fully offline-capable and fit the existing single-page-per-tool architecture.

## ⭐ Favourites

Users can mark any tool as a favourite by clicking the star icon in the sidebar or on the home page. Favourite tools are persisted in SQLite and appear in a dedicated "Favourites" section at the top of the sidebar. The home page shows favourite tools when at least one is set, or all tools otherwise.

## ✨ Generators

| Tool                    | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| ✅ GUID / UUID Generator | Generate GUIDs and UUIDs v4 instantly (already built)              |

## 🔤 Encoding & Conversion

| Tool                    | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| ✅ Base64 Encoder/Decoder | Encode and decode Base64 strings (already built)                  |
| URL Encoder/Decoder     | Encode/decode `%20`-style URL components                            |
| HTML Entity Encoder     | Convert `<div>` ↔ `&lt;div&gt;`                                    |
| ✅ JWT Decoder           | Paste a JWT, see header/payload/expiry — no verification needed (already built) |
| Number Base Converter   | Decimal ↔ Hex ↔ Octal ↔ Binary                                     |
| Color Converter         | HEX ↔ RGB ↔ HSL with a visual picker                               |

## 📝 Text & String Tools

| Tool                    | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| ✅ Regex Tester          | Write regex, test against input, see matches + capture groups live (already built) |
| String Case Converter   | camelCase ↔ snake_case ↔ PascalCase ↔ kebab-case ↔ CONSTANT_CASE   |
| Lorem Ipsum Generator   | Generate placeholder text (words, sentences, paragraphs)            |
| Text Diff               | Side-by-side or inline diff of any two text blocks                  |
| Character/Word Counter  | Count chars, words, lines, sentences, byte size                     |
| Slug Generator          | "My Blog Post Title" → `my-blog-post-title`                        |

## 🔐 Hashing & Crypto

| Tool                    | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| Hash Generator          | MD5, SHA-1, SHA-256, SHA-512 from text or file input                |
| Checksum Verifier       | Drop a file + paste expected hash → match/no-match                  |
| Password Generator      | Configurable length, character sets, entropy indicator              |

## 📊 Data & Formats

| Tool                    | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| ✅ JSON Formatter        | Format, minify, and validate JSON (already built)                  |
| ✅ JSON Compare          | Compare two JSON objects side by side (already built)              |
| ✅ Markdown to PDF       | Convert Markdown text to downloadable PDF (already built)          |
| ✅ YAML ↔ JSON Converter   | Bidirectional conversion with syntax validation (already built)    |
| CSV ↔ JSON Converter    | Parse CSV to JSON array and back                                    |
| TOML ↔ JSON Converter   | Useful for Rust/Python config files                                 |
| XML ↔ JSON Converter    | Especially handy for legacy API work                                |
| Cron Expression Parser  | Describe cron schedules in plain English + show next N run times    |
| SQL Formatter           | Pretty-print raw SQL queries                                        |

## ⏱ Date & Time

| Tool                    | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| Unix Timestamp Converter| Epoch ↔ human-readable, with timezone support                       |
| Date Diff Calculator    | Days/hours/minutes between two dates                                |
| Timezone Converter      | Compare times across zones side-by-side                             |

## 🌐 Network & API (offline-friendly)

| Tool                    | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| HTTP Status Code Reference | Searchable list with descriptions and common causes              |
| CIDR/Subnet Calculator  | Calculate network ranges, broadcast addresses, host counts          |
| Mock Data Generator     | Generate fake names, emails, addresses, UUIDs in bulk (JSON/CSV)    |

## 🖼 Misc Developer Utilities

| Tool                    | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| Image Base64 Converter  | Drop an image → get base64 data URI (and reverse)                   |
| QR Code Generator       | Text/URL → QR code image, all offline                               |
| Markdown Preview        | Live rendered preview (lighter sibling of Markdown to PDF)          |
| Placeholder Image Generator | Generate colored boxes with dimensions text, like placeholder.com but local |
