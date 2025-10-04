// jest.config.js (at root)
const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],  // Targets root /tests/ and subfolders
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: ['/node_modules/'],
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {  // Array format fixes deprecation
      tsconfig: path.resolve(__dirname, 'tsconfig.json')  // Root tsconfig with types
    }]
  },
  setupFilesAfterEnv: ["<rootDir>/tests/base/jest.setup.js"],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
    testSequencer: './tests/base/test-sequencer.js',
};