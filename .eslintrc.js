module.exports = {
  extends: [
    "react-app",
    "react-app/jest"
  ],
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    "react-hooks/exhaustive-deps": "warn",
    "testing-library/no-node-access": "error",
    "testing-library/no-container": "error",
    "testing-library/prefer-screen-queries": "error",
    "testing-library/prefer-find-by": "error"
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