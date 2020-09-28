module.exports = {
  setupFilesAfterEnv: ["<rootDir>src/test_setup.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
}
