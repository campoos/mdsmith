const fs = require("fs")
const path = require("path")

function formatDependencies(deps) {
    if (!deps || Object.keys(deps).length === 0) {
        return "No dependencies found.\n";
    }

    return Object.entries(deps)
        .map(([name, version]) => `- ${name} ${version}`)
        .join("\n");
}

function formatScripts(scripts) {
    if (!scripts || Object.keys(scripts).length === 0) {
        return "No scripts available.\n";
    }

    return Object.entries(scripts)
        .map(([name, script]) => `- ${name} -> ${script}`)
        .join("\n");
}

module.exports = {
formatDependencies,
formatScripts
}