const fs = require("fs")
const path = require("path")

const TECH_MAP = {
  // Frameworks
  express: "Express",
  fastify: "Fastify",
  koa: "Koa",
  hapi: "Hapi",
  "@nestjs/core": "NestJS",

  // ORMs
  prisma: "Prisma",
  "@prisma/client": "Prisma",
  sequelize: "Sequelize",
  mongoose: "Mongoose",
  typeorm: "TypeORM",
  drizzle: "Drizzle ORM",

  // Databases
  pg: "PostgreSQL",
  mysql: "MySQL",
  mysql2: "MySQL",
  sqlite3: "SQLite",
  mongodb: "MongoDB",

  // Auth
  jsonwebtoken: "JWT",
  passport: "Passport",

  // AI
  openai: "OpenAI",
  langchain: "LangChain",

  // Infra / Tools
  docker: "Docker",
  "swagger-ui-express": "Swagger",
  puppeteer: "Puppeteer",
  nodemailer: "Nodemailer"
}

function detectarTechStack(deps = {}) {
  const stack = new Set()

  for (const dep in deps) {
    if (TECH_MAP[dep]) {
      stack.add(TECH_MAP[dep])
    }
  }

  return Array.from(stack).sort()
}


function detectarEnvVars(projectRoot) {
  const envPath = path.join(projectRoot, ".env")

  if (!fs.existsSync(envPath)) return []

  const content = fs.readFileSync(envPath, "utf-8")

  const vars = content
    .split("\n")
    .map(line => line.trim())
    .filter(line =>
      line &&
      !line.startsWith("#") &&
      line.includes("=")
    )
    .map(line => line.replace(/^export\s+/, ""))
    .map(line => line.split("=")[0].trim())

  return vars
}

function detectarPorta(scanData) {
  const filesToScan = [...scanData.jsFiles, ...scanData.tsFiles]

  for (const filePath of filesToScan) {
    try {
      const content = fs.readFileSync(filePath, "utf-8")

      const listenRegex = /\.listen\s*\(\s*([\s\S]*?)\)/g

      let match

      while ((match = listenRegex.exec(content)) !== null) {
        const rawArgument = match[1].split(",")[0].trim()

        const directNumber = rawArgument.match(/^\d+$/)
        if (directNumber) {
          return directNumber[0]
        }

        const inlineFallback = rawArgument.match(/\|\|\s*(\d+)/)
        if (inlineFallback) {
          return inlineFallback[1]
        }

        if (rawArgument.includes("process.env.PORT")) {
          return "process.env.PORT"
        }

        const variableName = rawArgument.replace(/[^a-zA-Z0-9_]/g, "")

        if (!variableName) continue

        const variableRegex = new RegExp(
          `(const|let|var)\\s+${variableName}\\s*=\\s*([\\s\\S]*?);`
        )

        const variableMatch = content.match(variableRegex)

        if (variableMatch) {
          const variableValue = variableMatch[2]

          const fallbackMatch = variableValue.match(/\|\|\s*(\d+)/)
          if (fallbackMatch) {
            return fallbackMatch[1]
          }

          const numberMatch = variableValue.match(/\d+/)
          if (numberMatch) {
            return numberMatch[0]
          }
        }
      }

    } catch (err) {
      continue
    }
  }

  return null
}

function detectarPackageManager(projectRoot) {
  if (fs.existsSync(path.join(projectRoot, "pnpm-lock.yaml"))) {
    return "pnpm"
  }

  if (fs.existsSync(path.join(projectRoot, "yarn.lock"))) {
    return "yarn"
  }

  if (fs.existsSync(path.join(projectRoot, "package-lock.json"))) {
    return "npm"
  }

  return "npm"
}

function detectarNodeVersion(projectRoot, packageJson) {
  if (packageJson.engines && packageJson.engines.node) {
    return packageJson.engines.node
  }

  const nvmrcPath = path.join(projectRoot, ".nvmrc")
  if (fs.existsSync(nvmrcPath)) {
    return fs.readFileSync(nvmrcPath, "utf-8").trim()
  }

  const nodeVersionPath = path.join(projectRoot, ".node-version")
  if (fs.existsSync(nodeVersionPath)) {
    return fs.readFileSync(nodeVersionPath, "utf-8").trim()
  }

  return process.version
}

function detectarPrisma(projectRoot, packageJson) {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }

  const hasPrismaDep = deps.prisma || deps["@prisma/client"]
  const hasPrismaFolder = fs.existsSync(path.join(projectRoot, "prisma"))

  return hasPrismaDep && hasPrismaFolder
}

module.exports = {
detectarEnvVars,
detectarPorta,
detectarTechStack,
detectarPackageManager,
detectarNodeVersion,
detectarPrisma
}