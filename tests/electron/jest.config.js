/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../../tsconfig.test.json',
        isolatedModules: true,
        useESM: false,
      },
    ],
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  collectCoverageFrom: [
    '../../src/main/**/*.ts',
    '!../../src/main/**/*.d.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: false,
    },
  },
};