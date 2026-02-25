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
          <Route path="/jwt-decoder" element={<JwtDecoderPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
