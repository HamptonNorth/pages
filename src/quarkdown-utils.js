// version 10.0 Gemini 2.0 Flash
// quarkdown-utils.js
import { readdir, writeFile, readFile, mkdir, rm, copyFile, stat } from 'node:fs/promises'
import { join, basename, resolve, dirname } from 'node:path'
import { existsSync } from 'node:fs'

function stripFrontMatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return text
  return text.replace(match[0], '').trim()
}

async function findIndexHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      const found = await findIndexHtml(fullPath)
      if (found) return found
    } else if (entry.name === 'index.html') {
      return fullPath
    }
  }
  return null
}

/**
 * CSS REWRITER
 */
async function processAndCopyCss(src, dest) {
  let css = await readFile(src, 'utf-8')
  css = css.replace(/body\.quarkdown/g, '.quarkdown-scope')
  css = css.replace(/\.quarkdown/g, '.quarkdown-scope')
  await writeFile(dest, css)
}

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true })
  const entries = await readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      if (entry.name.endsWith('.css')) await processAndCopyCss(srcPath, destPath)
      else await copyFile(srcPath, destPath)
    }
  }
}

export async function compileSingleFile(filePath) {
  // 1. INCREMENTAL BUILD CHECK
  const finalOutputPath = filePath.replace('.source.qd', '.html')
  try {
    if (existsSync(finalOutputPath)) {
      const sourceStats = await stat(filePath)
      const destStats = await stat(finalOutputPath)

      // If HTML is newer than Source (with 1s buffer), skip
      if (destStats.mtimeMs > sourceStats.mtimeMs - 1000) {
        // console.log(`⏩ Up to date: ${basename(filePath)}`);
        return
      }
    }
  } catch (e) {
    /* ignore stat errors, proceed to compile */
  }

  const timestamp = Date.now()
  const projectRoot = resolve('.')
  const buildDir = join(projectRoot, '.cache', `qd_build_${timestamp}`)
  const tempQdPath = join(buildDir, 'main.qd')

  const publicStylesDir = join(projectRoot, 'public', 'styles', 'quarkdown')
  const publicScriptsDir = join(projectRoot, 'public', 'scripts', 'quarkdown')

  try {
    if (!existsSync(join(projectRoot, '.cache'))) await mkdir(join(projectRoot, '.cache'))
    await mkdir(buildDir)

    const content = await Bun.file(filePath).text()
    const body = stripFrontMatter(content)
    await writeFile(tempQdPath, body)

    let cmd = []
    const localJar = resolve('./bin/quarkdown.jar')
    const localBin = resolve('./bin/quarkdown')
    const globalBin1 = '/usr/local/bin/quarkdown'
    const globalBin2 = '/opt/quarkdown/bin/quarkdown'

    if (existsSync(localJar)) cmd = ['java', '-jar', localJar, 'c', 'main.qd']
    else if (existsSync(localBin)) cmd = [localBin, 'c', 'main.qd']
    else if (existsSync(globalBin1)) cmd = [globalBin1, 'c', 'main.qd']
    else if (existsSync(globalBin2)) cmd = [globalBin2, 'c', 'main.qd']
    else cmd = ['quarkdown', 'c', 'main.qd']

    const proc = Bun.spawn(cmd, { cwd: buildDir, stdout: 'pipe', stderr: 'pipe' })
    const exitCode = await proc.exited
    const stderr = await new Response(proc.stderr).text()

    if (exitCode !== 0) {
      console.warn(`⚠️ Quarkdown failed for ${basename(filePath)}`)
      if (stderr) console.warn(stderr)
      await safeDelete(buildDir)
      return
    }

    const indexPath = await findIndexHtml(buildDir)
    if (!indexPath) {
      console.warn(`⚠️ No index.html found in build output.`)
      await safeDelete(buildDir)
      return
    }

    const outputRoot = dirname(indexPath)

    // Always refresh assets on recompile to be safe
    if (existsSync(join(outputRoot, 'theme')))
      await copyDir(join(outputRoot, 'theme'), publicStylesDir)
    if (existsSync(join(outputRoot, 'script')))
      await copyDir(join(outputRoot, 'script'), publicScriptsDir)

    const fullHtml = await readFile(indexPath, 'utf-8')
    let cleanHtml = fullHtml

    const mainMatch = fullHtml.match(/<main[^>]*>([\s\S]*)<\/main>/i)
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)

    if (mainMatch && mainMatch[1]) {
      cleanHtml = `<div class="quarkdown-content">${mainMatch[1].trim()}</div>`
    } else if (bodyMatch && bodyMatch[1]) {
      cleanHtml = `<div class="quarkdown-content">${bodyMatch[1].trim()}</div>`
    }

    // Scoping
    let docClasses = 'quarkdown-scope'
    const bodyTag = fullHtml.match(/<body([^>]*)>/i)
    if (bodyTag && bodyTag[1]) {
      const classMatch = bodyTag[1].match(/class=["']([^"']*)["']/)
      if (classMatch && classMatch[1]) {
        docClasses = classMatch[1].replace('quarkdown', 'quarkdown-scope')
      }
    }

    cleanHtml = `<div class="${docClasses}">${cleanHtml}</div>`

    await writeFile(finalOutputPath, cleanHtml)
    console.log(`✅ Compiled: ${basename(filePath)}`)

    await safeDelete(buildDir)
  } catch (e) {
    console.error(`❌ Error compiling ${basename(filePath)}:`, e.message)
    await safeDelete(buildDir)
  }
}

async function safeDelete(path) {
  try {
    if (existsSync(path)) await rm(path, { recursive: true, force: true })
  } catch (e) {}
}

export async function compileQuarkdownFiles(rootDir = './public/pages') {
  console.log('🔨 Scanning for Quarkdown files...')
  await mkdir('public/styles/quarkdown', { recursive: true })
  await mkdir('public/scripts/quarkdown', { recursive: true })

  async function scanDir(dir) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
          if (entry.name === '.cache' || entry.name === 'output') continue
          await scanDir(fullPath)
        } else if (entry.name.endsWith('.source.qd')) {
          await compileSingleFile(fullPath)
        }
      }
    } catch (e) {}
  }
  await scanDir(rootDir)
  console.log('🏁 Quarkdown scan finished.')
}
