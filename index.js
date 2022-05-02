/* Import */
const Discord = require("discord.js-selfbot");
const color = require("chalk");

/* Client */
const client = new Discord.Client();

/* Options */
const config = require("./config.js");

/* Console */
function erreur(content) {
    console.log(color.bold.red(content))
}
function succes(content) {
    console.log(color.bold.green(content))
}
function log(content) {
    console.log(color.bold.blue(content))
}

/* Event démarrage */
client.on("ready", async () => {
    succes(`Le selfbot est connecté.`)
})

/* Connexion */
client.login(config.token)