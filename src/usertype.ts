
namespace USER {
    export interface Point { x: number; y: number }
    export interface PathPoint extends Point {
        index: number;
        distanceFromStart?: number;
        distanceToNext?: number;
        distanceFromCursor?: number;
        direction: number;
        radius: number;
        curvature: number;

    }
}
