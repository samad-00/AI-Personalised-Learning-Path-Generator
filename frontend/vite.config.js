import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import net from 'net'
import http from 'http'

// All ports that will be scanned to find Django
const SCAN_PORTS = [8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009, 8010, 8011, 8080]

function isPortOpen(port) {
  return new Promise((resolve) => {
    const s = new net.Socket()
    s.setTimeout(200)
    s.once('connect', () => { s.destroy(); resolve(true) })
    s.once('timeout', () => { s.destroy(); resolve(false) })
    s.once('error', () => resolve(false))
    s.connect(port, '127.0.0.1')
  })
}

let _cachedPort = null
let _lastScan = 0

async function detectBackendPort() {
  const now = Date.now()
  // Re-use cached port for 3 seconds to avoid scanning on every request
  if (_cachedPort && (now - _lastScan) < 3000) return _cachedPort

  const results = await Promise.all(
    SCAN_PORTS.map(async p => ({ p, open: await isPortOpen(p) }))
  )
  const hit = results.find(r => r.open)
  if (hit) {
    if (_cachedPort !== hit.p) {
      console.log(`\n  \x1b[32m[auto-proxy]\x1b[0m Django detected on port \x1b[36m${hit.p}\x1b[0m`)
    }
    _cachedPort = hit.p
    _lastScan = now
  }
  return _cachedPort
}

/** Vite plugin: intercepts /api/* and forwards to whichever port Django is on */
function djangoAutoProxyPlugin() {
  return {
    name: 'vite-django-auto-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) return next()

        const port = await detectBackendPort()

        if (!port) {
          res.writeHead(503, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({
            error: 'Django backend not found. Run: python manage.py runserver <any-port>'
          }))
        }

        // Buffer the request body (needed for POST/PATCH/PUT)
        const bodyChunks = []
        req.on('data', chunk => bodyChunks.push(chunk))
        req.on('end', () => {
          const body = Buffer.concat(bodyChunks)

          const options = {
            hostname: '127.0.0.1',
            port,
            path: req.url,
            method: req.method,
            headers: {
              ...req.headers,
              host: `127.0.0.1:${port}`,
              'content-length': body.length,
            },
          }

          const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers)
            proxyRes.pipe(res, { end: true })
          })

          proxyReq.on('error', () => {
            // Backend went away — force re-scan on next request
            _cachedPort = null
            _lastScan = 0
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Backend connection failed. Is Django still running?' }))
            }
          })

          if (body.length > 0) proxyReq.write(body)
          proxyReq.end()
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), djangoAutoProxyPlugin()],
  server: {
    historyApiFallback: true,
  },
  cacheDir: '.vite_cache'
})