// index.js
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates,],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});




/*const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});*/

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.on('messageCreate', message => {
  if (message.content.toLowerCase() === 'rick') {
    message.channel.send('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  }
});

const path = require('path');

const triggerWords = ['me voy a matar',"me quiero matar", 'me mato', 'no se maten', 'kill myself', 'KMS'];

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (triggerWords.some(word => msg.includes(word))) {
    message.reply({
      files: [path.join(__dirname, 'CGiAn47Q8ZYNdIZC.mp4')]
    });
  }
});

// crear botones

const buttonConfigs = [
  { label: '💥 Boom', file: 'boom.mp3' },
  { label: '😂 Laugh', file: 'laugh.mp3' },
  { label: '🚨 Alert', file: 'alert.mp3' },
  { label: '🎉 Party', file: 'party.mp3' },
  // ...add more up to 20
];

client.on('messageCreate', async message => {
  if (message.content === '!cajadank') {
    
    const rows = [];

    for (let i = 0; i < 20; i++) {
      const button = new ButtonBuilder()
        .setCustomId(`play_clip_${i + 1}`)
        .setLabel(`🎵 Clip ${i + 1}`)
        .setStyle(ButtonStyle.Primary);

      if (i % 5 === 0) rows.push(new ActionRowBuilder());
      rows[Math.floor(i / 5)].addComponents(button);
    }

    await message.reply({
      content: 'Choose a clip to play in voice:',
      components: rows,
    });
  }
});


//ingresa al chat de audio a reproducir el audio

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');


client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const id = interaction.customId;

  if (id.startsWith('play_clip_')) {
    const clipNum = id.split('_')[2];
    const clipPath = path.join(__dirname, 'media', `clip${clipNum}.mp3`);

    const channel = interaction.member.voice?.channel;
    if (!channel) {
      return interaction.reply({
        content: 'You must be in a voice channel to play audio! 🔇',
        ephemeral: true,
      });
    }

    // Join voice channel
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const resource = createAudioResource(clipPath);
    const player = createAudioPlayer();

    connection.subscribe(player);
    player.play(resource);

    /*await interaction.reply({
      content: `🎶 Playing Clip ${clipNum}!`,
      ephemeral: true,
    });*/

    // Disconnect after playback ends
    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
  }
});

// Cambiar nombre de boton
client.on('messageCreate', async message => {
  if (message.content.startsWith('!setbutton')) {
    const [_, id, emoji, ...labelParts] = message.content.split(' ');
    const label = labelParts.join(' ');
    const buttonNum = parseInt(id);

    if (isNaN(buttonNum) || buttonNum < 1 || buttonNum > 20) {
      return message.reply('❌ Invalid button number (1-20)');
    }

    buttonConfigs[buttonNum - 1] = {
      label: `${emoji} ${label}`,
      file: `clip${buttonNum}.mp3`, // for now, keep filename based on button number
    };

   
  }
});





client.login('MTM2MjgxNjE5NTc5MDg5NzI5Mg.GEBDk6.-0GJB2d9ayGQv-a_FEh7EwJiiG0F1_-4oV_iJ0');