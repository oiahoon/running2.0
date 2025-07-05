/**
 * Smart text truncation utilities for mobile-friendly display
 */

/**
 * Truncate text intelligently, preserving meaningful parts
 * @param text - The text to truncate
 * @param maxLength - Maximum length for mobile
 * @param preserveEnd - Whether to preserve the end of the text (useful for addresses)
 */
export function smartTruncate(text: string, maxLength: number = 30, preserveEnd: boolean = false): string {
  if (text.length <= maxLength) {
    return text
  }

  if (preserveEnd) {
    // For addresses like "Chengdu, Business Plaza / Chengdu, Dongfeng Electric Power Community"
    // Try to preserve the most important part (usually the end)
    const parts = text.split(/[,/]/).map(part => part.trim())
    if (parts.length > 1) {
      // Take the last meaningful part
      const lastPart = parts[parts.length - 1]
      if (lastPart.length <= maxLength) {
        return lastPart
      }
    }
  }

  // Standard truncation
  return text.substring(0, maxLength) + '...'
}

/**
 * Truncate address specifically for mobile display
 * @param address - The address string
 * @param maxLength - Maximum length
 */
export function truncateAddress(address: string, maxLength: number = 25): string {
  if (address.length <= maxLength) {
    return address
  }

  // For addresses with multiple parts separated by comma or slash
  const parts = address.split(/[,/]/).map(part => part.trim())
  
  if (parts.length > 1) {
    // Try to find the most specific part (usually contains building/area name)
    const specificParts = parts.filter(part => 
      part.length > 3 && 
      !part.match(/^(City|District|Province|State)$/i)
    )
    
    if (specificParts.length > 0) {
      const bestPart = specificParts[specificParts.length - 1]
      if (bestPart.length <= maxLength) {
        return bestPart
      }
      return bestPart.substring(0, maxLength - 3) + '...'
    }
  }

  // Fallback to simple truncation
  return address.substring(0, maxLength - 3) + '...'
}

/**
 * Get responsive text based on screen size
 * @param text - Original text
 * @param mobileLength - Length for mobile
 * @param tabletLength - Length for tablet
 */
export function getResponsiveText(text: string, mobileLength: number = 25, tabletLength: number = 40): {
  mobile: string
  tablet: string
  desktop: string
} {
  return {
    mobile: smartTruncate(text, mobileLength),
    tablet: smartTruncate(text, tabletLength),
    desktop: text
  }
}
