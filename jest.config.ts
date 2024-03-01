import { Config } from "@jest/types";

const common = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t)sx?$": "@swc/jest",
  },
  setupFilesAfterEnv: ["<rootDir>src/test_setup.ts"],
  testMatch: ["<rootDir>/src/**/*.(spec|test).ts?(x)"],
};

const config: Config.InitialOptions = {
  projects: [
    {
      displayName: "history-v4",
      moduleNameMapper: {
        history$: "history-v4",
      },
      ...common,
    },
    {
      displayName: "history-v5",
      moduleNameMapper: {
        history$: "history",
      },
      ...common,
    },
  ],
};

export default config;
