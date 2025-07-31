// Utility functions for hashing sensitive credential data
// Using Web Crypto API for secure hashing

/**
 * Hash a string using SHA-256
 * @param text - The text to hash
 * @returns Promise<string> - The hashed string in hex format
 */
export async function hashString(text: string): Promise<string> {
  if (!text || text.trim() === '') {
    return ''
  }
  
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(text.trim())
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    console.log(`Hashed ${text.length} characters successfully`)
    return hashHex
  } catch (error) {
    console.error('Error hashing string:', error)
    throw new Error(`Failed to hash string: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Hash multiple credential fields
 * @param credentials - Object containing credential fields to hash
 * @returns Promise<object> - Object with hashed credential fields
 */
export async function hashCredentials(credentials: {
  platform_email?: string
  platform_password?: string
  platform_username?: string
  platform_phone?: string
}): Promise<{
  platform_email?: string
  platform_password?: string
  platform_username?: string
  platform_phone?: string
}> {
  try {
    console.log('Starting credential hashing for fields:', Object.keys(credentials))
    const hashedCredentials: any = {}
    
    if (credentials.platform_email) {
      console.log('Hashing platform_email...')
      hashedCredentials.platform_email = await hashString(credentials.platform_email)
    }
    
    if (credentials.platform_password) {
      console.log('Hashing platform_password...')
      hashedCredentials.platform_password = await hashString(credentials.platform_password)
    }
    
    if (credentials.platform_username) {
      console.log('Hashing platform_username...')
      hashedCredentials.platform_username = await hashString(credentials.platform_username)
    }
    
    if (credentials.platform_phone) {
      console.log('Hashing platform_phone...')
      hashedCredentials.platform_phone = await hashString(credentials.platform_phone)
    }
    
    console.log('Credential hashing completed successfully')
    return hashedCredentials
  } catch (error) {
    console.error('Error in hashCredentials:', error)
    throw new Error(`Failed to hash credentials: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Verify if a plain text matches a hashed value
 * @param plainText - The plain text to verify
 * @param hashedValue - The hashed value to compare against
 * @returns Promise<boolean> - True if they match, false otherwise
 */
export async function verifyHash(plainText: string, hashedValue: string): Promise<boolean> {
  if (!plainText || !hashedValue) {
    return false
  }
  
  const hashedPlainText = await hashString(plainText)
  return hashedPlainText === hashedValue
}
