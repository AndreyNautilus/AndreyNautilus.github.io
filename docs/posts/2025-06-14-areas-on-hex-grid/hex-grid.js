class Point {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    equals(other) {
        return pointsEqual(this, other);
    }
}

function pointsEqual(p1, p2) {
    return p1.row === p2.row && p1.col === p2.col;
}

function distanceSq(p1, p2) {
    return (p1.row - p2.row) ** 2 + (p1.col + 0.5 * (p1.row % 2) - p2.col - 0.5 * (p2.row % 2)) ** 2;
}

function randomInt(max) {
    // Generate a random integer in the range [0, max).
    return Math.floor((max - 0.1) * Math.random());
}

function randomIntPoint(rows_max, cols_max) {
    return new Point(randomInt(rows_max), randomInt(cols_max));
}

/**
 * Hex grid with the following alignment:
 *   O O O O O ...
 *    O O O O O ...
 *   O O O O O ...
 *    ...
 */
class HexGrid {
    constructor(rows_count, cols_count) {
        this.cols_count = cols_count;
        this.rows_count = rows_count;

        this.cells = [];
        for (let row_idx = 0; row_idx < this.rows_count; ++row_idx) {
            this.cells.push([]);
        }

        this.fill(undefined);
    }

    fill(value) {
        for (let row_idx = 0; row_idx < this.rows_count; ++row_idx) {
            for (let col_idx = 0; col_idx < this.cols_count; ++col_idx) {
                this.cells[row_idx][col_idx] = value;
            }
        }
    }

    cell(point) {
        return this.cells[point.row][point.col];
    }

    setCell(point, value) {
        this.cells[point.row][point.col] = value;
    }

    isInside(point) {
        return 0 <= point.row && point.row < this.rows_count && 0 <= point.col && point.col < this.cols_count;
    }

    getNeighbors(point) {
        let neighbors = [];
        if (point.row % 2 == 0) {
            neighbors = [
                [point.row, point.col - 1],
                [point.row - 1, point.col - 1],
                [point.row - 1, point.col],
                [point.row, point.col + 1],
                [point.row + 1, point.col],
                [point.row + 1, point.col - 1],
            ];
        } else {
            neighbors = [
                [point.row, point.col - 1],
                [point.row - 1, point.col],
                [point.row - 1, point.col + 1],
                [point.row, point.col + 1],
                [point.row + 1, point.col + 1],
                [point.row + 1, point.col],
            ];
        }
        return neighbors.filter(([p_row, p_col]) => {
            return (0 <= p_row) && (p_row < this.rows_count) && (0 <= p_col) && (p_col < this.cols_count);
        }).map(([p_row, p_col]) => new Point(p_row, p_col));
    }
};


function collectEmptyNeighbors(grid, point) {
    const neighbors = grid.getNeighbors(point);
    return neighbors.filter((p) => grid.cell(p) == undefined);
}

function randomGridPoints(grid, count) {
    // Generate `count` unique random points within the grid.
    const points = [];
    while (points.length < count) {
        const point = randomIntPoint(grid.rows_count, grid.cols_count);
        if (!points.some((p) => p.equals(point))) {
            points.push(point);
        }
    }
    return points;
}

function randomDistantGridPoints(grid, count, max_candidates = 10) {
    // Generate `count` distinct random points.
    //   For every point generate a few candidates and pick the one
    //   with the maximized minimum distance to the already generated points.
    const result = [];
    for (let i = 0; i < count; ++i) {
        if (result.length == 0) {
            result.push(randomIntPoint(grid.rows_count, grid.cols_count));
        } else {
            let candidate = undefined;
            let candidate_min_dist = 0;
            for (let j = 0; j < max_candidates; ++j) {
                const cand = randomIntPoint(grid.rows_count, grid.cols_count);
                const min_dist = Math.min(...result.map((p) => distanceSq(cand, p)));
                if (candidate == undefined || min_dist > candidate_min_dist) {
                    candidate = cand;
                    candidate_min_dist = min_dist;
                }
            }
            result.push(candidate);
        }
    }
    return result;
}
