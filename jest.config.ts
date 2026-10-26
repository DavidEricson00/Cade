import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  testMatch: ['<rootDir>/tests/**/*.spec.ts'],

  setupFilesAfterEnv: ['<rootDir>/jest.env.ts'],

  clearMocks: true,
};

export default config;