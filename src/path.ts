import * as PIXI from 'pixi.js';
import * as Util from './util.js'
import * as Search from './arraysearch.js'
const RESOLUTION = 1.0

export class Path {
    private line = new PIXI.Graphics();
    private container: PIXI.Container
    private linepath: USER.PathPoint[] = []
    private divpath: USER.PathPoint[] = []
    public totalLength: number
    private gr: PIXI.Graphics
    private index: number
    private curveScale = 90;
    private dt = 0.001
    public endR: number = 100
    public ddr: number = 0

    constructor(container: PIXI.Container) {

        this.curveScale = 90;
        this.dt = 0.001
        this.endR = 100
        this.ddr = (this.curveScale * this.dt * this.dt) / this.endR

        this.container = container

        this.gr = new PIXI.Graphics();
        this.container.addChild(this.gr)
    }

    public drawPath() {

        this.linepath = []
        this.line.clear()
        this.gr.clear()
        this.line.moveTo(0, 0)
        this.line.lineStyle(RESOLUTION * 1, 0x90D090, 0.5);
        this.gr.lineStyle(1, 0);

        /* クロソイド曲線 */
        let t = 0;
        let x = 0;
        let y = -100;
        const dt = this.dt
        this.line.moveTo(x, y)

        let endR = this.endR
        let startΘ = 0
        let curveScale = this.curveScale
        let Θ = startΘ
        let ΔΘ = 0
        let endΔΘ = (this.curveScale * dt) / endR
        let ΔΔΘ = this.ddr
        let prevΘ = 0
        let startArcΘ = 0
        ΔΔΘ *= 2
        while (1) {
            x += Math.cos(Θ) * dt * curveScale;
            y += Math.sin(Θ) * dt * curveScale;
            ΔΘ += ΔΔΘ
            Θ += ΔΘ

            if (ΔΘ >= endΔΘ) {
                startArcΘ = Θ
                this.gr.drawCircle(x, y, 10)
                break
            }
            this.line.lineTo(x, y)
            this.linepath.push({ x: x, y: y, index: this.index, direction: Θ, radius: ΔΘ / dt, curvature: ΔΔΘ / dt })
            this.index++
            // console.log("Θ", Θ, "prevΘ", prevΘ, "ΔΘ", ΔΘ / dt, "r", (dt * curveScale) / ΔΘ)
        }
        let first = 1;
        while (1) {
            x += Math.cos(Θ) * dt * curveScale;
            y += Math.sin(Θ) * dt * curveScale;
            Θ += ΔΘ
            if (Θ >= ((Math.PI / 2))) {

                if (first) {
                    first = 0;
                }
            }
            if (Θ >= startArcΘ + (((Math.PI / 2) - startArcΘ) * 2)) {
                this.gr.drawCircle(x, y, 10)
                break
            }
            this.line.lineTo(x, y)
            this.linepath.push({ x: x, y: y, index: this.index, direction: Θ, radius: ΔΘ / dt, curvature: 0 })
            this.index++
            // console.log("Θ", Θ, "prevΘ", prevΘ, "ΔΘ", ΔΘ / dt, "r", (dt * curveScale) / ΔΘ)
        }


        while (1) {
            x += Math.cos(Θ) * dt * curveScale;
            y += Math.sin(Θ) * dt * curveScale;
            ΔΘ -= ΔΔΘ
            Θ += ΔΘ

            this.line.lineTo(x, y)
            this.linepath.push({ x: x, y: y, index: this.index, direction: Θ, radius: ΔΘ / dt, curvature: - ΔΔΘ / dt })
            this.index++
            // console.log("Θ", Θ, "prevΘ", prevΘ, "ΔΘ", ΔΘ / dt, "r", (dt * curveScale) / ΔΘ)
            if (ΔΘ <= 0) {
                break
            }
        }

        const scale: PIXI.IPointData = { x: 1 / RESOLUTION, y: 1 / RESOLUTION }
        this.line.scale = scale
        this.line.lineStyle();
        this.container.addChild(this.line)

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

        // this.linepath = []
        // let i = 0;
        // for (let index = 0; index < points.length; index += 4) {
        //     const x_odd = points[index + 0]
        //     const y_odd = points[index + 1]
        //     const x_even = points[index + 2]
        //     const y_even = points[index + 3]

        //     const x_center = (x_odd + x_even) / 2
        //     const y_center = (y_odd + y_even) / 2
        //     this.linepath.push({ x: x_center / RESOLUTION, y: y_center / RESOLUTION, index: i })
        //     i++
        // }

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
                this.divpath.push({ x: x, y: y, index: index, direction: this.linepath[i].direction, radius: this.linepath[i].radius, curvature: this.linepath[i].curvature })
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
        // console.log("total:" + this.totalLength)

        this.gr.lineStyle(0.1, 0x808000)
        this.gr.moveTo(this.linepath[0].x, this.linepath[0].y)
        this.linepath.forEach(element => {
            this.gr.lineTo(element.x, element.y)
        });
        this.container.addChild(this.gr)
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

    public getClosestPointInfo(cursor: USER.Point): {
        closestIndex: number;
        point: USER.Point;
        distanceFromStart: number;
        distPercent: number;
        direction: number;
        radius: number;
        curvature: number;
    } {

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

        /* 線分に対しての垂直線を伸ばすしてT->＋の形にする。Tだと計算誤差で線分同士が交わっていない判断になることがあるので。 */
        const scaledVector: USER.Point = { x: (perpendiculerPoint.x - cursor.x), y: (perpendiculerPoint.y - cursor.y) }
        scaledVector.x *= 2
        scaledVector.y *= 2
        const mirrorPoint: USER.Point = {
            x: (perpendiculerPoint.x + scaledVector.x),
            y: (perpendiculerPoint.y + scaledVector.y)
        }

        if (Util.judgeIentersected(indexForward.x, indexForward.y, indexBackward.x, indexBackward.y, cursor.x, cursor.y, mirrorPoint.x, mirrorPoint.y)) {
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
        // const rad = Math.atan2(indexBackward.y - indexForward.y, indexBackward.x - indexForward.x)
        const radDIr = closest.direction

        return {
            closestIndex: closest.index,
            point: pointOnLineSegment,
            distanceFromStart: length,
            distPercent: percent,
            direction: radDIr,
            radius: closest.radius,
            curvature: closest.curvature,

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
        if (distanceFromStart <= 0) {
            return this.divpath[0]
        }

        // const lenSortedPath = [...this.divpath].sort((a, b) => a.distanceFromStart - b.distanceFromStart)
        const lenSortedPath = [...this.divpath]
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



