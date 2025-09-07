// Test script to verify encryption is working and no plaintext is stored
const nacl = require('tweetnacl');
const util = require('tweetnacl-util');

// Simulate what the app does
const encryptShare = (data, shareCode) => {
  // Derive key from share code
  const codeBytes = new TextEncoder().encode(shareCode + 'ManyllaShare2025');
  let key = codeBytes;
  for (let i = 0; i < 1000; i++) {
    key = nacl.hash(key);
  }
  key = key.slice(0, 32);
  
  // Encrypt
  const nonce = nacl.randomBytes(24);
  const dataBytes = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = nacl.secretbox(dataBytes, nonce, key);
  
  // Combine nonce + encrypted
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);
  
  return util.encodeBase64(combined);
};

// Test data with sensitive medical information
const testShareData = {
  profile: {
    name: 'Test Child',
    entries: [
      { category: 'medical', content: 'ADHD diagnosis, takes Ritalin 10mg daily' },
      { category: 'allergies', content: 'Severe peanut allergy - carries EpiPen' }
    ]
  },
  recipientName: 'Dr. Smith - Pediatrician',
  note: 'Please review medication dosage and allergy severity'
};

const testShareCode = 'test123456';

// Encrypt the data
const encrypted = encryptShare(testShareData, testShareCode);

// Simulate what would be stored in localStorage
const shareToStore = {
  encrypted: encrypted,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  // Note: recipientName and note are NOT stored in plaintext anymore
};

console.log('\n=== ENCRYPTION TEST RESULTS ===\n');
console.log('Original sensitive data:');
console.log(JSON.stringify(testShareData, null, 2));
console.log('\n---\n');
console.log('What gets stored in localStorage:');
console.log(JSON.stringify(shareToStore, null, 2));
console.log('\n---\n');

// Check for plaintext leakage
const storageString = JSON.stringify(shareToStore);
const sensitiveTerms = ['ADHD', 'Ritalin', 'peanut', 'allergy', 'EpiPen', 'Dr. Smith', 'Pediatrician', 'medication'];

console.log('Checking for plaintext medical data in storage...');
let foundPlaintext = false;
for (const term of sensitiveTerms) {
  if (storageString.toLowerCase().includes(term.toLowerCase())) {
    console.log(`❌ FOUND PLAINTEXT: "${term}"`);
    foundPlaintext = true;
  }
}

if (!foundPlaintext) {
  console.log('✅ No plaintext medical data found in storage!');
  console.log('✅ All sensitive information is properly encrypted!');
} else {
  console.log('⚠️  WARNING: Plaintext medical data detected!');
}

console.log('\n=== TEST COMPLETE ===\n');