// version 1.0 Gemini 3 Flash
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const requiredDicts = [
  '@cspell/dict-en-gb',
  '@cspell/dict-software-terms',
  '@cspell/dict-node',
  '@cspell/dict-bash',
  '@cspell/dict-html',
  '@cspell/dict-css',
  '@cspell/dict-typescript',
  '@cspell/dict-markdown',
]

console.log('Checking CSpell Dictionaries...')
requiredDicts.forEach((dict) => {
  const path = join(process.cwd(), 'node_modules', dict)
  if (existsSync(path)) {
    console.log(`✅ ${dict} is installed.`)
  } else {
    console.error(`❌ ${dict} is MISSING. Run: bun add ${dict}`)
  }
})
