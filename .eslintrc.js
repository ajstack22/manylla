module.exports = {
  extends: [
    "react-app",
    "react-app/jest"
  ],
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    "react-hooks/exhaustive-deps": "warn"
  },
  settings: {
    "import/resolver": {
      "babel-module": {
        alias: {
          "@platform": "./src/utils/platform",
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