
function formatarAnalise(analysis) {
  console.log(`
Project Analysis
────────────────────────
  `)

  const entries = Object.entries(analysis)

  for (const [key, value] of entries) {
    if (value) {
      const label = key.charAt(0).toUpperCase() + key.slice(1)
      console.log(`✓ ${label}: ${value}`)
    }
  }

  console.log("")
}

function formatarExecucao(commands, warnings) {
  console.log(`Project Execution Strategy
────────────────────────`)

  console.log(`Install:`)
  console.log(`  ${commands.install}\n`)

  if (commands.dev) {
    console.log(`Development:`)
    console.log(`  ${commands.dev}\n`)
  }

  if (commands.build && commands.start) {
    console.log(`Production:`)
    console.log(`  ${commands.build}`)
    console.log(`  ${commands.start}\n`)
  }

  if (commands.preview) {
    console.log(`Preview:`)
    console.log(`  ${commands.preview}\n`)
  }

  if (warnings.length > 0) {
    console.log(`Warnings:`)
    warnings.forEach(w => console.log(`  ⚠ ${w}`))
    console.log()
  }
}

module.exports = {
    formatarAnalise,
    formatarExecucao
}