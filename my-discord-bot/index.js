// index.js



const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

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




client.login('MTM2MjgxNjE5NTc5MDg5NzI5Mg.GEBDk6.-0GJB2d9ayGQv-a_FEh7EwJiiG0F1_-4oV_iJ0');