const Discord = require('discord.js');
const DBL = require("dblapi.js");
const config = require("./config.json");
const fs = require("fs");
require("./alliances.js")();
require("./utils.js")();
const battle = require("./battles.js");
const express = require('express');
const client = new Discord.Client();
const app = express();
app.use(express.static('public'));
var server = require('http').createServer(app);

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

const dbl = new DBL(config.dbl.token, { webhookServer: listener, webhookAuth: config.dbl.auth}, client);
dbl.webhook.on('ready', hook => {
  console.log(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
});

dbl.webhook.on('vote', vote => {
  let rawdataUser = fs.readFileSync('userdata.json');
  let parsedData = JSON.parse(rawdataUser);
  for(let i = 0; i < parsedData.length;i++){
    if(parsedData[i].id == vote.user){
      parsedData[i].money += 15000;
      break;
    }
  }
  fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
});

//loading the settings
console.log("My prefix is", config.prefix)

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`.help | ${client.users.size} users on ${client.guilds.size} servers`);
  var tdiff = [(Math.floor(Date.now() / 1000) - config.lastPayout), (Math.floor(Date.now() / 1000) - config.lastPopulationWorkPayout)];
  setTimeout(payoutLoop, ((14400 - tdiff[0]) * 1000));
  setTimeout(populationWorkLoop, ((43200 - tdiff[1]) * 1000));
  /*
    let rawdataUser = fs.readFileSync('userdata.json');
  let parsedData = JSON.parse(rawdataUser);
  for(let i = 0; i < parsedData.length;i++){
    if(parsedData[i].food == null){
      parsedData[i].food = 0;
    }
  }
  fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
    let rawdataUser = fs.readFileSync('userdata.json');
  let parsedData = JSON.parse(rawdataUser);
  for(let i = 0; i < parsedData.length;i++){
    parsedData[i].money = Math.floor(parsedData[i].money);
    console.log(parsedData[i].tag);
  }
  fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));*/
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`.help | ${client.users.size} users on ${client.guilds.size} servers`);
  /*const roleUKexists = (guild.roles.find(role => role.name === "UK") == null) ? false : true;
  const roleAEexists = (guild.roles.find(role => role.name === "Advanced Equipment") == null) ? false : true;
  const roleRUexists = (guild.roles.find(role => role.name === "Russia") == null) ? false : true;
  const roleECexists = (guild.roles.find(role => role.name === "Expanded City") == null) ? false : true;
  const roleMSexists = (guild.roles.find(role => role.name === "More Soldiers") == null) ? false : true;
  const roleUSexists = (guild.roles.find(role => role.name === "US") == null) ? false : true;
  
 if(!roleUKexists) {
  guild.createRole({name: 'UK',})
    .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`))
    .catch(console.error)
  }
  if(!roleAEexists) {
    guild.createRole({name: 'Advanced Equipment',})
      .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`))
      .catch(console.error)
  }
  if(!roleRUexists) {
    guild.createRole({name: 'Russia',})
      .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`))
      .catch(console.error)
  }
  if(!roleECexists) {
    guild.createRole({name: 'Expanded City',})
      .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`))
      .catch(console.error)
  }
  if(!roleMSexists) {
    guild.createRole({name: 'More Soldiers',})
      .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`))
      .catch(console.error)
  }
  if(!roleUSexists) {
    guild.createRole({name: 'US',})
      .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`))
      .catch(console.error)
  }*/
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`.help | ${client.users.size} users on ${client.guilds.size} servers`);
});


