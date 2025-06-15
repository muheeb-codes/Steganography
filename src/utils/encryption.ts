// Basic XOR encryption for demonstration purposes
// In a production environment, use a proper encryption library

// Function to encrypt data using XOR with password
export const encryptData = async (
  data: string,
  password: string
): Promise<string> => {
  if (!password) return data;
  
  try {
    // Generate a key from the password using a simple hash
    const key = await simpleHash(password);
    
    // XOR encrypt
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      // XOR the character code with the corresponding byte from the key
      const charCode = data.charCodeAt(i);
      const keyByte = key[i % key.length];
      const encryptedChar = String.fromCharCode(charCode ^ keyByte);
      encrypted += encryptedChar;
    }
    
    // Return base64 encoded result
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Function to decrypt data
export const decryptData = async (
  encryptedData: string,
  password: string
): Promise<string> => {
  if (!password) return encryptedData;
  
  try {
    // Decode from base64
    const encrypted = atob(encryptedData);
    
    // Generate the same key from the password
    const key = await simpleHash(password);
    
    // XOR decrypt
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i);
      const keyByte = key[i % key.length];
      const decryptedChar = String.fromCharCode(charCode ^ keyByte);
      decrypted += decryptedChar;
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data. Incorrect password?');
  }
};

// A simple string hashing function to generate key bytes
const simpleHash = async (str: string): Promise<Uint8Array> => {
  // For a real application, use a proper cryptographic hash function
  // This is a simple demonstration
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  
  // Use the Web Crypto API for hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
};