window.gLocalAssetContainer["enemy"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

const {
    Effect
} = require("./effect");

const {
    EnemyBulletManager
} = require("./bullet");
const player = require("./player");

class Enemy extends g.Sprite {

    constructor(scene, assetId, x, y, hp, speed, score)
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

        this.hp = hp;
        this.speed = speed;
        this.score = score;
        this.isDestroy = false;

        this.se2 = scene.assets["se2"];
    }

    move()
    {
        // 継承でカスタマイズ
    }

    shoot()
    {
        // 継承でカスタマイズ
    }

    killed()
    {
        // 継承でカスタマイズ
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
        if(this.isDestroy)return;

        this.hp -= damage;
        if (this.hp <= 0)
        {
            this.isDestroy = true;
            this.killed();
            this.destroy();
            g.game.vars.gameState.score += this.score;
        }
        else{
            let se = this.se2.play();
            se.changeVolume(0.1);
        }
    }

    takeDamageByTackle()
    {
        this.hp -= 1;
        if (this.hp <= 0)
        {
            this.killed();
            this.destroy();
        }
    }

    get getScore()
    {
        return this.score;
    }
}

class EnemyManager {

    totalScore = 0;

    constructor(scene)
    {
        this.scene = scene;
        this.enemies = [];
        this.schedule = [];
    }

    set setPlayer(player)
    {
        this.player = player;
    }

    set setSoundManager(soundManager)
    {
        this.soundManager = soundManager
    }

    /**
     * エネミーの出現スケジュールを登録
     * @param {String} assetId - エネミー
     * @param {number} spawnTime - 残り時間(秒)
     * @param {number} x - 出現位置X
     * @param {number} y - 出現位置Y
     */
    addEnemySchedule(assetId, spawnTime, x, y)
    {
        this.schedule.push({ assetId, spawnTime, x, y});
    }

    /**
     * ゲームループ毎にエネミーを管理する
     * @param {number} remainingTime - 現在のゲームの残り時間(秒)
     */
    update(remainingTime) {
        for (let i = this.schedule.length - 1; i >= 0; i--)
        {
            const enemyData = this.schedule[i];
            if (remainingTime <= enemyData.spawnTime)
            {
                this.spawnEnemy(enemyData.assetId, enemyData.x, enemyData.y);
                this.schedule.splice(i, 1); // 出現済みエネミーを削除
            }
        }

        // 全てのエネミーの移動処理
        this.enemies.forEach(enemy => enemy.move());

        // 全てのエネミーの衝突判定処理
        this.checkCollisions();

        // 削除したエネミーをリストからも削除
        this.enemies = this.enemies.filter(enemy => !enemy.destroyed());
    }

    /**
     * エネミーを生成する
     * @param {string} assetId - アセットのID
     * @param {number} x - 出現位置X
     * @param {number} y - 出現位置Y
     */
    spawnEnemy(assetId, x, y)
    {
        /*
        let enemy;
        switch (assetId) {
            case "zero1":
                enemy = new Zero1(this.scene, x, y);
                break;
            default:
                break;
        }
        this.scene.append(enemy);
        this.enemies.push(enemy);
        */
    }

    checkCollisions()
    {
        const playerArea = this.player.getCollisionArea();

        if(!this.player.visible() || this.player.getIsInvincible)return; // 非表示の時と無敵の時は衝突判定を判定しない

        this.enemies.forEach(enemy => {
            const enemyArea = enemy.getCollisionArea();
            if(g.Collision.intersectAreas(playerArea, enemyArea))
            {
                this.player.takeDamage();
                enemy.takeDamageByTackle();
            }
        });
    }

    get getTotalScore()
    {
        return this.totalScore;
    }
}

class SkyEnemyManager extends EnemyManager {

    set setEnemyBulletManager(enemyBulletManager)
    {
        this.enemyBulletManager = enemyBulletManager;
    }

