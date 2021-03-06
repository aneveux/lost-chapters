import { initControls } from "../utils/controls";
import { resetSaveToNewGame, loadSave } from "../save";
import { sounds } from "../audio";

export class MenuScene {
    create() {
        game.scale.setGameSize(255, 144);
        game.add.tileSprite(0, 0, game.width, game.height, "title-bg");

        delete game.save;
        loadSave();
        initControls()
        this.showMenu()
    }

    showMenu() {
        let menu = {};

        if (game.save) {
            menu["Continuer l'aventure"] = () => {
                sounds.START_GAME.play()
                requestAnimationFrame(() => this.game.state.start("MainGame"));
            }
        }

        Object.assign(menu, {
            "Nouvelle partie": () => {
                sounds.START_GAME.play()
                resetSaveToNewGame();
                requestAnimationFrame(() => this.game.state.start("MainGame"));
            },
            "Contrôles": () => {
                sounds.MENU_POSITIVE.play();
                this.instructions = game.add.image(game.width / 2, game.height / 2, "instructions");
                this.instructions.anchor.setTo(0.5);
                game.controls.ACTION.onPress(() => this.backToMenu(), this, true)
                game.controls.ENTER.onPress(() => this.backToMenu(), this, true)
            },
            "Crédits": () => {
                sounds.MENU_POSITIVE.play();
                this.credits = game.add.image(game.width / 2, game.height / 2, "credits");
                this.credits.anchor.setTo(0.5);
                game.controls.ACTION.onPress(() => this.backToMenu(), this, true)
                game.controls.ENTER.onPress(() => this.backToMenu(), this, true)
            },
            /*"Alchemy (temporaire)": () => { this.game.state.start('Alchemy'); },*/
        })

        let options = Object.values(menu);

        let textSprite = game.add.text(20, 50, Object.keys(menu).join("\n"), {
            font: "14px Alagard",
            fill: "red",
            boundsAlignH: "left",
            boundsAlignV: "bottom"
        });
        textSprite.fixedToCamera = true
        textSprite.lineSpacing = -8
        textSprite.stroke = '#000000';
        textSprite.strokeThickness = 2;

        let selectionSprite = game.add.text(5, 51, "►", {
            font: "12px Alagard",
            fill: "red",
            boundsAlignH: "left",
            boundsAlignV: "bottom"
        })
        selectionSprite.fixedToCamera = true
        selectionSprite.stroke = '#000000';
        selectionSprite.strokeThickness = 2;

        game.controls.UP.onPress(this.selectChoice, this)
        game.controls.DOWN.onPress(this.selectChoice, this)
        game.controls.ACTION.onPress(this.validateChoice, this)
        game.controls.ENTER.onPress(this.validateChoice, this)

        this.menu = { options, textSprite, selectionSprite }
        this.selectedChoice = 0;
    }

    selectChoice() {
        let upOrDown = game.controls.UP.isPressed() ? -1 : +1
        let nbOptions = this.menu.options.length
        sounds.MENU_MOVE.play();
        this.selectedChoice = (this.selectedChoice + nbOptions + upOrDown) % nbOptions
        this.menu.selectionSprite.cameraOffset.y = 51 + 16 * this.selectedChoice;
    }

    validateChoice() {
        let selectedChoice = this.menu.options[this.selectedChoice]
        this.menu.selectionSprite.destroy();
        this.menu.textSprite.destroy();
        game.controls.UP.resetEvents()
        game.controls.DOWN.resetEvents()
        game.controls.ACTION.resetEvents()
        game.controls.ENTER.resetEvents()
        delete this.menu;
        selectedChoice()
    }

    backToMenu() {
        this.credits && this.credits.destroy()
        this.instructions && this.instructions.destroy()
        sounds.MENU_NEGATIVE.play();
        this.showMenu()
    }
}