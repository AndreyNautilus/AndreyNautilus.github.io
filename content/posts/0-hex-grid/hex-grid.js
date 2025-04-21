class Point {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    equals(other) {
        return this.row == other.row && this.col == other.col;
    }
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

function generateInitialPoints(grid, amount) {
    let result = [];
    for (let i = 0; i < amount; ++i) {
        let point = randomIntPoint(grid.rows_count, grid.cols_count);
        while (result.find((p) => point.equals(p)) != undefined) {
            // re-generate in case of duplicates
            point = randomIntPoint(grid.rows_count, grid.cols_count);
        }
        result.push(point);
    }
    return result;
}

function generateMap(grid, number_of_areas) {
    // generate starting points
    let areas = [];  // list of "list of points + color_index"
    const initialPoints = generateInitialPoints(grid, number_of_areas);
    initialPoints.forEach((p, idx) => {
        areas.push([[p, idx]]);
        grid.setCell(p, idx);
    });

    // apply flood fill
    let expandable_points_count = areas.reduce((acc, points) => acc + points.length, 0)
    let iter = 0;
    while (expandable_points_count > 0) {
        // choose area
        const area_idx = randomInt(areas.length);
        let area = areas[area_idx];

        // pick point in the area to expand
        let point_idx = Math.floor(area.length * Math.random());
        const [point, color_idx] = area[point_idx];
        let candidates = grid.getCandidates(point);
        const cand = candidates[randomInt(candidates.length)];
        area.push([cand, color_idx]);
        grid.setCell(cand, color_idx);

        // clean up points and areas
        // TODO: very inefficient, but works
        areas = areas
            .map((area) => area.filter(([point, color_idx]) => grid.getCandidates(point).length > 0))
            .filter((area) => area.length > 0);

        expandable_points_count = areas.reduce((acc, points) => acc + points.length, 0);
    }
}