client.on("message", async message => {
  if(message.author.bot) return;
  
  if(message.content.indexOf(config.prefix) !== 0) return;

  var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  else if(command == "test"){
    const filter = m => m.content.includes('discord');
    const collector = message.channel.createMessageCollector(filter, { time: 15000 });

    collector.on('collect', m => {
      console.log(`Collected ${m.content}`);
    });

    collector.on('end', collected => {
      console.log(`Collected ${collected.size} items`);
    });
  }
  else if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  
  else if(command === "kick" || command === "yeet") {
    /* This command must be limited to mods and admins. In this example we just hardcode the role names.
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");*/
    
    if (!message.member.hasPermission(['KICK_MEMBERS'], false, true, true)) {
      return message.reply("this command can only be used by Members who have Kick permissions");
    }  

    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  else if(command === "ban") {
    /* Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");*/
    
    if (!message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'], false, true, true)) {
      return message.reply("this command can only be used by Members who have Kick and Ban permissions");
    }


    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    if(!message.member.hasPermission(['MANAGE_MESSAGES'], false, true, true)){
      return message.reply("sorry, this command requires the manage message permission.")
    }
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10) + 1;
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 1 || deleteCount > 100)
      return message.reply("Please provide a number between 1 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }

  else if(command === "create"){
    createUser(message);
  }

  else if(command === "vote"){
    message.channel.send("Vote every 12h in order to get 15,000 money for free! \n" + "https://top.gg/bot/619909215997394955/vote")
  }

  else if(command == "bet" || command == "coinflip"){
    let rawdataUser = fs.readFileSync('userdata.json');
    var parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    if(args[0] == "a" && parsedData[index].money == 0) return message.reply("you don't have any money left!");
    else if((!isNumber(args[0]) && args[0] != "a" )|| typeof args[0] === "undefined" || args[0] < 1){
      return message.reply("please enter a valid amount using `.bet <amount>` or `.bet a` to bet all your money.");
    }
    var won = (Math.random() > 0.5);
    var money = (args[0] == "a") ? parsedData[index].money : parseInt(args[0]);
    if(money > parsedData[index].money){
      message.reply("you can't bet more money than you own!");
      return;
    }
    if(won){
      parsedData[index].money += money;
      message.reply("congratulations! You won " + money.commafy() + " coins!");
    }
    else {
      parsedData[index].money -= money;
      message.reply("you lost " + money.commafy() + " coins. Try again next time!");
    }
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
  }

  else if(command == "leaderboard" || command == "lb"){
    var lbEmbed;
    if(args[0] == "p" || args[0] == "population"){
      try {
        lbEmbed = (typeof args[1] === "undefined") ? generateLeaderboardEmbed("p", 1) : generateLeaderboardEmbed("p", args[1]);
      }
      catch {
        message.reply("that isn't a valid page numbers!")
      }
    }
    else if(args[0] == "alliances" || args[0] == "alliance" || args[0] == "a"){
      try {
        lbEmbed = (typeof args[1] === "undefined") ? generateLeaderboardEmbed("a", 1) : generateLeaderboardEmbed("a", args[1]);
      }
      catch {
        message.reply("that isn't a valid page number!")
      }
    }
    else {
      if(isNumber(args[0])){
        try {
          lbEmbed = generateLeaderboardEmbed("m", args[0]);
        }
        catch {
          message.reply("that isn't a valid page number!")
        }
      }
      else {
        try {
          lbEmbed = (typeof args[1] === "undefined") ? generateLeaderboardEmbed("m", 1) : generateLeaderboardEmbed("m", args[1]);
        }
        catch {
          message.reply("that isn't a valid page number!")
        }
      }
    }
    
    message.channel.send({ embed: lbEmbed });
  }

  else if(command === "invitelink"){
    message.reply("".concat("Add me to your server using this link: ", config.properties.inviteLink));
  }

  else if(command == "buy"){
    let rawdataUser = fs.readFileSync('userdata.json');
    var parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    for(var i = 0; i < args.length; i++){
      args[i] = args[i].toLowerCase();
    }
    if(args[0] == "uk"|| (args[0] == "invade") && args[1] == "the" && args[2] == "uk"){
      message.reply(buyItem("UK", index, 100000));
    }
    else if(args[0] == "equipment"|| (args[0] == "advanced") && args[1] == "equipment"){
      message.reply(buyItem("AE", index, 250000));
    }
    else if(args[0] == "russia"|| (args[0] == "invade") && args[1] == "russia"){
      message.reply(buyItem("RU", index, 500000));
    }
    else if(args[0] == "city"|| (args[0] == "expand") && args[1] == "your" && args[2] == "city"){
      message.reply(buyItem("EC", index, 1000000));
    }
    else if(args[0] == "soldiers"|| (args[0] == "recruit") && args[1] == "more" && args[2] == "soldiers"){
      message.reply(buyItem("MS", index, 10000000));
    }
    else if(args[0] == "us"|| (args[0] == "invade") && args[1] == "the" && args[2] == "us"){
      message.reply(buyItem("US", index, 5000000));
    }
    else if(args[0] == "food" || args[0] == "a" && args[1] == "pack" && args[2] == "of" && args[3] == "food"){
      if(parsedData[index].money >= 20000){
        parsedData[index].money -= 20000;
        parsedData[index].resources.food += 50000;
        fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
        message.reply("you successfully bought 50,000 food for your population.");
        return;
      }
      message.reply("You don't have enough money to buy that item.");
    }
    else if(args[0] == "arable" && args[1] == "farming"){
      message.reply(buyItemAlliance("AF", index, 100000, 1));
    }
    else if(args[0] == "pastoral" && args[1] == "farming"){
      message.reply(buyItemAlliance("PF", index, 1750000, 2));
    }
    else if(args[0] == "mixed" && args[1] == "farming"){
      message.reply(buyItemAlliance("MF", index, 7500000, 3));
    }
  }

  else if(command == "use"){
    let rawdataUser = fs.readFileSync('userdata.json');
    var parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    for(var i = 0; i < args.length; i++){
      args[i] = args[i].toLowerCase();
    }
    if(args[0] == "uk"|| (args[0] == "invade") && args[1] == "the" && args[2] == "uk"){
      message.reply(useItem("UK", index, message));
    }
    else if(args[0] == "equipment"|| (args[0] == "advanced") && args[1] == "equipment"){
      message.reply(useItem("AE", index, message));
    }
    else if(args[0] == "russia"|| (args[0] == "invade") && args[1] == "russia"){
      message.reply(useItem("RU", index, message));
    }
    else if(args[0] == "city"|| (args[0] == "expand") && args[1] == "your" && args[2] == "city"){
      message.reply(useItem("EC", index, message));
    }
    else if(args[0] == "soldiers"|| (args[0] == "recruit") && args[1] == "more" && args[2] == "soldiers"){
      message.reply(useItem("MS", index, message));
    }
    else if(args[0] == "us"|| (args[0] == "invade") && args[1] == "the" && args[2] == "us"){
      message.reply(useItem("US", index, message));
    }
  }

  else if(command === "me" || command === "stats"){
    var user;
    var url;
    if(typeof args[0] === "undefined"){
      user = searchUser(message);
      url = `${message.author.displayAvatarURL}`;
    }
    else {
      user = searchUserByID(message.mentions.users.first().id);
      url = `${message.mentions.users.first().displayAvatarURL}`;
    }
    var alliance = user.alliance;

    if(alliance == null){
      alliance = (typeof args[0] === "undefined") ? "You haven't joined an alliance yet." : `${message.mentions.users.first()} hasn't joined an alliance yet.`;
    }
    if(user.allianceRank == "M"){
      alliance = "".concat("Member of ", alliance);
    }
    else if(user.allianceRank == "C"){
      alliance = "".concat("Co-leader of ", alliance);
    }
    else if(user.allianceRank == "L"){
      alliance = "".concat("Leader of ", alliance);
    }
    var upgrades = (typeof args[0] === "undefined") ? "You haven't purchased any upgrades yet." : `${message.mentions.users.first()} hasn't purchased any upgrades yet.`;
    if(user.upgrades.population.length != 0){
      upgrades = "\u200b";
      if(user.upgrades.population.includes("UK")) upgrades += "UK"
      if(user.upgrades.population.includes("AE")) upgrades += ", Equipment"
      if(user.upgrades.population.includes("RU")) upgrades += ", Russia"
      if(user.upgrades.population.includes("EC")) upgrades += ", Expanded City"
      if(user.upgrades.population.includes("MS")) upgrades += ", More Soldiers"
      if(user.upgrades.population.includes("US")) upgrades += ", US"
    }

    const meEmbed = {
      color: parseInt(config.properties.embedColor),
      title: `Data for ` + ((typeof args[0] === "undefined") ? `${message.author.tag}` : `${message.mentions.users.first().tag}`),
      thumbnail: {
        url: url,
      },
      fields: [
        {
          name: 'Money:',
          value: user.money.commafy(),
          inline: true,
        },
        {
          name: 'Food:',
          value: user.resources.food.commafy(),
          inline: true,
        },
        {
          name: "Population",
          value: user.resources.population.commafy(),
        },
        {
          name: 'Alliance',
          value: alliance,
          inline: true,
        },
        {
          name: "Upgrades",
          value: upgrades,
          inline: true,
        }
      ],
      timestamp: new Date(),
      footer: config.properties.footer,
    }; 
    message.channel.send({ embed: meEmbed });
  }

  else if(command == "inventory" || command == "inv"){
    var user = searchUser(message);
    const inventoryEmbed = {
      color: parseInt(config.properties.embedColor),
      title: `Your inventory`,
      thumbnail: {
        url: `${message.author.displayAvatarURL}`,
      },
      fields: [
        {
          name: "Your items (shortenings)",
          value: ((user.inventory.length == 0) ? "You don't have any items in your inventory" : user.inventory.join(", ")),
        }
      ],
      timestamp: new Date(),
      footer: config.properties.footer,
    };
    message.channel.send({ embed: inventoryEmbed });
  }

  else if(command == "server"){
    message.reply("join the official Utopia server here: "+ config.serverInvite);
  }

  else if(command === "add"){
    if(!config.botAdmins.includes(parseInt(message.author.id))) return message.reply("only selected users can use this command. If any problem occured, DM <@393137628083388430>.");
    if(typeof args[0] === "undefined" || typeof args[1] === "undefined" || typeof args[2] === "undefined") return message.reply("please supply valid parameters following the syntax `.add <type> <mention> <amount>`.");
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.mentions.users.first().id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1) return message.reply("this user hasn't created an account yet.");
    var m = ["money", "m"];
    var f = ["food", "f"];
    var p = ["population", "p"]
    const a = parseInt(args[2])
    if(a == null) return message.reply("this isn't a valid amount.");
    if(m.includes(args[0])){
      parsedData[index].money += a;
      message.reply("Succesfully added " + a.commafy() + " " + `money to ${message.mentions.users.first()} balance.`);
    }
    else if(f.includes(args[0])){
      parsedData[index].resources.food += a;
      message.reply("Succesfully added " + a.commafy() + " " + `food to ${message.mentions.users.first()} balance.`);
    }
    else if(p.includes(args[0])){
      parsedData[index].resources.population += a;
      message.reply("Succesfully added " + a.commafy() + " " + `population to ${message.mentions.users.first()} balance.`);
    }
   
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
  }

  else if(command === "send"){
    const a = parseInt(args[1])
    if(typeof args[0] === "undefined" || typeof args[1] === "undefined" || isNaN(a))return message.reply("please supply valid parameters following the syntax `.send <mention> <amount>`.");
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    var auInd = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.mentions.users.first().id == parsedData[i].id) index = i;
      if(message.author.id == parsedData[i].id) auInd = i;
    }
    if(auInd == -1) return message.reply("you haven't created an account yet, please use `.create` to create one.");
    if(index == -1) return message.reply("this user hasn't created an account yet.");
    if(index == auInd) return message.reply("you can't send money to yourself!");
    if(parsedData[auInd].alliance == null) return message.reply("you haven't joined an alliance yet!");
    if(parsedData[auInd].alliance != parsedData[index].alliance) return message.reply("you can only send money to users in your alliance.");
    if(a == null || a < 1) return message.reply("this isn't a valid amount.");
    if(parsedData[auInd].money < a) return message.reply("you can't send more money than you own!");
    parsedData[index].money += a;
    parsedData[auInd].money -= a;
    message.reply("Succesfully sent " + a.commafy() + " " + `money to ${message.mentions.users.first()} balance.`);
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
  }

  else if(command === "joinalliance" || command === "join"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    else if(parsedData[i].alliance != null){
      message.reply("you can't join another alliance, because you already joined one. Leave your alliance with `.leavealliance` first.")
      return;
    }
    if(parsedData[index].alliance == null){
      const allianceName = args.join(" ");
      message.reply(joinAliiance(message, allianceName, index));
    }
  }

  else if(command == "createalliance"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    else if(parsedData[i].alliance != null){
      message.reply("you can't create your own alliance, because you already joined one. Leave your alliance with `.leavealliance` first.")
      return;
    }
    if(parsedData[index].alliance == null){
      const allianceName = args.join(" ");
      message.reply(createAliiance(message, allianceName, index));
    }
  }

  else if(command == "leavealliance" || command == "leave"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    else if(parsedData[i].alliance != null){
      message.reply(leaveAlliance(message));
    }
    if(parsedData[index].alliance == null){
      message.reply("you are not part of any alliance.")
      return;
    }
  }

  else if(command === "promote"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1) return message.reply("you haven't created an account yet, please use the `create` command.");
    if(typeof args[0] === 'undefined') return message.reply("please supply a username with `.promote <mention>`.");
    if(message.mentions.users.first().id == message.author.id) return message.reply("you can't promote yourself!");
    if(parsedData[index].allianceRank != "L") return message.reply("only the leader can promote members.");
    else {
      message.reply(promote(message, index));
    }
  }

  else if(command === "demote"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1) return message.reply("you haven't created an account yet, please use the `create` command.");
    if(message.mentions.users.first().id == message.author.id) return message.reply("you can't demote yourself!");
    if(typeof args[0] === 'undefined') return message.reply("please supply a username with `.demote <mention>`.");
    if(parsedData[index].allianceRank != "L") return message.reply("only the leader can demote members.");
    else {
      message.reply(demote(message, index));
    }
  }

  else if(command === "setprivate"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1) return message.reply("you haven't created an account yet, please use the `create` command.");
    if(parsedData[index].allianceRank == null) return message.reply("you haven't joined an alliance yet.");
    if(parsedData[index].allianceRank != "M") return message.reply(setAllianceStatus(false, index));
    else {
      message.reply("Only the Leader and the Co-Leaders can set the alliance status");
    }
  }

  else if(command === "setpublic"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1) return message.reply("you haven't created an account yet, please use the `create` command.");
    if(parsedData[index].allianceRank == null) return message.reply("you haven't joined an alliance yet.");
    if(parsedData[index].allianceRank != "M") return message.reply(setAllianceStatus(true, index));
    else {
      message.reply("Only the Leader and the Co-Leaders can set the alliance status");
    }
  }

  else if(command === "upgradealliance" || command == "upalliance"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    if(parsedData[index].allianceRank != "M"){
      message.reply(upgradeAlliance(index));
      return;
    }
    else {
      message.reply("Only the Leader and the Co-Leaders can upgrade the alliance status");
    }
  }

  else if(command === "invite"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    if(typeof args[0] === 'undefined'){
      message.reply("please supply a username with `.invite <mention>`.");
      return;
    }
    if(parsedData[index].allianceRank != "M"){
      message.reply(inviteToAlliance(message, index));
      return;
    }
    else {
      message.reply("only the leader and the co-leaders can send out invites.");
    }
  }
  
  else if(command === "fire"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    if(typeof args[0] === 'undefined'){
      message.reply("please supply a username with `.fire <mention>`.");
      return;
    }
    if(parsedData[index].allianceRank != "L"){
      message.reply("only the leader can fire members.");
      return;
    }
    else {
      message.reply(fire(message, index));
    }
  }

  else if(command == "alliance"){
    let rawdataAlliances = fs.readFileSync('alliances.json');
    let parsedDataAlliances = JSON.parse(rawdataAlliances);
    var user;
    var url;
    if(typeof args[0] === "undefined"){
      user = searchUser(message);
      url = `${message.author.displayAvatarURL}`;
    }
    else {
      user = searchUserByID(message.mentions.users.first().id);
      url = `${message.mentions.users.first().displayAvatarURL}`;
    }
    var alliance = user.alliance;
    if(alliance == null){
      if(typeof args[0] === "undefined"){
        message.reply("you haven't joined an alliance yet.");
        return;
      }
      else{
        message.reply(`${message.mentions.users.first()} hasn't joined an alliance yet.`);
        return;
      }
    }

    var ind = -1;
    for(var i = 0; i < parsedDataAlliances.length; i++){
      if(parsedDataAlliances[i].name == user.alliance){
        ind = i;
        break;
      }
    }
    var coLeaders = "This alliance doesn't have any Co-Leaders";
    const cl = parsedDataAlliances[ind].coLeaders;
    if(cl.length == 1){
      coLeaders = "The Co-Leader of this alliance is <@" + cl[0] + ">";
    }
    else if(cl.length == 2){
      coLeaders = "The Co-Leaders of this alliance are <@" + cl[0] + "> and <@" + cl[1] + ">";
    }
    const u = parsedDataAlliances[ind].upgrades;
    const allianceEmbed = {
      color: parseInt(config.properties.embedColor),
      title: "".concat("Data for ", alliance),
      thumbnail: {
        url: url,
      },
      fields: [
        {
          name: 'Leader:',
          value: "".concat("<@",parsedDataAlliances[ind].leader.id,">"),
          inline: true,
        },
        {
          name: "Level",
          value: "This alliance is level " + parsedDataAlliances[ind].level,
          inline: true,
        },
        {
          name: 'Co-Leaders:',
          value: coLeaders,
        },
        {
          name: "Membercount:",
          value: parsedDataAlliances[ind].members.length + parsedDataAlliances[ind].coLeaders.length + 1,
          inline: true,
        },
        {
          name: "Privaty settings",
          value: (parsedDataAlliances[ind].public) ? "This alliance is public" : "This alliance is private",
          inline: true
        },
        {
          name: 'Upgrades',
          value: "This alliance owns: " + u.af + "x Arable Farming, " + u.pf + "x Pastoral Farming, " + u.mf + "x Mixed Farming",
          inline: true,
        },
      ],
      timestamp: new Date(),
      footer: config.properties.footer,
    }; 
    message.channel.send({ embed: allianceEmbed });
  }

  else if(command == "alliancemembers"){
    let rawdataAlliances = fs.readFileSync('alliances.json');
    let parsedDataAlliances = JSON.parse(rawdataAlliances);
    var user;
    var url;
    if(typeof args[0] === "undefined"){
      user = searchUser(message);
      url = `${message.author.displayAvatarURL}`;
    }
    else {
      user = searchUserByID(message.mentions.users.first().id);
      url = `${message.mentions.users.first().displayAvatarURL}`;
    }
    var alliance = user.alliance;
    if(alliance == null){
      if(typeof args[0] === "undefined"){
        message.reply("you haven't joined an alliance yet.");
        return;
      }
      else{
        message.reply(`${message.mentions.users.first()} hasn't joined an alliance yet.`);
        return;
      }
    }

    var ind = -1;
    for(var i = 0; i < parsedDataAlliances.length; i++){
      if(parsedDataAlliances[i].name == user.alliance){
        ind = i;
        break;
      }
    }
    var coLeaders = "This alliance doesn't have any Co-Leaders";
    const cl = parsedDataAlliances[ind].coLeaders;
    if(cl.length == 1){
      coLeaders = "<@" + cl[0] + ">";
    }
    else if(cl.length == 2){
      coLeaders = " <@" + cl[0] + "> and <@" + cl[1] + ">";
    }
    var members = "This alliance doesn't have any members";
    if(parsedDataAlliances[ind].members.length > 0){
      members = ""
      for(let i = 0; i < parsedDataAlliances[ind].members.length;i++){
        members += "<@" + parsedDataAlliances[ind].members[i] +">\n";
      }
    }
    var invs = "This alliance doesn't have any active invites";
    if(parsedDataAlliances[ind].invitedUsers.length > 0){
      invs = ""
      for(let i = 0; i < parsedDataAlliances[ind].invitedUsers.length;i++){
        invs += "<@" + parsedDataAlliances[ind].invitedUsers[i] +">\n";
      }
    }
    const u = parsedDataAlliances[ind].upgrades;
    const allianceEmbed = {
      color: parseInt(config.properties.embedColor),
      title: "".concat("Data for ", alliance),
      thumbnail: {
        url: url,
      },
      fields: [
        {
          name: 'Leader:',
          value: "".concat("<@",parsedDataAlliances[ind].leader.id,">"),
          inline: true,
        },
        {
          name: 'Co-Leaders:',
          value: coLeaders,
          inline: true,
        },
        {
          name: "Members:",
          value: members,
        },
        {
          name: "Invited users:",
          value: invs
        }
      ],
      timestamp: new Date(),
      footer: config.properties.footer,
    }; 
    message.channel.send({ embed: allianceEmbed });
  }

  else if(command === "help"){
    var helpEmbed = {
      color: parseInt(config.properties.embedColor),
      title: "Welcome to the help menu. Please choose a category",
      thumbnail: {
        url: message.author.displayAvatarURL,
      },
      fields: [
        {
          name: 'General help:',
          value: "type `.help general` to view the help menu for the general comamnds",
        },
        {
          name: 'Alliance help:',
          value: "type `.help alliance` to view the alliance help menu",
        },
        {
          name: "Miscellaneous help:",
          value: "type `.help misc` to view the help menu for everything else",
        },
        {
          name: "Moderation help:",
          value: "type `.help mod` to view the help menu for everything else",
        }
      ],
      timestamp: new Date(),
      footer: config.properties.footer,
    }; 
    var a = ["alliance", "alliances", "a"]
    var g = ["general", "g"]
    if(g.includes(args[0])){
      helpEmbed.fields[2].name = "`.work`";
      helpEmbed.fields[2].value = "You gain up to 10,000 coins from working. You can work every 30 minutes.";
      helpEmbed.fields[0].name = "`.create`"
      helpEmbed.fields[0].value ="Create an account and start to conquer the world!"
      helpEmbed.fields[1].name = "`.me` or `.stats <mention>`"
      helpEmbed.fields[1].value = "View your stats or these of other players."
      helpEmbed.fields[3].value = "You can commit a crime every 4 hours. You have a 5% chance to increase your networth by 50,000 coins or up to 5% (whichever is higher), but be careful: you can also lose up to 2% of your current networth.",
      helpEmbed.fields[3].name = "`.crime`"
      field4 = {
        name: "`.lb` or `.leaderboard [type] [page]`",
        value: "View the global leaderboard. Allowed types are 'allaince', 'money' and 'population'.",
      }
      field5 = {
        name: "`.shop` or `.store [category]`",
        value: "View the shop (you'll find further information there).",
      }
      field6 = {
        name: "`.buy [item]`",
        value: "Buy an item from the shop."
      },
      field7 = {
        name: "`.use [item]`",
        value: "Use on of your purchased items."
      }
      field8 = {
        name: "`.inventory` or `.inv`",
        value: "View the items you purchased but haven't used yet."
      }
      field9 = {
        name: "`.alliance [mention]`",
        value: "View the stats of your alliance or of the alliance of another user."
      }
      field10 = {
        name: "`.bet <amount>` or `.coinflip <amount>`",
        value: "You either gain the amount you bet or you lose it. (Note: use `.bet a` to bet all your money)"
      }
      helpEmbed.title = "General help";
      helpEmbed.fields.push(field3, field4, field5, field6, field7, field8, field9, field10);
    }
    else if(a.includes(args[0])){
      helpEmbed.fields[2].name = "`.createalliance <name>`";
      helpEmbed.fields[2].value = "Create your own alliance. (Price: 250,000)";
      helpEmbed.fields[0].name = "`.leavealliance`";
      helpEmbed.fields[0].value ="Leave your current alliance";
      helpEmbed.fields[1].name = "`.joinalliance <name>`";
      helpEmbed.fields[1].value = "Join an alliance";
      helpEmbed.fields.pop();
      field3 = {
        name: "`.promote <mention>` (Leader only)",
        value: "Promote a member or Co-Leader of your alliance (there is a maximum of two co-leaders)",
      }
      field4 = {
        name: "`.demote <mention>` (Leader only)",
        value: "Demote a member of your alliance.",
      }
      field5 = {
        name: "`.fire <mention>` (Leader only)",
        value: "Fire a member of your alliance.",
      }
      field6 = {
        name: "`.setpublic` and `.setprivate` (Leader and Co-Leaders only)",
        value: "Change the setting of your alliance. Public: Everyone can join, Private: Only invited users can join."
      },
      field7 = {
        name: "`.invite <mention>` (Leader and Co-Leaders only)",
        value: "Invite a member to your alliance."
      }
      field8 = {
        name: "`.upgradealliance` (Leader and Co-Leaders only)",
        value: "Level up your alliance in order to buy more upgrades. A level two alliance can own every farm two times for example. The current maximum is level 4."
      }
      field9 = {
        name: "`.alliance [mention]`",
        value: "View the stats of your alliance or of the alliance of another user."
      }
      field10 = {
        name: "`.send <mention> <amount>`",
        value: "Send a specific amount of money to one of your alliance members."
      }
      field11 = {
        name: "`.alliancemembers [mention]`",
        value: "See a detailed list of all members and invited users from your alliance or the alliance of another user"
      }
      helpEmbed.title = "Alliance help";
      helpEmbed.fields.push(field3, field4, field5, field6, field7, field8, field9, field10, field11);
    }
    else if(args[0] == "misc"){
      helpEmbed.fields[0].name = "`.autpoing`";
      helpEmbed.fields[0].value ="Enable/Disable autopings when you can work or commit a crime again. (Enabled by default)";
      helpEmbed.fields[1].name = "`.payoutdms`";
      helpEmbed.fields[1].value = "Enable/Disable DMs when the payouts are given out. (Disabled by default)";
      helpEmbed.fields[2].name = "`.invitelink`";
      helpEmbed.fields[2].value = "Grab an invite link to add me to your server!";
      helpEmbed.fields.pop();
      field3 = {
        name: "`.server`",
        value: "Join the official Utopia server!"
      }
      helpEmbed.title = "Miscellaneous help";
      helpEmbed.fields.push(field3);
    }
    else if(args[0] == "mod"){
      helpEmbed.fields[0].name = "`.ban <mention>`";
      helpEmbed.fields[0].value ="Bans a user from the server.";
      helpEmbed.fields[1].name = "`.yeet <mention>` or `.kick <mention>`";
      helpEmbed.fields[1].value = "Kicks a user from the server";
      helpEmbed.fields[2].name = "`.purge <amount>`";
      helpEmbed.fields[2].value = "Delete a specific amount of messages (up to 100 at the same time).";
      helpEmbed.fields.pop();
      helpEmbed.title = "Moderation help"
      helpEmbed.description = "The bot role needs to be ranked above the roles of the other users in order for these commands to work.";
    }
    message.channel.send({ embed: helpEmbed });
  }

  else if(command === "store" || command == "shop"){
    var storeEmbed = null;
    a = ["alliance", "alliances", "a"]
    if(args[0] == "population" || args[0] == "p"){
      storeEmbed = createStoreEmbed(message, "p", args);
    }
    else if(a.includes(args[0])){
      storeEmbed = createStoreEmbed(message, "a", args);
    }
    else {
      storeEmbed = createStoreEmbed(message, "s", args);
    }
    if(storeEmbed != null) message.channel.send({ embed: storeEmbed });
  }

  else if(command == "autoping"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    parsedData[index].autoping = !parsedData[index].autoping;
    var s = (!parsedData[index].autoping) ? "you successfully disabled autopings." : "you succesfully enabled autopings.";
    message.reply(s);
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
  }

  else if(command == "payoutdms"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    parsedData[index].payoutDMs = !parsedData[index].payoutDMs;
    var s = (!parsedData[index].payoutDMs) ? "you successfully disabled payout DMs." : "you succesfully enabled payout DMS.";
    message.reply(s);
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
  }

  else if(command === "work"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    const oldTag = parsedData[index].tag;
    try{
      parsedData[index].tag = client.users.get(parsedData[index].id.toString()).tag;
    }
    catch {
      parsedData[index].tag = oldTag;
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    if(Math.floor(Date.now() / 1000) - parsedData[index].lastWorked < 1800){
      message.reply("".concat("You can work again in ", new Date((1800 - (Math.floor(Date.now() / 1000) - parsedData[i].lastWorked)) * 1000).toISOString().substr(11, 8)));
    }
    else {
      let oldBalance = parseInt(parsedData[index].money);
      var produced = Math.floor(Math.random() * 10000);
      var newBalance = oldBalance + produced;
      parsedData[index].money = newBalance;
      parsedData[index].lastWorked = Math.floor(Date.now() / 1000);
      fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2))
      message.reply("".concat("You successfully worked and gained ", produced.commafy(), " coins. Your new balance is ", newBalance.commafy(), " coins."));
      if(parsedData[index].autoping == true){
        reminder(message, "w");
      }
    }
  }

  else if(command === "crime"){
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.author.id == parsedData[i].id){
        index = i;
        break;
      }
    }
    if(index == -1){
      message.reply("you haven't created an account yet, please use the `create` command.");
      return;
    }
    if(Math.floor(Date.now() / 1000) - parsedData[index].lastCrime < 14400){
      message.reply("".concat("You can commit a crime again in ", new Date((14400 - (Math.floor(Date.now() / 1000) - parsedData[i].lastCrime)) * 1000).toISOString().substr(11, 8)));
    }
    else {
      let oldBalance = parseInt(parsedData[i].money);
      var produced;
      if(Math.floor(Math.random() * 99) < 5){
        var p = Math.floor(oldBalance * Math.random() * 0.02);
        produced = (p > 50000) ? p : 50000;
      }
      else {
        produced = Math.floor(-1 * (oldBalance * Math.random() * 0.02));
      }
      var newBalance = oldBalance + produced;
      parsedData[index].money = newBalance;
      parsedData[index].lastCrime = Math.floor(Date.now() / 1000);
      fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2))
      if(produced > 1){
        message.reply("".concat("You successfully worked and gained ", produced.commafy(), " coins. Your new balance is ", newBalance.commafy(), " coins."));
      }
      else{
        message.reply("".concat("You were unsuccesful and lost ", produced.commafy(), " coins. Your new balance is ", newBalance.commafy(), " coins."));
      }
      if(parsedData[index].autoping == true){
        reminder(message, "c");
      }
    }   
  }

  else if(command === "startbattle"){
    if(typeof args[0] === "undefined")return message.reply("please supply valid parameters following the syntax `.startbattle <mention>`.");
    let rawdataUser = fs.readFileSync('userdata.json');
    let parsedData = JSON.parse(rawdataUser);
    var index = -1;
    var auInd = -1;
    for(var i = 0; i < parsedData.length; i++){
      if(message.mentions.users.first().id == parsedData[i].id) index = i;
      if(message.author.id == parsedData[i].id) auInd = i;
    }
    if(auInd == -1) return message.reply("you haven't created an account yet, please use `.create` to create one.");
    if(index == -1) return message.reply("this user hasn't created an account yet.");
    if(index == auInd) return message.reply("you can't battle yourself!");
    battle.startbattle(auInd, index);
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
  }
});


