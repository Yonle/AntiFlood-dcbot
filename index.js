// Configurations //
// This is configuration of AntiFlood Bot. You can modify it as you wish.

const config = {
  muted_roles_name: "Muted", // Muted Roles name.
  track_userbot: true, // `false` to not tracking userbot. `true` to tracks userbot. Default is `true`.
  mute_userbot: false, // `false` to not mute userbot, `true` to mute userbot Default is `false`.
  warn_max_msg: 5, // Warning message limit, Default is 5.
  max_msg: 10 // Message limit per user, Default is 10.
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

  // Do nothing if There's no guild, nd Ignore webhook
  if (!message.guild || message.webhookID) return;

  // Now look at config back, If the owner didn't allows "this" bot to track last bots, Do nothing.
  if (message.author.bot) { if (!config.track_userbot) return; } 
  // Do not track your own bots.
  if (message.author.id === bot.user.id) return;
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

  // If the User ID isn't same as before, Change it.
  if(guild_info["user_id"] !== user_id) return guild.set(guild_id, { user_id, m_count: 1 });

  var m_count = guild_info.m_count;
  // If it's Admin/Moderator, Write it as 0

if(message.member.hasPermission('MANAGE_ROLES') || message.member.hasPermission(["KICK_MEMBERS", "BAN_MEMBERS"]) || message.guild.user === message.author) {
  guild.set(guild_id, { user_id: user_id, m_count: 0 });
  return console.log("[INFO] Admin Messaging, Cancelling to counting.");
}
  guild.set(guild_id, { user_id: user_id, m_count: m_count+1 });
  console.log(`[INFO] User ${user_id} messaging, Message Count:`, m_count);
  
  if (guild.get(guild_id).m_count > config.warn_max_msg) { 
  	if (message.author.bot) { 
  		if (!config.mute_userbot) { 
  	  	return false; 
  	  }
  	} else {
     message.reply("Your message limit is almost over the message limit per user. If you continue, you may be automatically muted by this bot.").catch(console.error); 
  	}
  }
  if (guild.get(guild_id).m_count > config.max_msg) {
        
        // Now look again your config back, If the owner didn't allows "this" bot to mute last bots, Do nothing.
        if (message.author.bot) { if (!config.mute_userbot) return; } 

        // Give a trigger if the bot has no MANAGE_ROLES permission.
        if(!message.guild.me.hasPermission("MANAGE_ROLES")) return;
   	let muteRole = message.guild.roles.cache.find(r => r.name === config.muted_roles_name);
	console.log(`[INFO] Max Message Count in ${guild_id} Reached. Finding Mute roles....`);
        // If there's no Muted roles named `Muted`, Create one.
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
		}).catch(console.error);
	});
   // If it's Admin/Moderator, Don't mute
if(message.member.hasPermission('MANAGE_ROLES') || message.member.hasPermission(["KICK_MEMBERS", "BAN_MEMBERS"]) || message.guild.user === message.author) return;
   member.roles.add(muteRole.id).then(() => {
     console.log(`[INFO] Muted ${user_id}`);
     message.channel.send("Yeah i don't like you flooding,\n**Muted "+message.author.tag+"!!**");
   }).catch(console.error);
  }
  
  if (!message.mentions.members.size) return;
  if (message.mentions.members.first().id === bot.user.id) {
		message.author.send("Hello, This bot has no Prefix. If you want invite this bot, Here is it:\nhttps://discord.com/api/oauth2/authorize?client_id="+bot.user.id+"&permissions=268438544&scope=bot").catch(console.error);
	}
});
	

bot.login(process.env.TOKEN).catch(console.error);
