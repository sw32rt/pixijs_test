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
    export let charts: { chart: Chart.Chart; cursor: PIXI.Graphics }[] = []

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
        app.renderer.resize(div.clientWidth, div.clientHeight);
        viewport.resize(div.clientWidth, div.clientHeight);

    };
    window.addEventListener("resize", onResize);

    app.stage.addChild(viewport);

    const div = document.getElementById("divCanvasArea");
    const canvas = <HTMLCanvasElement>document.getElementById("pixiCanvas");
    const clientRect = div.getBoundingClientRect()
    canvas.style.left = clientRect.left + "px"
    canvas.style.top = clientRect.top + "px"
    app.renderer.resize(div.clientWidth, div.clientHeight);
    viewport.resize(div.clientWidth, div.clientHeight);
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
    // console.log("x:", info.point.x, "y:", info.point.y, "dist:%.2f", info.distanceFromStart.toFixed(3), ", %:", (info.distPercent * 100).toFixed(4), "angle:", (info.direction + Math.PI) * (180 / Math.PI))

    /* draw △ */
    app.global.debugObject.drawRegularPolygon(info.point.x, info.point.y, 10, 3, info.direction + Math.PI / 2)

    const point = app.global.path.getPointByDistance(1300.0)
    app.global.debugObject.drawCircle(point.x, point.y, 10)

    app.global.charts.forEach(element => {
        const chart = element.chart
        const cursor = element.cursor
        const offsetx = chart.chartArea.left + ((chart.chartArea.right - chart.chartArea.left) * info.distPercent)
        chart.tooltip.caretX = offsetx
        cursor.x = offsetx
    });
}



export function app_main() {

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

    /* chart ============================== */
    Chart.Chart.register(...Chart.registerables);

    const directionList: number[] = []
    const radiusList: number[] = []
    const curvatureList: number[] = []
    for (let i = 0; i < app.global.path.totalLength; i++) {
        let point = app.global.path.getPointByDistance(i)
        let info = app.global.path.getClosestPointInfo(point)
        const digDir = (info.direction * 180 / Math.PI)
        const digradius = (info.radius * 180 / Math.PI)
        const digcurvature = (info.curvature * 180 / Math.PI)
        directionList.push(digDir)
        radiusList.push(digradius)
        curvatureList.push(digcurvature)
    }

    let chartCanvas: HTMLCanvasElement
    let cursorCanvas: HTMLCanvasElement

    chartCanvas = document.getElementById("chart1_mainLayer") as HTMLCanvasElement
    cursorCanvas = document.getElementById("chart1_tipLayer") as HTMLCanvasElement
    app.global.charts.push(crateChart(chartCanvas, cursorCanvas, directionList))

    chartCanvas = document.getElementById("chart2_mainLayer") as HTMLCanvasElement
    cursorCanvas = document.getElementById("chart2_tipLayer") as HTMLCanvasElement
    app.global.charts.push(crateChart(chartCanvas, cursorCanvas, radiusList))

    chartCanvas = document.getElementById("chart3_mainLayer") as HTMLCanvasElement
    cursorCanvas = document.getElementById("chart3_tipLayer") as HTMLCanvasElement
    app.global.charts.push(crateChart(chartCanvas, cursorCanvas, curvatureList))

}
////////////////////////////////////////////////////

function crateChart(chartCanvas: HTMLCanvasElement, cursorCanvas: HTMLCanvasElement, data: number[]): { chart: Chart.Chart; cursor: PIXI.Graphics } {
    let labels = [];
    for (let i = 0; i < data.length; i++) {
        labels.push(i);
    }

    const ctx = chartCanvas;

    const colors = [
        "rgba(255,0,0,0.5)",
        "rgba(0,255,0,0.5)",
        "rgba(0,0,255,0.5)",
        "rgba(255,128,0,0.5)",
        "rgba(0,255,255,0.5)",
        "rgba(0,0,0,0.5)",
        "rgba(255,0,255,0.5)"
    ];

    let datasets = [
        {
            data: data,
            borderColor: colors[3],
            backgroundColor: colors[3],
            radius: 0,
            borderWidth: 3
        },
    ];

    const chart_plugin = function (target) {
        cursor.x = target.tooltip.caretX;
    };

    let options = {
        responsive: true,
        interaction: {
            intersect: false,
            mode: 'nearest',
            axis: 'x'
        },
    };

    // view
    const chart = new Chart.Chart(ctx, {
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

    const layer = new PIXI.Application({
        view: cursorCanvas,
        antialias: false,
        backgroundColor: 0x00,
        backgroundAlpha: 0,
    })

    layer.resizeTo = chartCanvas

    const cursor = new PIXI.Graphics()
    cursor.lineStyle(2, 0x0000FF, 0.8)
    const x = 0;
    const topY = chart.chartArea.top;
    const bottomY = chart.chartArea.bottom;
    cursor.moveTo(x, topY);
    cursor.lineTo(x, bottomY);
    cursor.x = chart.chartArea.left
    layer.stage.addChild(cursor)

    return { chart: chart, cursor: cursor }

}

