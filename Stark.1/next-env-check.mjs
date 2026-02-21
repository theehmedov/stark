// Next.js Environment Variable Checker (ES Module)
// This loads the .env.local file like Next.js does
// Run this with: node next-env-check.mjs

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('='.repeat(60))
console.log('Next.js Environment Variables Check')
console.log('='.repeat(60))

// Check if .env.local exists
const envLocalPath = join(__dirname, '.env.local')
const envExists = existsSync(envLocalPath)

console.log(`\n📁 Checking for .env.local file...`)
console.log(`   Path: ${envLocalPath}`)
console.log(`   Status: ${envExists ? '✅ EXISTS' : '❌ NOT FOUND'}`)

if (!envExists) {
  console.log('\n❌ ERROR: .env.local file not found!')
  console.log('\n📝 Please create .env.local in the project root with:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://bjsdagwquuontqgvdtdx.supabase.co')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep')
  process.exit(1)
}

// Read and parse .env.local
const envContent = readFileSync(envLocalPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  line = line.trim()
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

function maskString(str) {
  if (!str) return 'NOT SET'
  if (str.length < 20) return str.substring(0, 4) + '***'
  const start = str.substring(0, 8)
  const end = str.substring(str.length - 8)
  return `${start}...${end}`
}

console.log('\n📋 Variables found in .env.local:\n')

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

let allPresent = true

requiredVars.forEach(varName => {
  const value = envVars[varName]
  const isPresent = !!value
  
  console.log(`${varName}:`)
  console.log(`  Value: ${maskString(value)}`)
  console.log(`  Status: ${isPresent ? '✅ SET' : '❌ NOT SET'}`)
  console.log()
  
  if (!isPresent) allPresent = false
})

console.log('='.repeat(60))

if (!allPresent) {
  console.log('\n⚠️  WARNING: Some required variables are missing!')
  console.log('\n📝 Your .env.local should contain:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://bjsdagwquuontqgvdtdx.supabase.co')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep')
  process.exit(1)
} else {
  console.log('\n✅ All required environment variables are present in .env.local!')
  console.log('\n💡 Next steps:')
  console.log('   1. Stop your dev server if running (Ctrl+C)')
  console.log('   2. Delete .next folder: Remove-Item -Recurse -Force .next')
  console.log('   3. Restart: npm run dev')
  console.log('\n   Environment variables are loaded at build time, so restart is required.')
}

console.log('\n' + '='.repeat(60))