client.login(config.token);

function createUser(msg){
  let rawdataUser = fs.readFileSync('userdata.json');
  let parsedData = JSON.parse(rawdataUser);
  try{
    for(var i = 0; i < parsedData.length; i++){
      if(msg.author.id == parsedData[i].id){
        msg.reply("you already have an registered account!");
        return;
      }
    }
  }
  catch {}
  
  let data = {
      tag: msg.author.tag,
      id: msg.author.id,
      money: 1000,
      lastWorked: 0,
      lastCrime: 0,
      autoping: true,
      payoutDMs: false,
      alliance: null,
      allianceRank: null,
      resources: {
        food: 10000,
        population: 1000
      },
      upgrades: {
        population: [],
        misc: []
      },
      inventory: []
  }
  parsedData.push(data);
  fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2))
  msg.reply("your account has been succesfully created.");
}

async function reminder(msg, type){
  var rawdataUser = fs.readFileSync('userdata.json');
  var parsedData = JSON.parse(rawdataUser);
  if(type == "w"){
    msg.channel.send("I'll remind you in 30 minutes that you can work again.");
    for(var i = 0; i < parsedData.length; i++){
      if(msg.author.id == parsedData[i].id){
        parsedData[i].lastWorked = Math.floor(Date.now() / 1000);
        break;
      }
    }
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
    await Sleep(1800000);
    msg.reply("Reminder: Work again");
  }
  else if(type == "c"){
    msg.channel.send("I'll remind you in 4h to commit a crime again.");
    for(var i = 0; i < parsedData.length; i++){
      if(msg.author.id == parsedData[i].id){
        parsedData[i].lastCrime = Math.floor(Date.now() / 1000);
        break;
      }
    }
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
    await Sleep(14400000);
    msg.reply("Reminder: Commit a crime.");
  }
  else {
    console.log("Error, no valid parameter for the reminder function.");
  }
  
}

