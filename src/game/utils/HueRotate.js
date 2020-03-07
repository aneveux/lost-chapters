/**
* Original shader by Daniil (https://www.shadertoy.com/view/4sl3DH)
* Tweaked, uniforms added and converted to Phaser/PIXI by Richard Davey
*/
Phaser.Filter.HueRotate = function (game, params) {
    params = Object.assign({
        hueVariation: 0,  // hue shift (in degrees)
        saturation: 1,   // saturation multiplier (scalar)
        luminosity: 1,        // value multiplier (scalar)
        hueVariationSpeed: 0
    }, params)

    Phaser.Filter.call(this, game);

    this.uniforms.hue = { type: '1f', value: params.hueVariation * Math.PI / 180 };
    this.uniforms.saturation = { type: '1f', value: params.saturation };
    this.uniforms.value = { type: '1f', value: params.luminosity };
    this.uniforms.speed = { type: '1f', value: params.hueVariationSpeed };
    this.uniforms.iChannel0 = { type: 'sampler2D', value: null, textureData: { repeat: true } };

    this.fragmentSrc = [

        "precision mediump float;",
        "uniform vec2      resolution;",
        "uniform float     time;",
        "uniform float     hue;",
        "uniform float     saturation;",
        "uniform float     value;",
        "uniform float     speed;",
        "uniform sampler2D iChannel0;",

        "/* Simple hue rotation filter based on article:",
        "http://beesbuzz.biz/code/hsv_color_transforms.php",
        "*/",

        "void main(void)",
        "{",
        "vec2 uv = gl_FragCoord.xy / resolution.xy;",

        "float c = value * saturation * cos(hue + time * speed);",
        "float s = value * saturation * sin(hue + time * speed);",

        "mat4 hueRotation =",
        "mat4(   0.299,  0.587,  0.114, 0.0,",
        "0.299,  0.587,  0.114, 0.0,",
        "0.299,  0.587,  0.114, 0.0,",
        "0.000,  0.000,  0.000, 1.0) * value +",

        "mat4(   0.701, -0.587, -0.114, 0.0,",
        "-0.299,  0.413, -0.114, 0.0,",
        "-0.300, -0.588,  0.886, 0.0,",
        "0.000,  0.000,  0.000, 0.0) * c +",

        "mat4(   0.168,  0.330, -0.497, 0.0,",
        "-0.328,  0.035,  0.292, 0.0,",
        "1.250, -1.050, -0.203, 0.0,",
        "0.000,  0.000,  0.000, 0.0) * s;",

        "vec4 pixel = texture2D(iChannel0, uv);",

        "gl_FragColor = pixel * hueRotation;",
        "}"
    ];

};

Phaser.Filter.HueRotate.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.HueRotate.prototype.constructor = Phaser.Filter.HueRotate;

Phaser.Filter.HueRotate.prototype.init = function (width, height, texture) {

    this.setResolution(width, height);

    this.uniforms.iChannel0.value = texture;

};

['alpha', 'shift', 'madness', 'speed'].forEach(prop => {
    Object.defineProperty(Phaser.Filter.HueRotate.prototype, prop, {

        get: function () {
            return this.uniforms[prop].value;
        },

        set: function (value) {
            this.uniforms[prop].value = value;
        }

    });
})

export default Phaser.Filter.HueRotate