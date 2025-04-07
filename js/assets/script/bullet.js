window.gLocalAssetContainer["bullet"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

const enemy = require("./enemy");

class PlayerBullet extends g.Sprite {

    constructor(scene, x, y, speed=20)
    {
        const playerBulletAssetId = "player_bullet";
        super({
            scene: scene,
            src: scene.assets[playerBulletAssetId],
            width: scene.assets[playerBulletAssetId].width,
            height: scene.assets[playerBulletAssetId].height,
            x: x,
            y: y,
            anchorX: 0.5,
            anchorY: 0.5
        });
        this.speed = speed;
    }

    move()
    {
        this.x += this.speed;

        if (this.x > (g.game.width + this.width/2))
        {
            this.destroy();
            return;
        }

        this.modified();
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
}

class PlayerAimingBullet extends PlayerBullet {

    constructor(scene, x, y, speed, vx, vy)
    {
        super(scene, x, y, speed);
        this.vx = vx;
        this.vy = vy;
    }

    move()
    {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < (0 - this.width/2) || this.x > (g.game.width + this.width/2) ||
            this.y < (0 - this.height/2) || this.y > (g.game.height + this.height/2))
        {
            this.destroy();
            return;
        }

        this.modified();
    }
}

class PlayerBomb extends g.Sprite {

    speed = 2;
    isBomb = false;
    isExplosion = false;
    damage = 1;

    constructor(scene, assetId, x, y, target)
    {
        super({
            scene: scene,
            src: scene.assets[assetId],
            width: scene.assets[assetId].width,
            height: scene.assets[assetId].height,
            x: x,
            y: y,
            anchorX: 0.5,
            anchorY: 0.5
        });
        this.target = target;
        this.staticTarget_x = this.target.x;
    }

    move()
    {
        this.x += this.speed;
        this.scaleX -= 0.01;
        this.scaleY -= 0.01;

        if (this.x > this.staticTarget_x)
        {
            return { isLanding:true, type:"bomb" };
        }

        this.modified();

        return { isLanding:false, type:"bomb" };
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

    get getDamage()
    {
        return this.damage;
    }
}

class PlayerBigBomb extends PlayerBomb{
    damage = 2;
}

class PlayerTorpedo extends PlayerBomb{

    torpedeSpeed = 20;
    isUnderWater = false;
    damage = 2;

    constructor(scene, assetId, x, y, target)
    {
        super(scene, assetId, x, y, target);
    }

    move()
    {
        if(!this.isUnderWater)
        {
            this.x += this.speed;
            this.scaleX -= 0.01;
            this.scaleY -= 0.01;

            this.modified();
        }
        else
        {
            this.x += this.torpedeSpeed;
            this.modified();
        }

        if (this.x > this.staticTarget_x)
        {
            this.isUnderWater = true;
        }

        if (this.x > (g.game.width + this.width/2))
        {
            this.destroy();
        }

        if(!this.isUnderWater)
        {
            return { isLanding:false, type:"torpedo" };
        }
        else{
            return { isLanding:true, type:"torpedo" };
        }
        
    }
}

class HomingBomb extends PlayerBomb {

    speed1 = 2;
    speed2 = 20;
    isUnderWater = false;
    damage = 3;
    lockOnEnemy = null;
    
    constructor(scene, assetId, x, y, target, seaEnemyManager)
    {
        super(scene, assetId, x, y, target);

        this.seaEnemyManager = seaEnemyManager;

        this.velX = this.speed2;
        this.velY = 0;
    }

    move()
    {
        if(!this.isUnderWater)
        {
            this.x += this.speed1;
            this.scaleX -= 0.01;
            this.scaleY -= 0.01;

            this.modified();
        }
        else
        {
            if(this.lockOnEnemy!=null) // エネミーが見つかった場合
            {
                const dx = this.lockOnEnemy.x - this.x;
                const dy = this.lockOnEnemy.y - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const nx = dx / dist;
                const ny = dy / dist;

                // 現在の方向を滑らかに変える(急旋回しないように)
                const turnRate = 0.1;   // 大きくすると急に曲がる
                this.velX += (nx * this.speed2 - this.velX) * turnRate;
                this.velY += (ny * this.speed2 - this.velY) * turnRate;
            }
            else
            {
                this.velX = this.speed2;
                this.vexY = 0;
            }

            this.x += this.velX;
            this.y += this.velY;

            // 進行方向に合わせて、画像の角度を変える
            this.angle = Math.atan2(this.velY, this.velX) * (180 / Math.PI);

            this.modified();
        }

        if (this.x > this.staticTarget_x)
        {
            this.isUnderWater = true;

            //ターゲットを決める
            this.lockOnEnemy = this.lockOn();
        }

        if (this.x > (g.game.width + this.width/2))
        {
            this.destroy();
        }
    
        if(!this.isUnderWater)
        {
            return { isLanding:false, type:"homing" };
        }
        else{
            return { isLanding:true, type:"homing" };
        }
    }

    lockOn()
    {
        let nearest = null;
        let nearestDist = Number.MAX_VALUE;
        for (const enemy of this.seaEnemyManager.enemies)
        {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = dx*dx + dy*dy;
            if(dist < nearestDist)
            {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        return nearest;
    }
}

class PlayerBulletManager {

    constructor(scene)
    {
        this.scene = scene;
        this.bullets = [];
    }

    set setPlayer(player)
    {
        this.player = player;
    }

    set setSkyEnemyManager(skyEnemyManager)
    {
        this.skyEnemyManager = skyEnemyManager;
    }

    spawnBullet(x, y, speed=20, vx=0, vy=0){

        // プレイヤーが非表示の時は生成しない
        if(!this.player.visible()) return true;

        if (vx == 0 && vy == 0){
            const bullet = new PlayerBullet(this.scene, x, y, speed);
            this.scene.append(bullet);
            this.bullets.push(bullet);
        }
        else{
            const bullet = new PlayerAimingBullet(this.scene, x, y, speed, vx, vy);
            this.scene.append(bullet);
            this.bullets.push(bullet);
        }
        
    }

    update()
    {
        let bulletsToRemove = [];

        this.bullets.forEach((bullet, index) => {
            
            bullet.move();
            try {
                this.skyEnemyManager.enemies.forEach(enemy => {
                    if(g.Collision.intersectAreas(bullet.getCollisionArea(), enemy.getCollisionArea()))
                    {
                        enemy.takeDamage();
                        bullet.destroy();
                        //this.bullets.splice(index, 1);
                        bulletsToRemove.push(bullet);
                    }
                });
            } catch (error)
            {
                console.error("forEach内でエラー発生:", error);
            }
        });

        // 削除した弾をリストからも削除
        //this.bullets = this.bullets.filter(bullet => !bullet.destroyed());
        this.bullets = this.bullets.filter(bullet => !bullet.destroyed() && !bulletsToRemove.includes(bullet));
    }
}

class PlayerBombManager {

    maxBombNum = 1;

    constructor(scene)
    {
        this.scene = scene;
        this.bombs = [];
    }

    set setPlayer(player)
    {
        this.player = player;
    }

    set setSeaEnemyManager(seaEnemyManager)
    {
        this.seaEnemyManager = seaEnemyManager;
    }

    spawnBomb(x, y, target, assetId)
    {
        // プレイヤーが非表示の時は生成しない
        if(!this.player.visible()) return true;

        let bomb;
        if(assetId=="bomb3")
        {
            bomb = new PlayerBigBomb(this.scene, assetId, x, y, target);
        }
        else if(assetId=="fritzx")
        {
            bomb = new HomingBomb(this.scene, assetId, x, y, target, this.seaEnemyManager);
        }
        else
        {
            bomb = new PlayerBomb(this.scene, assetId, x, y, target);
        }
        
        this.scene.append(bomb);
        this.scene.insertBefore(bomb, this.player)
        this.bombs.push(bomb);
    }

    spawnTorpede(x, y, target, assetId)
    {
        // プレイヤーが非表示の時は生成しない
        if(!this.player.visible()) return true;
        
        const torpedo = new PlayerTorpedo(this.scene, assetId, x, y, target);
        this.scene.append(torpedo);
        this.scene.insertBefore(torpedo, this.player)
        this.bombs.push(torpedo);
    }

    update()
    {
        this.bombs.forEach((bomb, index) => {

            const ret = bomb.move();

            if(ret.isLanding == true)
            {
                this.seaEnemyManager.enemies.forEach(enemy => {

                    if(g.Collision.intersectAreas(bomb.getCollisionArea(), enemy.getCollisionArea()))
                    {
                        enemy.takeDamage(bomb.getDamage);
            
                        if(ret.type=="torpedo" || ret.type=="homing")
                        {
                            bomb.destroy();
                            this.bombs.splice(index, 1);
                        }
                    }
                });

                if(ret.type=="bomb")
                {
                    bomb.destroy();
                }
            }

        });

        // 削除した弾をリストからも削除
        this.bombs = this.bombs.filter(bomb => !bomb.destroyed());
    }
}

class EnemyBullet extends g.Sprite {

    //speed = 15;

    constructor(scene, x, y, speed)
    {
        const enemyBulletAssetId = "enemy_bullet";
        super({
            scene: scene,
            src: scene.assets[enemyBulletAssetId],
            width: scene.assets[enemyBulletAssetId].width,
            height: scene.assets[enemyBulletAssetId].height,
            x: x,
            y: y,
            anchorX: 0.5,
            anchorY: 0.5
        });
        this.speed = speed;
    }

    move()
    {
        this.x -= this.speed;

        if (this.x < (0 - this.width/2))
        {
            this.destroy();
        }

        this.modified();
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
}

class EnemyAimingBullet extends EnemyBullet {

    //speed = 15;
    
    constructor(scene, x, y, speed, vx, vy)
    {
        super(scene, x, y, speed);
        this.vx = vx;
        this.vy = vy;
    }

    move()
    {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < (0 - this.width/2) || this.x > (g.game.width + this.width/2) ||
            this.y < (0 - this.height/2) || this.y > (g.game.height + this.height/2))
        {
            this.destroy();
        }

        this.modified();
    }
}

class EnemyBulletManager {

    constructor(scene)
    {
        this.scene = scene;
        this.bullets = [];
    }

    set setPlayer(player)
    {
        this.player = player;
    }

    spawnBullet(x, y, speed=15, vx=0, vy=0)
    {
        if(vx == 0 && vy == 0)
        {
            const bullet = new EnemyBullet(this.scene, x, y, speed);
            this.scene.append(bullet);
            this.bullets.push(bullet);
        }
        else
        {
            const bullet = new EnemyAimingBullet(this.scene, x, y, speed, vx, vy);
            this.scene.append(bullet);
            this.bullets.push(bullet);
        }
    }

    update()
    {
        this.bullets.forEach((bullet, index) => {
            
            bullet.move();

            if(!this.player.visible() || this.player.getIsInvincible)return; // 非表示の時と無敵の時は衝突判定を判定しない

            if(g.Collision.intersectAreas(this.player.getCollisionArea(), bullet.getCollisionArea()))
            {
                this.player.takeDamage();
                bullet.destroy();
                this.bullets.splice(index, 1);
            }

        });

        // 削除した弾をリストからも削除
        this.bullets = this.bullets.filter(bullet => !bullet.destroyed());
    }
}

module.exports = {
    PlayerBulletManager: PlayerBulletManager,
    PlayerBombManager: PlayerBombManager,
    EnemyBulletManager: EnemyBulletManager
}
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}