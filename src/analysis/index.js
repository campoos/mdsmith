

const fs = require("fs")
const path = require("path")
const prompts = require('prompts');

const detectors = require("../../src/detectors")

function analisarProjeto(packageJson, projectRoot) {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }

  const analysis = {
    frontend: deps.react ? "React" :
              deps.next ? "Next.js" :
              null,

    backend: deps.express ? "Express" :
             deps.fastify ? "Fastify" :
             null,

    language: deps.typescript ? "TypeScript" : "JavaScript",

    bundler: deps.vite ? "Vite" :
             deps.webpack ? "Webpack" :
             null,

    styling: deps.tailwindcss ? "TailwindCSS" :
             deps.sass ? "Sass" :
             null,

    database: deps.mongoose ? "MongoDB" :
              deps.prisma ? "Prisma" :
              deps.pg ? "PostgreSQL" :
              null,

    testing: deps.jest ? "Jest" :
             deps.vitest ? "Vitest" :
             null,

    linting: deps.eslint ? "ESLint" : null,

    formatting: deps.prettier ? "Prettier" : null,

    node: detectors.detectarNodeVersion(projectRoot, packageJson)
  }

  if (analysis.frontend && analysis.backend) {
    analysis.architecture = "Fullstack"
  } else if (analysis.frontend) {
    analysis.architecture = "Frontend"
  } else if (analysis.backend) {
    analysis.architecture = "Backend"
  }

  return analysis
}

function diagnosticarExecucao(commands) {
  const warnings = []

  if (!commands.dev && !commands.start) {
    warnings.push("No development or start script found.")
  }

  if (commands.build && !commands.start) {
    warnings.push("Build script found but no start script for production.")
  }

  return warnings
}

function healthChecks(packageJson, projectRoot, analysis) {
  const checks = []

  if (!analysis.testing) {
    checks.push({
      type: "warning",
      message: "No test runner configured."
    })
  }

  if (!analysis.linting) {
    checks.push({
      type: "info",
      message: "No ESLint detected."
    })
  }

  if (!analysis.formatting) {
    checks.push({
      type: "info",
      message: "No Prettier detected."
    })
  }

  if (!packageJson.engines?.node) {
    checks.push({
      type: "critical",
      message: "Node version not defined in package.json engines."
    })
  }

  if (!fs.existsSync(path.join(projectRoot, "Dockerfile"))) {
    checks.push({
      type: "info",
      message: "No Dockerfile found."
    })
  }

  return checks
}

function analisarScripts(scripts = {}, packageManager) {
  const commands = {
    install: packageManager === "npm"
      ? "npm install"
      : `${packageManager} install`
  }

  if (scripts.dev) {
    commands.dev = `${packageManager} run dev`
  }

  if (scripts.build) {
    commands.build = `${packageManager} run build`
  }

  if (scripts.start) {
    commands.start = packageManager === "npm"
      ? "npm start"
      : `${packageManager} start`
  }

  if (scripts.preview) {
    commands.preview = `${packageManager} run preview`
  }

  return commands
}

module.exports = {
    analisarProjeto,
    diagnosticarExecucao,
    healthChecks,
    analisarScripts
}