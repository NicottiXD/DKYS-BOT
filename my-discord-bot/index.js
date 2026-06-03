// index.js — Don't KYS Bot (optimizado)
require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');

const path  = require('path');
const fs    = require('fs');
const https = require('https');
const http  = require('http');

// ─────────────────────────────────────────────
//  HELPER: descargar archivo desde una URL
// ─────────────────────────────────────────────
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file  = fs.createWriteStream(destPath);
    proto.get(url, res => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// ─────────────────────────────────────────────
//  CONFIGURACIÓN DE BOTONES (persistente en JSON)
// ─────────────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, 'buttonConfig.json');

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }
  // Sin clips por defecto, arranca vacío
  return {};
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

let buttonConfig = loadConfig();

// ─────────────────────────────────────────────
//  CLIENTE DISCORD
// ─────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ─────────────────────────────────────────────
//  HELPER: construir filas de botones
// ─────────────────────────────────────────────
function buildButtonRows(config) {
  const ids = Object.keys(config).map(Number).sort((a, b) => a - b);
  const rows = [];

  for (let i = 0; i < ids.length; i++) {
    const id  = ids[i];
    const cfg = config[id];

    const button = new ButtonBuilder()
      .setCustomId(`play_clip_${id}`)
      .setLabel(`${cfg.emoji ?? '🎵'} ${cfg.label}`)
      .setStyle(ButtonStyle.Primary);

    if (i % 5 === 0) rows.push(new ActionRowBuilder());
    rows[Math.floor(i / 5)].addComponents(button);

    // Discord permite máximo 5 filas (25 botones)
    if (rows.length >= 5 && (i + 1) % 5 === 0) break;
  }

  return rows;
}