function createStoreEmbed(message, type, args){
  /* p = population
  *  s = store (default)
  *  a = alliance
  */
  if(type == "p"){
    var user = searchUser(message);
    const newEmbed = {
      color: parseInt(config.properties.embedColor),
      title: 'Population store',
      description: 'These items are currently available in the population store!',
      thumbnail: {
        url: `${message.author.displayAvatarURL}`,
      },
      fields: [
        {
          name: 'Your balance',
          value: user.money.commafy(),
        },
        {
          name: '\u200b',
			    value: '\u200b'
        },
        {
          name: 'Invade the UK',
          value: '+5k population every 4h \nPrice: 100,000',
          inline: true,
        },
        {
          name: 'Advanced Equipment',
          value: '+5k population every 4h \nPrice: 250,000',
          inline: true,
        },
        {
          name: 'Invade Russia',
          value: '+10k population every 4h \nPrice: 500,000',
          inline: true,
        },
        {
          name: 'Expand your City',
          value: '+25k population every 4h \nPrice: 1,000,000',
          inline: true,
        },
        {
          name: 'Recruit more Soldiers',
          value: '+500k population every 4h\nPrice: 10,000,000',
          inline: true,
        },
        {
          name: 'Invade the US',
          value: '+2M population every 4h \nPrice: 50,000,000',
          inline: true,
        },
      ],
      timestamp: new Date(),
      footer: config.properties.footer,
    };
    return newEmbed;
  }
  else if(type == "a"){
    var user = searchUser(message);
    var alliance = user.alliance;

    if(alliance == null){
      alliance = (typeof args[0] === "undefined") ? "You haven't joined an alliance yet." : `${message.mentions.users.first()} hasn't joined an alliance yet.`;
    }
    if(user.allianceRank == "M"){
      alliance = "".concat("Member of ", alliance);
    }
    else if(user.allianceRank == "C"){
      alliance = "".concat("Co-leader of ", alliance);
    }
    else if(user.allianceRank == "L"){
      alliance = "".concat("Leader of ", alliance);
    }
    const newEmbed = {
      color: parseInt(config.properties.embedColor),
      title: 'Alliance store',
      description: 'These items are currently avialable in the alliance store! \n' +  
                "Note: only the leader and the Co-Leaders can buy alliance upgrades and they are used immediately. " +
                "The Leader gets 10% of the alliance income, the Co-Leaders 5% each. The rest is split among the members.",
      thumbnail: {
        url: `${message.author.displayAvatarURL}`,
      },
      fields: [
        {
          name: 'Your balance',
          value: user.money.commafy(),
          inline: true,
        },
        {
          name: "Your alliance, your rank:",
          value: alliance,
          inline: true,
        },
        {
          name: '\u200b',
			    value: '\u200b'
        },
        {
          name: 'Arable farming',
          value: '+150k food for the alliance every 4h \nPrice: 100,000',
          inline: true,
        },
        {
          name: "Pastoral farming",
          value: "+1M food for the alliance every 4h \nPrice: 1,750,000",
          inline: true,
        },
        {
          name: "Mixed farming",
          value: "+5M food for the alliance every 4h \nPrice: 7,500,000",
          inline: true,
        }
      ],
      timestamp: new Date(),
      footer: config.properties.footer,
    };
    return newEmbed;
  }
  else if(type == "s"){
    var user = searchUser(message);
    const newEmbed = {
      color: parseInt(config.properties.embedColor),
      title: 'Store',
      description: 'Welcome to the store! \n' +
                    "Note: All items can only be purchased **once**.",
      thumbnail: {
        url: `${message.author.displayAvatarURL}`,
      },
      fields: [
        {
          name: 'Population store',
          value: "".concat('Type `', config.prefix, "store population` to view the population store"),
        },
        {
          name: 'Alliance store',
          value: "".concat('Type `', config.prefix, "store alliance` to view the alliance store"), 
        },
        {
          name: 'A pack of food',
          value: 'Contains 50k food (added to your account immediately) \nPrice: 20,000',
          inline: true,
        },
      ],
      timestamp: new Date(),
      footer: config.properties.footer,
    };
    return newEmbed;
  }
}

