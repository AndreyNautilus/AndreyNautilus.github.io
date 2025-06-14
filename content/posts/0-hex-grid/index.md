---
title: Areas on hexagon grids
summary: FloodFill and Voronoi exploration
# description: "Short description"  # will be shown in the post as subtitle
date: '2025-06-13T17:27:03+01:00'
draft: true  # draft mode by default
tags: [procedural generation, hexgrid, floodfill, voronoi]
styles:
  - canvas-wrapper.css
scripts:
  - hex-grid.js
  - grid-voronoi.js
  - render.js
---

Let's assume we have a hex-based grid and we want to fill this grid with random,
but naturally looking areas, like biomes or countries.
In this post I will explore and visualize some approaches.

_Side note:_ why hex-based grid? Because it gives smooth natually-looking areas compared to
square or rectangel grids for example.

## Flood fill

This is the simplest approach which comes to mind first. The idea is simple:

- initialize _areas_ by picking some random points;
- iterate over _areas_ and expand them to neighboring points (apply flood-fill approach);

Depending on the order of iteration over areas and how we pick a point to expand,
we'll get different results.

We can apply some restrictions to generation, for example:

- force initial points to be distinct (generate a few candidates and pick the most distinct one);
- apply priorities to areas;
- expand areas to nearest neighbours;
- etc;

### Fully random

On each step we pick _random area_ and expand it to _random point_:

{{< load_resource "map-floodfill.html" >}}

This gives nicely looking results, with ripped edges. But due to fully random nature,
one area can expand way more than others and produce weirdly-looking protrusions.

### Iterate over areas and expand to nearest point

This is the opposite approach with explicit restriction:

- circularly iterate over all areas (to give every area equal chance to grow);
- expand each area to the point nearest to the initial point;

{{< load_resource "map-floodfill-uniform.html" >}}

This gives roundish look. But due to heavy restrictions on how to expand the areas,
we can get long protrusions which ruin the entire picture. The easiest way to remove them
is to re-generate the layout.

### Combined?

It seems that combination of "iterative" and "fully random" floodfill will give us a good result,
but how can combine them? The expantion of areas should be random to avoid round shapes.
Looping over areas is actually the same as picking random area, because random number generator
should give roughly equal amuont of every index.

Possible improvements:

- add weights to areas to tweak RNG;
- add weights to expansion points;
- or implement an analyzer of the produced result and re-generate the layout of the quality is too low;

## "Voronoi" principle

Another approach is to use [Voronoi diagrams](https://en.wikipedia.org/wiki/Voronoi_diagram):
every point belongs to the area which initial point is the closest.

The generic solution for Voronoi diagrams on a plane is quite complex, but for grids
it's very simple: iterate over all points of the grid, compute distances to all initial points and pick the minimum.

Here's how it looks with "standard" approach:

{{< load_resource "map-voronoi.html" >}}

Looks very geometric, definitely not natual. But still may be useful.

### Manhattan distance

A way to make it look less geometric is to use a different _distance function_,
for example [ManHattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry).
This give way more stylish result:

{{< load_resource "map-voronoi-manhattan.html" >}}

Diagonal borders match the hexagon grid nicely.

## Initial points selection

Typically, initial points should be defined by underlying logic of the map/grid,
but for this post I pick random points.

One approach is to take fully random non-overlapping points. This may result in points
located close to each other, which may lead to weird generation results: small areas or
long protrusions.

A better approach is to use "best candidate" algorithm:

- for each point generate N candidates;
- select the candidate the maximazes the minimum distance to already generated points;

This will give points which are quite distant from each other.

## References

- [Overview of hex grids](https://www.redblobgames.com/grids/hexagons/): orientation, coordinates, etc.
- I took the idea of ManHattan distance for Voronoi diagram from [this article on Habr](https://habr.com/ru/articles/794572/).
