window.gLocalAssetContainer["main"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";

function main(param) {

	// 別ファイル読み込み
	const title = require("./title");

	// タイトル表示
	g.game.pushScene(title.createTitleScene());

}

module.exports = main;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}