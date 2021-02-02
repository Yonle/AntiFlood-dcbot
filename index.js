// Configurations 
const config = {
  muted_roles_name: "Muted",
  max_msg: 10
};

// Load module and Create Client
const { Client, MessageEmbed } = require("discord.js");
const bot = new Client();

// Load .env Variable
require('dotenv').config();

bot.on("ready", () => {
  console.log("Logged as", bot.user.tag);
  bot.user.setActivity("Muting People who flooding the text channel!");
});

// Create Map
const guild = new Map();

// Listen to Message
bot.on("message", async (message) => {
  // Get user id
  var user_id = message.author.id;
  // Get member information
  var member = message.member;
  // Get guild id
  var guild_id = message.guild.id;
  // Something....
  var guild_info = guild.get(guild_id);
  if (!guild_info) {
   guild.set(guild_id, { user_id: user_id, m_count: 1 });
   console.log(`[LOGGING] This guild(${guild_id}) isn't monitored. Adding to monitor list....`);
   return;
  }
  var m_count = guild_info.m_count;
  // If it's Admin/Moderator, Write it as 0

if(message.member.hasPermission('MANAGE_ROLES') || message.member.hasPermission(["KICK_MEMBERS", "BAN_MEMBERS"]) || message.guild.user === message.author) {
  guild.set(guild_id, { user_id: user_id, m_count: 0 });
  return console.log("[INFO] Admin Messaging, Cancelling to counting.");
}
  guild.set(guild_id, { user_id: user_id, m_count: m_count+1 });
  console.log(`[INFO] User ${user_id} messaging, Message Count:`, m_count);
  if (guild.get(guild_id).m_count === config.max_msg) {
        	if(!message.guild.me.hasPermission(["MANAGE_ROLES", "ADMINISTRATOR"])) return;
   	let muteRole = message.guild.roles.cache.find(r => r.name === config.muted_roles_name);
	console.log(`[INFO] Max Message Count in ${guild_id} Reached. Finding Mute roles....`);
	if(!muteRole) {
                console.log("[INFO] No Mute Roles in this guild. Creating one...");
		try {
			muteRole = await message.guild.roles.create({
				data: {
					name: config.muted_roles_name,
					color: "#000000",
					permissions: []
				}
			});
		} catch (e) {
			message.channel.send("An error occurted. try again later.")
			console.log(e.stack);
		}
	}
	console.log("[INFO] Overwritting @Muted roles at every channel....");
	message.guild.channels.cache.forEach((channel) => {
		channel.updateOverwrite(muteRole, {
			"SEND_MESSAGES": false,
			"ATTACH_FILES": false,
			"SEND_TTS_MESSAGES": false,
			"ADD_REACTIONS": false,
			"SPEAK": false,
			"STREAM": false
		});
	});
   // If it's Admin/Moderator, Don't mute
if(message.member.hasPermission('MANAGE_ROLES') || message.member.hasPermission(["KICK_MEMBERS", "BAN_MEMBERS"]) || message.guild.user === message.author) return;
   member.roles.add(muteRole.id).then(() => {
     console.log(`[INFO] Muted ${user_id}`);
     message.channel.send("Yeah i don't like you flooding,\n**Muted "+message.author.tag+"!!**");
   }).catch(console.error)
  }
});
	
bot.on("message", (message) => {
        if (!message.mentions.members.first()) return;
	if (message.mentions.members.first().id === bot.user.id) {
		message.author.send("Hello, This bot has no Prefix. If you want invite this bot, Here is it:\nhttps://discord.com/api/oauth2/authorize?client_id="+bot.user.id+"&permissions=268436480&scope=bot")
	}
})

bot.login(process.env.TOKEN);
