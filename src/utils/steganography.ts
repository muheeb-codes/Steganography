import { encryptData, decryptData } from './encryption';

// Helper function to convert a base64 string to an image element
const base64ToImage = (base64: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
};

// Calculate image capacity for data storage
export const calculateImageCapacity = async (imageDataUrl: string): Promise<{
  total: number;
  used: number;
  percentage: number;
}> => {
  const img = await base64ToImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Calculate available space (3 bits per pixel: RGB)
  const totalBytes = Math.floor((imageData.data.length * 3) / 8);
  
  return {
    total: totalBytes,
    used: 0,
    percentage: 0
  };
};

// Convert string to binary
const textToBinary = (text: string): string => {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    binary += charCode.toString(2).padStart(8, '0');
  }
  return binary;
};

// Convert binary to string
const binaryToText = (binary: string): string => {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    if (byte.length === 8) {
      const charCode = parseInt(byte, 2);
      text += String.fromCharCode(charCode);
    }
  }
  return text;
};

// Encode a message into an image using LSB steganography
export const encodeMessage = async (
  imageDataUrl: string,
  message: string,
  password: string = '',
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Encrypt the message if a password is provided
    const dataToHide = password ? await encryptData(message, password) : message;
    
    // Get length of data for embedding
    const dataLength = dataToHide.length;
    const binaryData = textToBinary(dataLength.toString() + '|' + dataToHide);
    
    // Load the image
    const img = await base64ToImage(imageDataUrl);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Draw image
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate available space
    const maxBits = Math.floor(data.length * 0.75);
    if (binaryData.length > maxBits) {
      throw new Error('Message too large for this image');
    }
    
    // Embed signature
    const signature = textToBinary('STEG');
    let pixelIndex = 0;
    
    for (let i = 0; i < signature.length; i++) {
      data[pixelIndex] = (data[pixelIndex] & 0xFE) | parseInt(signature[i]);
      pixelIndex++;
    }
    
    // Embed message
    const totalSteps = binaryData.length;
    for (let i = 0; i < binaryData.length; i++) {
      if (pixelIndex >= data.length) break;
      
      data[pixelIndex] = (data[pixelIndex] & 0xFE) | parseInt(binaryData[i]);
      pixelIndex++;
      
      if (onProgress && i % 1000 === 0) {
        onProgress(i / totalSteps);
      }
    }
    
    // Update progress to 100%
    if (onProgress) {
      onProgress(1);
    }
    
    // Update canvas
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error encoding message:', error);
    throw error;
  }
};

// Decode a message from an image
export const decodeMessage = async (
  imageDataUrl: string,
  password: string = '',
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Load image
    const img = await base64ToImage(imageDataUrl);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Draw image
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Extract signature
    let extractedSignature = '';
    let pixelIndex = 0;
    
    for (let i = 0; i < 32; i++) {
      extractedSignature += (data[pixelIndex] & 1).toString();
      pixelIndex++;
    }
    
    const signatureText = binaryToText(extractedSignature);
    if (signatureText !== 'STEG') {
      throw new Error('No steganographic data found in this image');
    }
    
    // Extract message
    let extractedBinary = '';
    const totalPixels = data.length;
    
    while (pixelIndex < data.length) {
      extractedBinary += (data[pixelIndex] & 1).toString();
      pixelIndex++;
      
      if (onProgress && pixelIndex % 1000 === 0) {
        onProgress(pixelIndex / totalPixels);
      }
      
      if (extractedBinary.includes('|') && extractedBinary.length > 64) {
        break;
      }
    }
    
    // Update progress to 100%
    if (onProgress) {
      onProgress(1);
    }
    
    // Convert to text
    const extractedText = binaryToText(extractedBinary);
    
    // Parse length and message
    const separatorIndex = extractedText.indexOf('|');
    if (separatorIndex === -1) {
      throw new Error('Invalid data format');
    }
    
    const lengthStr = extractedText.substring(0, separatorIndex);
    const expectedLength = parseInt(lengthStr, 10);
    
    let message = extractedText.substring(separatorIndex + 1);
    
    if (message.length >= expectedLength) {
      message = message.substring(0, expectedLength);
      
      // Decrypt if password was provided
      if (password) {
        return await decryptData(message, password);
      }
      
      return message;
    } else {
      throw new Error('Incomplete message data');
    }
  } catch (error) {
    console.error('Error decoding message:', error);
    throw error;
  }
};