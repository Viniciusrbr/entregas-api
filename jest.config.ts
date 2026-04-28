import type { Config } from 'jest';

const config: Config = {
  bail: true,
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": ["ts-jest", { diagnostics: { ignoreCodes: ["TS151002"] } }]
  },
  testMatch: [
    "<rootDir>/src/**/*.test.ts"
  ],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1"
  },
  setupFiles: [
    "<rootDir>/src/tests/setup-env.ts"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/src/database/singleton.ts"
  ]
};

export default config;
