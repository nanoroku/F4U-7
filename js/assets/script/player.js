window.gLocalAssetContainer["player"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

const {
    PlayerBulletManager,
    PlayerBombManager
} = require("./bullet");

const {
    Effect
} = require("./effect");

// ====================================================================
//  F4U-7
// ====================================================================
class Player extends g.Sprite {

    respawnTimeMs = 3000;
    respawnPosX;
    respawnPosY;
    maxHp = 1;
    hp;
    shootingInterval = 300;
    target;
    
    constructor(scene, assetId, x, y)
    {
        super({
            scene: scene,
            src: scene.assets[assetId],
            width: scene.assets[assetId].width,
            height: scene.assets[assetId].height,
            x: x,
            y: y,
            anchorX: 0.5,
            anchorY: 0.5,
            touchable: true
        });

        this.hp = this.maxHp;
        this.respawnPosX = this.x;
        this.respawnPosY = this.y;

        this.effect = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect);

        this.se = scene.assets["se"];
        this.se2 = scene.assets["se2"];

        this.isStop = false;
        this.isInvincible = false;

        this.isGameStart = false;

        // プレイヤー操作の設定
        scene.onPointMoveCapture.add(ev => {
            if(this.isStop === true)return; // 停止時は動かさない

            this.x += ev.prevDelta.x;
            this.y += ev.prevDelta.y;

            // 端に行った場合、それ以上動かないようにする
            if(this.x > g.game.width - this.width/2 || this.x < 0 + this.width/2){
                this.x -= ev.prevDelta.x;
                this.modified();
            }
            if(this.y > g.game.height - this.height/2 || this.y < 0 + this.height/2){
                this.y -= ev.prevDelta.y;
                this.modified();
            }

            this.target.x = this.x + 100;
            this.target.y = this.y;
            this.target.modified();

            this.modified();
        });

        // マウスの左ボタンを離したときに爆弾を落とす
        scene.onPointUpCapture.add((ev) => {
            this.bomb();
        });

        // マウスの右クリックを押したときでも爆弾を落とす(同時押しだと発火しないので、コメントアウト)
        /*
        scene.pointDownCapture.add((event) => {
            if(event.button === 2)
            {
                this.bomb();
            }
        });
        */
    }

    initTargetIcon(assetId)
    {
        this.target = new g.Sprite({
            scene: this.scene,
            src: this.scene.assets[assetId],
            width: this.scene.assets[assetId].width,
            height: this.scene.assets[assetId].height,
            x: this.x + 100,
            y: this.y,
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this.scene.append(this.target);
    }

    startGame()
    {
        this.isGameStart = true;
    }

    set setBulletManager(bulletManager)
    {
        this.bulletManager = bulletManager;

        // 一定間隔で弾を発射
        this.scene.setInterval(() => {
            if(this.isGameStart)
            {
                this.shoot(); 
            }
        }, this.shootingInterval);
    }

    set setBombManager(bombManager)
    {
        this.bombManager = bombManager;
    }

    getCollisionArea()
    {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    takeDamage(damage=1)
    {
        this.hp -= damage;
        if (this.hp <= 0)
        {
            this.killed();
            this.hide();
            this.target.hide();
            this.isInvincible = true;   // 無敵フラグ

            this.scene.setTimeout(() => {
                this.revive();
            }, this.respawnTimeMs);
        }
        else
        {
            let se = this.se2.play();
            se.changeVolume(0.1);
        }
    }

    revive()
    {
        this.target.x = this.x + 100;
        this.target.y = this.y;
        this.modified();
        this.target.modified();
        this.show();
        this.target.show();
        this.hp = this.maxHp;
        this.effect = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect);

        let blinkCount = 0;
        const blinkInterval = this.scene.setInterval(() => {
            this.opacity = (this.opacity === 1.0) ? 0.3 : 1.0;  // 透明度を切り替え
            this.modified();
            blinkCount++;

            if(blinkCount >= 9) // 1.5秒(9回)点滅で終了
            {
                this.scene.clearInterval(blinkInterval);
                this.opacity = 1.0; // 元に戻す
                this.isInvincible = false;
                this.modified();
            }
        }, 166);    // 約0.166秒ごとに点滅
    }

    get getIsInvincible()
    {
        return this.isInvincible;
    }

    killed()
    {
        this.effect.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y - this.height/4);
        this.bulletManager.spawnBullet(this.x + this.width/2 + 5, this.y);
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y + this.height/4);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnBomb(this.x, this.y, this.target, "bomb");
        }
    }

    stop()
    {
        this.isStop = true;
    }
}

// ====================================================================
//  AU-1
// ====================================================================
class AU1 extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y - this.height/4);
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y + this.height/4);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnBomb(this.x, this.y, this.target, "bomb2");
        }
    }
}

// ====================================================================
//  深山
// ====================================================================
class Liz extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
    }

    shoot()
    {
        //this.bulletManager.spawnBullet(this.x + this.width/2, this.y, 10);

        let dx = 4;
        let dy = -1;
        let length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        let vx = (dx / length) * 10;
        let vy = (dy / length) * 10;

        this.bulletManager.spawnBullet(this.x + this.width/2, this.y, 10, vx, vy);

        dx = 4;
        dy = 1;

        length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        vx = (dx / length) * 10;
        vy = (dy / length) * 10;

        this.bulletManager.spawnBullet(this.x + this.width/2, this.y, 10, vx, vy);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnBomb(this.x, this.y, this.target, "bomb3");
        }
    }
}

