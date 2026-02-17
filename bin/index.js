#!/usr/bin/env node

// npx mdsmith --help     # show help
// npx mdsmith --init     # create config file
// npx mdsmith --tree     # show project structure
// npx mdsmith --deps     # list dependencies
// npx mdsmith --readme   # generate README
// npx mdsmith --analyze  # project analyze



const fs = require("fs");

const path = require("path");

const core = require("../src/generators")
const detectors = require("../src/detectors")
const scanner = require("../src/scanner")
const readme = require("../src/readme")
const configModule = require("../src/config")
const analysisModule = require("../src/analysis")
const formatters = require("../src/formatters")


const prompts = require('prompts');

const projectRoot = process.cwd();

if(!fs.existsSync(path.join(process.cwd(), "package.json"))){
    console.log(`
Error: package.json not found.
Please run mdsmith from the project root.  
    `)
    process.exit(1)
}

let packageJson

try {
  packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8")
  )
} catch {
  console.log("Invalid package.json file.")
  process.exit(1)
}

const args = process.argv.slice(2)

async function main() {
    const config = configModule.loadConfig(projectRoot)

    if(args.length == 0){
        console.log(`
mdSmith
Node.js project analyzer
────────────────────────

Run "mdsmith --help" to view available commands.
        `);
        process.exit(0);
    }else if (args.includes("--init")) {

        const configPath = path.join(projectRoot, "mdsmith.config.json")

        if (fs.existsSync(configPath)) {
            console.log("mdsmith.config.json already exists.")
            process.exit(0)
        }

        fs.writeFileSync(
            configPath,
            JSON.stringify(configModule.defaultConfig, null, 2)
        )

        console.log("Configuration file created.")
        process.exit(0)

    } else if(args.includes("--help")){
        console.log(`
mdSmith — Available Commands
────────────────────────

    --help      Show help
    --init      Create config file
    --tree      Show project structure
    --deps      List dependencies
    --readme    Generate README
    --analyze   Project analysis
        `)  
        process.exit(0)
    } else if (args.includes("--tree")){
        console.log(`
Project Structure
────────────────────────
        `);
        console.log(scanner.scanDir(projectRoot, 0, config))
        process.exit(0)
    } else if (args.includes("--analyze")){
      const analysis = analysisModule.analisarProjeto(packageJson, projectRoot)
      const packageManager = detectors.detectarPackageManager(projectRoot)

      formatters.formatarAnalise(analysis)

      const commands = analysisModule.analisarScripts(packageJson.scripts, packageManager)
      const warnings = analysisModule.diagnosticarExecucao(commands)

      formatters.formatarExecucao(commands, warnings)

      const issues = analysisModule.healthChecks(packageJson, projectRoot, analysis)

      if (issues.length > 0) {
          console.log("Health Checks")
          console.log("────────────────────────")
          issues.forEach(issue => {
            let icon = "⚠"

            if (issue.type === "critical") icon = "❌"
            if (issue.type === "info") icon = "ℹ"

            console.log(`${icon} ${issue.message}`)
          })
          console.log()
      }

      process.exit(0)
    } else if (args.includes("--deps")){
        console.log(`
Dependencies
────────────────────────   
        `)
        const deps = core.formatDependencies(packageJson.dependencies)
        console.log(`${deps}\n`)
        console.log()
        process.exit(0)
    } else if (args.includes("--readme")){
        const content = await readme.generateReadme(packageJson, scanner.scanDir(projectRoot, 0, config), config)

        console.log(`
README Preview
────────────────────────
        `)

        console.log(content)

        const confirmResponse = await prompts({
            type: 'confirm',
            name: 'generate',
            message: 'Generate README-MDSMITH.md?',
            initial: true
        });

        if (confirmResponse.generate) {
            fs.writeFileSync("README-MDSMITH.md", content);
            console.log("\nREADME-MDSMITH.md created.\n");
        } else {
            console.log("\nOperation cancelled.\n");
        }

        process.exit(0);

    } else {
        console.log(`
Unknown command.
Run "mdsmith --help" for usage.    
        `)
        process.exit(0)
    }
}

main()

