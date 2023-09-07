import * as PIXI from 'pixi.js';
import '@pixi/graphics-extras';
import { Viewport } from "pixi-viewport";

import * as Search from "./arraysearch.js"

const pixiApp = new PIXI.Application<HTMLCanvasElement>({
  width: 1920,
  height: 1080,
  backgroundColor: 0xE0E0E0
});
pixiApp.view.style.width = '100%';
pixiApp.view.style.height = 'auto';
document.body.appendChild(pixiApp.view);

pixiApp.ticker.start();

const WORLD_WIDTH = 2000
const WORLD_HEIGHT = 2000

const viewport = new Viewport({
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  // screenWidth: window.innerWidth,
  // screenHeight: window.innerHeight,
  events: pixiApp.renderer.events,
})
  // .drag({mouseButtons:'right-middle'})
  .drag()
  .pinch({ percent: 2 })
  .wheel()
  .decelerate();

// fit and center the world into the panel
viewport.fit()
viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)

viewport.eventMode = 'static'

const onResize = () => {
  pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
  viewport.resize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onResize);

pixiApp.stage.addChild(viewport);

pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
viewport.resize(window.innerWidth, window.innerHeight);


// Drag target
const box = new PIXI.Graphics();
box.interactive = true;
box.cursor = 'pointer'
box.beginFill(0xfff8dc, 0.85);
box.drawCircle(0, 0, 50);
box.position.set(viewport.screenWidth / 2, viewport.screenHeight / 2);
viewport.addChild(box);

box.on('pointerdown', onDragStart, box);
box.on('pointerup', onDragEnd);
box.on('pointerupoutside', onDragEnd);

let linepath: USER.PathPoint[] = []
let divpath: USER.PathPoint[] = []








viewport.on('pointermove', onPointerMove)

const pointerCircle = new PIXI.Graphics()
pointerCircle.lineStyle(1, 0x000000)
pointerCircle.drawCircle(0, 0, 20)
viewport.addChild(pointerCircle)

const Rlines = new PIXI.Graphics();
Rlines.lineStyle(1, 0x000000, 0.8);
viewport.addChild(Rlines);

function onPointerMove(event) {
  const newPoint: USER.Point = event.getLocalPosition(this);
  pointerCircle.x = newPoint.x
  pointerCircle.y = newPoint.y

  // let dlist: { d: number, index: number }[] = []
  Rlines.clear();
  Rlines.lineStyle(1, 0x000000, 0.8);

  divpath.forEach(element => {
    element.distance_fromCursor = calcDistance(element, newPoint)
  });

  let sorted_dlist = [...divpath].sort((a, b) => (a.distance_fromCursor - b.distance_fromCursor))

  const shortestPoint = sorted_dlist[0];
  if (shortestPoint.distance_fromCursor > 30.0) {
    return;
  }
  let A = divpath[shortestPoint.index]
  let d1: USER.PathPoint | undefined = divpath.at(shortestPoint.index + 1)
  let d2: USER.PathPoint | undefined = divpath.at(shortestPoint.index - 1)
  let B = A
  if ((d1 == undefined) || (d1.distance_fromCursor >= d2.distance_fromCursor)) {
    B = divpath[shortestPoint.index - 1]
  }
  else if ((d2 == undefined) || (d1.distance_fromCursor < d2.distance_fromCursor)) {
    B = divpath[shortestPoint.index + 1]
  }
  else {
    Rlines.drawCircle(A.x, A.y, 10)
    return;
  }

  const H = getPerpendicular(A.x, A.y, B.x, B.y, newPoint.x, newPoint.y)
  let R = H

  if (judgeIentersected(A.x, A.y, B.x, B.y, newPoint.x, newPoint.y, H.x, H.y)) {
    /* 線分の範囲内 線分と垂直線の交点 */
    R = H
  }
  else {
    /* 線分の範囲外 */
    R = A
  }

  Rlines.drawCircle(R.x, R.y, 10)
  Rlines.moveTo(A.x, A.y)
  Rlines.lineTo(newPoint.x, newPoint.y)
  Rlines.lineTo(B.x, B.y)


  let m = A
  if (A.index > B.index) {
    m = B
  }

  length = 0
  if (m.index > 0) {
    let w = divpath.slice(0, m.index + 1)
    length = calcPathLength(w);
  }

  /* length */
  length += calcDistance(m, R)
  console.log("%:" + length / divpath.at(-1).distance_fromStart)

  /* rad */
  // let rad = 0
  // if(A.index > B.index)
  // {
  //   rad = Math.atan2(B.y - A.y, B.x - A.x)
  // }
  // else{
  //   rad = Math.atan2(A.y - B.y, A.x - B.x)
  // }
  // console.log((rad + Math.PI) * 180/Math.PI)



  const tlength = 1000.0
  let currentLength = 0
  let prevLength = 0
  let prevElement = divpath[0]
  let neerIndex = 0;
  let v_len
  let v: USER.Point

  const lenSortedPath = [...divpath].sort((a, b) => a.distance_fromStart - b.distance_fromStart)
  neerIndex = Search.lowerBound(lenSortedPath, tlength, ((l, r) => l.distance_fromStart < r))
  const prev = divpath[neerIndex - 1]
  const next = divpath[neerIndex]
  v_len = prev.distance_toNext
  v = { x: (next.x - prev.x), y: (next.y - prev.y) }

  let remain = tlength - prev.distance_fromStart
  v.x *= (remain / v_len)
  v.y *= (remain / v_len)

  Rlines.drawCircle(prev.x + v.x, prev.y + v.y, 10)
}

