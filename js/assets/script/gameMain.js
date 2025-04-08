window.gLocalAssetContainer["gameMain"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

const {
    SkyEnemyManager,
    SeaEnemyManager
} = require("./enemy");

const {
    Player,
    AU1,
    Liz,
    Jill,
    Shinden,
    XF5U,
    Swordfish,
    Oscar,
    Paul,
    Do217,
    Emily,
    Grace,
    Judy,
    ZeroBaku,
    Frances
} = require("./player");

const {
    PlayerBulletManager,
    PlayerBombManager,
    EnemyBulletManager
} = require("./bullet");

const {
    Effect
} = require("./effect");

const {
    FlyingObjectManager
} = require("./flyingObject");

module.exports.createGameMainScene = () =>
{
    const scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetIds: [
            "background",
            "cloud01",

            "f4u7",
            "au1",
            "liz",
            "jill",
            "shinden",
            "xf5u",
            "swordfish",
            "oscar",
            "paul",
            "do217",
            "emily",
            "grace",
            "judy",
            "zerobaku",
            "frances",

            "target",
            "arrow",
            "blank",

            "player_bullet",
            "bomb",
            "bomb2",
            "bomb3",
            "torpedo",
            "fritzx",

            "zero1",
            "zero2",
            "zero4",
            "zero5",
            "zero6",
            "96shiki",
            "cv1",
            "destroyer1",
            "bb1",
            "enemy_bullet",
            "explosion",
            "alert",
            
            // SE
            "flap_away",
            "se",
            "se2",
            "alert1"
        ]
    });
    scene.onLoad.add(() => {

        // タイトルから引き継いだ情報
        const planeName = g.game.vars.someData.planeName;
        const isAutoStart = g.game.vars.someData.isAutoStart;

        // ここからゲーム内容を記述します
        let time = 60;
        let remainingTime = time - 5;

        // 市場コンテンツのランキングモードでは、g.game.vars.gameState.scoreの値をスコアとして扱います
        g.game.vars.gameState = { score: 0 };

        // ====================================================================
        //  BGM再生
        // ====================================================================
        let bgm = scene.assets["flap_away"].play();
        bgm.changeVolume(0.1);

        // ====================================================================
        //  背景の生成
        // ====================================================================
        let scrollSpeed = 2;

        let bg1 = new g.Sprite({
            scene: scene,
            src: scene.assets["background"],
            x: 0,
            y: 0
        });
        let bg2 = new g.Sprite({
            scene: scene,
            src: scene.assets["background"],
            x: bg1.width,
            y: 0
        });
        scene.append(bg1);
        scene.append(bg2);

        // ====================================================================
        //  雲の描画
        // ====================================================================
        let scrollSpeedCloud = 4;

        const cloud1 = new g.Sprite({
            scene: scene,
            src: scene.assets["cloud01"],
            x: g.game.width/2,
            y: 0
        });
        /*
        const cloud2 = new g.Sprite({
            scene: scene,
            src: scene.assets["cloud01"],
            x: cloud1.width + cloud1.width/2,
            y: cloud1.height/2,
            anchorX: 0.5,
            anchorY: 0.5,
            angle: 180
        })
        */
        scene.append(cloud1);
        // scene.append(cloud2);

        // ====================================================================
        //  フレーム毎の更新処理
        // ====================================================================
        scene.update.add(function () {
            if (remainingTime === 0) return true; // 終了後は動かさない

            bg1.x -= scrollSpeed;
            bg2.x -= scrollSpeed;

            // 背景1が完全に画面外に出たら、右端に移動
            if (bg1.x <= -bg1.width)
            {
                bg1.x = bg2.x + bg1.width;
            }

            // 背景2が完全に画面外に出たら、右端に移動
            if (bg2.x <= -bg1.width)
            {
                bg2.x = bg1.x + bg1.width;
            }

            bg1.modified();
            bg2.modified();

            cloud1.x -= scrollSpeedCloud;
            //cloud2.x -= scrollSpeedCloud;

            cloud1.modified();
            //cloud2.modified();

            // 雲1が完全に画面外に出たら、右端に移動
            if (cloud1.x <= -cloud1.width)
            {
                cloud1.x = g.game.width; //cloud2.x + cloud1.width/2;
            }
            // 雲2が完全に画面外に出たら、右端に移動
            /*
            if (cloud2.x <= -cloud1.width/2)
            {
                cloud2.x = cloud1.x + cloud1.width + cloud1.width/2;
            }
            */

            skyEnemyManager.update(remainingTime);
            seaEnemyManager.update(remainingTime);
            flyingObjectManager.update(remainingTime);

            if(isGameStart)
            {
                playerBulletManager.update();
                playerBombManager.update();
            }
            enemyBulletManager.update();

            scoreLabel.text = "SCORE: " + g.game.vars.gameState.score;
            scoreLabel.invalidate();
        });

        // ====================================================================
        //  各種コンストラクタの生成
        // ====================================================================
        // プレイヤー
        let player;
        switch(planeName)
        {
            case "F4U-7":
                player = new Player(scene, "f4u7", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("target");
                break;
            case "AU-1":
                player = new AU1(scene, "au1", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("target");
                break;
            case "深山":
                player = new Liz(scene, "liz", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("target");
                break;
            case "天山":
                player = new Jill(scene, "jill", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("arrow");
                break;
            case "震電":
                player = new Shinden(scene, "shinden", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("blank");
                break;
            case "XF5U":
                player = new XF5U(scene, "xf5u", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("target");
                break;
            case "Swordfish":
                player = new Swordfish(scene, "swordfish", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("arrow");
                break;
            case "隼":
                player = new Oscar(scene, "oscar", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("target");
                break;
            case "瑞雲":
                player = new Paul(scene, "paul", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("target");
                break;
            case "Do 217":
                player = new Do217(scene, "do217", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("blank");
                break;
            case "二式大艇":
                player = new Emily(scene, "emily", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("arrow");
                break;
            case "流星":
                player = new Grace(scene, "grace", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("arrow");
                break;
            case "彗星":
                player = new Judy(scene, "judy", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("target");
                break;
            case "零戦(爆装)":
                player = new ZeroBaku(scene, "zerobaku", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("target");
                break;
            case "銀河":
                player = new Frances(scene, "frances", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("arrow");
                break;
            default:
                player = new Player(scene, "f4u7", g.game.width/2 - 400, g.game.height/2);
                player.initTargetIcon("target");
                break;
        }
        scene.append(player);

        // プレイヤーの弾管理
        const playerBulletManager = new PlayerBulletManager(scene);
        const playerBombManager = new PlayerBombManager(scene);

        // 敵の生成管理
        const skyEnemyManager = new SkyEnemyManager(scene);
        const seaEnemyManager = new SeaEnemyManager(scene);

        // 敵の弾管理
        const enemyBulletManager = new EnemyBulletManager(scene);

        // 表示関係の管理
        const flyingObjectManager = new FlyingObjectManager(scene);

        // ====================================================================
        //  プレイヤーの設定
        // ====================================================================
        player.setBulletManager = playerBulletManager;
        player.setBombManager = playerBombManager;

        // ====================================================================
        //  プレイヤーの弾の管理
        // ====================================================================
        playerBulletManager.setPlayer = player;
        playerBulletManager.setSkyEnemyManager = skyEnemyManager;
        playerBombManager.setPlayer = player;
        playerBombManager.setSeaEnemyManager = seaEnemyManager;

        // ====================================================================
        //  敵の弾の管理
        // ====================================================================
        enemyBulletManager.setPlayer = player;

        // ====================================================================
        //  表示関係
        // ====================================================================
        
        // ====================================================================
        //  敵の生成
        // ====================================================================
        skyEnemyManager.setPlayer = player;
        skyEnemyManager.setEnemyBulletManager = enemyBulletManager;

        seaEnemyManager.setPlayer = player;
        seaEnemyManager.setCloud = cloud1;
        seaEnemyManager.setEnemyBulletManager = enemyBulletManager;

        // 敵の生成タイムスケジュール
        const startTime = remainingTime;

        // Wave 1
        skyEnemyManager.addEnemySchedule("zero1", startTime - 5, 1400, calcRandomYPosition());
        skyEnemyManager.addEnemySchedule("zero1", startTime - 5, 1425, calcRandomYPosition());
        skyEnemyManager.addEnemySchedule("zero1", startTime - 5, 1450, calcRandomYPosition());
        skyEnemyManager.addEnemySchedule("zero1", startTime - 5, 1475, calcRandomYPosition());

        // Wave 2
        skyEnemyManager.addEnemySchedule("zero1", startTime - 10, 1400, calcRandomYPosition());
        skyEnemyManager.addEnemySchedule("zero1", startTime - 10, 1425, calcRandomYPosition());
        skyEnemyManager.addEnemySchedule("zero1", startTime - 10, 1450, calcRandomYPosition());
        skyEnemyManager.addEnemySchedule("zero1", startTime - 10, 1475, calcRandomYPosition());

        seaEnemyManager.addEnemySchedule("destroyer1", startTime - 10, 1600, calcRandomYPosition());
        
        // Wave 3
        skyEnemyManager.addEnemySchedule("zero2", startTime - 15, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero3", startTime - 15, 1425, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 15, 1450, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero3", startTime - 16, 1475, calcRandomYPosition(), enemyBulletManager);

        seaEnemyManager.addEnemySchedule("destroyer1", startTime - 15, 1600, calcRandomYPosition());

        // Wave 4
        flyingObjectManager.addFlyingObjectSchedule("alert", startTime - 19, 72, 360);

        skyEnemyManager.addEnemySchedule("zero6", startTime - 21, -100, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero6", startTime - 21, -125, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero6", startTime - 21, -150, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero6", startTime - 22, -175, calcRandomYPosition(), enemyBulletManager);

        seaEnemyManager.addEnemySchedule("cv1", startTime - 21, 1600, calcRandomYPosition());

        // Wave 5
        skyEnemyManager.addEnemySchedule("zero2", startTime - 27, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero3", startTime - 27, 1425, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 27, 1450, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero3", startTime - 27, 1475, calcRandomYPosition(), enemyBulletManager);

        skyEnemyManager.addEnemySchedule("96shiki", startTime - 27, 1500, 360, enemyBulletManager);

        // Wave 6
        seaEnemyManager.addEnemySchedule("bb1", startTime - 32, 1630, 360);

        skyEnemyManager.addEnemySchedule("zero2", startTime - 32, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 32, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 32, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 32, 1400, calcRandomYPosition(), enemyBulletManager);

        skyEnemyManager.addEnemySchedule("zero2", startTime - 37, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 37, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 37, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 37, 1400, calcRandomYPosition(), enemyBulletManager);

        skyEnemyManager.addEnemySchedule("zero2", startTime - 42, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 42, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 42, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 42, 1400, calcRandomYPosition(), enemyBulletManager);

        skyEnemyManager.addEnemySchedule("zero2", startTime - 47, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 47, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 47, 1400, calcRandomYPosition(), enemyBulletManager);
        skyEnemyManager.addEnemySchedule("zero2", startTime - 47, 1400, calcRandomYPosition(), enemyBulletManager);


        // ====================================================================
        //  UIの設定
        // ====================================================================
        // フォントの生成
        var font = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-selif",
            size: 48
        });

        // 縁取りフォントの定義
        var strokeFont = new g.DynamicFont({
            game: scene.game,
            fontFamily: g.FontFamily.Serif,
            fontColor: "black",
            strokeColor: "white",
            strokeWidth: 4,
            size: 72
        });

        // スコア表示用のラベル
        var scoreLabel = new g.Label({
            scene: scene,
            text: "SCORE: 0",
            font: strokeFont,
            fontSize: strokeFont.size / 2,
        });
        scene.append(scoreLabel);

        // 残り時間表示用ラベル
        var timeLabel = new g.Label({
            scene: scene,
            text: "TIME: " + remainingTime,
            font: strokeFont,
            fontSize: strokeFont.size / 2,
            x: 0.65 * g.game.width
        });
        scene.append(timeLabel)

        // タイマーのカウントダウン表示
        function updateTimer() {
            timeLabel.text = "TIME: " + remainingTime;
            timeLabel.invalidate();
        }

        // タイマーのカウントダウン処理
        const timer = scene.setInterval(() => {
            remainingTime--;
            if (remainingTime === 0) {
                scene.clearInterval(timer); // タイマーの停止
                // TODO: 終了処理
                player.stop();
                bgm.stop();

                console.log("total score:", skyEnemyManager.getTotalScore + seaEnemyManager.getTotalScore);
            }
            updateTimer();
        }, 1000);

        // ====================================================================
        //  1回画面をクリックするまで、ゲームを開始しないようにする
        // ====================================================================
        let isGameStart;
        if(!isAutoStart) // タイトル画面で自動開始がOFFだった場合
        {
            isGameStart = false;

            const overlay = new g.FilledRect({
                scene: scene,
                cssColor: "rgba(255, 255, 255, 0.7)",
                width: g.game.width,
                height: g.game.height,
                x: 0,
                y: 0,
                touchable: true
            });
            scene.append(overlay);

            const overlayLabel = new g.Label({
                scene: scene,
                text: "Click start!",
                font: font,
                fontSize: 72,
                textColor: "black",
                x: g.game.width/2,
                y: g.game.height/2,
                anchorX: 0.5,
                anchorY: 0.5
            });
            overlay.append(overlayLabel);

            overlay.pointDown.add(() => {
                if(!isGameStart)
                {
                    isGameStart = true;
                    player.startGame();
                    overlay.destroy();
                }
            });
        }
        else{ // タイトル画面で自動開始がONだった場合
            isGameStart = true;
            player.startGame();
        }
        // ここまでゲーム内容を記述します

    });
    return scene;
};

function calcRandomYPosition()
{
    let randY, rangeY;
    let marginTop = 50;
    let marginBottom = 670;

    randY = g.game.random.generate() * g.game.height;
    rangeY = Math.floor(marginTop + (randY * (marginBottom - marginTop) / g.game.height));

    return rangeY;
}

function calcRandomXPosition()
{
    let randX, rangeX;
    let marginLeft = 640;
    let marginRight = 1230;

    randX = g.game.random.generate() * g.game.width;
    rangeX = Math.floor(marginLeft + (randX * (marginRight - marginLeft)/ g.game.width));

    return rangeX;
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}