function payoutLoop(){
  let rawdataUser = fs.readFileSync('userdata.json');
  let parsedData = JSON.parse(rawdataUser);
  let rawdataConfig = fs.readFileSync("config.json");
  let parsedConfigData = JSON.parse(rawdataConfig);
  let rawdataAlliances = fs.readFileSync('alliances.json');
  let parsedDataAlliances = JSON.parse(rawdataAlliances);
  var payoutChannel = client.channels.get(parsedConfigData.payoutChannel);
  //while(true){
    /*var tdiff = Math.floor(Date.now() / 1000) - parsedConfigData.lastPopulationWorkPayout;
    if(tdiff < 100){
      Sleep((100 - tdiff) * 1000);
    }
    rawdataUser = fs.readFileSync('userdata.json');
    parsedData = JSON.parse(rawdataUser);
    rawdataAlliances = fs.readFileSync('alliances.json');
    parsedDataAlliances = JSON.parse(rawdataAlliances);*/
    payoutChannel.send("Processing started...");
    let l = parsedData.length;
    for(var i = 0; i < l; i++){
      if(parsedData[i].upgrades.population.includes("UK")){
        parsedData[i].resources.population += 5000;
      }
      if(parsedData[i].upgrades.population.includes("AE")){
        parsedData[i].resources.population += 5000;
      }
      if(parsedData[i].upgrades.population.includes("RU")){
        parsedData[i].resources.population += 10000;
      }
      if(parsedData[i].upgrades.population.includes("EC")){
        parsedData[i].resources.population += 25000;
      }
      if(parsedData[i].upgrades.population.includes("MS")){
        parsedData[i].resources.population += 500000;
      }
      if(parsedData[i].upgrades.population.includes("US")){
        parsedData[i].resources.population += 2000000;
      }
      if(parsedData[i].payoutDMs){
        try{
          client.users.get(parsedData[i].id).send("You have succesfully gained population from your upgrades!");
        }
        catch(e){
          console.log(e);
        }
      }
    } 
    payoutChannel.send("You have succesfully gained population from your upgrades!");
    payoutChannel.send("Processing started...");
    for(var i = 0; i < parsedDataAlliances.length; i++){
      if(parsedDataAlliances[i].upgrades.af > 0){
        for(var j = 0; j < parsedData.length; j++){
          if(parsedData[j].alliance == parsedDataAlliances[i].name){
            if(parsedData[j].id == parsedDataAlliances[i].leader.id){
              parsedData[j].resources.food += parsedDataAlliances[i].upgrades.af * 15000 + Math.floor(((parsedDataAlliances[i].upgrades.af * 120000)/(parsedDataAlliances[i].members.length + parsedDataAlliances[i].coLeaders.length + 1)));
            }
            if(parsedDataAlliances[i].coLeaders.includes(parsedData[j].id)){
              parsedData[j].resources.food += parsedDataAlliances[i].upgrades.af * 7500 + Math.floor(((parsedDataAlliances[i].upgrades.af * 120000)/(parsedDataAlliances[i].members.length + parsedDataAlliances[i].coLeaders.length + 1)));
            }
            if(parsedDataAlliances[i].members.includes(parsedData[j].id)){
              parsedData[j].resources.food += Math.floor(((parsedDataAlliances[i].upgrades.af * 120000)/(parsedDataAlliances[i].members.length + parsedDataAlliances[i].coLeaders.length + 1)));
            }
          }
        }
      }
      if(parsedDataAlliances[i].upgrades.pf > 0){
        for(var j = 0; j < parsedData.length; j++){
          if(parsedData[j].alliance == parsedDataAlliances[i].name){
            if(parsedData[j].id == parsedDataAlliances[i].leader.id){
              parsedData[j].resources.food += parsedDataAlliances[i].upgrades.pf * 100000 + Math.floor(((parsedDataAlliances[i].upgrades.af * 800000)/(parsedDataAlliances[i].members.length + parsedDataAlliances[i].coLeaders.length + 1)));
            }
            if(parsedDataAlliances[i].coLeaders.includes(parsedData[j].id)){
              parsedData[j].resources.food += parsedDataAlliances[i].upgrades.pf * 50000 + Math.floor(((parsedDataAlliances[i].upgrades.af * 800000)/(parsedDataAlliances[i].members.length + parsedDataAlliances[i].coLeaders.length + 1)));
            }
            if(parsedDataAlliances[i].members.includes(parsedData[j].id)){
              parsedData[j].resources.foodd += Math.floor(((parsedDataAlliances[i].upgrades.af * 800000)/(parsedDataAlliances[i].members.length + parsedDataAlliances[i].coLeaders.length + 1)));
            }
          }
        }
      }
      if(parsedDataAlliances[i].upgrades.mf > 0){
        for(var j = 0; j < parsedData.length; j++){
          if(parsedData[j].alliance == parsedDataAlliances[i].name){
            if(parsedData[j].id == parsedDataAlliances[i].leader.id){
              parsedData[j].resources.food += parsedDataAlliances[i].upgrades.mf * 500000 + Math.floor(((parsedDataAlliances[i].upgrades.af * 4000000)/(parsedDataAlliances[i].members.length + parsedDataAlliances[i].coLeaders.length + 1)));
            }
            if(parsedDataAlliances[i].coLeaders.includes(parsedData[j].id)){
              parsedData[j].resources.food += parsedDataAlliances[i].upgrades.mf * 250000 + Math.floor(((parsedDataAlliances[i].upgrades.af * 4000000)/(parsedDataAlliances[i].members.length + parsedDataAlliances[i].coLeaders.length + 1)));
            }
            if(parsedDataAlliances[i].members.includes(parsedData[j].id)){
              parsedData[j].resources.food += Math.floor(((parsedDataAlliances[i].upgrades.af * 4000000)/(parsedDataAlliances[i].members.length + parsedDataAlliances[i].coLeaders.length + 1)));
            }
          }
        }
      }
    }
    payoutChannel.send("You have succesfully gained food from your alliance upgrades!");
    parsedConfigData.lastPayout = Math.floor(Date.now() / 1000);
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2))
    fs.writeFileSync("config.json", JSON.stringify(parsedConfigData, null, 2))
    fs.writeFileSync("alliances.json", JSON.stringify(parsedDataAlliances, null, 2))
    //await Sleep(14400000);
    setTimeout(payoutLoop, (1000 * 14400));
  }
