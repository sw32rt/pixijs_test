/// <reference path="util.ts">

import * as PIXI from 'pixi.js';
import '@pixi/graphics-extras';
import { Viewport } from "pixi-viewport";

const WORLD_WIDTH = 2000
const WORLD_HEIGHT = 2000

var input = "      asdf //comments         "
var trimStr = trimLeft(input);
// alert(trimStr)

trimStr = myapp.util.strings.trimRight(input)
// alert(trimStr)

const app = new PIXI.Application<HTMLCanvasElement>({
  width: 1920,
  height: 1080,
  backgroundColor: 0x000000
});
app.view.style.width = '100%';
app.view.style.height = 'auto';
document.body.appendChild(app.view);

const viewport = new Viewport({
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  // screenWidth: window.innerWidth,
  // screenHeight: window.innerHeight,
  events: app.renderer.events,
})
  // .drag({mouseButtons:'right-middle'})
  .drag()
  .pinch({ percent: 2 })
  .wheel()
  .decelerate();

// fit and center the world into the panel
viewport.fit()
viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)

app.stage.addChild(viewport);
app.ticker.start();

const onResize = () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  viewport.resize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onResize);
viewport.eventMode = 'static'

app.stage.addChild(viewport)

const graphics = new PIXI.Graphics();

// create a texture from an image path
const texture = PIXI.Texture.from('https://pixijs.com/assets/bunny.png');


// Scale mode for pixelation
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

for (let i = 0; i < 3; i++)
{
    createBunny(
        Math.floor(Math.random() * app.screen.width),
        Math.floor(Math.random() * app.screen.height),
    );

    createDraggerbleRect(
      Math.floor(Math.random() * app.screen.width),
      Math.floor(Math.random() * app.screen.height),
  );
    
}

function createDraggerbleRect(x, y)
{
  graphics.lineStyle(10, 0xFFBD01, 1);
  graphics.beginFill(0xC34288);
  graphics.drawRect(0, 0, 30, 30);
  graphics.endFill();
  const tex = app.renderer.generateTexture(graphics)
  const grSprite = new PIXI.Sprite(tex)
  grSprite.eventMode = 'static';
  grSprite.cursor = 'pointer'
  grSprite.anchor.set(0.5);
  grSprite.on('pointerdown', onDragStart, grSprite);
  grSprite.on('pointerup', onDragEnd);
  grSprite.on('pointerupoutside', onDragEnd);
  grSprite.x = x
  grSprite.y = y
  viewport.addChild(grSprite)
  
}

function createBunny(x, y)
{
    // create our little bunny friend..
    const bunny = new PIXI.Sprite(texture);

    // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
    bunny.eventMode = 'static';

    // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
    bunny.cursor = 'pointer';

    // center the bunny's anchor point
    bunny.anchor.set(0.5);

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

let dragTarget = null;

// viewport.eventMode = 'static';
// viewport.hitArea = app.screen;
// // app.stage.on('pointerdown', onDragStart_p, app.stage);
// viewport.on('pointerup', onDragEnd);
// viewport.on('pointerupoutside', onDragEnd);
// viewport.on('pointerdown', onDragStart, viewport);

function onDragMove_this(event)
{
    if (dragTarget)
    {
        // dragTarget.toLocal(event.global, null, dragTarget.position);
    }
}

function onDragMove(event)
{
    if (dragTarget)
    {
        dragTarget.parent.toLocal(event.global, null, dragTarget.position);
        // dragTarget.toLocal(event.global, null, dragTarget.position);
    }
}

function onDragStart_p()
{
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    // this.data = event.data;
    // this.alpha = 0.5;
    // dragTarget = this;
    // app.stage.on('pointermove', onDragMove_this);
}

function onDragStart()
{
    viewport.parent.interactive = false
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    // this.data = event.data;
    this.alpha = 0.5;
    dragTarget = this;
    dragTarget.parent.on('pointermove', onDragMove);
}

function onDragEnd()
{
    if (dragTarget)
    {
        dragTarget.parent.off('pointermove', onDragMove);
        dragTarget.alpha = 1;
        dragTarget = null;
        viewport.parent.interactive = true
      }
}

