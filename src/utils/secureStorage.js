import CryptoJS from 'crypto-js';

class SecureStorage {
  constructor() {
    // Tạo secret key từ nhiều nguồn để khó đoán
    this.secretKey = this.generateSecretKey();
    this.integrityKey = this.generateIntegrityKey();
  }

  generateSecretKey() {
    // Combine multiple browser fingerprints
    const canvas = this.getCanvasFingerprint();
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const userAgent = navigator.userAgent.slice(0, 50); // Truncate to avoid too long
    
    return CryptoJS.SHA256(`${canvas}-${screenInfo}-${timezone}-${language}-${userAgent}`).toString();
  }

  generateIntegrityKey() {
    // Different key for integrity checking
    const hardwareInfo = `${navigator.hardwareConcurrency}-${navigator.deviceMemory || 'unknown'}`;
    const platform = navigator.platform;
    return CryptoJS.SHA256(`integrity-${hardwareInfo}-${platform}-${this.secretKey}`).toString();
  }

  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 50;
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('SecureTest123!@#', 2, 2);
      
      return CryptoJS.SHA256(canvas.toDataURL()).toString().slice(0, 16);
    } catch {
      return 'fallback-canvas';
    }
  }

  createDataPacket(data, testId, timestamp = Date.now()) {
    const packet = {
      data,
      testId,
      timestamp,
      sessionId: this.getSessionId(),
      checksum: CryptoJS.SHA256(JSON.stringify(data) + testId + timestamp).toString()
    };

    // Add integrity hash
    packet.integrity = CryptoJS.HmacSHA256(JSON.stringify(packet), this.integrityKey).toString();
    
    return packet;
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = CryptoJS.SHA256(
        `${Date.now()}-${Math.random()}-${performance.now()}`
      ).toString().slice(0, 16);
    }
    return this.sessionId;
  }

  encrypt(data, testId) {
    try {
      const timestamp = Date.now();
      const packet = this.createDataPacket(data, testId, timestamp);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(packet), this.secretKey).toString();
      
      // Store with additional obfuscation
      const obfuscated = this.obfuscateData(encrypted);
      return obfuscated;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  decrypt(encryptedData, testId) {
    try {
      if (!encryptedData) return null;
      
      // Deobfuscate first
      const deobfuscated = this.deobfuscateData(encryptedData);
      
      const decrypted = CryptoJS.AES.decrypt(deobfuscated, this.secretKey);
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedStr) {
        throw new Error('Decryption failed');
      }
      
      const packet = JSON.parse(decryptedStr);
      
      // Verify integrity
      if (!this.verifyIntegrity(packet)) {
        throw new Error('Data integrity check failed');
      }
      
      // Verify test ID
      if (packet.testId !== testId) {
        throw new Error('Test ID mismatch');
      }
      
      // Check timestamp (data shouldn't be older than 24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - packet.timestamp > maxAge) {
        throw new Error('Data expired');
      }
      
      // Verify checksum
      const expectedChecksum = CryptoJS.SHA256(
        JSON.stringify(packet.data) + packet.testId + packet.timestamp
      ).toString();
      
      if (packet.checksum !== expectedChecksum) {
        throw new Error('Data checksum mismatch');
      }
      
      return packet.data;
    } catch (error) {
      console.warn('Data decryption/verification failed:', error.message);
      return null;
    }
  }

  verifyIntegrity(packet) {
    try {
      const { integrity, ...packetWithoutIntegrity } = packet;
      const expectedIntegrity = CryptoJS.HmacSHA256(
        JSON.stringify(packetWithoutIntegrity), 
        this.integrityKey
      ).toString();
      
      return integrity === expectedIntegrity;
    } catch {
      return false;
    }
  }

  obfuscateData(data) {
    // Simple obfuscation to make it less obvious in dev tools
    const parts = data.match(/.{1,50}/g) || [];
    const shuffled = parts.map((part, index) => {
      const shift = (index + 1) % 26;
      return part.split('').map(char => {
        if (char.match(/[a-zA-Z]/)) {
          const code = char.charCodeAt(0);
          const base = code >= 65 && code <= 90 ? 65 : 97;
          return String.fromCharCode(((code - base + shift) % 26) + base);
        }
        return char;
      }).join('');
    });
    
    return btoa(shuffled.join('|'));
  }

  deobfuscateData(obfuscatedData) {
    try {
      const decoded = atob(obfuscatedData);
      const parts = decoded.split('|');
      
      const original = parts.map((part, index) => {
        const shift = (index + 1) % 26;
        return part.split('').map(char => {
          if (char.match(/[a-zA-Z]/)) {
            const code = char.charCodeAt(0);
            const base = code >= 65 && code <= 90 ? 65 : 97;
            return String.fromCharCode(((code - base - shift + 26) % 26) + base);
          }
          return char;
        }).join('');
      });
      
      return original.join('');
    } catch {
      throw new Error('Deobfuscation failed');
    }
  }

  setSecureItem(key, data, testId) {
    const encrypted = this.encrypt(data, testId);
    if (encrypted) {
      localStorage.setItem(key, encrypted);
      return true;
    }
    return false;
  }

  getSecureItem(key, testId) {
    const encrypted = localStorage.getItem(key);
    return this.decrypt(encrypted, testId);
  }

  removeSecureItem(key) {
    localStorage.removeItem(key);
  }

  // Additional security: detect if localStorage was tampered with
  validateStorageIntegrity(key, testId) {
    try {
      const data = this.getSecureItem(key, testId);
      return data !== null;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export default new SecureStorage();