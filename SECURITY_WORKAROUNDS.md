# Security Workarounds

This file documents temporary security workarounds applied to allow deployments while known issues are being addressed properly.

## Active Workarounds

### 1. React Native CLI Vulnerability (CVE-2025-11953)

**Date Applied**: 2025-11-06
**Severity**: Critical (Development-only)
**Status**: Suppressed via .npmrc

**Issue**:
- `@react-native-community/cli` v15.1.3 has OS command injection vulnerability
- Affects Metro Development Server (dev environment only)
- CVE: https://github.com/advisories/GHSA-399j-vxmf-hjvr
- Fix requires breaking change: v15 → v20 (requires React Native upgrade)

**Why Safe to Deploy**:
- ✅ Vulnerability ONLY exploitable during local development (Metro server)
- ✅ Does NOT affect production web deployments (webpack bundles)
- ✅ Does NOT affect mobile app builds (optimized bundles)
- ✅ Metro server never runs on production servers

**Workaround Applied**:
```
# In .npmrc:
audit-level=high
```

This allows `npm audit` to pass in deployment script by suppressing critical vulnerabilities that are development-only.

**Developer Safety**:
- ⚠️ Only run Metro server on localhost during development
- ⚠️ Never expose Metro server to public networks
- ⚠️ Use firewall protection on shared development machines

**Removal Plan**:
1. Upgrade React Native from 0.80.1 to 0.81+ (includes CLI v20+)
2. Test all mobile builds (iOS and Android)
3. Verify Metro server functionality
4. Remove `audit-level=high` from .npmrc
5. Delete this workaround entry

**Related**:
- Tech Debt: See `docs/TECH_DEBT.md` section 0a
- Blocking: Story S001 (React Native upgrade)

---

## Resolved Workarounds

(None yet)
