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
    const db = admin.firestore(); // Asegurate que Firebase esté inicializado
    const clipsSnapshot = await db.collection('clips').get();

    if (clipsSnapshot.empty) {
      await message.reply('❌ No hay clips cargados en la base de datos.');
      return;
    }

    const clips = [];
    clipsSnapshot.forEach(doc => {
      const data = doc.data();
      clips.push({
        id: doc.id, // o podrías usar algo como clip1, clip2
        label: data.label || 'Sin nombre',
        file: data.file || ''
      });
    });

    const rows = [];

    clips.forEach((clip, index) => {
      const button = new ButtonBuilder()
        .setCustomId(`play_clip_${clip.id}`) // id de Firestore como identificador único
        .setLabel(`🎵 ${clip.label}`)
        .setStyle(ButtonStyle.Primary);

      if (index % 5 === 0) rows.push(new ActionRowBuilder());
      rows[Math.floor(index / 5)].addComponents(button);
    });

    await message.reply({
      content: '🎶 Elegí un clip para reproducir en el canal de voz:',
      components: rows
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

  const clipId = interaction.customId.replace('play_clip_', '');
  const db = admin.firestore();
  const clipDoc = await db.collection('clips').doc(clipId).get();

  if (!clipDoc.exists) {
    await interaction.reply({ content: '❌ Clip no encontrado.', ephemeral: true });
    return;
  }

  const clipData = clipDoc.data();

  const member = interaction.member;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    await interaction.reply({ content: '🚫 Debés estar en un canal de voz para reproducir el clip.', ephemeral: true });
    return;
  }

  // Reproducir audio
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });

  const filePath = path.join(__dirname, 'clips', clipData.file); // Asegurate que el archivo exista en ./clips/

  try {
    const resource = createAudioResource(filePath);
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy(); // Salir del canal después de reproducir
    });

    await interaction.reply({
      content: `▶️ Reproduciendo: **${clipData.label}**`,
      ephemeral: false
    });

  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '⚠️ Hubo un error al reproducir el audio.', ephemeral: true });
    connection.destroy();
  }
});

// Cambiar nombre de boton
client.on('messageCreate', async message => {
  if (message.content.startsWith('!setbutton')) {
    var matches = message.content.match(/"([^"]+)"\s+"([^"]+)"/);

    if (!matches || matches.length < 3) {
      message.reply('❌ Usá el formato correcto: `!setbutton "Nombre actual" "Nuevo nombre"`');
      return;
    }

    var viejoBoton = matches[1];
    var nuevoBoton = matches[2];

    actualizarClipPorLabel(viejoBoton, nuevoBoton);

    // const [_, id, emoji, ...labelParts] = message.content.split(' ');
    // const label = labelParts.join(' ');
    // const buttonNum = parseInt(id);

    // if (isNaN(buttonNum) || buttonNum < 1 || buttonNum > 20) {
    //   return message.reply('❌ Invalid button number (1-20)');
    // }

    // buttonConfigs[buttonNum - 1] = {
    //   label: `${emoji} ${label}`,
    //   file: `clip${buttonNum}.mp3`, // for now, keep filename based on button number
    // };
   
  }
});

async function actualizarClipPorLabel(viejoBoton, nuevoBoton) {
  const clipsRef = db.collection('clips');
  const snapshot = await clipsRef.where('label', '==', viejoBoton).get();

  if (snapshot.empty) {
    console.log(`❌ No se encontró un clip con el label "${viejoBoton}"`);
    return;
  }

  snapshot.forEach(async doc => {
    await doc.ref.update(nuevoBoton);
    console.log(`✅ Clip "${viejoBoton}" actualizado`);
  });
}


client.login('MTM2MjgxNjE5NTc5MDg5NzI5Mg.GEBDk6.-0GJB2d9ayGQv-a_FEh7EwJiiG0F1_-4oV_iJ0');