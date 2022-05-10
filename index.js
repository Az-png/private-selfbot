/* Importation */
const color = require("chalk"),
    request = require("request"),
    config = require("./config.js"),
    fs = require("fs");

/* Version actuelle */
const version = "1.0.1"

/* Verification version */
request({
    url: "https://api.github.com/repos/vayd0/private-selfbot/contents/package.json",
    headers: {
        'User-Agent': 'vayd0'
    },
}, function (err, rep, body) {
    let content = JSON.parse(body).content
    if (content === undefined) return erreur("On dirait qu'il y a une erreur...")
    let packagejson = JSON.parse(Buffer.from(content, 'base64').toString('utf-8'))
    if (version !== packagejson.version) {
        downloadUpdate(packagejson)
    } else {
        selfbot()
    }
})

/* Selfbot */
function selfbot() {
    const Discord = require("discord.js-selfbot");
    const client = new Discord.Client();

    const prefix = config.prefix,
        color = config.color,
        footer = config.footer || "Tempo";

    client.on("ready", async () => {
        succes(`Le selfbot est connecté.`)
    });

    client.on("message", message => {
        if (message.author.id !== client.user.id) return;

        const args = message.content.slice(prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
    })

    client.login(config.token);
}

/* Mise à jour */
function downloadUpdate(newPackage) {
    request({
        url: "https://api.github.com/repos/vayd0/private-selfbot/contents/index.js",
        headers: {
            'User-Agent': 'vayd0'
        },
    }, function (err, rep, body) {
        let content = JSON.parse(body).content
        let indexFile = Buffer.from(content.toString(), 'base64').toString('utf-8')
        log("Mise à jour en cours..")
        fs.writeFileSync("./index.js", indexFile, 'utf-8')
        fs.writeFileSync("./package.json", JSON.stringify(newPackage, null, 2), 'utf-8')
        log("Les mises à jour du fichier index.js ont été effectué.")
        process.exit();
    })
}
/* Console */
function erreur(content) {
    console.log(color.bold.red(content));
}
function succes(content) {
    console.log(color.bold.green(content));
}
function log(content) {
    console.log(color.bold.blue(content));
}