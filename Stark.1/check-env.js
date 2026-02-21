// Environment Variable Checker
// Run this with: node check-env.js

console.log('='.repeat(60))
console.log('Environment Variables Check')
console.log('='.repeat(60))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function maskString(str) {
  if (!str) return 'NOT SET'
  if (str.length < 20) return str.substring(0, 4) + '***'
  const start = str.substring(0, 8)
  const end = str.substring(str.length - 8)
  return `${start}...${end}`
}

console.log('\n📋 Checking environment variables:\n')
console.log(`NEXT_PUBLIC_SUPABASE_URL:`)
console.log(`  Value: ${maskString(supabaseUrl)}`)
console.log(`  Status: ${supabaseUrl ? '✅ SET' : '❌ NOT SET'}`)

console.log(`\nNEXT_PUBLIC_SUPABASE_ANON_KEY:`)
console.log(`  Value: ${maskString(supabaseKey)}`)
console.log(`  Status: ${supabaseKey ? '✅ SET' : '❌ NOT SET'}`)

console.log('\n' + '='.repeat(60))

if (!supabaseUrl || !supabaseKey) {
  console.log('\n⚠️  WARNING: Environment variables are missing!')
  console.log('\n📝 Make sure you have created .env.local in the project root with:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your-url')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key')
  console.log('\n💡 After creating .env.local, restart your dev server.')
  process.exit(1)
} else {
  console.log('\n✅ All environment variables are set correctly!')
  console.log('\n💡 Note: If your Next.js app still shows errors:')
  console.log('   1. Stop the dev server (Ctrl+C)')
  console.log('   2. Delete the .next folder')
  console.log('   3. Run: npm run dev')
}

console.log('\n' + '='.repeat(60))
