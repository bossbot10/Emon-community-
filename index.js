const login = require("fca-unofficial");
const fs = require("fs");

// Config file পড়া
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

login({ appState: require(`./${config.APPSTATEPATH}`) }, (err, api) => {
    if (err) return console.error(err);

    api.setOptions(config.FCAOption);
    console.log(`${config.BOTNAME} is now running...`);

    api.listenMqtt((err, event) => {
        if (err) return console.error(err);

        if (event.type === "message") {
            let msg = event.body || "";

            // সব মেসেজে reply দেবে
            api.sendMessage(`👋 Hi, I'm ${config.BOTNAME}\nYou said: ${msg}`, event.threadID, event.messageID);
        }
    });
});
