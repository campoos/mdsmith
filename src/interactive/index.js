const fs = require("fs")
const path = require("path")
const prompts = require('prompts');

async function buscarNome(nome) {
  if (!nome) {
    const confirm = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Project name not found in package.json. Provide one?',
      initial: true
    });

    if (!confirm.value) {
      console.log("\nProject name will be set as Unnamed Project.\n");
      return "Unnamed Project";
    }

    const response = await prompts({
      type: 'text',
      name: 'value',
      message: 'Enter the project name:'
    });

    console.log(`\nProject name set to "${response.value}".\n`);
    return response.value || "Unnamed Project";
  }

  return nome;
}

async function buscarDescricao(descricao) {
  if (!descricao) {
    const confirm = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Project description not found. Provide one?',
      initial: true
    });

    if (!confirm.value) {
      console.log("\nDescription placeholder added.\n");
      return "*Project description goes here*";
    }

    const response = await prompts({
      type: 'text',
      name: 'value',
      message: 'Enter the project description:'
    });

    console.log("\nDescription saved.\n");
    return response.value || "*Project description goes here*";
  }

  return descricao;
}

async function escolherLingua() {
  const response = await prompts({
    type: 'select',
    name: 'lang',
    message: 'Choose README language',
    choices: [
      { title: 'English', value: 'en' },
      { title: 'Português', value: 'pt' },
      { title: 'Español', value: 'es' }
    ],
    initial: 0
  });

  return response.lang || 'en';
}


async function perguntarPortaManual() {
  const response = await prompts({
    type: "text",
    name: "port",
    message: "⚠️  Could not automatically detect the port.\nEnter the API port (or leave empty to skip):",
    validate: value => {
      if (!value) return true
      return /^\d+$/.test(value) || "Please enter numbers only"
    }
  })

  return response.port || null
}

module.exports = {
buscarNome,
buscarDescricao,
escolherLingua,
perguntarPortaManual
}