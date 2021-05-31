#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const { exit } = require('process')

const tablePath = path.join(__dirname, 'tables')
const log = console.log
log('tconvert-to-utf8 v0.1')

const args = process.argv

if (args.length < 5) {
    log(`Usage:\tconvert-to-utf8 file-match-glob charset output-directory [--wrap n] [--trim]`)
    const encodings = fs.readdirSync(tablePath)
    log(`\tCharset may be ${encodings.map(e => e.replace('.txt', '')).join(', ')}`)
    log(`\t--wrap n where n defines at which point to add a lf`)
    log(`\t--trim removes whitespace from the end of each line`)
    exit(1)
}

// Skip node junk args
args.shift()
args.shift() 

const matchGlob = args.shift()
const charset = args.shift()
const outPath = args.shift()
let wrap = -1
let trim = false

while (args.length > 0) {
    const switchArg = args.shift()
    switch(switchArg) {
        case '--wrap':
            wrap = parseInt(args.shift())
            break
        case '--trim':
            trim = true
            break
        default:
            log(`\tUnknown option ${switchArg}`)
            exit(1)
    } 
}

const map = createConversionMap(charset)

glob(matchGlob, null, function (er, files) {
    log(`Converting ${files.length} files from ${charset} to utf-8`)
    for (const inName of files) {
        processFile(inName)
    }
})

function processFile(inName) {
    const inBuffer = fs.readFileSync(inName)
    let outStr = ''
    let column = 0
    let lineBuff = ''
    for (var i = 0; i < inBuffer.length; i++) {
        const mapped = map.get(inBuffer[i])
        const outChar = (mapped != null) ? mapped : String.fromCharCode(inBuffer[i])
        if (outChar == '\n' || column + 1 == wrap) {
            if (trim) lineBuff = lineBuff.trimEnd()
            outStr += lineBuff + '\n'
            column = 0
            lineBuff = ''
        }
        else {
            lineBuff += outChar
            column++
        }
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
