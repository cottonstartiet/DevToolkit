import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"

const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })))
const UuidGeneratorPage = lazy(() => import("./pages/UuidGeneratorPage").then(m => ({ default: m.UuidGeneratorPage })))
const JsonFormatterPage = lazy(() => import("./pages/JsonFormatterPage").then(m => ({ default: m.JsonFormatterPage })))
const JsonComparePage = lazy(() => import("./pages/JsonComparePage").then(m => ({ default: m.JsonComparePage })))
const Base64Page = lazy(() => import("./pages/Base64Page").then(m => ({ default: m.Base64Page })))
const MarkdownPdfPage = lazy(() => import("./pages/MarkdownPdfPage").then(m => ({ default: m.MarkdownPdfPage })))
const YamlJsonPage = lazy(() => import("./pages/YamlJsonPage").then(m => ({ default: m.YamlJsonPage })))
const JwtDecoderPage = lazy(() => import("./pages/JwtDecoderPage").then(m => ({ default: m.JwtDecoderPage })))
const RegexTesterPage = lazy(() => import("./pages/RegexTesterPage").then(m => ({ default: m.RegexTesterPage })))
const UrlEncoderPage = lazy(() => import("./pages/UrlEncoderPage").then(m => ({ default: m.UrlEncoderPage })))
const XmlJsonPage = lazy(() => import("./pages/XmlJsonPage").then(m => ({ default: m.XmlJsonPage })))
const CronParserPage = lazy(() => import("./pages/CronParserPage").then(m => ({ default: m.CronParserPage })))
const NumberBaseConverterPage = lazy(() => import("./pages/NumberBaseConverterPage").then(m => ({ default: m.NumberBaseConverterPage })))
const ColorConverterPage = lazy(() => import("./pages/ColorConverterPage").then(m => ({ default: m.ColorConverterPage })))
const StringCaseConverterPage = lazy(() => import("./pages/StringCaseConverterPage").then(m => ({ default: m.StringCaseConverterPage })))
const TextDiffPage = lazy(() => import("./pages/TextDiffPage").then(m => ({ default: m.TextDiffPage })))
const CharacterCounterPage = lazy(() => import("./pages/CharacterCounterPage").then(m => ({ default: m.CharacterCounterPage })))
const SlugGeneratorPage = lazy(() => import("./pages/SlugGeneratorPage").then(m => ({ default: m.SlugGeneratorPage })))
const HashGeneratorPage = lazy(() => import("./pages/HashGeneratorPage").then(m => ({ default: m.HashGeneratorPage })))
const UnixTimestampPage = lazy(() => import("./pages/UnixTimestampPage").then(m => ({ default: m.UnixTimestampPage })))
const HttpStatusCodePage = lazy(() => import("./pages/HttpStatusCodePage").then(m => ({ default: m.HttpStatusCodePage })))
const CidrCalculatorPage = lazy(() => import("./pages/CidrCalculatorPage").then(m => ({ default: m.CidrCalculatorPage })))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Suspense><HomePage /></Suspense>} />
          <Route path="/uuid" element={<Suspense><UuidGeneratorPage /></Suspense>} />
          <Route path="/json-formatter" element={<Suspense><JsonFormatterPage /></Suspense>} />
          <Route path="/json-compare" element={<Suspense><JsonComparePage /></Suspense>} />
          <Route path="/base64" element={<Suspense><Base64Page /></Suspense>} />
          <Route path="/markdown-pdf" element={<Suspense><MarkdownPdfPage /></Suspense>} />
          <Route path="/yaml-json" element={<Suspense><YamlJsonPage /></Suspense>} />
          <Route path="/xml-json" element={<Suspense><XmlJsonPage /></Suspense>} />
          <Route path="/cron-parser" element={<Suspense><CronParserPage /></Suspense>} />
          <Route path="/jwt-decoder" element={<Suspense><JwtDecoderPage /></Suspense>} />
          <Route path="/regex-tester" element={<Suspense><RegexTesterPage /></Suspense>} />
          <Route path="/url-encoder" element={<Suspense><UrlEncoderPage /></Suspense>} />
          <Route path="/number-base" element={<Suspense><NumberBaseConverterPage /></Suspense>} />
          <Route path="/color-converter" element={<Suspense><ColorConverterPage /></Suspense>} />
          <Route path="/string-case" element={<Suspense><StringCaseConverterPage /></Suspense>} />
          <Route path="/text-diff" element={<Suspense><TextDiffPage /></Suspense>} />
          <Route path="/char-counter" element={<Suspense><CharacterCounterPage /></Suspense>} />
          <Route path="/slug-generator" element={<Suspense><SlugGeneratorPage /></Suspense>} />
          <Route path="/hash-generator" element={<Suspense><HashGeneratorPage /></Suspense>} />
          <Route path="/unix-timestamp" element={<Suspense><UnixTimestampPage /></Suspense>} />
          <Route path="/http-status" element={<Suspense><HttpStatusCodePage /></Suspense>} />
          <Route path="/cidr-calculator" element={<Suspense><CidrCalculatorPage /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