/* https://qiita.com/ykob/items/ab7f30c43a0ed52d16f2 */
function judgeIentersected(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number): boolean {
  const ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
  const tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
  const tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
  const td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);

  // return tc * td < 0 && ta * tb < 0;
  return tc * td <= 0.5 && ta * tb <= 0.5; // 端点を含む場合
};

/* https://kazuki-nagasawa.hatenablog.com/entry/memo_20221018_javascript_perpendicular */
function getPerpendicular(x1: number, y1: number, x2: number, y2: number, px: number, py: number): { x: number, y: number } {
  // 線分Wの単位ベクトルUを求める
  let W = { x: x2 - x1, y: y2 - y1 };
  let dist_w = Math.sqrt(Math.pow(W.x, 2) + Math.pow(W.y, 2));
  let U = { x: W.x / dist_w, y: W.y / dist_w };

  // A ... point から線分の片方の端までのベクトル
  let A = { x: px - x1, y: py - y1 };

  // t ... A と U との内積
  let t = A.x * U.x + A.y * U.y;

  // 線分の片方の端から t 倍だけ進んだ先の点が求める座標
  let H = { x: x1 + t * U.x, y: y1 + t * U.y };

  return H;
}


function calcPathLength(path: USER.PathPoint[]) {
  let length = 0;
  let current = path[0]
  path.forEach(element => {
    length += calcDistance(element, current)
    current = element
  });
  return length
}