//}

function populationWorkLoop(){
  let rawdataUser = fs.readFileSync('userdata.json');
  let parsedData = JSON.parse(rawdataUser);
  let rawdataConfig = fs.readFileSync("config.json");
  let parsedConfigData = JSON.parse(rawdataConfig);
  var payoutChannel = client.channels.get(parsedConfigData.payoutChannel);
  //while(true){
    /*var tdiff = Math.floor(Date.now() / 1000) - parsedConfigData.lastPopulationWorkPayout;
    if(tdiff < 43200){
      Sleep((43200 - tdiff) * 1000);
    }*/
    rawdataUser = fs.readFileSync('userdata.json');
    parsedData = JSON.parse(rawdataUser);
    payoutChannel.send("Processing started...");
    let l = parsedData.length;
    for(var i = 0; i < l; i++){
      pop = parsedData[i].resources.population;
      parsedData[i].money += Math.floor(pop / Math.floor((Math.random() * 10) + 15));
      const consumption = Math.floor(pop * (2 + getBaseLog(10, getBaseLog(10, getBaseLog(3, pop)))));
      if(consumption > parsedData[i].resources.food){
        const diff = consumption - parsedData[i].resources.food;
        parsedData[i].resources.food = 0;
        try {
          client.users.get(parsedData[i].id.toString()).send("**Alert**: You don't have any food left, your population is dying!");
        }
        catch {}
        if(diff > pop){
          parsedData[i].resources.population = 0;
          try{
            client.users.get(parsedData[i].id.toString()).send("**Alert**: All of your population died");
          }
          catch {}
        }
        else {
          parsedData[i].resources.population -= diff;
        }
      }
      else {
        parsedData[i].resources.food -= consumption;
      }
      if(parsedData[i].payoutDMs){
        try {
          client.users.get(parsedData[i].id.toString()).send("You have succesfully gained money through the work of your population!");
        }
        catch {}
      }
      console.log("Factor: " + (2 + getBaseLog(10, getBaseLog(10, getBaseLog(3, pop)))) + "(" + parsedData[i].tag + ")");
    } 
    payoutChannel.send("You have succesfully gained money through the work of your population!");
    parsedConfigData.lastPopulationWorkPayout = Math.floor(Date.now() / 1000);
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2))
    fs.writeFileSync("config.json", JSON.stringify(parsedConfigData, null, 2))
    //await Sleep(43200000);
    setTimeout(populationWorkLoop, (1000 * 43200));
  }
