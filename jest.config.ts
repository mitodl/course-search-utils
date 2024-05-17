import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testEnvironment: "jsdom",
  collectCoverage: true,
  transform: {
    "^.+\\.(t)sx?$": "@swc/jest",
  },
  setupFilesAfterEnv: ["<rootDir>src/test_setup.ts"],
  testMatch: ["<rootDir>/src/**/*.(spec|test).ts?(x)"],
};

export default config;
