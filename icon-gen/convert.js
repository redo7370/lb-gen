#!/usr/bin/env node

/**
 * HTML to PNG Converter
 *
 * Converts all HTML files in the ./html directory to PNG images
 * and saves them in the ./png directory with the same filename.
 *
 * Usage: node convert.js
 *
 * Requirements: puppeteer
 * Install: npm install puppeteer
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const HTML_DIR = path.join(__dirname, 'html')
const PNG_DIR = path.join(__dirname, 'png')

async function convertHtmlToPng(htmlPath, pngPath) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Read HTML file
    const htmlContent = await fs.readFile(htmlPath, 'utf-8')

    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    })

    // Get dimensions from the HTML element
    const dimensions = await page.evaluate(() => {
      const element = document.documentElement
      return {
        width: element.scrollWidth,
        height: element.scrollHeight,
      }
    })

    // Set viewport to match content
    await page.setViewport({
      width: dimensions.width,
      height: dimensions.height,
      deviceScaleFactor: 2, // Higher quality
    })

    // Take screenshot
    await page.screenshot({
      path: pngPath,
      type: 'png',
      omitBackground: true, // Transparent background
    })

    console.log(`✅ Converted: ${path.basename(htmlPath)} → ${path.basename(pngPath)}`)
  } catch (error) {
    console.error(`❌ Error converting ${path.basename(htmlPath)}:`, error.message)
  } finally {
    await browser.close()
  }
}

async function main() {
  try {
    // Ensure directories exist
    await fs.mkdir(HTML_DIR, { recursive: true })
    await fs.mkdir(PNG_DIR, { recursive: true })

    // Read all HTML files
    const files = await fs.readdir(HTML_DIR)
    const htmlFiles = files.filter((file) => file.endsWith('.html'))

    if (htmlFiles.length === 0) {
      console.log('⚠️  No HTML files found in ./html directory')
      return
    }

    console.log(`🔄 Converting ${htmlFiles.length} HTML file(s)...\n`)

    // Convert each file
    for (const htmlFile of htmlFiles) {
      const htmlPath = path.join(HTML_DIR, htmlFile)
      const pngFile = htmlFile.replace('.html', '.png')
      const pngPath = path.join(PNG_DIR, pngFile)

      await convertHtmlToPng(htmlPath, pngPath)
    }

    console.log(`\n✨ Done! Converted ${htmlFiles.length} file(s)`)
    console.log(`📁 Output directory: ${PNG_DIR}`)
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

main()
