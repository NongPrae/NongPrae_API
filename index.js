//sc base case by Rafky

const {
    default: makeWASocket,
    useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const readline = require("readline")
const Pino = require("pino");

const usePairingCode = true

const question = (text) => {
  const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
  });
  return new Promise((resolve) => {
rl.question(text, resolve)
  })
};

(async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const bot = makeWASocket({
      logger: Pino({ level: "silent" }),
      browser: [ "Ubuntu", "Chrome", "20.0.04" ],
      auth: state,
      printQRInTerminal: !usePairingCode,
      defaultQueryTimeoutMs: undefined,
      syncFullHistory: false
    });
    if(usePairingCode && !bot.authState.creds.registered) {
		const phoneNumber = await question('Masukan Nomer Yang Aktif Awali Dengan 62:\n');
		const code = await bot.requestPairingCode(phoneNumber.trim())
		console.log(`Pairing code: ${code}`)
	}
    bot.ev.on("connection.update", (c) => {
        const { connection, lastDisconnect } = c;
        if(connection === "close") {
          console.log(lastDisconnect);
          connectToWhatsApp();
        }
        if(connection === "open") {
          console.log(bot.user.id.split(":")[0]);
        }
    });
    bot.ev.on("creds.update", saveCreds);
})();