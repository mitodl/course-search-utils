import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  testEnvironment:  "jsdom",
  transform:          {
    "^.+\\.(t)sx?$": "@swc/jest",
  },
  setupFilesAfterEnv: ["<rootDir>src/test_setup.ts"]
}

export default config
