import { HashRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import { HomePage } from "./pages/HomePage"
import { UuidGeneratorPage } from "./pages/UuidGeneratorPage"
import { JsonFormatterPage } from "./pages/JsonFormatterPage"
import { JsonComparePage } from "./pages/JsonComparePage"
import { Base64Page } from "./pages/Base64Page"
import { MarkdownPdfPage } from "./pages/MarkdownPdfPage"
import { YamlJsonPage } from "./pages/YamlJsonPage"
import { JwtDecoderPage } from "./pages/JwtDecoderPage"
import { RegexTesterPage } from "./pages/RegexTesterPage"
import { UrlEncoderPage } from "./pages/UrlEncoderPage"
import { XmlJsonPage } from "./pages/XmlJsonPage"
import { CronParserPage } from "./pages/CronParserPage"
import { NumberBaseConverterPage } from "./pages/NumberBaseConverterPage"
import { ColorConverterPage } from "./pages/ColorConverterPage"
import { StringCaseConverterPage } from "./pages/StringCaseConverterPage"
import { TextDiffPage } from "./pages/TextDiffPage"
import { CharacterCounterPage } from "./pages/CharacterCounterPage"
import { SlugGeneratorPage } from "./pages/SlugGeneratorPage"
import { HashGeneratorPage } from "./pages/HashGeneratorPage"
import { UnixTimestampPage } from "./pages/UnixTimestampPage"
import { HttpStatusCodePage } from "./pages/HttpStatusCodePage"
import { CidrCalculatorPage } from "./pages/CidrCalculatorPage"

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/uuid" element={<UuidGeneratorPage />} />
          <Route path="/json-formatter" element={<JsonFormatterPage />} />
          <Route path="/json-compare" element={<JsonComparePage />} />
          <Route path="/base64" element={<Base64Page />} />
          <Route path="/markdown-pdf" element={<MarkdownPdfPage />} />
          <Route path="/yaml-json" element={<YamlJsonPage />} />
          <Route path="/xml-json" element={<XmlJsonPage />} />
          <Route path="/cron-parser" element={<CronParserPage />} />
          <Route path="/jwt-decoder" element={<JwtDecoderPage />} />
          <Route path="/regex-tester" element={<RegexTesterPage />} />
          <Route path="/url-encoder" element={<UrlEncoderPage />} />
          <Route path="/number-base" element={<NumberBaseConverterPage />} />
          <Route path="/color-converter" element={<ColorConverterPage />} />
          <Route path="/string-case" element={<StringCaseConverterPage />} />
          <Route path="/text-diff" element={<TextDiffPage />} />
          <Route path="/char-counter" element={<CharacterCounterPage />} />
          <Route path="/slug-generator" element={<SlugGeneratorPage />} />
          <Route path="/hash-generator" element={<HashGeneratorPage />} />
          <Route path="/unix-timestamp" element={<UnixTimestampPage />} />
          <Route path="/http-status" element={<HttpStatusCodePage />} />
          <Route path="/cidr-calculator" element={<CidrCalculatorPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
