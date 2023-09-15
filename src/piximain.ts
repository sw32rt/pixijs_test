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
  let a = document.getElementById("pixiCanvas")
  console.log(a)
  const pixiApp = new PIXI.Application<HTMLCanvasElement>({
    view: <HTMLCanvasElement>document.getElementById("pixiCanvas"),
    // antialias: true,
    backgroundColor: 0xE0E0E0
  })
  // const pixiApp = new PIXI.Application<HTMLCanvasElement>({
  // const pixiApp = new PIXI.Application<HTMLCanvasElement>({
  //   width: 1920,
  //   height: 1080,
  //   backgroundColor: 0xE0E0E0
  // });
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
  // viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
  viewport.moveCenter(0, 0)
  // viewport.zoom(0.00001)

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
  console.log("x:", info.point.x, "y:", info.point.y, "dist:%.2f", info.distanceFromStart.toFixed(3), ", %:", (info.distPercent * 100).toFixed(4), "angle:", (info.direction + Math.PI) * (180 / Math.PI))

  /* draw △ */
  app.global.debugObject.drawRegularPolygon(info.point.x, info.point.y, 10, 3, info.direction - Math.PI / 2)

  const point = app.global.path.getPointByDistance(1300.0)
  app.global.debugObject.drawCircle(point.x, point.y, 10)

  /* TODO: line tooltip */
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

  // const pathData: number[] = []
  // let dist = 0;
  // while (dist < app.global.path.totalLength) {
  //     // while (dist < 3) {
  //     let point = app.global.path.getPointByDistance(dist)
  //     let info = app.global.path.getClosestPointInfo(point)

  //     pathData.push(info.direction * 180 / Math.PI)
  //     dist += 1
  // }

  // Chart.Chart.register(...Chart.registerables);
  // const ctx = document.getElementById('myChart') as HTMLCanvasElement;

  // const colors = [
  //     "rgba(255,0,0,0.5)",
  //     "rgba(0,255,0,0.5)",
  //     "rgba(0,0,255,0.5)",
  //     "rgba(255,128,0,0.5)",
  //     "rgba(0,255,255,0.5)",
  //     "rgba(0,0,0,0.5)",
  //     "rgba(255,0,255,0.5)"
  // ];

  // let col_num = 3;
  // let data_count = 50;
  // let labels = [];
  // for (let i = 1; i <= data_count; i++) {
  //     labels.push(i);
  // }
  // let datas = [];
  // for (let i = 0; i < labels.length; i++) {
  //     datas.push(Math.floor(Math.random() * 10));
  // }
  // let datasets = [
  //     {
  //         data: datas,
  //         borderColor: colors[col_num],
  //         backgroundColor: colors[col_num],
  //         label: "graph-2"
  //     }
  // ];

  // const chart_plugin = function (target) {
  //     let ctx = target.ctx;
  //     var x = chart_2.tooltip.caretX;
  //     var topY = chart_2.chartArea.top;
  //     var bottomY = chart_2.chartArea.bottom;
  //     ctx.save();
  //     ctx.beginPath();
  //     ctx.moveTo(x, topY);
  //     ctx.lineTo(x, bottomY);
  //     ctx.lineWidth = 2.0;
  //     ctx.strokeStyle = 'red';
  //     ctx.stroke();
  //     ctx.restore();
  // };

  // let options = {
  //     responsive: true,
  //     tooltips: {
  //         intersect: false,
  //         mode: 'index',
  //         axis: 'x'
  //     },
  // };

  // // view
  // const chart_2 = new Chart.Chart(ctx, {
  //     type: "line",
  //     data: {
  //         labels: labels,
  //         datasets: datasets
  //     },
  //     options: options,
  //     plugins: [{
  //         id: "s",
  //         beforeDraw: chart_plugin.bind(this)
  //     }]
  // });

}
////////////////////////////////////////////////////

// declare module 'chart.js' {
//     interface TooltipPositionerMap {
//         myCustomPositioner: Chart.TooltipPositionerFunction<Chart.ChartType>;
//     }
// }
// var ctx = document.getElementById("myChart");
// var activeIndex = 0;

// const tooltipPlugin = Chart.registry.getPlugin('tooltip');
// Chart.Tooltip.positioners.myCustomPositioner = function (elements, e) {
//     if (elements.length < 1) {
//         return;
//     }

//     const x = elements[0].element.x;
//     const y = this.chart.chartArea.top - 5;

//     return {
//         x,
//         y
//     };
// };

// tooltipPlugin.element.prototype.drawCaret = function (tooltipPoint, ctx, size, options) {
//     const caretPosition = this.getCaretPosition(tooltipPoint, size, options);