function calcDistance(a: USER.Point, b: USER.Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

// create a texture from an image path
const texture = PIXI.Texture.from('https://pixijs.com/assets/bunny.png');

// Scale mode for pixelation
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

for (let i = 0; i < 3; i++) {
  // createBunny(
  //   Math.floor(Math.random() * app.screen.width),
  //   Math.floor(Math.random() * app.screen.height),
  // );

  createDraggerbleRect(
    Math.floor(Math.random() * pixiApp.screen.width),
    Math.floor(Math.random() * pixiApp.screen.height),
  );

}
const line = new PIXI.Graphics();

function pointv() {
  const points = line.geometry.points
  const dots = points.length / 2;
  const dot = new PIXI.Graphics();
  dot.lineStyle(0.1, 0x000080)

  for (let index = 0; index < points.length; index += 2) {
    const x = points[index];
    const y = points[index + 1];
    dot.drawCircle(x, y, 2);

  }
  viewport.addChild(dot)

  linepath = []
  let i = 0;
  for (let index = 0; index < points.length; index += 4) {
    const x_odd = points[index + 0]
    const y_odd = points[index + 1]
    const x_even = points[index + 2]
    const y_even = points[index + 3]

    const x_center = (x_odd + x_even) / 2
    const y_center = (y_odd + y_even) / 2
    linepath.push({ x: x_center, y: y_center, index: i })
    i++
  }

  /* path point 分割 */
  divpath = []
  let newindex: number = 0
  for (let i = 0; i < linepath.length - 1; i++) {
    const e = linepath[i];
    e.index = newindex
    newindex++;
    divpath.push(e)
    const xdiff = linepath[i + 1].x - linepath[i].x
    const ydiff = linepath[i + 1].y - linepath[i].y
    const gtdiff = Math.max(Math.abs(xdiff), Math.abs(ydiff))
    const threshold = 10
    const div = Math.floor(gtdiff / threshold)
    for (let divCount = 0; divCount < div - 1; divCount++) {
      const x = linepath[i].x + ((xdiff / div) * (divCount + 1));
      const y = linepath[i].y + ((ydiff / div) * (divCount + 1));
      const index = newindex;
      divpath.push({ x: x, y: y, index: index })
      newindex++;
    }
  }
  const d = linepath[linepath.length - 1]
  d.index = newindex
  divpath.push(d)

  let totalLength = 0; /* スタートからの総距離 */
  let PtoPLength = 0;  /* point-point区間距離 */
  let current = divpath[0]
  divpath.forEach(element => {
    PtoPLength = calcDistance(element, current)
    totalLength += PtoPLength
    current.distance_toNext = PtoPLength
    element.distance_fromStart = totalLength
    current = element
  });

  let length = divpath[-1].distance_fromStart;
  console.log("total:" + length)

  const gr = new PIXI.Graphics()
  gr.lineStyle(0.1, 0x808000)
  gr.moveTo(linepath[0].x, linepath[0].y)
  linepath.forEach(element => {
    gr.lineTo(element.x, element.y)
  });
  viewport.addChild(gr)
}



function addline(){

  // line.interactive = true;
  // line.cursor = 'pointer'
  line.moveTo(0, 0)
  line.lineStyle(50, 0x90D090);
  
  // line.drawCircle(100,100,100)
  
  // line.lineTo(90, 0);
  // line.lineTo(90, 90);
  
  line.quadraticCurveTo(120, 380, 300, 500)
  line.quadraticCurveTo(520, 580, 500, 300)
  line.lineTo(500, 200)
  line.lineTo(500, 0)
  line.lineTo(700, 0)
  
  line.lineStyle();
  viewport.addChild(line)
  line.on('pointerdown', onDragStart, line);
  line.on('pointerup', onDragEnd);
  line.on('pointerupoutside', onDragEnd);
  line.on('pointermove', onDragMove)
  console.log(line.geometry.points)
  // line.containsPoint()
  
  // const tex = pixiApp.renderer.generateTexture(line)
  // const grSprite = new PIXI.Sprite(tex)
  // grSprite.eventMode = 'static';
  // grSprite.cursor = 'pointer'
  // grSprite.x = 500
  // grSprite.y = 500
  // grSprite.on('pointerdown', onDragStart, grSprite);
  // grSprite.on('pointerup', onDragEnd);
  // grSprite.on('pointerupoutside', onDragEnd);
  // viewport.addChild(grSprite)
  
  line.hitArea = {
    contains: (x: number, y: number) => {
      const points = line.geometry.points
      const od: { x: number; y: number; z: number }[] = []
      const even: { x: number; y: number; z: number }[] = []
  
      for (let index = 0; index * 2 < points.length; index++) {
        const x = points[index * 2]
        const y = points[index * 2 + 1]
        const z = points[index * 2 + 2]
        if (index % 2 === 0) {
          od.push({ x, y, z })
        } else {
          even.push({ x, y, z })
        }
      }
      return new PIXI.Polygon([...od, ...even.reverse()]).contains(x, y)
    },
  }
  
  pointv()
}


class SpriteHandle {
  N: PIXI.Sprite | undefined = undefined;
  E: PIXI.Sprite | undefined = undefined;
  W: PIXI.Sprite | undefined = undefined;
  S: PIXI.Sprite | undefined = undefined;
}

export const walls: SpriteHandle[][] = [];
export const pillers: PIXI.Sprite[][] = [];
const CELLS_X = 1
const CELLS_Y = 1
const CELL_SIZE = 90
for (let x = 0; x < CELLS_X; x++) {
  walls.push([]);
  pillers.push([]);
  for (let y = 0; y < CELLS_Y; y++) {
    walls[x].push(new SpriteHandle());
    walls[x][y].N = createRect((x * CELL_SIZE) + 6, (y * CELL_SIZE));
    walls[x][y].W = createRect((x * CELL_SIZE) + 6, (y * CELL_SIZE) + 6);
    walls[x][y].W.rotation = Math.PI / 2;
    pillers[x].push(new PIXI.Sprite);
    pillers[x][y] = createPiller((x * CELL_SIZE), (y * CELL_SIZE));
    if (y >= 1) {
      walls[x][y - 1].S = walls[x][y].N;
    }
    if (x >= 1) {
      walls[x - 1][y].E = walls[x][y].W;
    }

    if (y == (CELLS_Y - 1)) {
      walls[x][y].S = createRect(((x) * CELL_SIZE) + 6, ((y + 1) * CELL_SIZE));
      pillers[x][y] = createPiller((x * CELL_SIZE), ((y + 1) * CELL_SIZE));
    }
    if (x == (CELLS_X - 1)) {
      walls[x][y].E = createRect(((x + 1) * CELL_SIZE) + 6, ((y) * CELL_SIZE) + 6);
      walls[x][y].E.rotation = Math.PI / 2;
      pillers[x][y] = createPiller(((x + 1) * CELL_SIZE), (y * CELL_SIZE));
    }
    if ((y == (CELLS_Y - 1)) && (x == (CELLS_X - 1))) {
      pillers[x][y] = createPiller((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
    }
  }
}

function createPiller(x: number, y: number) {
  const rect = new PIXI.Graphics();
  rect.lineStyle(0, 0xFFBD01, 1);
  rect.beginFill(0x202020);
  rect.drawRect(0, 0, 6, 6);
  rect.endFill();

  const tex = pixiApp.renderer.generateTexture(rect)
  const grSprite = new PIXI.Sprite(tex)
  grSprite.eventMode = 'static';
  grSprite.cursor = 'pointer'
  // grSprite.on('pointerdown', onDragStart, grSprite);
  // grSprite.on('pointerup', onDragEnd);
  // grSprite.on('pointerupoutside', onDragEnd);
  grSprite.x = x
  grSprite.y = y
  return viewport.addChild(grSprite)
}


function createRect(x: number, y: number) {
  const rect = new PIXI.Graphics();
  rect.lineStyle(0, 0xFFBD01, 1);
  rect.beginFill(0x207070);
  rect.drawRect(0, 0, 84, 6);
  rect.endFill();

  const tex = pixiApp.renderer.generateTexture(rect)
  const grSprite = new PIXI.Sprite(tex)
  grSprite.eventMode = 'static';
  grSprite.cursor = 'pointer'
  // grSprite.on('pointerdown', onDragStart, grSprite);
  // grSprite.on('pointerup', onDragEnd);
  // grSprite.on('pointerupoutside', onDragEnd);
  grSprite.x = x
  grSprite.y = y
  return viewport.addChild(grSprite)
}

function createDraggerbleRect(x: number, y: number) {
  const rect = new PIXI.Graphics();
  rect.lineStyle(10, 0xFFBD01, 1);
  rect.beginFill(0xC34288);
  rect.drawRect(0, 0, 30, 30);
  rect.endFill();

  const tex = pixiApp.renderer.generateTexture(rect)
  const grSprite = new PIXI.Sprite(tex)
  grSprite.eventMode = 'static';
  grSprite.cursor = 'pointer'
  grSprite.on('pointerdown', onDragStart, grSprite);
  grSprite.on('pointerup', onDragEnd);
  grSprite.on('pointerupoutside', onDragEnd);
  grSprite.x = x
  grSprite.y = y
  viewport.addChild(grSprite)
}

function createBunny(x, y) {
  // create our little bunny friend..
  const bunny = new PIXI.Sprite(texture);

  // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
  bunny.eventMode = 'static';

  // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
  bunny.cursor = 'pointer';

  // make it a bit bigger, so it's easier to grab
  bunny.scale.set(3);

  // setup events for mouse + touch using
  // the pointer events
  bunny.on('pointerdown', onDragStart, bunny);
  bunny.on('pointerup', onDragEnd);
  bunny.on('pointerupoutside', onDragEnd);
  // bunny.on('pointermove', onDragMove);

  // move the sprite to its designated position
  bunny.x = x;
  bunny.y = y;

  // add it to the stage
  viewport.addChild(bunny);
}

let dragPoint;
let dragTarget = null;

function onDragMove(event: PIXI.FederatedPointerEvent) {
  if (dragTarget) {
    const newPoint = event.getLocalPosition(dragTarget.parent);
    dragTarget.x = newPoint.x - dragPoint.x;
    dragTarget.y = newPoint.y - dragPoint.y;
  }
}

function onDragStart(event: PIXI.FederatedPointerEvent) {
  addline();

  event.stopPropagation()
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  // this.data = event.data;
  this.alpha = 0.5;
  dragPoint = event.getLocalPosition(this.parent);
  dragPoint.x -= this.x;
  dragPoint.y -= this.y;
  dragTarget = this;
  dragTarget.parent.on('pointermove', onDragMove);
}

function onDragEnd(event: PIXI.FederatedPointerEvent) {
  if (dragTarget) {
    event.stopPropagation()
    dragTarget.parent.off('pointermove', onDragMove);
    dragTarget.alpha = 1;
    dragTarget = null;
    viewport.parent.interactive = true
  }
}

