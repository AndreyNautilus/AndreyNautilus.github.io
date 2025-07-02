export function createSvgPoints(svg, points) {
    // clear existing points
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    points.forEach(([x, y]) => {
        const circle = document.createElementNS(svg.namespaceURI, 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 2);
        circle.setAttribute('style', 'fill: var(--primary)');
        svg.appendChild(circle);
    });
}
