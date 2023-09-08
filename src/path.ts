import * as PIXI from 'pixi.js';
import * as Util from './util.js'
import * as Search from './arraysearch.js'

export class Path {
    private line = new PIXI.Graphics();
    private container: PIXI.Container
    private linepath: USER.PathPoint[] = []
    private divpath: USER.PathPoint[] = []
    private totalLength: number

    constructor(container: PIXI.Container) {
        this.container = container
    }

    public drawPath() {

        // line.interactive = true;
        // line.cursor = 'pointer'
        this.line.moveTo(0, 0)
        this.line.lineStyle(50, 0x90D090);

        // line.drawCircle(100,100,100)

        // line.lineTo(90, 0);
        // line.lineTo(90, 90);

        this.line.quadraticCurveTo(120, 380, 300, 500)
        this.line.quadraticCurveTo(520, 580, 500, 300)
        this.line.lineTo(500, 200)
        this.line.lineTo(500, 0)
        this.line.lineTo(700, 0)

        this.line.lineStyle();
        this.container.addChild(this.line)
        // this.line.on('pointerdown', onDragStart, this.line);
        // this.line.on('pointerup', onDragEnd);
        // this.line.on('pointerupoutside', onDragEnd);
        // this.line.on('pointermove', onDragMove)
        console.log(this.line.geometry.points)
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
        // this.container.addChild(grSprite)

        this.line.hitArea = {
            contains: (x: number, y: number) => {
                const points = this.line.geometry.points
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

        this.pathDivide()
    }

    private pathDivide() {
        this.line.geometry.updateBatches()
        const points = this.line.geometry.points
        const dots = points.length / 2;

        for (let index = 0; index < points.length; index += 2) {
            const x = points[index];
            const y = points[index + 1];
        }

        this.linepath = []
        let i = 0;
        for (let index = 0; index < points.length; index += 4) {
            const x_odd = points[index + 0]
            const y_odd = points[index + 1]
            const x_even = points[index + 2]
            const y_even = points[index + 3]

            const x_center = (x_odd + x_even) / 2
            const y_center = (y_odd + y_even) / 2
            this.linepath.push({ x: x_center, y: y_center, index: i })
            i++
        }

        /* path point 分割 */
        this.divpath = []
        let newindex: number = 0
        for (let i = 0; i < this.linepath.length - 1; i++) {
            const e = this.linepath[i];
            e.index = newindex
            newindex++;
            this.divpath.push(e)
            const xdiff = this.linepath[i + 1].x - this.linepath[i].x
            const ydiff = this.linepath[i + 1].y - this.linepath[i].y
            const gtdiff = Math.max(Math.abs(xdiff), Math.abs(ydiff))
            const threshold = 10
            const div = Math.floor(gtdiff / threshold)
            for (let divCount = 0; divCount < div - 1; divCount++) {
                const x = this.linepath[i].x + ((xdiff / div) * (divCount + 1));
                const y = this.linepath[i].y + ((ydiff / div) * (divCount + 1));
                const index = newindex;
                this.divpath.push({ x: x, y: y, index: index })
                newindex++;
            }
        }
        const terminatePoint = this.linepath[this.linepath.length - 1]
        terminatePoint.index = newindex
        this.divpath.push(terminatePoint)

        let totalLength = 0; /* スタートからの総距離 */
        let pointToPointLength = 0;  /* point-point区間距離 */
        let current = this.divpath[0]
        this.divpath.forEach(element => {
            pointToPointLength = this.calcDistance(element, current)
            totalLength += pointToPointLength
            current.distanceToNext = pointToPointLength
            element.distanceFromStart = totalLength
            current = element
        });

        this.totalLength = this.divpath.at(-1).distanceFromStart;
        console.log("total:" + this.totalLength)

        const gr = new PIXI.Graphics()
        gr.lineStyle(0.1, 0x808000)
        gr.moveTo(this.linepath[0].x, this.linepath[0].y)
        this.linepath.forEach(element => {
            gr.lineTo(element.x, element.y)
        });
        this.container.addChild(gr)
    }

    private calcDistance(a: USER.Point, b: USER.Point) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
    }

    private calcPathLength(path: USER.PathPoint[]) {
        let length = 0;
        let current = path[0]
        path.forEach(element => {
            length += this.calcDistance(element, current)
            current = element
        });
        return length
    }

    public getClosestPointInfo(cursor: USER.Point): { point: USER.Point; distanceFromStart: number; distPercent: number; direction: number } {

        const { closest: closest, adjacent: adjacent } = this.searchClosestPoints(cursor)
        let indexBackward = closest
        let indexForward = adjacent
        if ((closest == undefined) || (adjacent == undefined)) { return }

        if (closest.index > adjacent.index) {
            indexForward = closest
            indexBackward = adjacent
        }
        else {
            indexForward = adjacent
            indexBackward = closest
        }


        const perpendiculerPoint = Util.getPerpendicular(indexForward.x, indexForward.y, indexBackward.x, indexBackward.y, cursor.x, cursor.y)
        let pointOnLineSegment = perpendiculerPoint

        // console.log("cursordiff:", cursor.y - perpendiculerPoint.y)
        // const prevToNextLength = prevWayPoint.distanceToNext
        // const prevToNextVector: USER.Point = { x: (nextWayPoint.x - prevWayPoint.x), y: (nextWayPoint.y - prevWayPoint.y) }

        // /* distanceFromStart にフィットするようにベクトルを縮める */
        // let remain = distanceFromStart - prevWayPoint.distanceFromStart
        // const scaledVector: USER.Point = {
        //     x: prevToNextVector.x * (remain / prevToNextLength),
        //     y: prevToNextVector.y * (remain / prevToNextLength)
        // }

        // const destinationPoint: USER.Point = {
        //     x: (prevWayPoint.x + scaledVector.x),
        //     y: (prevWayPoint.y + scaledVector.y)
        // }


        if (Util.judgeIentersected(indexForward.x, indexForward.y, indexBackward.x, indexBackward.y, cursor.x, cursor.y, perpendiculerPoint.x, perpendiculerPoint.y)) {
            /* 線分の範囲内 線分と垂直線の交点 */
            pointOnLineSegment = perpendiculerPoint
        }
        else {
            /* 線分の範囲外 */
            pointOnLineSegment = closest
        }

        /* path start to pointOnLineSegment pathlength */
        let length = indexBackward.distanceFromStart
        length += this.calcDistance(indexBackward, pointOnLineSegment)

        let percent = length / this.totalLength

        /* direction */
        const rad = Math.atan2(indexBackward.y - indexForward.y, indexBackward.x - indexForward.x)

        return {
            point: pointOnLineSegment,
            distanceFromStart: length,
            distPercent: percent,
            direction: rad
        }
    }

    private searchClosestPoints(cursor: USER.Point): { closest: USER.PathPoint | undefined; adjacent: USER.PathPoint | undefined } {
        const THRESHOLD = 30.0

        this.divpath.forEach(element => {
            element.distanceFromCursor = this.calcDistance(element, cursor)
        });

        let sorted_dlist = [...this.divpath].sort((a, b) => (a.distanceFromCursor - b.distanceFromCursor))

        const shortestPoint = sorted_dlist[0];
        if (shortestPoint.distanceFromCursor > THRESHOLD) {
            return { closest: undefined, adjacent: undefined };
        }
        const closest = this.divpath[shortestPoint.index]
        const nextA: USER.PathPoint | undefined = this.divpath[shortestPoint.index + 1]
        const prevA: USER.PathPoint | undefined = this.divpath[shortestPoint.index - 1]
        const adjacent = this.distCursorComp(nextA, prevA)


        return { closest: closest, adjacent: adjacent }
    }

    private distCursorComp(A: USER.PathPoint | undefined, B: USER.PathPoint | undefined) {
        if (A == undefined) {
            return B;
        }
        if (B == undefined) {
            return A;
        }

        if (A.distanceFromCursor >= B.distanceFromCursor) {
            return B;
        }
        else {
            return A;
        }


    }

    public getPointByDistance(distanceFromStart: number): USER.Point {
        if (distanceFromStart > this.totalLength) {
            distanceFromStart = this.totalLength
        }
        if (distanceFromStart < 0) {
            distanceFromStart = 0;
        }

        const lenSortedPath = [...this.divpath].sort((a, b) => a.distanceFromStart - b.distanceFromStart)
        const neerIndex = Search.lowerBound(lenSortedPath, distanceFromStart, ((l, r) => l.distanceFromStart < r))
        const prevWayPoint = this.divpath[neerIndex - 1] /* distanceFromStartよりちょっと短い */
        const nextWayPoint = this.divpath[neerIndex]     /* distanceFromStartよりちょっと長い */
        const prevToNextLength = prevWayPoint.distanceToNext
        const prevToNextVector: USER.Point = { x: (nextWayPoint.x - prevWayPoint.x), y: (nextWayPoint.y - prevWayPoint.y) }

        /* distanceFromStart にフィットするようにベクトルを縮める */
        let remain = distanceFromStart - prevWayPoint.distanceFromStart
        const scaledVector: USER.Point = {
            x: prevToNextVector.x * (remain / prevToNextLength),
            y: prevToNextVector.y * (remain / prevToNextLength)
        }

        const destinationPoint: USER.Point = {
            x: (prevWayPoint.x + scaledVector.x),
            y: (prevWayPoint.y + scaledVector.y)
        }
        return destinationPoint
    }
}