    spawnEnemy(assetId, x, y)
    {
        let enemy;
        switch (assetId) {
            case "zero1":
                enemy = new Zero1(this.scene, x, y);
                break;
            case "zero2":
                enemy = new Zero2(this.scene, x, y);
                enemy.setEnemyBulletManager = this.enemyBulletManager;
                break;
            case "zero3":
                enemy = new Zero3(this.scene, x, y, this.player);
                enemy.setEnemyBulletManager = this.enemyBulletManager;
                break;
            case "zero4":
                enemy = new Zero4(this.scene, x, y, this.player);
                enemy.setEnemyBulletManager = this.enemyBulletManager;
                break;
            case "zero5":
                enemy = new Zero5(this.scene, x, y, this.player);
                enemy.setEnemyBulletManager = this.enemyBulletManager;
                break;
            case "zero6":
                enemy = new Zero6(this.scene, x, y, this.player);
                enemy.setEnemyBulletManager = this.enemyBulletManager;
                break;
            case "zero7":
                enemy = new Zero7(this.scene, x, y, this.player);
                enemy.setEnemyBulletManager = this.enemyBulletManager;
                break;
            case "96shiki":
                enemy = new G3M(this.scene, x, y);
                enemy.setEnemyBulletManager = this.enemyBulletManager;
                break;
            default:
                break;
        }
        this.scene.append(enemy);
        this.enemies.push(enemy);

        this.totalScore += enemy.getScore;
    }
}

class SeaEnemyManager extends EnemyManager {

    set setCloud(cloud)
    {
        this.cloud = cloud;
    }

    set setEnemyBulletManager(enemyBulletManager)
    {
        this.enemyBulletManager = enemyBulletManager;
    }

    spawnEnemy(assetId, x, y)
    {
        let enemy;
        switch (assetId) {
            case "cv1":
                enemy = new CV1(this.scene, x, y);
                break;
            case "destroyer1":
                enemy = new Destroyer1(this.scene, x, y);
                break;
            case "bb1":
                enemy = new BattleShip1(this.scene, x, y, this.player);
                enemy.setEnemyBulletManager = this.enemyBulletManager;
                break;
            default:
                break;
        }
        this.scene.append(enemy);
        this.scene.insertBefore(enemy, this.cloud);
        this.enemies.push(enemy);

        this.totalScore += enemy.getScore;
    }

    update(remainingTime)
    {
        for (let i = this.schedule.length - 1; i >= 0; i--)
        {
            const enemyData = this.schedule[i];
            if (remainingTime <= enemyData.spawnTime)
            {
                this.spawnEnemy(enemyData.assetId, enemyData.x, enemyData.y);
                this.schedule.splice(i, 1); // 出現済みエネミーを削除
            }
        }
    
        // 全てのエネミーの移動処理
        this.enemies.forEach(enemy => enemy.move());
    
        // 削除したエネミーをリストからも削除
        this.enemies = this.enemies.filter(enemy => !enemy.destroyed());
    }
}

class skyEnemy extends Enemy {

    set setEnemyBulletManager(enemyBulletManager)
    {
        this.enemyBulletManager = enemyBulletManager;
    }
}

class seaEnemy extends Enemy {

    set setEnemyBulletManager(enemyBulletManager)
    {
        this.enemyBulletManager = enemyBulletManager;
    }
}

class Zero1 extends skyEnemy {

    constructor(scene, x, y)
    {
        super(scene, "zero1", x, y, 1, 15, 100);

        this.effect = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect);

        this.se = scene.assets["se"];
    }

    move()
    {
        if(this.x < -this.width/2)
        {
            this.destroy();
        }
        this.x -= this.speed;
        this.modified();
    }

    killed()
    {
        this.effect.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);
    }
}

class Zero2 extends skyEnemy {

    constructor(scene, x, y)
    {
        super(scene, "zero2", x, y, 1, 10, 200);
        this.isDestroy = false;

        this.effect = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect);

        this.se = scene.assets["se"];

        scene.setTimeout(() => {
            this.shoot();
        }, 1000);
    }

    move()
    {
        if(this.x < -this.width/2)
        {
            this.destroy();
        }
        this.x -= this.speed;
        this.modified();
    }

    shoot()
    {
        if(this.isDestroy) return;
        this.enemyBulletManager.spawnBullet(this.x - this.width/2, this.y);
    }

    killed()
    {
        this.effect.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);
    }
}

class Zero3 extends skyEnemy {

    constructor(scene, x, y, player)
    {
        super(scene, "zero2", x, y, 1, 10, 200);
        this.isDestroy = false;
        this.player = player;

        this.effect = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect);

        this.se = scene.assets["se"];