//}

function getLeaderboardList(type){
  let rawdataUser = fs.readFileSync('userdata.json');
  let parsedData = JSON.parse(rawdataUser);
  let rawdataAlliances = fs.readFileSync('alliances.json');
  let parsedDataAlliances = JSON.parse(rawdataAlliances);
  if(type == "p"){
    return parsedData.sort((a, b) => parseFloat(b.resources.population) - parseFloat(a.resources.population));
  }
  else if(type == "a"){
    return parsedDataAlliances.sort(sort_by('name', false, function(a){return a.toUpperCase()}));
  }
  else {
    return parsedData.sort((a, b) => parseFloat(b.money) - parseFloat(a.money));
  }
}

function generateLeaderboardEmbed(type, page){
  var p = page - 1;
  var lbEmbed;
  if(type == "p"){
    var lb = getLeaderboardList("p");
    lbEmbed = {
      color: parseInt(config.properties.embedColor),
      title: "".concat("Leaderboard sorted by population, page ", page, " of ", Math.floor(lb.length / 10) + 1),
      fields: leaderBoardEmbedFields(p, lb, "p"),
      timestamp: new Date(),
      footer: config.properties.footer,
    };
  }
  else if(type == "a"){
    var lb = getLeaderboardList("a");
    lbEmbed = {
      color: parseInt(config.properties.embedColor),
      title: "".concat("Alliance leaderboard sorted by name, page ", page, " of ", Math.floor(lb.length / 10) + 1),
      fields: leaderBoardEmbedFields(p, lb, "a"),
      timestamp: new Date(),
      footer: config.properties.footer,
    };
  }
  else {
    var lb = getLeaderboardList("m");
    lbEmbed = {
      color: parseInt(config.properties.embedColor),
      title: "".concat("Leaderboard sorted by money, page ", page, " of ", Math.floor(lb.length / 10) + 1),
      fields: leaderBoardEmbedFields(p, lb, "m"),
      timestamp: new Date(),
      footer: config.properties.footer,
    };
  }
  return lbEmbed;
}

