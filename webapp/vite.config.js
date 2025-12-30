import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

// API plugin to serve compositions list
function compositionsApiPlugin() {
  return {
    name: 'compositions-api',
    configureServer(server) {
      // GET /api/compositions - list all compositions
      server.middlewares.use('/api/compositions', (req, res) => {
        const compositionsDir = path.resolve(__dirname, 'public/compositions')
        const analysisDir = path.resolve(__dirname, '../output/analysis')

        const compositions = []

        // Get compositions from public/compositions
        if (fs.existsSync(compositionsDir)) {
          const files = fs.readdirSync(compositionsDir).filter(f => f.endsWith('.js'))
          files.forEach(file => {
            const filePath = path.join(compositionsDir, file)
            const stat = fs.statSync(filePath)
            const content = fs.readFileSync(filePath, 'utf-8')

            // Extract metadata from comments
            const titleMatch = content.match(/^\/\/\s*(.+)/m)
            const bpmMatch = content.match(/setcpm\((\d+)\)/i) || content.match(/BPM[:\s]+(\d+)/i)
            const keyMatch = content.match(/Key[:\s]+([A-G][#b]?\s*\w*)/i)

            compositions.push({
              id: file.replace('.js', ''),
              name: titleMatch ? titleMatch[1].trim() : file.replace('.js', ''),
              file: `/compositions/${file}`,
              source: 'local',
              bpm: bpmMatch ? parseInt(bpmMatch[1], 10) : null,
              key: keyMatch ? keyMatch[1].trim() : null,
              modifiedAt: stat.mtime.toISOString(),
              size: stat.size
            })
          })
        }

        // Get compositions from output/analysis (generated from audio)
        if (fs.existsSync(analysisDir)) {
          const files = fs.readdirSync(analysisDir).filter(f => f.endsWith('.js'))
          files.forEach(file => {
            // Skip if already in local compositions
            if (compositions.some(c => c.id === file.replace('.js', ''))) return

            const filePath = path.join(analysisDir, file)
            const stat = fs.statSync(filePath)
            const content = fs.readFileSync(filePath, 'utf-8')

            // Try to load matching JSON for richer metadata
            const jsonPath = filePath.replace('.js', '_analysis.json')
            let metadata = {}
            if (fs.existsSync(jsonPath)) {
              try {
                metadata = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
              } catch {
                // JSON parse failed, use defaults
              }
            }

            const titleMatch = content.match(/^\/\/\s*Generated from[:\s]+(.+)/m)
            const bpmMatch = content.match(/setcpm\((\d+)\)/i)
            const keyMatch = content.match(/Key[:\s]+([A-G][#b]?\s*\w*)/i)

            compositions.push({
              id: file.replace('.js', ''),
              name: titleMatch ? `Generated: ${titleMatch[1].trim()}` : file.replace('.js', ''),
              file: `/api/analysis/${file}`,
              source: 'generated',
              bpm: metadata.bpm || (bpmMatch ? parseInt(bpmMatch[1], 10) : null),
              key: metadata.key ? `${metadata.key} ${metadata.mode || ''}`.trim() : (keyMatch ? keyMatch[1].trim() : null),
              duration: metadata.duration_seconds || null,
              modifiedAt: stat.mtime.toISOString(),
              size: stat.size
            })
          })
        }

        // Sort by modified date, newest first
        compositions.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(compositions))
      })

      // GET /api/analysis/:file - serve generated compositions
      server.middlewares.use('/api/analysis', (req, res) => {
        const filename = req.url.replace(/^\//, '')
        const analysisDir = path.resolve(__dirname, '../output/analysis')
        const filePath = path.join(analysisDir, filename)

        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/javascript')
          res.end(fs.readFileSync(filePath, 'utf-8'))
        } else {
          res.statusCode = 404
          res.end('Not found')
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [compositionsApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['api.viernes.cc', 'localhost', '127.0.0.1'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        generator: resolve(__dirname, 'generator.html'),
      },
    },
  },
  publicDir: 'public',
})
