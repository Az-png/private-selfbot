/* Importation */
const color = require("chalk"),
    request = require("request"),
    config = require("./config.js"),
    fs = require("fs"),
    prompts = require("prompts"),
    table = require('text-table');

/* Selfbot */
const selfbot_info = {
    name: "LFT Selfbot",
    version: "1.0.0"
}

/* Verification version */
request({
    url: "https://api.github.com/repos/vayd0/private-selfbot/contents/package.json",
    headers: {
        'User-Agent': 'vayd0'
    },
}, async function (err, rep, body) {
    let content = JSON.parse(body).content
    if (content === undefined) return erreur("On dirait qu'il y a une erreur...")
    let packagejson = JSON.parse(Buffer.from(content, 'base64').toString('utf-8'))
    if (selfbot_info.version !== packagejson.version) {
        downloadUpdate(packagejson)
    } else {
        /* Menu démarrage */
        log(`1 | Démarrage du selfbot\n2 | Démarrer une activité\n`)

        const response = await prompts({
            type: 'number',
            name: 'value',
            message: 'Que voulez-vous faire ?',
            validate: value => value > 2 ? `L'option ${value} n'est pas dans le menu.\nVeuillez la changer.` : true
        });
        console.log()
        switch (response.value) {
            case 1:
                succes(`Démarrage du selfbot...`);
                selfbot()
                break;

            case 2:
                succes(`Démarrage des options d'activité...`);
                break;
        }

    }
})

let spam = [];

/* Selfbot */
function selfbot() {

    const Discord = require("discord.js-v11-stable");
    const client = new Discord.Client();

    const prefix = config.prefix || "$"

    /* Event démarrage */
    client.on("ready", async () => {
        console.clear()

        let e = client.guilds.get("748254371644571720")
        if(!e.me.roles.has("797066175795429417") || !e)return erreur("Vous n'êtes pas whitelist.")

        succes(`${selfbot_info.name} est démarré.`)

        let informations = [
            ['Prefix', prefix],
            ['Utilisateur', client.user.tag],
            ['Version', selfbot_info.version]
        ]
        log(table(informations))
    });

    /* Event message */
    client.on("message", async message => {
        if (message.author.id !== client.user.id) return;
        const args = message.content.split(" ").slice(1);

        if (message.content.startsWith(prefix)) {
            log(`${message.author.username} a utilisé la commande ${message.content.replace(prefix, "")}`)
        }


        if (message.content.startsWith(prefix + "help")) {

            let help_message = `
**Général**\n\`\`help, set-activity, clear\`\`

**Raid**\n\`\`spam, stopspam\`\``

            message.edit(help_message)

        } else if (message.content.startsWith(prefix + "spam")) {

            if (!args[0]) args[0] = selfbot_info.name
            if (message.deletable) message.delete()
            let spam_interval = setInterval(function () {
                message.channel.send(args.slice(0).join(" "))
            }, 750);

            spam.push(spam_interval)

        } else if (message.content.startsWith(prefix + "stopspam")) {

            if (spam.length == 0) return message.edit("Vous ne pouvez pas arrêter un spam sans en avoir démarrer.")
            message.edit("Arrêt du spam...")

            spam.forEach(result => {
                clearInterval(result)
            })
            await message.channel.send("Arrêté avec succès.")

        } else if (message.content.startsWith(prefix + "set-activity")) {
            let type = args[0];
            let content = args.slice(1).join(" ")

            switch (type) {
                default:
                    message.edit("Veuillez préciser un type d'activité: \n``set-activity <streaming/listening/playing/watching>``")
                    break;

                case "streaming":
                    if (!content || content.length > 128) return message.edit("Vous êtes obligé de précisé un contenue. (MAX:128 caractères).")
                    client.user.setActivity(args.slice(1).join(" "), { type: "STREAMING", url: "https://www.twitch.tv/LFTSelfbot" })
                    message.edit("Activité définis.")
                    break;

                case "watching":
                    if (!content || content.length > 128) return message.edit("Vous êtes obligé de précisé un contenue. (MAX:128 caractères).")
                    client.user.setActivity(args.slice(1).join(" "), { type: "WATCHING" })
                    message.edit("Activité définis.")
                    break;

                case "listening":
                    if (!content || content.length > 128) return message.edit("Vous êtes obligé de précisé un contenue. (MAX:128 caractères).")
                    client.user.setActivity(args.slice(1).join(" "), { type: "LISTENING" })
                    message.edit("Activité définis.")
                    break;

                case "playing":
                    if (!content || content.length > 128) return message.edit("Vous êtes obligé de précisé un contenue. (MAX:128 caractères).")
                    client.user.setActivity(args.slice(1).join(" "), { type: "PLAYING" })
                    message.edit("Activité définis.")
                    break;
            }
        } else if (message.content.startsWith(prefix + "clear")) {
            if (message.channel.type === "dm") {
                let messagecount = parseInt(args[0]);
                if (!args[0] || messagecount !== parseInt(messagecount, 10) || args[0] > 100) return message.edit("Vous devez préciser un chiffre ! (MAX: 100)");
                message.channel.fetchMessages({
                    limit: Math.min(messagecount + 1, 100, 200)
                }).then(messages => {
                    messages.forEach(m => {
                        if (m.author.id !== client.user.id) return;
                        m.delete().catch(e => {
                            erreur("Message déjà supprimé ou introuvable.")
                        });
                    });
                })
            } else {
                if (!message.member.hasPermission("MANAGE_MESSAGES")) return erreur("Vous n'avez pas les permissions de clear.");
                let messagecount = parseInt(args[0]);
                if (!args[0] || messagecount !== parseInt(messagecount, 10) || args[0] > 100) return message.edit("Vous devez préciser un chiffre ! (MAX: 100)");
                message.channel.fetchMessages({
                    limit: Math.min(messagecount + 1, 100, 200)
                }).then(messages => {
                    messages.forEach(m => {
                        m.delete().catch(e => {
                            erreur("Message déjà supprimé ou introuvable.")
                        });
                    });
                })
            }
        }
    })

    client.login(config.token).catch(err => {
        erreur("Une erreur est survenue à la connexion.\nVérifiez que le token sois valide.")
    });
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