import * as PIXI from 'pixi.js';
import '@pixi/graphics-extras';
import { Viewport } from "pixi-viewport";

import { MazeView } from './mazeview.js';
import { Path } from './path.js';

namespace app.global {
    export let pixiApp: PIXI.Application
    export let viewport: Viewport
    export let path: Path
    export let mazeview: MazeView
    export let pointerCircle: PIXI.Graphics
    export let debugObject: PIXI.Graphics
}

function createPixiApp(): PIXI.Application {

    const pixiApp = new PIXI.Application<HTMLCanvasElement>({
        width: 1920,
        height: 1080,
        backgroundColor: 0xE0E0E0
    });
    pixiApp.view.style.width = '100%';
    pixiApp.view.style.height = 'auto';
    document.body.appendChild(pixiApp.view);

    pixiApp.renderer
    pixiApp.ticker.start();
    return pixiApp
}

function createViewport(app: PIXI.Application): Viewport {

    const WORLD_WIDTH = 2000
    const WORLD_HEIGHT = 2000
    const viewport = new Viewport({
        worldWidth: WORLD_WIDTH,
        worldHeight: WORLD_HEIGHT,
        // screenWidth: window.innerWidth,
        // screenHeight: window.innerHeight,
        events: app.renderer.events,
    })
        .drag()
        .pinch({ percent: 2 })
        .wheel()
        .decelerate();

    // fit and center the world into the panel
    viewport.fit()
    viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)

    viewport.eventMode = 'static'

    const onResize = () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        viewport.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    app.stage.addChild(viewport);

    app.renderer.resize(window.innerWidth, window.innerHeight);
    viewport.resize(window.innerWidth, window.innerHeight);
    return viewport
}



function onPointerMove(event) {
    const cursor: USER.Point = event.getLocalPosition(this);
    app.global.pointerCircle.x = cursor.x
    app.global.pointerCircle.y = cursor.y

    app.global.debugObject.clear();
    app.global.debugObject.lineStyle(1, 0x000000, 0.8);

    const info = app.global.path.getClosestPointInfo(cursor)
    if (info == undefined) { return }
    console.log("dist:%.2f", info.distanceFromStart.toFixed(3), ", %:", (info.distPercent * 100).toFixed(4), "angle:", (info.direction + Math.PI) * (180 / Math.PI))

    app.global.debugObject.drawCircle(info.point.x, info.point.y, 10)

    const point = app.global.path.getPointByDistance(1300.0)
    app.global.debugObject.drawCircle(point.x, point.y, 10)
}

function app_main() {

    app.global.pixiApp = createPixiApp()
    app.global.viewport = createViewport(app.global.pixiApp)
    app.global.mazeview = new MazeView(app.global.pixiApp.renderer, app.global.viewport)
    app.global.mazeview.drawMaze()
    app.global.path = new Path(app.global.viewport)
    app.global.path.drawPath()

    app.global.viewport.on('pointermove', onPointerMove)

    app.global.pointerCircle = new PIXI.Graphics()
    app.global.pointerCircle.lineStyle(1, 0x000000)
    app.global.pointerCircle.drawCircle(0, 0, 20)
    app.global.viewport.addChild(app.global.pointerCircle)

    app.global.debugObject = new PIXI.Graphics();
    app.global.debugObject.lineStyle(1, 0x000000, 0.8);
    app.global.viewport.addChild(app.global.debugObject);

}

app_main()
