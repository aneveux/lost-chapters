/* global Phaser illuminated game */

import { BootScene } from "./scenes/BootScene"
import { LoadingScene } from "./scenes/LoadingScene"
import { MenuScene } from "./scenes/MenuScene"
import { GameScene } from "./scenes/GameScene"
import { GameOverScene } from "./scenes/GameOverScene"
import { DecryptorScene } from "./scenes/minigames/Decryptor";
import { AlchemyScene } from "./scenes/minigames/Alchemy";
import { EscapeGameScene } from "./scenes/minigames/EscapeGame";

export const gameWidth = 255
export const gameHeight = 144

export function startGame() {
	game = new Phaser.Game(gameWidth, gameHeight, Phaser.WEBGL, "game", null, true, false)
	game.state.add("Boot", BootScene)
	game.state.add("Preload", LoadingScene)
	game.state.add("TitleScreen", MenuScene)
	game.state.add("MainGame", GameScene)
	game.state.add("GameOver", GameOverScene)
	game.state.add("Decryptor", DecryptorScene);
	game.state.add("Alchemy", AlchemyScene)
	game.state.add("EscapeGame", EscapeGameScene);

	game.state.start("Boot")
	return game
}
