import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  testMatch: ['<rootDir>/tests/**/*.spec.ts'],

  setupFilesAfterEnv: ['<rootDir>/jest.env.ts'],

  clearMocks: true,
  testTimeout: 60000,

  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
  },
};

export default config;