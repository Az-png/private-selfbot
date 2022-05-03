
const Discord = require("discord.js-selfbot");
const color = require("chalk");

const client = new Discord.Client();

const config = require("./config.js");

function erreur(content) {
    console.log(color.bold.red(content))
}
function succes(content) {
    console.log(color.bold.green(content))
}
function log(content) {
    console.log(color.bold.blue(content))
}

client.on("ready", async () => {
    succes(`Le selfbot est connecté.`)
})

client.login(config.token)