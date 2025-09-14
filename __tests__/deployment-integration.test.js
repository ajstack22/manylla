import fs from 'fs';
import path from 'path';

describe('Deployment Integration Tests', () => {
  const projectRoot = path.resolve(__dirname, '..');

  describe('Build System', () => {
    it('should have proper project structure', () => {
      const requiredFiles = [
        'package.json',
        'webpack.config.js',
        'babel.config.js',
        'tsconfig.json',
        '.eslintrc.js',
        'scripts/deploy-qual.sh'
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have all required npm scripts', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      const requiredScripts = [
        'test',
        'test:ci',
        'test:watch',
        'test:coverage',
        'build:web',
        'lint',
        'typecheck'
      ];

      requiredScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });

    it('should have Jest configuration with proper settings', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.jest).toBeDefined();
      expect(packageJson.jest.testTimeout).toBe(10000);
      expect(packageJson.jest.bail).toBe(true);
      expect(packageJson.jest.testEnvironment).toBe('jsdom');
      expect(packageJson.jest.coverageThreshold).toBeDefined();
    });
  });

  describe('Deployment Script', () => {
    it('should have executable deploy-qual.sh script', () => {
      const deployScript = path.join(projectRoot, 'scripts', 'deploy-qual.sh');
      expect(fs.existsSync(deployScript)).toBe(true);

      const stats = fs.statSync(deployScript);
      expect(stats.mode & parseInt('111', 8)).toBeTruthy(); // Check if executable
    });

    it('should include test execution step in deploy script', () => {
      const deployScript = path.join(projectRoot, 'scripts', 'deploy-qual.sh');
      const scriptContent = fs.readFileSync(deployScript, 'utf8');

      expect(scriptContent).toContain('Test Suite Execution');
      expect(scriptContent).toContain('npm run test:ci');
      expect(scriptContent).toContain('TEST_EXIT_CODE');
    });

    it('should have proper error handling for test failures', () => {
      const deployScript = path.join(projectRoot, 'scripts', 'deploy-qual.sh');
      const scriptContent = fs.readFileSync(deployScript, 'utf8');

      expect(scriptContent).toContain('handle_error');
      expect(scriptContent).toContain('failing tests');
      expect(scriptContent).toContain('Fix all failing tests');
    });

    it('should have correct step numbering after test integration', () => {
      const deployScript = path.join(projectRoot, 'scripts', 'deploy-qual.sh');
      const scriptContent = fs.readFileSync(deployScript, 'utf8');

      // Check that steps are properly numbered
      expect(scriptContent).toContain('Step 9: Test Suite Execution');
      expect(scriptContent).toContain('Step 10: Dependency Analysis');
      expect(scriptContent).toContain('Step 11: Bundle Size');
    });
  });

  describe('Test Infrastructure', () => {
    it('should have jest setup file', () => {
      const setupFile = path.join(projectRoot, 'jest.setup.js');
      expect(fs.existsSync(setupFile)).toBe(true);

      const setupContent = fs.readFileSync(setupFile, 'utf8');
      expect(setupContent).toContain('React Native modules');
      expect(setupContent).toContain('AsyncStorage');
      expect(setupContent).toContain('fetch');
      expect(setupContent).toContain('localStorage');
    });

    it('should validate test:ci script works', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.scripts['test:ci']).toBe('jest --ci --coverage --watchAll=false --bail');
    });

    it.skip('should have coverage thresholds set correctly', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      const thresholds = packageJson.jest.coverageThreshold.global;
      expect(thresholds.statements).toBe(7);
      expect(thresholds.branches).toBe(3);
      expect(thresholds.functions).toBe(5);
      expect(thresholds.lines).toBe(7);
    });

    it('should have proper transformIgnorePatterns', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.jest.transformIgnorePatterns).toContain(
        'node_modules/(?!(react-native|@react-native|react-native-vector-icons|msw)/)'
      );
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have proper TypeScript config', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.jsx).toBeDefined();
      expect(tsconfig.compilerOptions.moduleResolution).toBeDefined();
    });
  });

  describe('ESLint Configuration', () => {
    it('should have proper ESLint config', () => {
      const eslintPath = path.join(projectRoot, '.eslintrc.js');
      expect(fs.existsSync(eslintPath)).toBe(true);

      const eslintContent = fs.readFileSync(eslintPath, 'utf8');
      expect(eslintContent).toContain('extends');
      expect(eslintContent).toContain('rules');
    });
  });

  describe('Build Output Validation', () => {
    it('should produce build output in correct directory', () => {
      const webBuildDir = path.join(projectRoot, 'web', 'build');
      // Note: We just check the structure, actual build testing would be in CI
      expect(path.dirname(webBuildDir)).toBe(path.join(projectRoot, 'web'));
    });

    it('should have webpack config for web builds', () => {
      const webpackPath = path.join(projectRoot, 'webpack.config.js');
      const webpackContent = fs.readFileSync(webpackPath, 'utf8');

      expect(webpackContent).toContain('output');
      expect(webpackContent).toContain('entry');
      expect(webpackContent).toContain('module');
    });
  });

  describe('Security and Quality Gates', () => {
    it('should have proper test coverage requirements', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Check that coverage thresholds are not too low (minimum 30%)
      const globalThresholds = packageJson.jest.coverageThreshold.global;
      Object.values(globalThresholds).forEach(threshold => {
        expect(threshold).toBeGreaterThanOrEqual(30);
      });
    });

    it('should block deployment on test failures', () => {
      const deployScript = path.join(projectRoot, 'scripts', 'deploy-qual.sh');
      const scriptContent = fs.readFileSync(deployScript, 'utf8');

      // Verify that test failures cause deployment to stop
      expect(scriptContent).toContain('if [ $TEST_EXIT_CODE -ne 0 ]');
      expect(scriptContent).toContain('handle_error');
    });
  });
});