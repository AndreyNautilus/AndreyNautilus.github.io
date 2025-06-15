function fillGridViaVoronoi(grid, colors, distanceFn = distanceSq) {
    // generate starting points
    const initialPoints = randomDistantGridPoints(grid, colors.length);

    // apply Voronoi principle
    for (let row_idx = 0; row_idx < grid.rows_count; ++row_idx) {
        for (let col_idx = 0; col_idx < grid.cols_count; ++col_idx) {
            const dists = initialPoints.map((p) => distanceFn(p, { row: row_idx, col: col_idx }));
            const [idx, min_dist] = dists.reduce((acc, dist, idx) => {
                if (acc == undefined || dist < acc[1]) {
                    return [idx, dist];
                }
                return acc;
            }, undefined);

            grid.setCell({ row: row_idx, col: col_idx }, colors[idx]);
        }
    }

    return initialPoints;
}