        scene.setTimeout(() => {
            this.shoot();
        }, 1000);
    }

    move()
    {
        if(this.x < -this.width/2)
        {
            this.destroy();
        }
        this.x -= this.speed;
        this.modified();
    }

    shoot()
    {
        if(this.isDestroy) return;

        // プレイヤーの方向を計算
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        const speed = 15;

        // 正規化して速度をかける
        const vx = (dx / length) * speed;
        const vy = (dy / length) * speed;

        this.enemyBulletManager.spawnBullet(this.x - this.width/2, this.y, speed, vx, vy);
    }

    killed()
    {
        this.effect.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);
    }
}

class Zero4 extends skyEnemy {

    constructor(scene, x, y, player)
    {
        super(scene, "zero4", x, y, 1, 10, 200);
        this.isDestroy = false;
        this.player = player;

        this.effect = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect);

        this.se = scene.assets["se"];

        scene.setTimeout(() => {
            this.shoot();
        }, 750);
    }

    move()
    {
        if(this.y < -this.height/2)
        {
            this.destroy();
        }
        this.y -= this.speed;
        this.modified();
    }

    shoot()
    {
        if(this.isDestroy) return;

        // プレイヤーの方向を計算
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        const speed = 15;

        // 正規化して速度をかける
        const vx = (dx / length) * speed;
        const vy = (dy / length) * speed;

        this.enemyBulletManager.spawnBullet(this.x - this.width/2, this.y, speed, vx, vy);
    }

    killed()
    {
        this.effect.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);
    }
}

class Zero5 extends skyEnemy {

    constructor(scene, x, y, player)
    {
        super(scene, "zero5", x, y, 1, 10, 200);
        this.isDestroy = false;
        this.player = player;

        this.effect = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect);

        this.se = scene.assets["se"];

        scene.setTimeout(() => {
            this.shoot();
        }, 750);
    }

    move()
    {
        if(this.y > g.game.height + this.height/2)
        {
            this.destroy();
        }
        this.y += this.speed;
        this.modified();
    }

    shoot()
    {
        if(this.isDestroy) return;

        // プレイヤーの方向を計算
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        const speed = 15;

        // 正規化して速度をかける
        const vx = (dx / length) * speed;
        const vy = (dy / length) * speed;

        this.enemyBulletManager.spawnBullet(this.x - this.width/2, this.y, speed, vx, vy);
    }

    killed()
    {
        this.effect.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);
    }
}

class Zero6 extends skyEnemy {

    constructor(scene, x, y)
    {
        super(scene, "zero6", x, y, 1, -10, 200);
        this.isDestroy = false;

        this.effect = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect);

        this.se = scene.assets["se"];

        scene.setTimeout(() => {
            this.shoot();
        }, 1000);
    }

    move()
    {
        if(this.x > g.game.width + this.width/2)
        {
            this.destroy();
        }
        this.x -= this.speed;
        this.modified();
    }

    shoot()
    {
        if(this.isDestroy) return;
        this.enemyBulletManager.spawnBullet(this.x - this.width/2, this.y, -20);
    }

    killed()
    {
        this.effect.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);
    }
}

class Zero7 extends skyEnemy {

    constructor(scene, x, y, player)
    {
        super(scene, "zero6", x, y, 1, -10, 200);
        this.isDestroy = false;
        this.player = player;

        this.effect = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect);

        this.se = scene.assets["se"];

        scene.setTimeout(() => {
            this.shoot();
        }, 1000);
    }

    move()
    {
        if(this.x > g.game.width + this.width/2)
        {
            this.destroy();
        }
        this.x -= this.speed;
        this.modified();
    }

    shoot()
    {
        if(this.isDestroy) return;

        // プレイヤーの方向を計算
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        const speed = 15;

        // 正規化して速度をかける
        const vx = (dx / length) * speed;
        const vy = (dy / length) * speed;

        this.enemyBulletManager.spawnBullet(this.x - this.width/2, this.y, speed, vx, vy);
    }

    killed()
    {
        this.effect.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);
    }
}

class G3M extends skyEnemy {

    constructor(scene, x, y)
    {
        super(scene, "96shiki", x, y, 15, 7, 2005);
        this.isDestroy = false;

        this.effect1 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect2 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect3 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect1);
        this.scene.append(this.effect2);
        this.scene.append(this.effect3);

        this.se = scene.assets["se"];
        this.se2 = scene.assets["se2"];

        scene.setInterval(() => {
            this.shootFront();
        }, 750);

