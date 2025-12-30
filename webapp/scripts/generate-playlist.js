#!/usr/bin/env node
/**
 * Generate a static playlist.json from compositions directory.
 * Run this before build to create a static API response.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const compositionsDir = path.resolve(__dirname, '../public/compositions')
const outputFile = path.resolve(__dirname, '../public/api/compositions.json')

function generatePlaylist() {
  const compositions = []

  if (!fs.existsSync(compositionsDir)) {
    console.log('No compositions directory found')
    fs.mkdirSync(path.dirname(outputFile), { recursive: true })
    fs.writeFileSync(outputFile, '[]')
    return
  }

  const files = fs.readdirSync(compositionsDir).filter(f => f.endsWith('.js'))

  for (const file of files) {
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
  }

  // Sort by modified date, newest first
  compositions.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })

  // Write static JSON
  fs.writeFileSync(outputFile, JSON.stringify(compositions, null, 2))
  console.log(`Generated ${outputFile} with ${compositions.length} compositions`)
}

generatePlaylist()
