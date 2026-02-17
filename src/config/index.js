
const fs = require("fs")
const path = require("path")
const prompts = require('prompts');

const defaultConfig = {
  ignore: ["node_modules", ".git", ".vscode"],
  depth: Infinity,
  emojis: true
}


function loadConfig(projectRoot) {
  const configPath = path.join(projectRoot, "mdsmith.config.json")

  if (!fs.existsSync(configPath)) {
    return defaultConfig
  }

  try {
    const fileContent = fs.readFileSync(configPath, "utf-8")
    const userConfig = JSON.parse(fileContent)

    return {
        ...defaultConfig,
        ...userConfig,
        ignore: [
            ...defaultConfig.ignore,
            ...(userConfig.ignore || [])
        ]
    }


  } catch (error) {
    console.log("Failed to read mdsmith.config.json. Using default configuration.")
    return defaultConfig
  }
}

module.exports = {
    defaultConfig,
    loadConfig
}