        scene.setInterval(() => {
            this.shootBack();
        }, 375);
    }

    move()
    {
        if(this.x < -this.width/2)
        {
            this.destroy();
            this.isDestroy = true;
        }
        this.x -= this.speed;
        this.modified();
    }

    shootFront()
    {
        if(this.isDestroy) return;

        this.enemyBulletManager.spawnBullet(this.x - this.width/2, this.y, 10);

        let dx = -3;
        let dy = -1;
        let length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        let vx = (dx / length) * 10;
        let vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x - this.width/2, this.y, 10, vx, vy);

        dx = -3;
        dy = 1;

        length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        vx = (dx / length) * 10;
        vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x - this.width/2, this.y, 10, vx, vy);
    }

    shootBack()
    {
        if(this.isDestroy) return;
        
        this.enemyBulletManager.spawnBullet(this.x + this.width/2, this.y, -10);

        let dx = 2;
        let dy = -1;
        let length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        let vx = (dx / length) * 10;
        let vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x + this.width/2, this.y, 10, vx, vy);

        dx = 2;
        dy = 1;

        length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        vx = (dx / length) * 10;
        vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x + this.width/2, this.y, 10, vx, vy);
    }

    takeDamage(damage=1)
    {
        if(this.isDestroy)return;

        this.hp -= damage;
        if (this.hp <= 0)
        {
            this.isDestroy = true;
            this.killed(() => {
                this.destroy();
                this.isDestroy = true;
                g.game.vars.gameState.score += this.score;
            });
        }
        else{
            let se = this.se2.play();
            se.changeVolume(0.1);
        }
    }

    killed(onFinish)
    {
        this.effect1.startEffect(this.x - this.width/2.5, this.y - this.height/2.5);
        let se = this.se.play();
        se.changeVolume(0.1);

        this.scene.setTimeout(() => {
            this.effect2.startEffect(this.x, this.y + this.height/2.5);
            se = this.se.play();
            se.changeVolume(0.1);
        }, 100);

        this.scene.setTimeout(() => {
            this.effect3.startEffect(this.x + this.width/2.5, this.y - this.height/2.5);
            se = this.se.play();
            se.changeVolume(0.1);

            // 全てのエフェクトが終わった後に destroy　する
            if (onFinish) onFinish();
        }, 200);
    }
}

class CV1 extends seaEnemy {

    constructor(scene, x, y)
    {
        super(scene, "cv1", x, y, 1, 7, 1050);

        this.effect1 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect2 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect3 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect1);
        this.scene.append(this.effect2);
        this.scene.append(this.effect3);

        this.se = scene.assets["se"];
    }

    move()
    {
        if(this.x < -this.width/2)
        {
            this.destroy();
        }
        this.x -= this.speed;
        this.modified();
    }

    takeDamage(damage=1)
    {
        if(this.isDestroy)return;

        this.hp -= damage;
        if (this.hp <= 0)
        {
            this.isDestroy = true;
            this.killed(() => {
                this.destroy();
                this.isDestroy = true;
                g.game.vars.gameState.score += this.score;
            });
        }
        else{
            let se = this.se2.play();
            se.changeVolume(0.1);
        }
    }

    killed(onFinish)
    {
        this.effect1.startEffect(this.x - this.width/3, this.y - this.height/3);
        let se = this.se.play();
        se.changeVolume(0.1);

        this.scene.setTimeout(() => {
            this.effect2.startEffect(this.x, this.y + this.height/3);
            se = this.se.play();
            se.changeVolume(0.1);
        }, 100);

        this.scene.setTimeout(() => {
            this.effect3.startEffect(this.x + this.width/3, this.y - this.height/3);
            se = this.se.play();
            se.changeVolume(0.1);

            // 全てのエフェクトが終わった後に destroy　する
            if (onFinish) onFinish();
        }, 200);
    }
}

class Destroyer1 extends seaEnemy {

    constructor(scene, x, y)
    {
        super(scene, "destroyer1", x, y, 1, 7, 500);

        this.effect1 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect1);

        this.se = scene.assets["se"];
    }

    move()
    {
        if(this.x < -this.width/2)
        {
            this.destroy();
        }
        this.x -= this.speed;
        this.modified();
    }

    killed()
    {
        this.effect1.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);
    }
}

class BattleShip1 extends seaEnemy {

