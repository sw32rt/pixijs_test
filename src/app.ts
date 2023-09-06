import * as PIXI from 'pixi.js';
import '@pixi/graphics-extras';
import { Viewport } from "pixi-viewport";

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

let linepath: { x: number; y: number; index: number }[] = []
let linepath_sortByX: { x: number; y: number; index: number }[] = []
let linepath_sortByY: { x: number; y: number; index: number }[] = []

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

  const path: { x: number; y: number; }[] = []
  linepath = []
  let i = 0;
  for (let index = 0; index < points.length; index += 4) {
    const x_odd = points[index + 0]
    const y_odd = points[index + 1]
    const x_even = points[index + 2]
    const y_even = points[index + 3]

    const x_center = (x_odd + x_even) / 2
    const y_center = (y_odd + y_even) / 2
    path.push({ x: x_center, y: y_center })
    linepath.push({ x: x_center, y: y_center, index: i })
    i++
  }
  // linepath_sortByX = [...linepath].sort()

  const gr = new PIXI.Graphics()
  gr.lineStyle(0.1, 0x808000)
  gr.moveTo(path[0].x, path[0].y)
  path.forEach(element => {
    gr.lineTo(element.x, element.y)
  });
  viewport.addChild(gr)

}




const line = new PIXI.Graphics();

// line.interactive = true;
// line.cursor = 'pointer'
line.moveTo(100, 0)
line.lineStyle(50, 0x90D090);
// line.lineTo(100, 360);
// line.lineTo(200, 200)
line.quadraticCurveTo(120, 380, 300, 500)
line.quadraticCurveTo(520, 580, 300, 300)
// line.arcTo(300, 500, 500, 600, Math.PI * 3)
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

viewport.on('pointermove', onPointerMove)

const pointerCircle = new PIXI.Graphics()
pointerCircle.lineStyle(1, 0x000000)
pointerCircle.drawCircle(0, 0, 20)
viewport.addChild(pointerCircle)

const Rlines = new PIXI.Graphics();
Rlines.lineStyle(1, 0x000000, 0.8);
viewport.addChild(Rlines);

function onPointerMove(event) {
  const newPoint = event.getLocalPosition(this);
  pointerCircle.x = newPoint.x
  pointerCircle.y = newPoint.y

  let dlist: { d: number, index: number }[] = []
  Rlines.clear();
  Rlines.lineStyle(1, 0x000000, 0.8);
  /* path割 */
  let divpath: { x: number; y: number; index: number }[] = []
  let newindex: number = 0
  for (let i = 0; i < linepath.length - 1; i++) {
    const e = linepath[i];
    e.index = newindex
    newindex++;
    divpath.push(e)
    const xdiff = linepath[i + 1].x - linepath[i].x
    const ydiff = linepath[i + 1].y - linepath[i].y
    const gtdiff = Math.max(Math.abs(xdiff), Math.abs(ydiff))
    const threshold = 20
    const div = Math.floor(gtdiff / threshold)
    for (let divCount = 0; divCount < div - 1; divCount++) {
      let d: { x: number; y: number; index: number } = { x: 0, y: 0, index: 0 };
      d.x = linepath[i].x + ((xdiff / div) * (divCount + 1));
      d.y = linepath[i].y + ((ydiff / div) * (divCount + 1));
      d.index = newindex;
      divpath.push(d)
      newindex++;
    }
  }
  const d = linepath[linepath.length - 1]
  d.index = newindex
  divpath.push(d)

  divpath.forEach(element => {
    const dist = Math.sqrt(((element.x - newPoint.x) ** 2 + (element.y - newPoint.y) ** 2))
    dlist.push({ d: dist, index: element.index })
  });

  dlist.sort((a, b) => (a.d - b.d))

  for (let i = 0; i < 2; i++) {
    const element = divpath[dlist[i].index];
    if (dlist[i].d > 30.0) {
      break;
    }
    // Rlines.moveTo(newPoint.x, newPoint.y)
    // Rlines.lineTo(element.x, element.y)
    if (i == 1) {
      const A = divpath[dlist[0].index]
      const B = divpath[dlist[1].index]
      const H = getPerpendicular(A.x, A.y, B.x, B.y, newPoint.x, newPoint.y)

      if (judgeIentersected(A.x, A.y, B.x, B.y, newPoint.x, newPoint.y, H.x, H.y)) {
        Rlines.drawCircle(H.x, H.y, 10)
      }
      else{
        // Rlines.lineStyle(1, 0x900000, 0.8);
        Rlines.drawCircle(A.x, A.y, 10)
      }
    }
  }

}

/* https://qiita.com/ykob/items/ab7f30c43a0ed52d16f2 */
function judgeIentersected(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number): boolean {
  const ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
  const tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
  const tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
  const td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);

  // return tc * td < 0 && ta * tb < 0;
  return tc * td <= 5 && ta * tb <= 5; // 端点を含む場合
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

// let p = line.geometry.points

// for (let index = 0; index < p.length; index += 2) {
//   const x = p[index];
//   const y = p[index + 1];

// }

// function checker()
// {
//   const position = app.renderer.plugins.interaction.mouse.global;
//   if(line.containsPoint(position))
//   {
//     let asdf = 0
//   }
// }

// app.ticker.add(checker)

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
  pointv();

  event.stopPropagation()
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  // this.data = event.data;
  walls[0][0].N.alpha = 0;
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

