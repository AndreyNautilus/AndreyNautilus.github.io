class Point {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    equals(other) {
        return this.row == other.row && this.col == other.col;
    }
}

function distanceSq(p1, p2) {
    return (p1.row - p2.row) ** 2 + (p1.col + 0.5 * (p1.row % 2) - p2.col - 0.5 * (p2.row % 2)) ** 2;
}

function randomInt(max) {
    return Math.floor(max * Math.random());
}

function randomIntPoint(rows_max, cols_max) {
    return new Point(randomInt(rows_max), randomInt(cols_max));
}

class HexGrid {
    constructor(rows_count, cols_count) {
        this.cols_count = cols_count;
        this.rows_count = rows_count;
        this.cells = [];

        for (let row_idx = 0; row_idx < this.rows_count; ++row_idx) {
            this.cells[row_idx] = [];
            for (let col_idx = 0; col_idx < this.cols_count; ++col_idx) {
                this.cells[row_idx][col_idx] = undefined;
            }
        }
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
        let candidates = [];
        if (point.row % 2 == 0) {
            candidates = [
                [point.row, point.col - 1],
                [point.row - 1, point.col - 1],
                [point.row - 1, point.col],
                [point.row, point.col + 1],
                [point.row + 1, point.col],
                [point.row + 1, point.col - 1],
            ];
        } else {
            candidates = [
                [point.row, point.col - 1],
                [point.row - 1, point.col],
                [point.row - 1, point.col + 1],
                [point.row, point.col + 1],
                [point.row + 1, point.col + 1],
                [point.row + 1, point.col],
            ];
        }
        return candidates.filter(([p_row, p_col]) => {
            return (0 <= p_row) && (p_row < this.rows_count) && (0 <= p_col) && (p_col < this.cols_count);
        }).map(([p_row, p_col]) => new Point(p_row, p_col));
    }

    getCandidates(point) {
        let candidates = this.getNeighbors(point);
        return candidates.filter((p) => this.cell(p) == undefined);
    }
};