    constructor(scene, x, y, player)
    {
        super(scene, "bb1", x, y, 5, 3, 10000);

        this.effect1 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect2 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect3 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect4 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect5 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect6 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect7 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect8 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.effect9 = new Effect(this.scene, "explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        this.scene.append(this.effect1);
        this.scene.append(this.effect2);
        this.scene.append(this.effect3);
        this.scene.append(this.effect4);
        this.scene.append(this.effect5);
        this.scene.append(this.effect6);
        this.scene.append(this.effect7);
        this.scene.append(this.effect8);
        this.scene.append(this.effect9);

        this.se = scene.assets["se"];
        this.player = player;
        this.isDestroy = false;

        scene.setInterval(() => {
            this.shoot();
        }, 1000);

        scene.setInterval(() => {
            this.aimingShoot();
        }, 2000)
    }

    move()
    {
        if(this.x < -this.width/2)
        {
            this.destroy();
        }
        this.x -= this.speed;
        this.modified();
    }

    shoot()
    {
        if(this.isDestroy) return;

        let dx = -3;
        let dy = -1;
        let length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        let vx = (dx / length) * 10;
        let vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x + 50, this.y - 45, 10, vx, vy);

        dx = -3;
        dy = 1;

        length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        vx = (dx / length) * 10;
        vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x + 50, this.y + 12, 10, vx, vy);

        dx = 3;
        dy = -1;
        length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        vx = (dx / length) * 10;
        vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x + 125, this.y - 45, 10, vx, vy);

        dx = 3;
        dy = 1;

        length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        vx = (dx / length) * 10;
        vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x + 125, this.y + 12, 10, vx, vy);
    }

    aimingShoot()
    {
        if(this.isDestroy) return;

        let dx = this.player.x - this.x;
        let dy = this.player.y - this.y;
        let length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        let vx = (dx / length) * 10;
        let vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x + 30, this.y - 23, 10, vx, vy);

        dx = this.player.x - this.x;
        dy = this.player.y - this.y;

        length = Math.sqrt(dx * dx + dy * dy); // ベクトルの長さ
        
        // 正規化して速度をかける
        vx = (dx / length) * 10;
        vy = (dy / length) * 10;

        this.enemyBulletManager.spawnBullet(this.x + 30, this.y - 2, 10, vx, vy);
    }

    takeDamage(damage=1)
    {
        if(this.isDestroy)return;

        this.hp -= damage;
        if (this.hp <= 0)
        {
            this.isDestroy = true;
            this.killed(() => {
                this.destroy();
                this.isDestroy = true;
                g.game.vars.gameState.score += this.score;
            });
        }
        else{
            let se = this.se2.play();
            se.changeVolume(0.1);
        }
    }

    killed(onFinish)
    {
        this.effect1.startEffect(this.x, this.y);
        let se = this.se.play();
        se.changeVolume(0.1);

        this.scene.setTimeout(() => {
            this.effect2.startEffect(this.x - this.width/3, this.y - this.height/3);
            se = this.se.play();
            se.changeVolume(0.1);
        }, 100);

        this.scene.setTimeout(() => {
            this.effect3.startEffect(this.x - this.width/3-10, this.y + this.height/3);
            se = this.se.play();
            se.changeVolume(0.1);
        }, 200);

        this.scene.setTimeout(() => {
            this.effect2.startEffect(this.x - this.width/4, this.y - this.height/3+10);
            se = this.se.play();
            se.changeVolume(0.1);
        }, 300);

        this.scene.setTimeout(() => {
            this.effect3.startEffect(this.x - this.width/4+10, this.y + this.height/3+10);
            se = this.se.play();
            se.changeVolume(0.1);
        }, 400);

        this.scene.setTimeout(() => {
            this.effect3.startEffect(this.x + this.width/4-10, this.y - this.height/3);
            se = this.se.play();
            se.changeVolume(0.1);
        }, 500);

        this.scene.setTimeout(() => {
            this.effect3.startEffect(this.x + this.width/4, this.y + this.height/3);
            se = this.se.play();
            se.changeVolume(0.1);
        }, 600);

        this.scene.setTimeout(() => {
            this.effect3.startEffect(this.x + this.width/3+10, this.y - this.height/3+10);
            se = this.se.play();
            se.changeVolume(0.1);
        }, 700);

        this.scene.setTimeout(() => {
            this.effect3.startEffect(this.x + this.width/3, this.y + this.height/3+10);
            se = this.se.play();
            se.changeVolume(0.1);

            // 全てのエフェクトが終わった後に destroy　する
            if (onFinish) onFinish();
        }, 800);
    }
}

module.exports = {
    SkyEnemyManager: SkyEnemyManager,
    SeaEnemyManager: SeaEnemyManager
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}