window.gLocalAssetContainer["title"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

module.exports.createTitleScene = () =>
{
    const gameMain = require("./gameMain")

    const titleTimeoutMsec = 10000; //5000;
    let remainingTime = titleTimeoutMsec/1000;

    const scene = new g.Scene({
        game: g.game,
        assetIds: [
            "title06",
            "intro_f4u7",
            "intro_au1",
            "intro_liz",
            "intro_jill",
            "intro_shinden",
            "intro_xf5u",
            "intro_swordfish",
            "intro_oscar",
            "intro_paul",
            "intro_do217",
            "intro_emily",
            "intro_grace",
            "intro_judy",
            "intro_zerobaku",
            "intro_frances"
        ]
    });

    scene.onLoad.add(() => {

        const al = require("@akashic-extension/akashic-label");

        const titleImageAsset = scene.asset.getImageById("title06");

        const title = new g.Sprite({
            scene: scene,
            src: titleImageAsset,
            x: 0,
            y: 0
        });
        scene.append(title);

        // ====================================================================
        //  UIの設定
        // ====================================================================
        // フォントの生成
        var font = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-selif",
            fontColor: "white",
            size: 72
        });

        var planeFont = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-selif",
            fontColor: "white",
            size: 20
        });

        // タイマーラベルの設定
        const timerLabel = new g.Label({
            scene: scene,
            font: font,
            fontSize: font.size,
            text:'',
            x: 975,
            y: 620,
            width: 70,
            anchorX: 1.0,
            anchorY: 0.0
        });
        scene.append(timerLabel);

        // タイマー表示を更新する
        function updateTimer() {
            timerLabel.text = `${remainingTime}`;
            timerLabel.invalidate();
        }

        const timer = scene.setInterval(() => {
            remainingTime--;
            updateTimer();
        }, 1000);

        // ボタンの設定
        let buttons = [];
        const labels = [
            [
                "F4U-7", "AU-1", "深山", "天山", "震電",
                 "XF5U", "Swordfish", "隼", "瑞雲", "Do 217"
            ],
            [
                "二式大艇", "流星", "彗星", "零戦(爆装)", "銀河",
                "", "", "", "", ""
            ]
        ];
        let selectedIndex = null;

        const positions = [
            {x:675, y:15}, {x:675, y:65}, {x:675, y:115}, {x:675, y:165}, {x:675, y:215},
            {x:795, y:15}, {x:795, y:65}, {x:795, y:115}, {x:795, y:165}, {x:795, y:215}
        ];

        g.game.vars.someData = {
            planeName: "test",
            isAutoStart: false
        };

        // ページ送りのボタンの設定
        let currentPage = 0;
        let maxPage = 1;

        let prevButton = new g.FilledRect({
            scene: scene,
            cssColor: "#000000",
            x: 675,
            y: 265,
            width: 110,
            height: 40,
            touchable: true
        });

        let prevLabel = new g.Label({
            scene: scene,
            text: "◀",
            textColor: "white",
            font: planeFont,
            fontSize: planeFont.size,
            x: 55,
            y: 20-2,
            anchorX: 0.5,
            anchorY: 0.5
        });
        prevButton.append(prevLabel);
        scene.append(prevButton);

        let nextButton = new g.FilledRect({
            scene: scene,
            cssColor: "#000000",
            x: 795,
            y: 265,
            width: 110,
            height: 40,
            touchable: true
        });

        let nextLabel = new g.Label({
            scene: scene,
            text: "▶",
            textColor: "white",
            font: planeFont,
            fontSize: planeFont.size,
            x: 55,
            y: 20-2,
            anchorX: 0.5,
            anchorY: 0.5
        });
        nextButton.append(nextLabel);
        scene.append(nextButton);

        prevButton.onPointDown.add(() => {
            currentPage--;
            if(currentPage < 0)
            {
                currentPage = maxPage;
            }
            updateLabels(currentPage);
            updateButtonStatus(currentPage, null)
        });

        nextButton.onPointDown.add(() => {
            currentPage++;
            if(currentPage > maxPage)
            {
                currentPage = 0;
            }
            updateLabels(currentPage);
            updateButtonStatus(currentPage, null)
        });

        function updateLabels(currentPage)
        {
            for (let i = 0; i < labels[currentPage].length; i++)
            {
                buttons[i].label.text = labels[currentPage][i]
                buttons[i].label.invalidate();
            }
        }

        for (let i = 0; i < labels[0].length; i++)
        {
            const button = createButton(labels[0][i], positions[i].x, positions[i].y, i);
            buttons.push(button);
        }
        selectedIndex = 0;
        updateButtonStatus(currentPage, buttons[0].label);

        function createButton(text, x, y, i)
        {
            const button = new g.FilledRect({
                scene: scene,
                cssColor: "#000000",
                x: x,
                y: y,
                width: 110,
                height: 40,
                touchable: true
            });

            let label = new g.Label({
                scene: scene,
                text: text,
                textColor: "white",
                font: planeFont,
                fontSize: planeFont.size,
                x: 55,
                y: 20-2,
                anchorX: 0.5,
                anchorY: 0.5
            });
            button.append(label);
            scene.append(button);

            // クリックイベントを追加
            button.onPointDown.add(() => {
                selectedIndex = currentPage * 10 + i;
                if(selectedIndex > introImageAsset.length - 1)return; // 設定されている機体よりも先のボタンを押された場合処理しない
                updateButtonStatus(currentPage, label);
                introSprite.src = scene.asset.getImageById(introImageAsset[selectedIndex])
                introSprite.invalidate();
                introMessage.text = introMessages[selectedIndex];
                introMessage.invalidate();
            });

            return ({button, label});
        }

        // 紹介画像
        const introImageAsset = [
            "intro_f4u7",
            "intro_au1",
            "intro_liz",
            "intro_jill",
            "intro_shinden",
            "intro_xf5u",
            "intro_swordfish",
            "intro_oscar",
            "intro_paul",
            "intro_do217",
            "intro_emily",
            "intro_grace",
            "intro_judy",
            "intro_zerobaku",
            "intro_frances"
        ];

        const introMessages = [
            "格闘：■■■□\n爆装：■□□□\n耐久：■□□□",
            "格闘：■■□□\n爆装：■■□□\n耐久：■□□□",
            "格闘：■■□□\n爆装：■■■□\n耐久：■□□□",
            "格闘：□□□□\n雷装：■■■■\n耐久：■■□□",
            "格闘：■■■■\n爆装：□□□□\n耐久：■□□□",
            "格闘：■■□□\n爆装：■□□□\n耐久：■□□□",
            "格闘：■□□□\n雷装：■■■■\n耐久：■■□□",
            "格闘：■■□□\n爆装：■□□□\n耐久：■■□□",
            "格闘：■■□□\n爆装：■□□□\n耐久：■■■□",
            "格闘：■■□□\n爆装：■■■■■\n耐久：■■□□",
            "格闘：■■□□\n雷装：■■■■\n耐久：■■□□",
            "格闘：■■□□\n雷装：■■■■\n耐久：■□□□",
            "格闘：■■□□\n爆装：■■□□\n耐久：■□□□",
            "格闘：■■■□\n爆装：■□□□\n耐久：■□□□",
            "格闘：■□□□\n雷装：■■■■\n耐久：■■□□"
        ];

        let introSprite = new g.Sprite({
            scene: scene,
            src: scene.asset.getImageById(introImageAsset[0]),
            width: 250,
            height: 230,
            x: 940,
            y: 45
        });
        scene.append(introSprite);

        let introMessage = new al.Label({
            scene: scene,
            text: introMessages[0],
            textColor: "white",
            font: planeFont,
            fontSize: 24,
            x: 940,
            y: 200,
            width: 200
        });
        scene.append(introMessage);

        function updateButtonStatus(currentPage, clickedLabel)
        {
            for(let i = 0; i < 10; i++)
            {
                const index = currentPage * 10 + i;

                const isSelected = (index == selectedIndex);

                // console.log("index:" + index + " selectIndex:" + selectedIndex + " isSelected:" + isSelected);

                buttons[i].button.cssColor = isSelected ? "#ff0000" : "#000000";
                buttons[i].button.modified();

                if(isSelected)
                {
                    g.game.vars.someData.planeName = buttons[i].label.text; //clickedLabel.text;
                }
            }
        }

        // 自動開始ボタンの設定
        createToggleAutoStartButton(scene, 615, 265, false);

        function createToggleAutoStartButton(scene, x, y, initialState)
        {
            let isOn = initialState; //　初期状態(true = ON, false = OFF)
            let button;

            let autoStartButton = new g.FilledRect({
                scene: scene,
                cssColor: isOn ? "#E60012" : "#000000",
                x: x,
                y: y,
                width: 82, 
                height: 82,
                anchorX: 0.5,
                anchorY: 0.5,
                touchable: true
            });
            scene.append(autoStartButton);

            const autoStartLabel = new al.Label({
                scene: scene,
                text: "自動\n開始",
                textColor: "white",
                font: planeFont,
                fontSize: 24,
                x: 58,
                y: 40,
                width: autoStartButton.width,
                anchorX: 0.5,
                anchorY: 0.5
            });
            autoStartButton.append(autoStartLabel);

            autoStartButton.onPointDown.add(() => {
                isOn = !isOn;
                autoStartButton.cssColor = isOn ? "#E60012" : "#000000";
                autoStartButton.modified();
                g.game.vars.someData.isAutoStart = !g.game.vars.someData.isAutoStart;
            });

            return button;
        }

        scene.setTimeout(() => {
            g.game.pushScene(gameMain.createGameMainScene());
        }, titleTimeoutMsec);
    });
    g.game.pushScene(scene);

    return scene;
};

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}