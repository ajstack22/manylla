/**
 * Example: Creating a Profile in Manylla
 *
 * This example demonstrates how to create a new profile with encrypted data.
 * For production use, ensure all data is properly validated and sanitized.
 */

// Import required services
import { ProfileService } from '../src/services/ProfileService';
import { EncryptionService } from '../src/services/sync/manyllaEncryptionService';

/**
 * Create a new profile with medical information
 * @returns {Promise<Object>} Created profile object
 */
async function createMedicalProfile() {
  try {
    // Initialize services
    const profileService = new ProfileService();
    const encryptionService = new EncryptionService();

    // Create profile data
    const profileData = {
      name: 'Example Child',
      birthDate: '2015-03-15',
      photo: null, // Can be base64 encoded image
      quickInfo: {
        bloodType: 'O+',
        allergies: 'Peanuts, Tree nuts',
        medications: 'Albuterol inhaler as needed',
        emergencyContact: 'Mom: (555) 123-4567'
      },
      categories: [
        {
          id: 'medical',
          name: 'Medical Information',
          icon: '🏥',
          entries: [
            {
              title: 'Primary Care Physician',
              content: 'Dr. Sarah Johnson\nPediatric Associates\n(555) 987-6543',
              date: new Date().toISOString()
            },
            {
              title: 'Diagnoses',
              content: 'Asthma (moderate persistent)\nFood allergies (severe)',
              date: new Date().toISOString()
            }
          ]
        },
        {
          id: 'education',
          name: 'Education',
          icon: '📚',
          entries: [
            {
              title: 'IEP Summary',
              content: 'Accommodations:\n- Extra time on tests\n- Preferential seating\n- Access to nurse for inhaler',
              date: new Date().toISOString()
            }
          ]
        }
      ]
    };

    // Encrypt the profile data
    const encrypted = await encryptionService.encrypt(
      JSON.stringify(profileData)
    );

    // Save the profile
    const savedProfile = await profileService.createProfile({
      ...profileData,
      encrypted: encrypted,
      lastModified: new Date().toISOString()
    });

    console.log('✅ Profile created successfully');
    console.log('Profile ID:', savedProfile.id);

    return savedProfile;

  } catch (error) {
    console.error('❌ Error creating profile:', error);
    throw error;
  }
}

/**
 * Example with error handling and validation
 */
async function createProfileWithValidation(data) {
  // Validate required fields
  if (!data.name || !data.birthDate) {
    throw new Error('Name and birth date are required');
  }

  // Validate birth date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.birthDate)) {
    throw new Error('Birth date must be in YYYY-MM-DD format');
  }

  // Validate emergency contact
  if (data.quickInfo && !data.quickInfo.emergencyContact) {
    console.warn('⚠️ No emergency contact provided');
  }

  // Create the profile
  return await createMedicalProfile();
}

// Example usage
if (require.main === module) {
  createMedicalProfile()
    .then(profile => {
      console.log('Profile created:', profile.name);
    })
    .catch(error => {
      console.error('Failed to create profile:', error);
    });
}

export { createMedicalProfile, createProfileWithValidation };