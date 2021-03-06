import { Message } from "discord.js";
import { getUser, updateValueForUser } from "../utils/databasehandler";
import { user } from "../utils/interfaces";
import "../utils/utils";

export async function kill(message: Message, args: string[]) {
    if (typeof args[0] === "undefined" || (isNaN(<any>args[0]) && args[0] !== "a") || parseInt(args[0]) < 0 || parseInt(args[0]) == Infinity)
        return message.reply("please specify the amount follow the syntax of `.kill <amount>`.");

    let user: user = await getUser(message.author.id);
    if (!user)
        return message.reply("you haven't created an account yet, please use the `.create` command first.");

    const a = (args[0] === "a") ? user.resources.population : parseInt(args[0].replace(/[,]/g, ''));
    if (a > user.resources.population || a === Infinity || isNaN(a))
        return message.reply("you can't kill more population than you own!");

    updateValueForUser(message.author.id, "population", -1 * a, "$inc");
    return message.reply(`you succesfully killed ${a.commafy()} people.`);
}