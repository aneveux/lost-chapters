import { Character, CHARACTER_STATE } from "./Character"
import { save } from "../save";
import { sounds } from "../audio";

import { openBook, nextPage } from "../utils/book";
import { closePage, readPage } from "../utils/page";
import { controls } from "../utils/controls"
import { pickRandomIn } from "../utils/array";
import { describeSelectedItem } from "../utils/inventory";
import { talkTo, nextLine, talkToMyself } from "../utils/dialog";

import { readDescription, descriptions } from "../dialogs/descriptions";
import { traductions } from "../dialogs/traductions";

import { pickLoot } from "../items/loot";
import { blocs } from "../items/Bloc";

import { hallucinations } from "../effects/Hallucination";

import { startDecryptor } from "../scenes/minigames/Decryptor"

const MOVE_SPEED = 50
const RUN_SPEED = 100;
let ACTION_DELAY;

export class Player extends Character {
	constructor(game) {
		super(game, { x: 0, y: 0 }, "howard", game.save.playerState)
		this.type = "player"
		this.movesBeforeTp = 0;
		this.body.setSize(10, 13, 11, 19)
		this.body.moves = true;
		this.watchingPoint = this.worldPosition;
		this.isMoving = false;
		this.isRunning = false;
		this.isDying = false;

		this.interactionSprite = game.make.sprite(0, 0, 'interactions');
		this.interactionSprite.animations.add("talk", [0, 1, 2, 3], 3, true);
		this.interactionSprite.animations.add("item", [4, 5, 6, 7], 3, true);
		this.interactionSprite.visible = false;
		game.time.events.loop(300, this.checkInFrontOfPlayer, this);
	}

	update() {
		super.update();

		// coordonnées du point ciblé
		this.watchingPoint = {
			x: this.worldPosition.x,
			y: this.worldPosition.y + 3
		};

		switch (this.state) {
			case CHARACTER_STATE.LEFT:
			case CHARACTER_STATE.WALKING_LEFT:
			case CHARACTER_STATE.RUNNING_LEFT:
				this.watchingPoint.x -= 16;
				break;
			case CHARACTER_STATE.RIGHT:
			case CHARACTER_STATE.WALKING_RIGHT:
			case CHARACTER_STATE.RUNNING_RIGHT:
				this.watchingPoint.x += 16
				break;
			case CHARACTER_STATE.UP:
			case CHARACTER_STATE.WALKING_UP:
			case CHARACTER_STATE.RUNNING_UP:
				this.watchingPoint.y -= 16
				break;
			case CHARACTER_STATE.DOWN:
			case CHARACTER_STATE.WALKING_DOWN:
			case CHARACTER_STATE.RUNNING_DOWN:
				this.watchingPoint.y += 16
				break;
		}

		this.interactionSprite.position.x = this.position.x
		this.interactionSprite.position.y = this.position.y - 32

		if (this.isMoving && !this.footstepTimeout) {
			this.playFootstepSound();
		} else if (!this.isMoving && this.footstepTimeout) {
			clearTimeout(this.footstepTimeout);
			this.footstepTimeout = null;
		}
	}

	destroy() {
		super.destroy();
		clearTimeout(this.footstepTimeout);
	}

	playFootstepSound() {
		let sound = pickRandomIn(sounds[game.level.footstepSounds])
		sound.volume = this.isRunning ? 0.7 : 0.4;
		this.footstepTimeout = setTimeout(() => {
			sound.play();
			this.playFootstepSound();
		}, this.isRunning ? 220 : 300);
	}

	checkInFrontOfPlayer() {
		if (!game.groups) return;
		let { x, y } = this.watchingPoint;
		let pnjInFront = game.groups.pnj.children.find(obj => obj instanceof Phaser.Sprite && obj.getBounds().contains(x, y));
		let objectInFront = [
			...game.groups.nonCollidableObjects.children,
			...game.groups.objects.children
		].find(obj => obj instanceof Phaser.Sprite && obj.getBounds().contains(x, y));

		this.interactionSprite.visible = (
			!game.dialog
			&& !game.book
			&& !game.page
			&& game.selectedItem == null
			&& !!(pnjInFront || objectInFront)
		)

		if (pnjInFront) this.interactionSprite.animations.play("talk")
		else if (objectInFront) this.interactionSprite.animations.play("item")
	}

