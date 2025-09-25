module.exports = {
  extends:  ["eslint-config-mitodl"],
  settings: {
    react: {
      version: "16.4.0"
    }
  },
  env: {
    browser: true,
    jquery:  true,
    jest:    true
  },
  rules: {
    "@typescript-eslint/ban-ts-comment":  "off",
    "@typescript-eslint/no-explicit-any": "off"
  }
}
