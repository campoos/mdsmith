const fs = require("fs")
const path = require("path")


function scanDir(dirPath, padding, config) { 
      let entries
      try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true })
          .sort((a, b) => {
              if (a.isDirectory() && !b.isDirectory()) return -1
              if (!a.isDirectory() && b.isDirectory()) return 1
              return a.name.localeCompare(b.name)
          })
      } catch {
        return ""
      }

    let treeContent = ""

    
    for (const entry of entries) { 
        
        const fullPath = path.join(dirPath, entry.name); 
        
        if (entry.isDirectory()) { 
            if (config.ignore.includes(entry.name)){
                continue
            } else {
                treeContent += `${" ".repeat(padding*2)} 📂 ${entry.name}\n`
                if (config.depth === null || padding < config.depth){
                    padding ++
                    treeContent += scanDir(fullPath, padding, config)
                    padding --
                } else {
                    treeContent += `${" ".repeat((padding + 1) * 2)} ··· \n`
                }
            }
        } else { 
            if (config.ignore.includes(entry.name)){
                continue
            } else{
                treeContent += `${" ".repeat(padding*2)} 📄 ${entry.name}\n`
            }
        } 
    } 

    return treeContent
}

function scanProjectFiles(projectRoot) {
  const result = {
    allFiles: [],
    jsFiles: [],
    tsFiles: [],
    envFiles: [],
    hasDockerfile: false,
    hasPrisma: false,
    hasSrcFolder: false,
  }

  function walk(dir) {
    let files
    try {
      files = fs.readdirSync(dir)
    } catch {
      return
    }

    for (const file of files) {
      const fullPath = path.join(dir, file)

      if (
        fullPath.includes("node_modules") ||
        fullPath.includes(".git")
      ) continue

      let stat
      try {
        stat = fs.lstatSync(fullPath)

        if (stat.isSymbolicLink()) continue
      } catch {
        continue
      }

      if (stat.isDirectory()) {
        if (file === "src") {
          result.hasSrcFolder = true
        }
        walk(fullPath)
      } else {
        result.allFiles.push(fullPath)

        if (file.endsWith(".js")) result.jsFiles.push(fullPath)
        if (file.endsWith(".ts")) result.tsFiles.push(fullPath)
        if (file.startsWith(".env")) result.envFiles.push(fullPath)

        if (file === "Dockerfile") result.hasDockerfile = true
        if (fullPath.includes("prisma")) result.hasPrisma = true
      }
    }
  }

  walk(projectRoot)

  return result
}

module.exports = {
scanDir,
scanProjectFiles
}