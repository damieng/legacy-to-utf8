#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const { exit } = require('process')

const tablePath = path.join(__dirname, 'tables')
const log = console.log
log('tconvert-to-utf8 v0.1')

if (process.argv.length !== 5) {
    log(`Usage:\tconvert-to-utf8 file-match-glob charset output-directory`)
    const encodings = fs.readdirSync(tablePath)
    log(`\tCharset may be ${encodings.map(e => e.replace('.txt', '')).join(', ')}`)
    exit(1)
}

const outPath = process.argv.pop()
const charset = process.argv.pop()
const matchGlob = process.argv.pop()
const map = createConversionMap(charset)

glob(matchGlob, null, function (er, files) {
    log(`Converting ${files.length} files from ${charset} to utf-8`)
    for (const inName of files) {
        processFile(inName)
    }
})

function processFile() {
    const inBuffer = fs.readFileSync(inName)
    let outStr = ''
    for (var i = 0; i < inBuffer.length; i++) {
        const mapped = map.get(inBuffer[i])
        outStr += (mapped != null) ? mapped : String.fromCharCode(inBuffer[i])
    }

    const outName = path.join(outPath, path.basename(inName))
    fs.writeFileSync(outName, outStr, { encoding: 'utf-8' })
    log(` * Converted ${inName} > ${outName}`)
}

function createConversionMap(name) {
    const file = path.join(tablePath, path.basename(name) + '.txt')
    log('Reading conversion table from ' + file)
    const lines = fs.readFileSync(file, { encoding: 'ascii' }).toString().split('\n')
    const map = new Map()
    for (const line of lines) {
        if (!line.startsWith('#')) {
            const parts = line.split('\t')
            if (parts.length > 1) {
                map.set(parseInt(parts[0]), String.fromCharCode(parseInt(parts[1])))
            }
        }
    }
    return map
}
