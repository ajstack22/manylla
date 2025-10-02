module.exports = {
  extends: [
    "react-app",
    "react-app/jest"
  ],
  plugins: [
    "security",
    "no-secrets"
  ],
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    "react-hooks/exhaustive-deps": "warn",
    "testing-library/no-node-access": "error",
    "testing-library/no-container": "error",
    "testing-library/prefer-screen-queries": "error",
    "testing-library/prefer-find-by": "error",

    // Security rules
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-possible-timing-attacks": "warn",

    // Prevent secrets in code
    "no-secrets/no-secrets": ["error", {
      "tolerance": 4.5,
      "ignoreContent": [
        "^REACT_APP_",
        "^PUBLIC_",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "abcdefghijklmnopqrstuvwxyz",
        "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
      ]
    }],

    // Additional security
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error"
  },
  settings: {
    "import/resolver": {
      "babel-module": {
        alias: {
          "@components": "./src/components",
          "@services": "./src/services",
          "@context": "./src/context",
          "@hooks": "./src/hooks",
          "@utils": "./src/utils",
          "@screens": "./src/screens",
          "@navigation": "./src/navigation",
          "@types": "./src/types",
          "@constants": "./src/constants"
        }
      }
    }
  }
};