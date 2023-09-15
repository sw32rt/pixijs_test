/* https://qiita.com/ykob/items/ab7f30c43a0ed52d16f2 */
export function judgeIentersected(ax, ay, bx, by, cx, cy, dx, dy) {
    const ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
    const tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
    const tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
    const td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);
    // return tc * td < 0 && ta * tb < 0;
    return tc * td <= 0 && ta * tb <= 0; // 端点を含む場合
}
;
/* https://kazuki-nagasawa.hatenablog.com/entry/memo_20221018_javascript_perpendicular */
export function getPerpendicular(x1, y1, x2, y2, px, py) {
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
// export function range(begin: number, end: number) {
//     return ([...Array(to - from)].map((_, i) => (from + i)))
// }
//# sourceMappingURL=util.js.map