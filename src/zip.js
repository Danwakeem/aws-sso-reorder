import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const manifest = require('../build/manifest.json')

const directoryToZip = 'build'
const outputZipFile = `package/${manifest.name.replaceAll(' ', '-')}-${manifest.version}.zip`
const outputDir = path.dirname(outputZipFile)

// Check if the output zip file exists and remove it if it does
if (fs.existsSync(outputZipFile)) {
  fs.unlinkSync(outputZipFile)
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.sync
// Create a file to stream archive data to.
const output = fs.createWriteStream(outputZipFile)
const archive = archiver('zip', {
  zlib: { level: 9 }, // Sets the compression level.
})

// Listen for all archive data to be written
output.on('close', () => {
  console.log(`${archive.pointer()} total bytes`)
  console.log('Archiver has been finalized and the output file descriptor has closed.')
})

// Good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('File not found:', err)
  } else {
    throw err
  }
})

// Good practice to catch this error explicitly
archive.on('error', (err) => {
  throw err
})

// Pipe archive data to the file
archive.pipe(output)

// Append files from a directory
archive.directory(directoryToZip, false)

// Finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize()
