// https://htmlcolorcodes.com/ - Color chart - 5th line from the bottom
const ColorDarkRose = "#c0392b";  // dark rose
const ColorPurple = "#8e44ad";  // purple
const ColorBlue = "#2980b9";  // blue
const ColorLightGreen = "#1abc9c";  // light green
const ColorGreen = "#27ae60";  // green
const ColorOrange = "#f39c12";  // orange
const ColorGrey = "#7f8c8d";  // grey
const ColorSand = "#f0b27a";
const ColorDarkBrown = "#784212";

const colors = [
    ColorDarkRose,
    //"#e74c3c",
    //"#9b59b6",
    ColorPurple,
    ColorBlue,
    //"#3498db",
    ColorLightGreen,
    //"#16a085",
    ColorGreen,
    //"#2ecc71",
    //"#f1c40f",
    ColorOrange,
    //"#e67e22",
    //"#d35400",  // dark orange
    ColorGrey,
]

const ColorPurpleIdx = colors.indexOf(ColorPurple);
const ColorBlueIdx = colors.indexOf(ColorBlue);
const ColorGreenIdx = colors.indexOf(ColorGreen);
const ColorGreyIdx = colors.indexOf(ColorGrey);

function hexToCoords(row_idx, col_idx, cell_radius) {
    const cell_diameter = 2 * cell_radius;
    const x = cell_radius + cell_radius * (row_idx % 2) + col_idx * cell_diameter;
    const y = cell_radius + row_idx * cell_diameter;
    return { x, y };
}

function renderGrid(canvas, grid, initialPoints, colors, cell_radius) {
    // const cell_diameter = 2 * cell_radius;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row_idx = 0; row_idx < grid.rows_count; ++row_idx) {
        for (let col_idx = 0; col_idx < grid.cols_count; ++col_idx) {
            const { x, y } = hexToCoords(row_idx, col_idx, cell_radius);

            const color_idx = grid.cells[row_idx][col_idx];
            if (color_idx != undefined) {
                ctx.beginPath();
                ctx.arc(x, y, cell_radius, 0, Math.PI * 2);
                ctx.fillStyle = colors[color_idx];
                ctx.fill();
            }
        }
    }

    initialPoints.forEach(p => {
        const { x, y } = hexToCoords(p.row, p.col, cell_radius);

        ctx.beginPath();
        ctx.arc(x, y, cell_radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ff0000";  // red
        // ctx.strokeStyle = "#ff0000";  // black
        ctx.fill();
        // ctx.stroke();

    });
}
