window.gLocalAssetContainer["effect"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

class Effect extends g.FrameSprite {

    constructor(scene, assetId, frames)
    {
        super({
            scene: scene,
            src: scene.assets[assetId],
            width: scene.assets[assetId].width / frames.length,
            height: scene.assets[assetId].height,
            frames: frames,
            interval: 100,
            x: -1000,
            y: -1000,
            anchorX: 0.5,
            anchorY: 0.5,
            loop: false
        });

        this.stop();
    }

    startEffect(x, y)
    {
        this.x = x;
        this.y = y;
        this.start();

        this.finished.add(() => {
            this.destroy();
        });
    }

}

module.exports = {
    Effect: Effect
}
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}