// ─────────────────────────────────────────────
//  COMANDOS DE TEXTO
// ─────────────────────────────────────────────
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const msg  = message.content;
  const args = msg.trim().split(/\s+/);
  const cmd  = args[0].toLowerCase();

  // --- !ping ---
  if (cmd === '!ping') {
    return message.reply('Pong! 🏓');
  }

  // --- rick roll ---
  if (msg.toLowerCase() === 'rick') {
    return message.channel.send('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  }

  // --- palabras gatillo ---
  const triggerWords = [
    'me voy a matar', 'me quiero matar', 'me mato',
    'no se maten', 'kill myself', 'kms',
  ];
  if (triggerWords.some(w => msg.toLowerCase().includes(w))) {
    return message.reply({
      files: [path.join(__dirname, 'CGiAn47Q8ZYNdIZC.mp4')],
    });
  }

  // ── !cajadank ──────────────────────────────
  // Muestra el panel de botones
  if (cmd === '!cajadank') {
    if (Object.keys(buttonConfig).length === 0) {
      return message.reply('📭 No hay clips cargados todavía. Usá `!addclip 🎵 Nombre` adjuntando un .mp3 para agregar uno.');
    }
    const rows = buildButtonRows(buttonConfig);
    return message.reply({
      content: '🎶 Elegí un clip para reproducir en el canal de voz:',
      components: rows,
    });
  }

  // ── !setbutton <id> <emoji> <nombre> ───────
  // Ejemplo: !setbutton 3 🔥 Fuego épico
  if (cmd === '!setbutton') {
    const id    = parseInt(args[1]);
    const emoji = args[2] ?? '🎵';
    const label = args.slice(3).join(' ');

    if (isNaN(id) || id < 1 || id > 25) {
      return message.reply('❌ Número de botón inválido (1–25).');
    }
    if (!label) {
      return message.reply('❌ Usá: `!setbutton <id> <emoji> <nombre>`\nEjemplo: `!setbutton 3 🔥 Fuego épico`');
    }

    buttonConfig[id] = {
      label,
      emoji,
      file: buttonConfig[id]?.file ?? `clip${id}.mp3`,
    };
    saveConfig(buttonConfig);
    return message.reply(`✅ Botón ${id} actualizado: ${emoji} ${label}`);
  }

  // ── !addclip <emoji> <nombre> [+ adjunto .mp3/.ogg/.wav] ─
  // Si adjuntás un audio, lo descarga automáticamente a media/
  if (cmd === '!addclip') {
    const emoji = args[1] ?? '🎵';
    const label = args.slice(2).join(' ') ;

    const ids   = Object.keys(buttonConfig).map(Number);
    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

    if (newId > 25) {
      return message.reply('❌ Ya tenés 25 botones (límite de Discord). Usá `!removeclip <id>` para liberar uno.');
    }

    // Verificar adjunto de audio
    const attachment = message.attachments.first();
    const validExts  = ['.mp3', '.ogg', '.wav'];
    const hasAudio   = attachment && validExts.some(e => attachment.name.toLowerCase().endsWith(e));
    const fileName   = hasAudio ? attachment.name : `clip${newId}.mp3`;
    const destPath   = path.join(__dirname, 'media', fileName);

    // Crear carpeta media/ si no existe
    if (!fs.existsSync(path.join(__dirname, 'media'))) {
      fs.mkdirSync(path.join(__dirname, 'media'));
    }

    buttonConfig[newId] = { label, emoji, file: fileName };
    saveConfig(buttonConfig);

    if (hasAudio) {
      try {
        await message.reply(`⏬ Descargando \`${fileName}\`...`);
        await downloadFile(attachment.url, destPath);
        return message.reply(`✅ Clip ${newId} guardado: ${emoji} **${label}** → \`media/${fileName}\``);
      } catch (err) {
        console.error('Error descargando archivo:', err);
        return message.reply(`⚠️ Clip ${newId} registrado pero falló la descarga. Subí \`${fileName}\` manualmente a \`media/\`.`);
      }
    } else {
      return message.reply(
        `✅ Clip ${newId} registrado: ${emoji} **${label}**\n` +
        `📎 Tip: la próxima vez adjuntá el **.mp3** en el mismo mensaje y el bot lo descarga solo.\n` +
        `📁 O subí manualmente el archivo a \`media/${fileName}\`.`
      );
    }
  }

  // ── !removeclip <id> ───────────────────────
  if (cmd === '!removeclip') {
    const id = parseInt(args[1]);
    if (isNaN(id) || !buttonConfig[id]) {
      return message.reply('❌ ID de clip inválido o no existe.');
    }
    const removed = buttonConfig[id];
    delete buttonConfig[id];
    saveConfig(buttonConfig);
    return message.reply(`🗑️ Clip ${id} (${removed.emoji} ${removed.label}) eliminado.`);
  }

  // ── !listclips ─────────────────────────────
  if (cmd === '!listclips') {
    const lines = Object.entries(buttonConfig)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([id, c]) => `\`${id}\` — ${c.emoji} **${c.label}** → \`${c.file}\``);

    return message.reply(`📋 **Clips configurados:**\n${lines.join('\n')}`);
  }

  // ── !setfile <id> <archivo.mp3> ────────────
  // Cambiar qué archivo reproduce un botón
  if (cmd === '!setfile') {
    const id   = parseInt(args[1]);
    const file = args[2];
    if (isNaN(id) || !buttonConfig[id]) {
      return message.reply('❌ ID inválido.');
    }
    if (!file || !file.endsWith('.mp3')) {
      return message.reply('❌ Indicá un archivo .mp3. Ej: `!setfile 3 sonido_nuevo.mp3`');
    }
    buttonConfig[id].file = file;
    saveConfig(buttonConfig);
    return message.reply(`✅ Botón ${id} ahora reproduce \`${file}\`.`);
  }

  // ── !help ──────────────────────────────────
  if (cmd === '!help') {
    return message.reply(`
**🤖 Comandos disponibles:**
\`!cajadank\` — Mostrar panel de clips
\`!setbutton <id> <emoji> <nombre>\` — Renombrar un botón
\`!addclip <emoji> <nombre>\` — Agregar un clip nuevo
\`!removeclip <id>\` — Eliminar un clip
\`!setfile <id> <archivo.mp3>\` — Cambiar el archivo de un botón
\`!listclips\` — Ver todos los clips configurados
\`!ping\` — Test de conexión
    `.trim());
  }
});

// ─────────────────────────────────────────────
//  INTERACCIONES (botones)
// ─────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const id = interaction.customId;
  if (!id.startsWith('play_clip_')) return;

  // Deferir SIEMPRE primero para evitar "Interacción fallida"
  await interaction.deferReply({ ephemeral: true });

  const clipId  = parseInt(id.split('_')[2]);
  const clipCfg = buttonConfig[clipId];

  if (!clipCfg) {
    return interaction.editReply('❌ Este clip no existe en la configuración.');
  }

  const clipPath = path.join(__dirname, 'media', clipCfg.file);

  if (!fs.existsSync(clipPath)) {
    return interaction.editReply(`❌ Archivo no encontrado: \`media/${clipCfg.file}\``);
  }

  const voiceChannel = interaction.member.voice?.channel;
  if (!voiceChannel) {
    return interaction.editReply('🔇 Tenés que estar en un canal de voz primero.');
  }

  try {
    const connection = joinVoiceChannel({
      channelId:      voiceChannel.id,
      guildId:        voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player   = createAudioPlayer();
    const resource = createAudioResource(clipPath);

    connection.subscribe(player);
    player.play(resource);

    await interaction.deleteReply();

    player.on(AudioPlayerStatus.Idle, () => connection.destroy());

    player.on('error', err => {
      console.error('Error de audio:', err);
      connection.destroy();
    });

  } catch (err) {
    console.error('Error al unirse al canal de voz:', err);
    return interaction.editReply('❌ No pude unirme al canal de voz.');
  }
});

// ─────────────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);