import {allPotions} from "../scenes/minigames/alchemy/potions";

export function potionDeForce(save) {
    return [
        allPotions.filter((potion) => potion.name === "potionDeForce")[0].description,
        {
            "La boire": () => {
                save.inventory.potionDeForce.actif = true;
                save.inventory.potionDeForce.nombre--;
            },
            "La ranger": () => {

            }
        }
    ]
}

export function potionDeLucidite(save) {
    return [
        allPotions.filter((potion) => potion.name === "potionDeLucidite")[0].description,
        {
            "La boire": () => {
                save.inventory.potionDeLucidite.actif = true;
                save.inventory.potionDeLucidite.nombre--;
            },
            "La ranger": () => {

            }
        }
    ]
}

export function potionDeProtection(save) {
    return [
        allPotions.filter((potion) => potion.name === "potionDeProtection")[0].description,
        {
            "La boire": () => {
                save.inventory.potionDeProtection.actif = true;
                save.inventory.potionDeProtection.nombre--;
            },
            "La ranger": () => {

            }
        }
    ]
}

export function fioleDeSang(save) {
    return [
        allPotions.filter((potion) => potion.name === "fioleDeSang")[0].description,
        {
            "La boire": () => {
                save.inventory.fioleDeSang.actif = true;
                save.inventory.fioleDeSang.nombre--;
            },
            "La ranger": () => {

            }
        }
    ]
}

export function cape(save) {
    return [
        "Cette cape que m'a donné Jean Louis me permet de me cacher",
        "pour entrer dans les douches des sbires sans être vu :D",
    ]
}

export function parchemin(save) {
    return [
        "Ce parchemin que m'a confié Billou ne ressemble à rien, ",
        "on dirait du papier toilettes en toile de jute",
    ]
}