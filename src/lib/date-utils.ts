// Date utilities that ensure consistent server/client rendering
// to prevent hydration mismatches

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  
  // Use a consistent format that doesn't depend on locale
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours()
  const minutes = d.getMinutes()
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const monthName = monthNames[month - 1]
  
  return `${monthName} ${day}, ${year} at ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date)
  
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  
  return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`
}

export function formatNumber(num: number): string {
  // Use a consistent number formatting that doesn't depend on locale
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toString()
  }
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}
