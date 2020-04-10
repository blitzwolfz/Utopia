import * as config from "../../config.json";
import { Client, TextChannel, Channel } from "discord.js";
import { getBaseLog, Sleep, rangeInt } from "../../utils/utils";
import { user } from "../../utils/interfaces";
import { getAllUsers, updateValueForUser, editConfig } from "../../utils/databasehandler";

export async function populationWorkLoop(client: Client) {
    let payoutChannel: Channel = client.channels.get(config.payoutChannel)!;
    let users: user[] = await getAllUsers();
    for (const u of users) {
        let pop = u.resources.population;
        const consumption = Math.floor(pop * (2 + getBaseLog(10, getBaseLog(10, getBaseLog(3, pop)))));
        if (consumption > u.resources.food) {
            try {
                client.users.get(u._id)?.send("**Alert**: Your population will die within in the next hour if you don't buy more food!");
            }
            catch (e) {
                console.log(e + `\n${u.tag}`);
            }
        }
    }
    await Sleep(3600000);

    users = await getAllUsers();
    for (const u of users) {
        let pop = u.resources.population;
        var money = Math.floor(pop / rangeInt(8, 15));
        if (u.loan) {
            const diff = u.loan - money;
            if (diff < 0) {
                updateValueForUser(u._id, "loan", 0, "$set");
                updateValueForUser(u._id, "money", -diff, "$inc");
            }
            else {
                updateValueForUser(u._id, "loan", -diff, "$inc");
            }
        }
        else {
            updateValueForUser(u._id, "money", money, "$inc");
        }
        const consumption = Math.floor(pop * (2 + getBaseLog(10, getBaseLog(10, getBaseLog(3, pop)))));
        if (consumption > u.resources.food) {
            const diff = consumption - u.resources.food;
            updateValueForUser(u._id, "food", 0, "$set");
            try {
                client.users.get(u._id)?.send("**Alert**: You don't have any food left, your population is dying!");
            }
            catch { }
            if (diff > pop) {
                updateValueForUser(u._id, "population", 0, "$set");
                try {
                    client.users.get(u._id)?.send("**Alert**: All of your population died");
                }
                catch { }
            }
            else {
                updateValueForUser(u._id, "population", -diff, "$inc");
            }
        }
        else {
            updateValueForUser(u._id, "food", -consumption, "$inc");
        }
        if (u.payoutDMs) {
            try {
                client.users.get(u._id)?.send("You have succesfully gained money through the work of your population!\nYour battle token cooldown has been reset!");
            }
            catch { }
        }
        if (u.resources.food == null) updateValueForUser(u._id, "food", 0, "$set");
    }

    (payoutChannel as TextChannel).send({
        embed: {
            color: 0x00FF00,
            title: "You have succesfully gained money through the work of your population!\nYour battle token cooldown has been reset!",
            timestamp: new Date()
        }
    });
    editConfig("lastPopulationWorkPayout", Math.floor(Date.now() / 1000));
    setTimeout(populationWorkLoop, 39600000); //11h
}