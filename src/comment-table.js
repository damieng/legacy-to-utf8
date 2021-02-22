#!/usr/bin/env node

const fs = require('fs')
const { exit } = require('process')

const skipChars = [' ', '@', ';', '\t']
const log = console.log
log('comment-table v0.1')

if (process.argv.length !== 4) {
    log(`Usage:\tcomment-table table-to-modify NamesList.txt`)
    exit(1)
}

const namesListPath = process.argv.pop()
const tableToModify = process.argv.pop()
const map = createNamesMap(namesListPath)

let updated = 0
const lines = fs.readFileSync(tableToModify, { encoding: 'utf-8' }).toString().split('\n')
for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line[0] != '#') {
        const [position, unicode, comment] = line.split('\t')
        const newName = unicode != '' ? map.get(parseInt(unicode, 16)) : 'UNDEFINED'
        const oldName = comment && comment.split('#')[0].trim()
        if (newName != undefined && newName != oldName) {
            const newLine = `${position}\t${unicode}\t# ${newName}`
            log(newLine + (oldName == '' ? '' : ' (was previously ' + oldName + ')'))
            lines[i] = newLine
            updated++
        }
    }
}
fs.writeFileSync(tableToModify, lines.join('\n'), { encoding: 'utf-8' })
log(` * Updated ${tableToModify} with ${updated} names`)

function createNamesMap(namesListPath) {
    log('Reading conversion table from ' + namesListPath)
    const lines = fs.readFileSync(namesListPath, { encoding: 'utf-8' }).toString().split('\n')
    const map = new Map()
    let idx = 0
    while (idx < lines.length) {
        const line = lines[idx]
        if (line.length > 0 && !skipChars.includes(line[0])) {
            let [unicode, name] = line.split('\t')
            if (name != '<not a character>') {
                if (name == undefined || (name[0] < 'A' || name[0] > 'Z')) {
                    while (idx++ < lines.length) {
                        const parts = lines[idx].split('=')
                        if (parts.length > 1) {
                            name = parts[1].trim()
                            break
                        }
                    }
                }
                map.set(parseInt(unicode, 16), name.trim())
            }
        }
        idx++
    }
    return map
}
