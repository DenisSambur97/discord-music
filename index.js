require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
    console.log(`✅ Бот запущен как ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith("!play") || message.author.bot) return;

    const args = message.content.split(" ");
    if (args.length < 2) return message.reply("❌ Укажи ссылку на YouTube!");

    const url = args[1];
    if (!ytdl.validateURL(url)) return message.reply("❌ Неверная ссылка на YouTube!");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("❌ Ты должен быть в голосовом канале!");

    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        const stream = ytdl(url, { filter: "audioonly" });
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);

        message.reply(`🎶 Воспроизведение: ${url}`);
    } catch (error) {
        console.error(error);
        message.reply("❌ Ошибка при воспроизведении музыки!");
    }
});

client.login(process.env.DISCORD_TOKEN);