//     let y1 = caretPosition.y1;
//     const y2 = caretPosition.y2;
//     let y3 = caretPosition.y3;

//     const x1 = caretPosition.x1;
//     const x2 = caretPosition.x2;
//     const x3 = caretPosition.x3;

//     const radius = 14;
//     const tooltipS = tooltipPoint.x;
//     const tooltipE = tooltipPoint.x + size.width;
//     // if (x3 <= tooltipS + radius) {
//     if (x3 <= tooltipS + (radius / 2)) {
//         y3 -= 10;
//     }
//     if (x1 >= tooltipE - radius) {
//         y1 -= 5;
//     }

//     ctx.lineTo(x1, y1);
//     ctx.lineTo(x2, y2);
//     ctx.lineTo(x3, y3);
// };

// tooltipPlugin._element.prototype.drawBackground = function (pt, ctx, tooltipSize, options) {
//     // Start of original code from chart.esm.js
//     const { xAlign, yAlign } = this;
//     const { x, y } = pt;
//     const { width, height } = tooltipSize;
//     const radius = options.cornerRadius;
//     ctx.fillStyle = options.backgroundColor;
//     ctx.strokeStyle = options.borderColor;
//     ctx.lineWidth = options.borderWidth;
//     ctx.beginPath();
//     ctx.moveTo(x + radius, y);
//     if (yAlign === 'top') {
//         this.drawCaret(pt, ctx, tooltipSize, options);
//     }
//     ctx.lineTo(x + width - radius, y);
//     ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
//     if (yAlign === 'center' && xAlign === 'right') {
//         this.drawCaret(pt, ctx, tooltipSize, options);
//     }
//     ctx.lineTo(x + width, y + height - radius);
//     ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
//     if (yAlign === 'bottom') {
//         this.drawCaret(pt, ctx, tooltipSize, options);
//     }
//     ctx.lineTo(x + radius, y + height);
//     ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
//     if (yAlign === 'center' && xAlign === 'left') {
//         this.drawCaret(pt, ctx, tooltipSize, options);
//     }
//     ctx.lineTo(x, y + radius);
//     ctx.quadraticCurveTo(x, y, x + radius, y);
//     ctx.closePath();
//     ctx.fill();
//     if (options.borderWidth > 0) {
//         ctx.stroke();
//     }
//     // End of original code from chart.esm.js

//     const activeItem = this._active[0];
//     const caretPosition = this.getCaretPosition(pt, tooltipSize, options);

//     ctx.beginPath();
//     ctx.lineWidth = 1;
//     ctx.strokeStyle = '#1E7A71';
//     ctx.moveTo(caretPosition.x2, caretPosition.y2);

//     // adjust code for workaround
//     // const adjustY = (this._tooltipItems[0].parsed.y === 0) ? -5 : 0;
//     // ctx.lineTo(caretPosition.x2, activeItem.element.y + adjustY);
//     ctx.lineTo(caretPosition.x2, activeItem.element.y);
//     ctx.stroke();
//     ctx.closePath();
// };

// var myChart = new Chart(ctx, {
//     type: "bar",

//     data: {
//         labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
//         datasets: [
//             {
//                 label: "# of Votes",
//                 data: [1, 4, 3, 5, 2, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, null, null, null, null],
//                 backgroundColor: "rgba(0, 255, 132, 0.2)",
//                 minBarLength: 5
//             }
//         ]
//     },
//     options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         interaction: {
//             mode: 'index'
//         },
//         hover: {
//             mode: null
//         },
//         events: ['touchmove', 'mousemove'],
//         scales: {
//             y: {
//                 beginAtZero: true
//             },
//             x: {
//                 categoryPercentage: 1,
//                 barPercentage: 0.9,
//                 display: true,
//                 grid: {
//                     display: false,
//                     offset: true
//                 },
//             }
//         },
//         animation: {
//             duration: 100,
//             onComplete: () => {
//                 // ToDo : Draw tooltip prorammatically

//             }
//         },
//         onClick: (e) => {
//             console.log('clicked');
//         },
//         plugins: {
//             beforeDraw: () => {
//                 console.log('before Draw!!!!');
//             },
//             legend: {
//                 display: false
//             },
//             tooltip: {
//                 intersect: false,
//                 position: 'myCustomPosition',
//                 xAlign: 'center',
//                 yAlign: 'bottom',
//                 callbacks: {
//                     label: function (context) {
//                         var label = 'value : '

//                         if (context.parsed.y !== null) {
//                             label += context.parsed.y;
//                         }
//                         return label;
//                     },
//                     title: function () {
//                         return null;
//                     }
//                 }
//             }
//         }
//     }
// });



// app_main()
