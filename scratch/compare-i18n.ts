import { pt } from '../src/i18n/dictionaries/pt'
import { en } from '../src/i18n/dictionaries/en'

function compareObjects(obj1: any, obj2: any, path = '') {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  const allKeys = Array.from(new Set([...keys1, ...keys2]))
  
  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key
    
    if (!(key in obj1)) {
      console.log(`[MISSING in PT] ${currentPath}`)
      continue
    }
    
    if (!(key in obj2)) {
      console.log(`[MISSING in EN] ${currentPath}`)
      continue
    }
    
    if (typeof obj1[key] === 'object' && obj1[key] !== null) {
      compareObjects(obj1[key], obj2[key], currentPath)
    } else {
      if (obj1[key] === obj2[key]) {
        const value = obj1[key]
        if (value.length > 3 && !['MoodSpace', 'Spotify', 'YouTube', 'Giphy', 'Instagram', 'Twitter', 'TikTok'].includes(value)) {
           console.log(`[SAME VALUE] ${currentPath}: ${value}`)
        }
      }
    }
  }
}

console.log('Comparing PT and EN dictionaries...')
compareObjects(pt, en)
console.log('Comparison complete.')
