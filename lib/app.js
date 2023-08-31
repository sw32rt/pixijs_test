"use strict";

var PIXI = _interopRequireWildcard(require("pixi.js"));
require("../node_modules/@pixi/graphics-extras");
var _util = require("./util.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// <reference path="util.ts">
// <reference path="../node_modules/pixi.js/dist/pixi.mjs">
// <reference path="../node_modules/@pixi/graphics-extras/lib/index.mjs">
// import * as PIXI from '../node_modules/pixi.js/dist/pixi.mjs';
// import '../node_modules/@pixi/graphics-extras/lib/index.mjs';

var input = "      asdf //comments         ";
var trimStr = (0, _util.trimLeft)(input);
// alert(trimStr)
trimStr = _util.myapp.util.strings.trimRight(input);
// alert(trimStr)
// // PIXI.JSアプリケーションを呼び出す (この数字はゲーム内の画面サイズ)
// const pixiApp = new PIXI.Application({ width: 400, height: 600 });
// // index.htmlのbodyにapp.viewを追加する (app.viewはcanvasのdom要素)
// document.body.appendChild(pixiApp.view);
const app = new PIXI.Application({
  width: 1920,
  height: 1080,
  backgroundColor: 0x000000
});
app.view.style.width = '100%';
app.view.style.height = 'auto';
document.body.appendChild(app.view);
// import * as PIXI from 'pixi.js';
// import '@pixi/graphics-extras';
// const app = new PIXI.Application({ antialias: true, resizeTo: window });
// document.body.appendChild(app.view);
const graphics = new PIXI.Graphics();
// Rectangle
graphics.beginFill(0xDE3249);
graphics.drawRect(50, 50, 100, 100);
graphics.endFill();
// Rectangle + line style 1
graphics.lineStyle(2, 0xFEEB77, 1);
graphics.beginFill(0x650A5A);
graphics.drawRect(200, 50, 100, 100);
graphics.endFill();
// Rectangle + line style 2
graphics.lineStyle(10, 0xFFBD01, 1);
graphics.beginFill(0xC34288);
graphics.drawRect(350, 50, 100, 100);
graphics.endFill();
// Rectangle 2
graphics.lineStyle(2, 0xFFFFFF, 1);
graphics.beginFill(0xAA4F08);
graphics.drawRect(530, 50, 140, 100);
graphics.endFill();
// Circle
graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
graphics.beginFill(0xDE3249, 1);
graphics.drawCircle(100, 250, 50);
graphics.endFill();
// Circle + line style 1
graphics.lineStyle(2, 0xFEEB77, 1);
graphics.beginFill(0x650A5A, 1);
graphics.drawCircle(250, 250, 50);
graphics.endFill();
// Circle + line style 2
graphics.lineStyle(10, 0xFFBD01, 1);
graphics.beginFill(0xC34288, 1);
graphics.drawCircle(400, 250, 50);
graphics.endFill();
// Ellipse + line style 2
graphics.lineStyle(2, 0xFFFFFF, 1);
graphics.beginFill(0xAA4F08, 1);
graphics.drawEllipse(600, 250, 80, 50);
graphics.endFill();
// draw a shape
graphics.beginFill(0xFF3300);
graphics.lineStyle(4, 0xffd900, 1);
graphics.moveTo(50, 350);
graphics.lineTo(250, 350);
graphics.lineTo(100, 400);
graphics.lineTo(50, 350);
graphics.closePath();
graphics.endFill();
// draw a rounded rectangle
graphics.lineStyle(2, 0xFF00FF, 1);
graphics.beginFill(0x650A5A, 0.25);
graphics.drawRoundedRect(50, 440, 100, 100, 16);
graphics.endFill();
// draw star
graphics.lineStyle(2, 0xFFFFFF);
graphics.beginFill(0x35CC5A, 1);
graphics.drawStar(360, 370, 5, 50, 100);
graphics.endFill();
// draw star 2
graphics.lineStyle(2, 0xFFFFFF);
graphics.beginFill(0xFFCC5A, 1);
graphics.drawStar(280, 510, 7, 50, 10);
graphics.endFill();
// draw star 3
graphics.lineStyle(4, 0xFFFFFF);
graphics.beginFill(0x55335A, 1);
graphics.drawStar(470, 450, 4, 50, 10);
graphics.endFill();
// draw polygon
const path = [600, 370, 700, 460, 780, 420, 730, 570, 590, 520];
graphics.lineStyle(0);
graphics.beginFill(0x3500FA, 1);
graphics.drawPolygon(path);
graphics.endFill();
app.stage.addChild(graphics);