// ====================================================================
//  天山
// ====================================================================
class Jill extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 2;
        this.hp = this.maxHp;
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x - this.width/4, this.y, -20);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnTorpede(this.x, this.y, this.target, "torpedo");
        }
    }
}

// ====================================================================
//  震電
// ====================================================================
class Shinden extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2 + 20, this.y - 6);
        this.bulletManager.spawnBullet(this.x + this.width/2 + 5, this.y - 6);
        this.bulletManager.spawnBullet(this.x + this.width/2 + 5, this.y + 6);
        this.bulletManager.spawnBullet(this.x + this.width/2 + 20, this.y + 6);
    }

    bomb()
    {
        
    }
}

// ====================================================================
//  XF5U
// ====================================================================
class XF5U extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2 + 5, this.y - 6);
        this.bulletManager.spawnBullet(this.x + this.width/2 + 5, this.y + 6);
    }
}

// ====================================================================
//  ソードフィッシュ
// ====================================================================
class Swordfish extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 2;
        this.hp = this.maxHp;
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y, 20);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnTorpede(this.x, this.y, this.target, "torpedo");
        }
    }
}

// ====================================================================
//  隼
// ====================================================================
class Oscar extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 2;
        this.hp = this.maxHp;
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y - 6);
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y + 6);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnBomb(this.x, this.y, this.target, "bomb");
        }
    }
}

// ====================================================================
//  瑞雲
// ====================================================================
class Paul extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 3;
        this.hp = this.maxHp;
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y - 6);
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y + 6);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnBomb(this.x, this.y, this.target, "bomb");
        }
    }
}

// ====================================================================
//  Do 217
// ====================================================================
class Do217 extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 2;
        this.hp = this.maxHp;
    }

    shoot()
    {
        //this.bulletManager.spawnBullet(this.x + this.width/2 + 5, this.y, 20);
        //this.bulletManager.spawnBullet(this.x + this.width/2 + 20, this.y, 20);

        let dx = 4;
        let dy = -1;
        let length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ

        // 正規化して速度をかける
        let vx = (dx / length) * 10;
        let vy = (dy / length) * 10;

        this.bulletManager.spawnBullet(this.x + this.width/2, this.y, 10, vx, vy);

        dx = 4;
        dy = 1;
        length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        vx = (dx / length) * 10;
        vy = (dy / length) * 10;

        this.bulletManager.spawnBullet(this.x + this.width/2, this.y, 10, vx, vy);

        //this.bulletManager.spawnBullet(this.x - this.width/4, this.y, -20);
        //this.bulletManager.spawnBullet(this.x - this.width/2, this.y, -20);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnBomb(this.x, this.y, this.target, "fritzx");
        }
    }
}

// ====================================================================
//  二式大艇
// ====================================================================
class Emily extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 3;
        this.hp = this.maxHp;
    }

    shoot()
    {
        let dx = 4;
        let dy = -1;
        let length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ

        // 正規化して速度をかける
        let vx = (dx / length) * 10;
        let vy = (dy / length) * 10;

        this.bulletManager.spawnBullet(this.x + this.width/2, this.y, 10, vx, vy);

        dx = 4;
        dy = 1;
        length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        vx = (dx / length) * 10;
        vy = (dy / length) * 10;

        this.bulletManager.spawnBullet(this.x + this.width/2, this.y, 10, vx, vy);   
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnTorpede(this.x, this.y, this.target, "torpedo");
        }
    }
}

// ====================================================================
//  流星
// ====================================================================
class Grace extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 1;
        this.hp = this.maxHp;
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y - 6);
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y + 6);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnTorpede(this.x, this.y, this.target, "torpedo");
        }
    }
}

// ====================================================================
//  彗星
// ====================================================================
class Judy extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 1;
        this.hp = this.maxHp;
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y - 6);
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y + 6);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnBomb(this.x, this.y, this.target, "bomb2");
        }
    }
}

// ====================================================================
//  零戦(爆装)
// ====================================================================
class ZeroBaku extends Player {

    shootingInterval = 200;

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 1;
        this.hp = this.maxHp;
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y - 6);
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y + 6);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnBomb(this.x, this.y, this.target, "bomb");
        }
    }
}

// ====================================================================
//  銀河
// ====================================================================
class Frances extends Player {

    constructor(scene, assetId, x, y)
    {
        super(scene, assetId, x, y);
        this.maxHp = 2;
        this.hp = this.maxHp;
    }

    shoot()
    {
        this.bulletManager.spawnBullet(this.x + this.width/2, this.y);
    }

    bomb()
    {
        if(this.bombManager.bombs.length < this.bombManager.maxBombNum)
        {
            this.bombManager.spawnTorpede(this.x, this.y, this.target, "torpedo");
        }
    }
}

module.exports = {
    Player: Player,
    AU1: AU1,
    Liz: Liz,
    Jill: Jill,
    Shinden: Shinden,
    XF5U: XF5U,
    Swordfish: Swordfish,
    Oscar: Oscar,
    Paul: Paul,
    Do217: Do217,
    Emily: Emily,
    Grace: Grace,
    Judy: Judy,
    ZeroBaku: ZeroBaku,
    Frances: Frances
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}