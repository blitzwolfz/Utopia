import { Client, TextChannel } from "discord.js";
import { user, alliance } from "../../utils/interfaces";
import { getAllUsers, getAllAlliances, updateValueForUser, getUser, editConfig } from "../../utils/databasehandler";
import * as config from "../../config.json";

export async function payoutLoop(client: Client) {
    let users: user[] = await getAllUsers();
    let alliances: alliance[] = await getAllAlliances();
    var payoutChannel = client.channels.get(config.payoutChannel)!;
    for (const u of users) {
        if (u.upgrades.population.includes("UK"))
            updateValueForUser(u._id, "population", 5000, "$inc");
        if (u.upgrades.population.includes("AE"))
            updateValueForUser(u._id, "population", 10000, "$inc");
        if (u.upgrades.population.includes("RU"))
            updateValueForUser(u._id, "population", 15000, "$inc");
        if (u.upgrades.population.includes("EC"))
            updateValueForUser(u._id, "population", 25000, "$inc");
        if (u.upgrades.population.includes("GL"))
            updateValueForUser(u._id, "population", 50000, "$inc");
        if (u.upgrades.population.includes("MS"))
            updateValueForUser(u._id, "population", 200000, "$inc");
        if (u.upgrades.population.includes("US"))
            updateValueForUser(u._id, "population", 750000, "$inc");
        updateValueForUser(u._id, "food", u.upgrades.pf.nf * 500000, "$inc");
        updateValueForUser(u._id, "food", u.upgrades.pf.sf * 1000000, "$inc");
        updateValueForUser(u._id, "food", u.upgrades.pf.sef * 5000000, "$inc");
        updateValueForUser(u._id, "food", u.upgrades.pf.if * 10000000, "$inc");

        if (u.payoutDMs) {
            try {
                client.users.get(u._id)!.send("You have succesfully gained population from your upgrades!");
            }
            catch (e) {
                console.log(e + "\n" + u.tag);
            }
        }
        if (u.resources.food == null) updateValueForUser(u._id, "food", 0, "$set")
    }
    (payoutChannel as TextChannel).send({
        embed: {
            color: 0x00FF00,
            title: "You have succesfully gained population from your upgrades!",
            timestamp: new Date()
        }
    });

    for (const alliance of alliances) {
        if (alliance.upgrades.af > 0) {
            for (const m of alliance.members) {
                updateValueForUser(m, "food", Math.floor((alliance.upgrades.af * 120000) / (alliance.members.length + alliance.coLeaders.length + 1)), "$inc");
            }
            for(const c of alliance.coLeaders){
                updateValueForUser(c, "food", alliance.upgrades.af * 7500 + Math.floor((alliance.upgrades.af * 120000) / (alliance.members.length + alliance.coLeaders.length + 1)), "$inc");
            }
            updateValueForUser(alliance.leader._id, "food", alliance.upgrades.af * 15000 + Math.floor((alliance.upgrades.af * 120000) / (alliance.members.length + alliance.coLeaders.length + 1)), "$inc");
            if(alliance.coLeaders.length === 0) updateValueForUser(alliance.leader._id, "food", alliance.upgrades.af * 15000, "$inc");
        }
        if(alliance.upgrades.pf > 0){
            for (const m of alliance.members) {
                updateValueForUser(m, "food", Math.floor((alliance.upgrades.pf * 800000) / (alliance.members.length + alliance.coLeaders.length + 1)), "$inc");
            }
            for(const c of alliance.coLeaders){
                updateValueForUser(c, "food", alliance.upgrades.pf * 50000 + Math.floor((alliance.upgrades.pf * 800000) / (alliance.members.length + alliance.coLeaders.length + 1)), "$inc");
            }
            updateValueForUser(alliance.leader._id, "food", alliance.upgrades.pf * 100000 + Math.floor((alliance.upgrades.pf * 800000) / (alliance.members.length + alliance.coLeaders.length + 1)), "$inc");
            if(alliance.coLeaders.length === 0) updateValueForUser(alliance.leader._id, "food", alliance.upgrades.pf * 100000, "$inc");
        }
        if(alliance.upgrades.mf > 0){
            for (const m of alliance.members) {
                updateValueForUser(m, "food", Math.floor((alliance.upgrades.mf * 4000000) / (alliance.members.length + alliance.coLeaders.length + 1)), "$inc");
            }
            for(const c of alliance.coLeaders){
                updateValueForUser(c, "food", alliance.upgrades.mf * 250000 + Math.floor((alliance.upgrades.mf * 4000000) / (alliance.members.length + alliance.coLeaders.length + 1)), "$inc");
            }
            updateValueForUser(alliance.leader._id, "food", alliance.upgrades.mf * 500000 + Math.floor((alliance.upgrades.mf * 4000000) / (alliance.members.length + alliance.coLeaders.length + 1)), "$inc");
            if(alliance.coLeaders.length === 0) updateValueForUser(alliance.leader._id, "food", alliance.upgrades.mf * 500000, "$inc");
        }
    }
    //payoutChannel.send("You have succesfully gained food from your alliance upgrades!");
    (payoutChannel as TextChannel).send({
        embed: {
            color: 0x00FF00,
            title: "You have succesfully gained food from your alliance upgrades!",
            timestamp: new Date()
        }
    });
    editConfig("lastPayout", Math.floor(Date.now() / 1000));
    setTimeout(payoutLoop, (1000 * 14400));
}