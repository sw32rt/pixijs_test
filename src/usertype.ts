
namespace USER {
  export interface Point { x: number; y: number }
  export interface PathPoint extends Point { index: number; distance_fromStart?: number; distance_toNext?: number; distance_fromCursor?: number }
}