	updateControls() {
		// can't move while talking or reading
		let canMove = true;
		if (game.dialog
			|| game.book
			|| game.page
			|| controls.ACTION.isPressed()
			|| this.isForceMoving
			|| this.isDying
			|| game.selectedItem != null
		) {
			canMove = false;
		}

		this.isRunning = controls.SECONDARY.isPressed() && game.player.key !== "cultist";
		let moveSpeed = this.isRunning ? RUN_SPEED : MOVE_SPEED;

		if (canMove && controls.DOWN.isPressed()) {
			this.state = this.isRunning ? CHARACTER_STATE.RUNNING_DOWN : CHARACTER_STATE.WALKING_DOWN
			this.body.velocity.y = moveSpeed
			this.body.velocity.x = 0
			this.isMoving = true
		}
		else if (canMove && controls.UP.isPressed()) {
			this.state = this.isRunning ? CHARACTER_STATE.RUNNING_UP : CHARACTER_STATE.WALKING_UP
			this.body.velocity.y = -moveSpeed
			this.body.velocity.x = 0
			this.isMoving = true
		} else if (canMove && controls.LEFT.isPressed()) {
			this.state = this.isRunning ? CHARACTER_STATE.RUNNING_LEFT : CHARACTER_STATE.WALKING_LEFT
			this.body.velocity.x = -moveSpeed
			this.body.velocity.y = 0
			this.isMoving = true
		} else if (canMove && controls.RIGHT.isPressed()) {
			this.state = this.isRunning ? CHARACTER_STATE.RUNNING_RIGHT : CHARACTER_STATE.WALKING_RIGHT
			this.body.velocity.x = moveSpeed
			this.body.velocity.y = 0
			this.isMoving = true;
		} else if (!this.isForceMoving) {
			this.stopMoving();
			this.isMoving = false;
		}

		if (this.isMoving && this.movesBeforeTp > 0) this.movesBeforeTp--;

		if (game.lamp) {
			game.lamp.x = this.x
			game.lamp.y = this.y
		}
	}

	forceMove(direction, duration = 500) {
		this.isForceMoving = true;
		switch (direction) {
			case "DOWN":
				this.state = CHARACTER_STATE.WALKING_DOWN
				this.body.velocity.y = MOVE_SPEED
				this.body.velocity.x = 0;
				break;
			case "UP":
				this.state = CHARACTER_STATE.WALKING_UP
				this.body.velocity.y = -MOVE_SPEED
				this.body.velocity.x = 0
				break;
			case "LEFT":
				this.state = CHARACTER_STATE.WALKING_LEFT
				this.body.velocity.x = -MOVE_SPEED
				this.body.velocity.y = 0
				break;
			case "RIGHT":
				this.state = CHARACTER_STATE.WALKING_RIGHT
				this.body.velocity.x = MOVE_SPEED
				this.body.velocity.y = 0
				break;
		}

		return new Promise(resolve => {
			clearTimeout(this.forceMoveTimeout);
			this.forceMoveTimeout = setTimeout(() => {
				this.stopMoving()
				this.isForceMoving = false;
				resolve();
			}, duration)
		})
	}

