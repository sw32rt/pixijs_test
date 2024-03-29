import * as PIXI from 'pixi.js';
class SpriteHandle {
    constructor() {
        this.N = undefined;
        this.E = undefined;
        this.W = undefined;
        this.S = undefined;
    }
}
export const walls = [];
export const pillers = [];
const CELLS_X = 1;
const CELLS_Y = 0;
const CELL_SIZE = 90;
export class MazeView {
    constructor(renderer, container) {
        this.renderer = renderer;
        this.container = container;
    }
    drawMaze() {
        for (let x = 0; x < CELLS_X; x++) {
            walls.push([]);
            pillers.push([]);
            for (let y = 0; y < CELLS_Y; y++) {
                walls[x].push(new SpriteHandle());
                walls[x][y].N = this.createRect((x * CELL_SIZE) + 6, (y * CELL_SIZE));
                walls[x][y].W = this.createRect((x * CELL_SIZE) + 6, (y * CELL_SIZE) + 6);
                walls[x][y].W.rotation = Math.PI / 2;
                pillers[x].push(new PIXI.Sprite);
                pillers[x][y] = this.createPiller((x * CELL_SIZE), (y * CELL_SIZE));
                if (y >= 1) {
                    walls[x][y - 1].S = walls[x][y].N;
                }
                if (x >= 1) {
                    walls[x - 1][y].E = walls[x][y].W;
                }
                if (y == (CELLS_Y - 1)) {
                    walls[x][y].S = this.createRect(((x) * CELL_SIZE) + 6, ((y + 1) * CELL_SIZE));
                    pillers[x][y] = this.createPiller((x * CELL_SIZE), ((y + 1) * CELL_SIZE));
                }
                if (x == (CELLS_X - 1)) {
                    walls[x][y].E = this.createRect(((x + 1) * CELL_SIZE) + 6, ((y) * CELL_SIZE) + 6);
                    walls[x][y].E.rotation = Math.PI / 2;
                    pillers[x][y] = this.createPiller(((x + 1) * CELL_SIZE), (y * CELL_SIZE));
                }
                if ((y == (CELLS_Y - 1)) && (x == (CELLS_X - 1))) {
                    pillers[x][y] = this.createPiller((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
                }
            }
        }
    }
    createPiller(x, y) {
        const rect = new PIXI.Graphics();
        rect.lineStyle(0, 0xFFBD01, 1);
        rect.beginFill(0x202020);
        rect.drawRect(0, 0, 6, 6);
        rect.endFill();
        const tex = this.renderer.generateTexture(rect);
        const grSprite = new PIXI.Sprite(tex);
        grSprite.eventMode = 'static';
        grSprite.cursor = 'pointer';
        grSprite.x = x;
        grSprite.y = y;
        return this.container.addChild(grSprite);
    }
    createRect(x, y) {
        const rect = new PIXI.Graphics();
        rect.lineStyle(0, 0xFFBD01, 1);
        rect.beginFill(0x207070);
        rect.drawRect(0, 0, 84, 6);
        rect.endFill();
        const tex = this.renderer.generateTexture(rect);
        const grSprite = new PIXI.Sprite(tex);
        grSprite.eventMode = 'static';
        grSprite.cursor = 'pointer';
        grSprite.x = x;
        grSprite.y = y;
        return this.container.addChild(grSprite);
    }
}
;
//# sourceMappingURL=mazeview.js.map