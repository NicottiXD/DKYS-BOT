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

client.on('messageCreate', async message => {
  if (message.content === '!button') {
    const button = new ButtonBuilder()
      .setCustomId('my_button')
      .setLabel('Click me!')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.reply({ content: 'Here is a button!', components: [row] });
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'my_button') {
    await interaction.reply({ content: 'You clicked the button!', ephemeral: true });
  }
});


client.login('MTM2MjgxNjE5NTc5MDg5NzI5Mg.GEBDk6.-0GJB2d9ayGQv-a_FEh7EwJiiG0F1_-4oV_iJ0');