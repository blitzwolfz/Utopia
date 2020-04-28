import { Message } from "discord.js";
import { marketOffer, resources } from "../../utils/interfaces";
import { addOffer } from "../../utils/databasehandler";

//.make-offer <amount> <currency> <price> <price-currency>
export async function makeOffer(message: Message, args: string[]) {
    if (!args[3]) return message.reply("plese follow the syntax of `.make-offer <amount> <currency> <price> <price-currency>`");
    var oc: resources, pc: resources;
    switch (args[1][0]) {
        case "p": oc = "population"; break;
        case "m": oc = "money"; break;
        case "o": oc = "oil"; break;
        case "s": oc = "steel"; break;
        case "f": oc = "food"; break;
        default: return message.reply("please choose a valid currency for selling!");
    }
    switch (args[3][0]) {
        case "p": pc = "population"; break;
        case "m": pc = "money"; break;
        case "o": pc = "oil"; break;
        case "s": pc = "steel"; break;
        case "f": pc = "food"; break;
        default: return message.reply("please choose a valid currency for selling!");
    }

    const offer: marketOffer = {
        _id: message.id,
        seller: { 
            _id: message.author.id, 
            tag: message.author.tag 
        },
        offer: {
            amount: parseInt(args[0]),
            currency: oc
        },
        price: {
            amount: parseInt(args[2]),
            currency: pc
        }
    };

    addOffer(offer).then(() => message.reply("you succesfully added your offer to the market!"));
}