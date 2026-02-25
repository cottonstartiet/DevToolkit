import ReactMarkdown from "react-markdown"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

export interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * React component for rendering markdown.
 * Wraps the underlying markdown library so it can be swapped from one place.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return React.createElement(
    "div",
    { className },
    React.createElement(ReactMarkdown, null, content)
  )
}

/**
 * Converts markdown to an HTML string (for non-React contexts like print windows).
 */
export function markdownToHtml(md: string): string {
  return renderToStaticMarkup(React.createElement(ReactMarkdown, null, md))
}
