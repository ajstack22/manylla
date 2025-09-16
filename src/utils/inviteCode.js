/**
 * Invite Code Utilities for Manylla Sync
 *
 * Generates and validates user-friendly 8-character invite codes
 * FormatXXX-XXXX (avoiding confusing characters)
 */

// Character set excluding confusing characters (0/O, 1/I/L)
const INVITE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Generate a random invite code in format XXXX-XXXX
 */
export function generateInviteCode() {
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) {
      code += "-";
    }
    const randomIndex = Math.floor(Math.random() * INVITE_CHARS.length);
    code += INVITE_CHARS[randomIndex];
  }
  return code;
}

/**
 * Validate invite code format
 */
export function validateInviteCode(code) {
  // Remove any spaces and convert to uppercase
  const cleanCode = code.trim().toUpperCase();

  // Check formatXXX-XXXX
  const regex = new RegExp(`^[${INVITE_CHARS}]{4}-[${INVITE_CHARS}]{4}$`);
  return regex.test(cleanCode);
}

/**
 * Clean/normalize an invite code for comparison
 */
export function normalizeInviteCode(code) {
  return code.trim().toUpperCase().replace(/\s/g, "");
}

/**
 * Generate a shareable invite URL
 */
export function generateInviteUrl(inviteCode, recoveryPhrase, baseUrl) {
  const origin = baseUrl || window.location.origin;
  // URL format: /sync/ABCD-1234#recoveryPhrase
  return `${origin}/sync/${inviteCode}#${recoveryPhrase}`;
}

/**
 * Parse invite code and recovery phrase from URL
 */
export function parseInviteUrl(pathname, hash) {
  // Extract invite code from pathname: /sync/ABCD-1234
  const match = pathname.match(/\/sync\/([A-Z0-9]{4}-[A-Z0-9]{4})/i);
  const inviteCode = match ? match[1].toUpperCase() : null;

  // Extract recovery phrase from hash
  const recoveryPhrase = hash.startsWith("#") ? hash.substring(1) : null;

  return { inviteCode, recoveryPhrase };
}

/**
 * Store invite code data in local storage
 */
export function storeInviteCode(inviteCode, syncId, recoveryPhrase) {
  try {
    const invites = JSON.parse(localStorage.getItem("manylla_invites") || "{}");
    invites[inviteCode] = {
      syncId,
      recoveryPhrase,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    localStorage.setItem("manylla_invites", JSON.stringify(invites));
  } catch (error) {
    // Protect invite code storage warnings in production
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to store invite code:", error);
    }
  }
}

/**
 * Retrieve invite code data from local storage
 */
export function getInviteCode(inviteCode) {
  try {
    const invites = JSON.parse(localStorage.getItem("manylla_invites") || "{}");
    const normalizedCode = normalizeInviteCode(inviteCode);
    const invite = invites[normalizedCode];

    if (!invite) {
      return null;
    }

    // Check if expired
    if (invite.expiresAt < Date.now()) {
      // Clean up expired invite - use normalized code
      delete invites[normalizedCode];
      localStorage.setItem("manylla_invites", JSON.stringify(invites));
      return null;
    }

    return {
      syncId: invite.syncId,
      recoveryPhrase: invite.recoveryPhrase,
    };
  } catch (error) {
    // Protect invite code retrieval warnings in production
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to retrieve invite code:", error);
    }
    return null;
  }
}

/**
 * Clean up expired invite codes
 */
export function cleanupExpiredInvites() {
  try {
    const invites = JSON.parse(localStorage.getItem("manylla_invites") || "{}");
    const now = Date.now();

    Object.keys(invites).forEach((code) => {
      if (invites[code].expiresAt < now) {
        delete invites[code];
      }
    });

    localStorage.setItem("manylla_invites", JSON.stringify(invites));
  } catch (error) {
    // Protect invite code cleanup warnings in production
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to cleanup expired invites:", error);
    }
    // Fallback: store empty object
    try {
      localStorage.setItem("manylla_invites", "{}");
    } catch (storageError) {
      // Ignore if storage is completely unavailable
    }
  }
}
