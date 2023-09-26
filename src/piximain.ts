import * as PIXI from 'pixi.js';
import '@pixi/graphics-extras';
import { Viewport } from "pixi-viewport";

import { MazeView } from './mazeview.js';
import { Path } from './path.js';

import * as Chart from 'chart.js'

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
        view: <HTMLCanvasElement>document.getElementById("pixiCanvas"),
        antialias: true,
        backgroundColor: 0xE0E0E0
    })

    pixiApp.renderer
    pixiApp.ticker.start();
    return pixiApp
}

function createViewport(app: PIXI.Application): Viewport {

    const WORLD_WIDTH = 200
    const WORLD_HEIGHT = 200
    const viewport = new Viewport({
        worldWidth: WORLD_WIDTH,
        worldHeight: WORLD_HEIGHT,
        events: app.renderer.events,
    })
        .drag()
        .pinch({ percent: 2 })
        .wheel()
        .decelerate();

    // fit and center the world into the panel
    viewport.fit()
    viewport.moveCenter(0, 0)

    viewport.eventMode = 'static'

    const onResize = () => {
        const div = document.getElementById("divCanvasArea");
        const canvas = <HTMLCanvasElement>document.getElementById("pixiCanvas");
        const clientRect = div.getBoundingClientRect()
        canvas.style.left = clientRect.left + "px"
        canvas.style.top = clientRect.top + "px"
        console.log(clientRect.left, clientRect.top)
        app.renderer.resize(div.clientWidth, div.clientHeight);
        viewport.resize(div.clientWidth, div.clientHeight);
        console.log("div.clientWidth:", div.clientWidth, ",div.clientHeight:", div.clientHeight)
        console.log("canvas.clientWidth:", canvas.clientWidth, ",canvas.clientHeight:", canvas.clientHeight)

    };
    window.addEventListener("resize", onResize);

    app.stage.addChild(viewport);

    const div = document.getElementById("divCanvasArea");
    const canvas = <HTMLCanvasElement>document.getElementById("pixiCanvas");
    const clientRect = div.getBoundingClientRect()
    canvas.style.left = clientRect.left + "px"
    canvas.style.top = clientRect.top + "px"
    console.log(clientRect.left, clientRect.top)
    app.renderer.resize(div.clientWidth, div.clientHeight);
    viewport.resize(div.clientWidth, div.clientHeight);
    console.log("div.clientWidth:", div.clientWidth, ",div.clientHeight:", div.clientHeight)
    console.log("canvas.clientWidth:", canvas.clientWidth, ",canvas.clientHeight:", canvas.clientHeight)
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
    console.log("x:", info.point.x, "y:", info.point.y, "dist:%.2f", info.distanceFromStart.toFixed(3), ", %:", (info.distPercent * 100).toFixed(4), "angle:", (info.direction + Math.PI) * (180 / Math.PI))

    /* draw △ */
    app.global.debugObject.drawRegularPolygon(info.point.x, info.point.y, 10, 3, info.direction - Math.PI / 2)

    const point = app.global.path.getPointByDistance(1300.0)
    app.global.debugObject.drawCircle(point.x, point.y, 10)

    const offsetx = chart1.chartArea.left + ((chart1.chartArea.right - chart1.chartArea.left) * info.distPercent)
    chart1.tooltip.caretX = offsetx
    chart1_cursor.x = offsetx
}
let chart1: Chart.Chart
let chart1_cursor: PIXI.Graphics



export function app_main() {

    app.global.pixiApp = createPixiApp()
    app.global.viewport = createViewport(app.global.pixiApp)
    // --------------------------
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
    // --------------------------

    const pathData: number[] = []
    let labels = [];
    for (let i = 0; i < app.global.path.totalLength; i++) {
        let point = app.global.path.getPointByDistance(i)
        let info = app.global.path.getClosestPointInfo(point)

        pathData.push(info.direction * 180 / Math.PI)
        labels.push(i);
    }

    Chart.Chart.register(...Chart.registerables);
    const ctx = document.getElementById("chart1_mainLayer") as HTMLCanvasElement;

    const colors = [
        "rgba(255,0,0,0.5)",
        "rgba(0,255,0,0.5)",
        "rgba(0,0,255,0.5)",
        "rgba(255,128,0,0.5)",
        "rgba(0,255,255,0.5)",
        "rgba(0,0,0,0.5)",
        "rgba(255,0,255,0.5)"
    ];

    let col_num = 3;
    let data_count = 50;

    let datasets = [
        {
            data: pathData,
            borderColor: colors[col_num],
            backgroundColor: colors[col_num],
            label: "graph-2",
            radius: 0,
            borderWidth: 1
        }
    ];

    const chart_plugin = function (target) {
        chart1_cursor.x = target.tooltip.caretX;
    };

    let options = {
        responsive: true,
        tooltips: {
            intersect: false,
            mode: 'nearest',
            axis: 'x'
        },
        interaction: {
            intersect: false,
            mode: 'nearest',
            axis: 'x'
        },
    };

    // view
    chart1 = new Chart.Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: datasets
        },
        options: options,
        plugins: [{
            id: "s",
            beforeDraw: chart_plugin.bind(this)
        }]
    });

    const te = new PIXI.Application({
        view: <HTMLCanvasElement>document.getElementById("chart1_tipLayer"),
        antialias: false,
        backgroundColor: 0x00,
        backgroundAlpha: 0,
    })

    te.resizeTo = document.getElementById("chart1_mainLayer")

    chart1_cursor = new PIXI.Graphics()
    chart1_cursor.lineStyle(2, 0x0000FF, 0.8)
    const x = 0;
    const topY = chart1.chartArea.top;
    const bottomY = chart1.chartArea.bottom;
    chart1_cursor.moveTo(x, topY);
    chart1_cursor.lineTo(x, bottomY);
    chart1_cursor.x = chart1.chartArea.left
    te.stage.addChild(chart1_cursor)

}
////////////////////////////////////////////////////