	doAction() {
		if (ACTION_DELAY) return;
		ACTION_DELAY = setTimeout(() => ACTION_DELAY = null, 250)
		if (game.dialog) return nextLine();
		if (game.book) return nextPage();
		if (game.page) return closePage();
		if (game.selectedItem != null) return describeSelectedItem();

		let { x, y } = this.watchingPoint;
		let pnjInFront = game.groups.pnj.children.find(obj => obj instanceof Phaser.Sprite && obj.getBounds().contains(x, y));

		if (pnjInFront) {
			// talk to someone
			//game.player.loadTexture(pnjInFront.key); // TEST: transforme en le personnage ciblé

			switch (this.state) {
				case CHARACTER_STATE.LEFT:
				case CHARACTER_STATE.WALKING_LEFT:
				case CHARACTER_STATE.RUNNING_LEFT:
					pnjInFront.state = CHARACTER_STATE.RIGHT;
					break;
				case CHARACTER_STATE.RIGHT:
				case CHARACTER_STATE.WALKING_RIGHT:
				case CHARACTER_STATE.RUNNING_RIGHT:
					pnjInFront.state = CHARACTER_STATE.LEFT;
					break;
				case CHARACTER_STATE.UP:
				case CHARACTER_STATE.WALKING_UP:
				case CHARACTER_STATE.RUNNING_UP:
					pnjInFront.state = CHARACTER_STATE.DOWN;
					break;
				case CHARACTER_STATE.DOWN:
				case CHARACTER_STATE.WALKING_DOWN:
				case CHARACTER_STATE.RUNNING_DOWN:
					pnjInFront.state = CHARACTER_STATE.UP;
					break;
			}

			let pnjDialogId = pnjInFront.properties.dialog || pnjInFront.key
			return talkTo(pnjDialogId);
		}

		let objectInFront = [
			...game.groups.nonCollidableObjects.children,
			...game.groups.objects.children
		].find(obj => obj instanceof Phaser.Sprite && obj.getBounds().contains(x, y));
		if (objectInFront) {
			switch (objectInFront.type) {
				case "book":
					save();
					openBook(objectInFront.properties.name);
					return;
				case "page":
					save();
					readPage(objectInFront.properties.name);
					return;
				case "description":
					readDescription(objectInFront.properties.name);
					return;
				case "loot":
					pickLoot(objectInFront);
					return;
				case "runes":
					let { variant = "", duration, name } = objectInFront.properties
					if (!game.save.hasDiscoveredAlphabet) {
						return talkToMyself(descriptions.runes_inconnues(game.save))
					} else if (game.save.translationsFound.includes(name)) {
						const traduction = traductions[name]
						return talkToMyself(traduction.lines.map(part => `"${part}"`))
							.then(() => {
								if (traduction.after) traduction.after(game.save)
							})
					} else {
						return startDecryptor({
							variants: variant.split(","),
							duration,
							translation: name
						}).then(youWon => {
							if (youWon) {
								let traduction = traductions[name];
								if (traduction.before) traduction.before(game.save)
								return talkToMyself([
									"Ça y est, j'ai trouvé !",
									...traduction.lines.map(part => `"${part}"`),
								]).then(() => {
									game.save.translationsFound.push(name)
									save()
									if (traduction.after) traduction.after(game.save)
									else talkToMyself(["Intéressant..."]);
								})
							} else {
								return talkToMyself([
									"Je me suis encore trompé...",
									"Bon, recommençons depuis le début !"
								])
							}
						})
					}
				case "chaudron":
					readDescription("chaudron");
					return;

				case 'escapeTable':
					if (game.save.inventory.items.parchemin.nombre > 0
						|| game.save.inventory.items.parcheminFalsifie.nombre > 0) {
						return talkToMyself([
							`J'ai percé le secret de cet établi. Il ne me reste plus rien à faire ici.`,
						])
					}
					save();
					game.state.start('EscapeGame');
					setTimeout(() => {
						game.escapeGame.onEnd = () => talkToMyself([
							`L'établi renfermait ce parchemin couvert de drôles de runes.`,
							`Therled s'est donné beaucoup de mal pour le planquer ici.`,
							`Il doit être précieux. Je ferais mieux de le montrer à Franck.`
						])
					}, 500);
					return;

				case 'bloc':
					blocs[objectInFront.properties.name](objectInFront);
					return;

				case "hallucination":
					hallucinations[objectInFront.properties.name](objectInFront);
					return;
			}
		}
	}
}
