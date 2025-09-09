/**
 * Invite Code Utilities for Manylla Sync
 *
 * Generates and validates user-friendly 8-character invite codes
 * Format: XXXX-XXXX (avoiding confusing characters)
 */

// Character set excluding confusing characters (0/O, 1/I/L)
const INVITE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Generate a random invite code in format XXXX-XXXX
 */
export function generateInviteCode(): string {
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
export function validateInviteCode(code: string): boolean {
  // Remove any spaces and convert to uppercase
  const cleanCode = code.trim().toUpperCase();

  // Check format: XXXX-XXXX
  const regex = new RegExp(`^[${INVITE_CHARS}]{4}-[${INVITE_CHARS}]{4}$`);
  return regex.test(cleanCode);
}

/**
 * Clean/normalize an invite code for comparison
 */
export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s/g, "");
}

/**
 * Generate a shareable invite URL
 */
export function generateInviteUrl(
  inviteCode: string,
  recoveryPhrase: string,
): string {
  const baseUrl = window.location.origin;
  // URL format: /sync/ABCD-1234#recoveryPhrase
  return `${baseUrl}/sync/${inviteCode}#${recoveryPhrase}`;
}

/**
 * Parse invite code and recovery phrase from URL
 */
export function parseInviteUrl(
  pathname: string,
  hash: string,
): {
  inviteCode: string | null;
  recoveryPhrase: string | null;
} {
  // Extract invite code from pathname: /sync/ABCD-1234
  const match = pathname.match(/\/sync\/([A-Z0-9]{4}-[A-Z0-9]{4})/i);
  const inviteCode = match ? match[1].toUpperCase() : null;

  // Extract recovery phrase from hash
  const recoveryPhrase = hash.startsWith("#") ? hash.substring(1) : null;

  return { inviteCode, recoveryPhrase };
}

/**
 * Store invite code mapping locally (temporary until server is ready)
 */
export function storeInviteCode(
  inviteCode: string,
  syncId: string,
  recoveryPhrase: string,
): void {
  const invites = JSON.parse(localStorage.getItem("manylla_invites") || "{}");
  invites[inviteCode] = {
    syncId,
    recoveryPhrase,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  localStorage.setItem("manylla_invites", JSON.stringify(invites));
}

/**
 * Retrieve invite code data from local storage
 */
export function getInviteCode(inviteCode: string): {
  syncId: string;
  recoveryPhrase: string;
} | null {
  const invites = JSON.parse(localStorage.getItem("manylla_invites") || "{}");
  const invite = invites[normalizeInviteCode(inviteCode)];

  if (!invite) {
    return null;
  }

  // Check if expired
  if (invite.expiresAt < Date.now()) {
    // Clean up expired invite
    delete invites[inviteCode];
    localStorage.setItem("manylla_invites", JSON.stringify(invites));
    return null;
  }

  return {
    syncId: invite.syncId,
    recoveryPhrase: invite.recoveryPhrase,
  };
}

/**
 * Clean up expired invite codes from local storage
 */
export function cleanupExpiredInvites(): void {
  const invites = JSON.parse(localStorage.getItem("manylla_invites") || "{}");
  const now = Date.now();
  let hasChanges = false;

  Object.keys(invites).forEach((code) => {
    if (invites[code].expiresAt < now) {
      delete invites[code];
      hasChanges = true;
    }
  });

  if (hasChanges) {
    localStorage.setItem("manylla_invites", JSON.stringify(invites));
  }
}

/**
 * Format invite code for display (with spacing for readability)
 */
export function formatInviteCodeForDisplay(code: string): string {
  const normalized = normalizeInviteCode(code);
  if (normalized.length === 9 && normalized[4] === "-") {
    // Add spacing: ABCD - 1234
    return `${normalized.slice(0, 4)} - ${normalized.slice(5)}`;
  }
  return normalized;
}