function leaderBoardEmbedFields(p, lb, type){
  var h = ((lb.length - p * 10) > 10) ? 10 : lb.length - p * 10;
  var fields = [];
  if(type == "p"){
    for(var i = 0; i < h; i++){
      field = {
        name: "`#" + ((i + 1) + (p * 10)) + "` - " + lb[i + p * 10].tag,
        value: "".concat(lb[i + p * 10].resources.population.commafy(), " population")
      }
      fields.push(field);
    }
  }
  else if(type == "a"){
    for(var i = 0; i < h; i++){
      field = {
        name: "`#" + ((i + 1) + (p * 10)) + "`",
        value: lb[i + p *10].name,
      }
      fields.push(field);
    }
  }
  else {
    for(var i = 0; i < h; i++){
      field = {
        name: "`#" + ((i + 1) + (p * 10)) + "` - " + lb[i + p * 10].tag,
        value: "".concat(lb[i + p * 10].money.commafy(), " coins")
      }
      fields.push(field);
    }
  }
  return fields;
}

function useItem(item, index, message){
  let rawdataUser = fs.readFileSync('userdata.json');
  var parsedData = JSON.parse(rawdataUser);
  if(!parsedData[index].inventory.includes(item)){
    return "you don't own that item.";
  }
  populationUpgrades = ["UK", "AE", "RU", "EC", "MS", "US"];
  parsedData[index].inventory = parsedData[index].inventory.filter(i => i !== item);
  if(populationUpgrades.includes(item)){
    parsedData[index].upgrades.population.push(item);
  }
  else {
    parsedData[index].upgrades.misc.push(item);
  }
  fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
  switch(item){
    case "UK":
      return "you succesfully invaded the UK.";
    case "AE":
      return "you succesfully used the Advanced Equipment.";
    case "RU":
      return "you succesfully invaded Russia.";
    case "EC":
      return "you succesfully expanded your city.";
    case "MS":
      return "you succesfully recruited more soldiers.";
    case "US":
      return "you succesfully invaded the US";
    default:
      return "Error";
  }
}

function buyItem(item, index, price){
  let rawdataUser = fs.readFileSync('userdata.json');
  var parsedData = JSON.parse(rawdataUser);
  if(parsedData[index].inventory.includes(item)){
      return "you already own that item! Use it with `.use <item>`";
  }
  else if(parsedData[index].upgrades.population.includes(item) || parsedData[index].upgrades.misc.includes(item)){
    return "you already bought and used this item!";
  }
  if(parsedData[index].money >= price){
    parsedData[index].money -= price;
    parsedData[index].inventory.push(item);
    fs.writeFileSync("userdata.json", JSON.stringify(parsedData, null, 2));
    return "you successfully bought the item.";
  }
  return "You don't have enough money to buy that item.";
}