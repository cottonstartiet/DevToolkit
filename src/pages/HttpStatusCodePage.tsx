import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface StatusCode {
  code: number
  phrase: string
  description: string
}

const statusCodes: StatusCode[] = [
  // 1xx Informational
  { code: 100, phrase: "Continue", description: "The server has received the request headers and the client should proceed to send the request body." },
  { code: 101, phrase: "Switching Protocols", description: "The requester has asked the server to switch protocols and the server has agreed." },
  { code: 102, phrase: "Processing", description: "The server has received and is processing the request, but no response is available yet." },
  { code: 103, phrase: "Early Hints", description: "Used to return some response headers before the final HTTP message." },

  // 2xx Success
  { code: 200, phrase: "OK", description: "The request has succeeded. Standard response for successful HTTP requests." },
  { code: 201, phrase: "Created", description: "The request has been fulfilled and a new resource has been created." },
  { code: 202, phrase: "Accepted", description: "The request has been accepted for processing, but the processing has not been completed." },
  { code: 203, phrase: "Non-Authoritative Information", description: "The server is a transforming proxy that received a 200 OK from its origin." },
  { code: 204, phrase: "No Content", description: "The server successfully processed the request but is not returning any content." },
  { code: 206, phrase: "Partial Content", description: "The server is delivering only part of the resource due to a range header sent by the client." },
  { code: 207, phrase: "Multi-Status", description: "The message body contains multiple status codes for multiple independent operations." },

  // 3xx Redirection
  { code: 301, phrase: "Moved Permanently", description: "The resource has been permanently moved to a new URL. Clients should use the new URL." },
  { code: 302, phrase: "Found", description: "The resource resides temporarily at a different URL. Client should continue using the original URL." },
  { code: 303, phrase: "See Other", description: "The response can be found under a different URI using a GET method." },
  { code: 304, phrase: "Not Modified", description: "The resource has not been modified since the version specified by the request headers." },
  { code: 307, phrase: "Temporary Redirect", description: "The request should be repeated with another URI, but future requests should still use the original URI." },
  { code: 308, phrase: "Permanent Redirect", description: "The request and all future requests should be repeated using another URI." },

  // 4xx Client Errors
  { code: 400, phrase: "Bad Request", description: "The server cannot process the request due to malformed syntax, invalid parameters, or deceptive routing." },
  { code: 401, phrase: "Unauthorized", description: "Authentication is required and has failed or has not been provided. Include valid credentials." },
  { code: 403, phrase: "Forbidden", description: "The server understood the request but refuses to authorize it. Authentication will not help." },
  { code: 404, phrase: "Not Found", description: "The requested resource could not be found on the server. Check the URL for typos." },
  { code: 405, phrase: "Method Not Allowed", description: "The request method is not supported for the requested resource (e.g., GET on a POST-only endpoint)." },
  { code: 406, phrase: "Not Acceptable", description: "The resource is not available in a format that would respect the Accept headers of the request." },
  { code: 408, phrase: "Request Timeout", description: "The server timed out waiting for the request. The client did not produce a request in time." },
  { code: 409, phrase: "Conflict", description: "The request conflicts with the current state of the server (e.g., duplicate entry, edit conflict)." },
  { code: 410, phrase: "Gone", description: "The resource is no longer available and will not be available again. Unlike 404, this is permanent." },
  { code: 413, phrase: "Payload Too Large", description: "The request entity is larger than the server is willing or able to process." },
  { code: 414, phrase: "URI Too Long", description: "The URI provided was too long for the server to process." },
  { code: 415, phrase: "Unsupported Media Type", description: "The media format of the requested data is not supported by the server." },
  { code: 418, phrase: "I'm a Teapot", description: "The server refuses to brew coffee because it is, permanently, a teapot (RFC 2324)." },
  { code: 422, phrase: "Unprocessable Entity", description: "The request was well-formed but contains semantic errors (common in REST API validation)." },
  { code: 429, phrase: "Too Many Requests", description: "The user has sent too many requests in a given amount of time (rate limiting)." },
  { code: 451, phrase: "Unavailable For Legal Reasons", description: "The resource is unavailable due to legal demands (censorship, court order)." },

  // 5xx Server Errors
  { code: 500, phrase: "Internal Server Error", description: "A generic error message when the server encounters an unexpected condition." },
  { code: 501, phrase: "Not Implemented", description: "The server does not support the functionality required to fulfill the request." },
  { code: 502, phrase: "Bad Gateway", description: "The server received an invalid response from an upstream server while acting as a gateway." },
  { code: 503, phrase: "Service Unavailable", description: "The server is currently unavailable (overloaded or down for maintenance)." },
  { code: 504, phrase: "Gateway Timeout", description: "The server did not receive a timely response from an upstream server." },
  { code: 505, phrase: "HTTP Version Not Supported", description: "The server does not support the HTTP version used in the request." },
  { code: 511, phrase: "Network Authentication Required", description: "The client needs to authenticate to gain network access (e.g., captive portal)." },
]

const categoryColors: Record<string, string> = {
  "1xx": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "2xx": "bg-green-500/10 text-green-500 border-green-500/20",
  "3xx": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "4xx": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "5xx": "bg-red-500/10 text-red-500 border-red-500/20",
}

const categoryLabels: Record<string, string> = {
  "1xx": "Informational",
  "2xx": "Success",
  "3xx": "Redirection",
  "4xx": "Client Error",
  "5xx": "Server Error",
}

function getCategory(code: number): string {
  return `${Math.floor(code / 100)}xx`
}

export function HttpStatusCodePage() {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return statusCodes
    return statusCodes.filter(
      (s) =>
        s.code.toString().includes(q) ||
        s.phrase.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    )
  }, [search])

  const grouped = useMemo(() => {
    const groups: Record<string, StatusCode[]> = {}
    for (const s of filtered) {
      const cat = getCategory(s.code)
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s)
    }
    return groups
  }, [filtered])

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">HTTP Status Code Reference</h1>
        <p className="text-muted-foreground">
          Searchable reference of HTTP status codes with descriptions and common causes.
        </p>
      </div>

      <div className="mb-4 shrink-0 max-w-md">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code, name, or description..."
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1">
        {Object.entries(grouped).map(([category, codes]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background py-1 z-10">
              <Badge variant="outline" className={categoryColors[category]}>
                {category}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">{categoryLabels[category]}</span>
              <span className="text-xs text-muted-foreground">({codes.length})</span>
            </div>
            <div className="space-y-2">
              {codes.map((s) => (
                <Card key={s.code}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start gap-3">
                      <code className="text-lg font-bold font-mono shrink-0 w-12">{s.code}</code>
                      <div className="min-w-0">
                        <div className="font-medium">{s.phrase}</div>
                        <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No status codes match your search.
          </div>
        )}
      </div>
    </div>
  )
}
