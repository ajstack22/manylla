/**
 * Example: Using Manylla's Zero-Knowledge Encryption
 *
 * This demonstrates how to encrypt and decrypt data using
 * Manylla's encryption service with recovery phrases.
 */

import { EncryptionService } from '../src/services/sync/manyllaEncryptionService';

/**
 * Generate a new recovery phrase for device sync
 * @returns {string} 32-character hex recovery phrase
 */
function generateRecoveryPhrase() {
  const encryptionService = new EncryptionService();
  const phrase = encryptionService.generateRecoveryPhrase();

  console.log('📝 Generated Recovery Phrase:', phrase);
  console.log('⚠️  Store this securely - it cannot be recovered if lost!');

  return phrase;
}

/**
 * Encrypt sensitive data
 * @param {Object} data - Data to encrypt
 * @param {string} recoveryPhrase - 32-character hex recovery phrase
 * @returns {Promise<string>} Encrypted data string
 */
async function encryptData(data, recoveryPhrase) {
  try {
    const encryptionService = new EncryptionService();

    // Set the recovery phrase
    encryptionService.setRecoveryPhrase(recoveryPhrase);

    // Convert data to JSON string
    const dataString = JSON.stringify(data);

    // Encrypt the data
    const encrypted = await encryptionService.encrypt(dataString);

    console.log('🔐 Data encrypted successfully');
    console.log('Encrypted length:', encrypted.length, 'characters');

    return encrypted;

  } catch (error) {
    console.error('❌ Encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt data
 * @param {string} encryptedData - Encrypted data string
 * @param {string} recoveryPhrase - 32-character hex recovery phrase
 * @returns {Promise<Object>} Decrypted data object
 */
async function decryptData(encryptedData, recoveryPhrase) {
  try {
    const encryptionService = new EncryptionService();

    // Set the recovery phrase
    encryptionService.setRecoveryPhrase(recoveryPhrase);

    // Decrypt the data
    const decrypted = await encryptionService.decrypt(encryptedData);

    // Parse JSON
    const data = JSON.parse(decrypted);

    console.log('🔓 Data decrypted successfully');

    return data;

  } catch (error) {
    console.error('❌ Decryption failed:', error);
    throw error;
  }
}

/**
 * Complete example demonstrating encryption workflow
 */
async function demonstrateEncryption() {
  console.log('=== Manylla Encryption Demo ===\n');

  // 1. Generate recovery phrase
  const recoveryPhrase = generateRecoveryPhrase();

  // 2. Sample sensitive data
  const sensitiveData = {
    medical: {
      conditions: ['Autism Spectrum Disorder', 'ADHD'],
      medications: [
        { name: 'Methylphenidate', dose: '10mg', frequency: 'Daily' }
      ],
      allergies: ['Penicillin', 'Peanuts'],
      bloodType: 'A+'
    },
    contacts: {
      emergency: 'Mom: (555) 123-4567',
      doctor: 'Dr. Smith: (555) 987-6543'
    },
    notes: 'Sensory sensitivities: loud noises, bright lights'
  };

  console.log('\n📋 Original Data:');
  console.log(JSON.stringify(sensitiveData, null, 2));

  // 3. Encrypt the data
  console.log('\n🔐 Encrypting...');
  const encrypted = await encryptData(sensitiveData, recoveryPhrase);

  console.log('\n📦 Encrypted Data (truncated):');
  console.log(encrypted.substring(0, 100) + '...');

  // 4. Simulate storage/transmission
  console.log('\n💾 Data can now be safely stored or transmitted');

  // 5. Decrypt the data
  console.log('\n🔓 Decrypting...');
  const decrypted = await decryptData(encrypted, recoveryPhrase);

  console.log('\n✅ Decrypted Data:');
  console.log(JSON.stringify(decrypted, null, 2));

  // 6. Verify integrity
  const isIdentical = JSON.stringify(sensitiveData) === JSON.stringify(decrypted);
  console.log('\n🔍 Data Integrity Check:', isIdentical ? 'PASSED ✅' : 'FAILED ❌');
}

/**
 * Example: Handling encryption errors
 */
async function demonstrateErrorHandling() {
  const encryptionService = new EncryptionService();
  const validPhrase = generateRecoveryPhrase();
  const invalidPhrase = 'invalid123';

  const data = { test: 'data' };

  // Encrypt with valid phrase
  encryptionService.setRecoveryPhrase(validPhrase);
  const encrypted = await encryptionService.encrypt(JSON.stringify(data));

  // Try to decrypt with wrong phrase
  try {
    encryptionService.setRecoveryPhrase(invalidPhrase);
    await encryptionService.decrypt(encrypted);
  } catch (error) {
    console.log('✅ Correctly rejected invalid recovery phrase');
  }

  // Decrypt with correct phrase
  encryptionService.setRecoveryPhrase(validPhrase);
  const decrypted = await encryptionService.decrypt(encrypted);
  console.log('✅ Successfully decrypted with correct phrase');
}

// Run demo if executed directly
if (require.main === module) {
  demonstrateEncryption()
    .then(() => demonstrateErrorHandling())
    .catch(console.error);
}

export {
  generateRecoveryPhrase,
  encryptData,
  decryptData,
  demonstrateEncryption
};