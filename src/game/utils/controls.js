export const controls = {
    UP: {
        keyCode: Phaser.Keyboard.UP,
        buttonCode: Phaser.Gamepad.XBOX360_DPAD_UP,
        isPressed() {
            return (game.input.gamepad.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1)
                || (controls.UP.button && controls.UP.button.isDown)
                || controls.UP.key.isDown
        }
    },
    DOWN: {
        keyCode: Phaser.Keyboard.DOWN,
        buttonCode: Phaser.Gamepad.XBOX360_DPAD_DOWN,
        isPressed() {
            return (game.input.gamepad.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.4)
                || (controls.DOWN.button && controls.DOWN.button.isDown)
                || controls.DOWN.key.isDown
        }
    },
    LEFT: {
        keyCode: Phaser.Keyboard.LEFT,
        buttonCode: Phaser.Gamepad.XBOX360_DPAD_LEFT,
        isPressed() {
            return (game.input.gamepad.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.4)
                || (controls.LEFT.button && controls.LEFT.button.isDown)
                || controls.LEFT.key.isDown
        }
    },
    RIGHT: {
        keyCode: Phaser.Keyboard.RIGHT,
        buttonCode: Phaser.Gamepad.XBOX360_DPAD_RIGHT,
        isPressed() {
            return (game.input.gamepad.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.4)
                || (controls.RIGHT.button && controls.RIGHT.button.isDown)
                || controls.RIGHT.key.isDown
        }
    },
    ACTION: {
        keyCode: Phaser.Keyboard.SPACEBAR,
        buttonCode: Phaser.Gamepad.XBOX360_A,
        isPressed() {
            return (controls.ACTION.button && controls.ACTION.button.isDown)
                || controls.ACTION.key.isDown
        }
    }
}

export function initControls() {
    game.controls = controls;
    game.input.gamepad.start();
    game.input.gamepad.onConnectCallback = initGamepadControls

    for (let control of Object.values(controls)) {
        game.input.keyboard.addKeyCapture([control.keyCode])
        control.key = game.input.keyboard.addKey(control.keyCode)
        control.button = game.input.gamepad.pad1.getButton(control.buttonCode)
        control.onPress = (callback, context = control, once = false) => {
            let add = once ? "addOnce" : "add"
            control.event = { callback, context, once }
            control.key.onDown[add](callback, context)
            if (control.button) control.button.onDown[add](callback, context)
        }
        control.resetEvents = () => {
            control.key.onDown.removeAll(control.event.context)
            if (control.button) control.button.onDown.removeAll(control.event.context)
            delete control.event;
        }
    }

    controls.ACTION.onPress(() => game.player && game.player.doAction())
    console.log("Keyboard controls ready")
}

export function initGamepadControls() {
    for (let control of Object.values(controls)) {
        control.button = game.input.gamepad.pad1.getButton(control.buttonCode)
        if (control.event) {
            let add = control.event.once ? "addOnce" : "add"
            control.button.onDown.removeAll(control.event.context)
            control.button.onDown[add](control.event.callback, control.event.context)
        }
    }
    console.log("Gamepad controls ready")
}
