window.gLocalAssetContainer["flyingObject"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

class AlertObject extends g.Sprite {

    constructor(scene, x, y)
    {
        super({
            scene: scene,
            src: scene.assets["alert"],
            width: scene.assets["alert"].width,
            height: scene.assets["alert"].height,
            x: x,
            y: y,
            anchorX: 0.5,
            anchorY: 0.5,
        });

        this.se = scene.assets["alert1"];
    }

    display()
    {
        let blinkCount = 0;
        const blinkInterval = this.scene.setInterval(() => {
            this.opacity = (this.opacity === 1.0) ? 0.0 : 1.0;  // 透明度の切り替え
            this.modified();
            blinkCount++;

            let player = this.se.play();
            player.changeVolume(0.1);

            if(blinkCount >= 9) // 1.5秒(9回)点滅で終了
            {
                this.scene.clearInterval(blinkInterval);
                this.opacity = 1.0; // 元に戻す
                this.destroy();
                this.modified();
            }
        }, 166);    // 約0.166秒ごとに点滅
    }
}

class FlyingObjectManager {

    constructor(scene)
    {
        this.scene = scene;
        this.objects = [];
        this.schedule = [];
    }

    addFlyingObjectSchedule(assetId, spawnTime, x, y)
    {
        this.schedule.push({ assetId, spawnTime, x, y});
    }

    update(remainingTime) {
        for (let i = this.schedule.length - 1; i >= 0; i--)
        {
            const flyingObjectData = this.schedule[i];
            if (remainingTime <= flyingObjectData.spawnTime)
            {
                this.spawnFlyingObject(flyingObjectData.assetId, flyingObjectData.x, flyingObjectData.y);
                this.schedule.splice(i, 1); // 出現済みオブジェクトを削除
            }
        }

        // 削除したオブジェクトをリストからも削除
        this.objects = this.objects.filter(object => !object.destroyed());
    }

    spawnFlyingObject(assetId, x, y)
    {
        let object;
        switch (assetId)
        {
            case "alert":
                object = new AlertObject(this.scene, x, y);
                object.display();
                break;
            default:
                break;
        }
        this.scene.append(object);
        this.objects.push(object);
    }
}

module.exports = {
    FlyingObjectManager: FlyingObjectManager
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}