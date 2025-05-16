---
title: Hexagonal grids for map generation
# summary: "Post summary"  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2025-02-22T17:27:03+01:00'
draft: true  # draft mode by default
tags: [procgen]
scripts:
  - hex-grid.js
  - render.js
---

Let's assume we need to generate a 2d map with random areas (bioms or countries for example).
One approach is to use [Voronoi diagrams](https://en.wikipedia.org/wiki/Voronoi_diagram),
which are very powerful, but complicated to implement. Another approach is to use grid and
generate a map based on that grid.

Hexagonal grids give smooth look, so they're suitable for natural-look objects. Let's explore them.

[Overview of hex grids](https://www.redblobgames.com/grids/hexagons/): orientation, coordinates, etc.

## Map with areas

Fully random areas:

- put random points on a grid (bright red). Those will initialize _areas_;
- pick a random area and axpand it an a random direction (flood-fill algorithm)
  until the entire grid is filled;

{{< load_resource "map-fully-random.html" >}}

We can apply some restrictions to generation, for example:

- force initial points to be distinct (generate a few candidates and pick the most distinct one);
- apply priorities to areas;
- expand areas to nearest neighbours;
- etc;

### Uniformly expanded areas

- distinct initial points;
- areas are iterated sequantially during expansion;
- expand to nearest neighbours;

{{< load_resource "map-uniformly-expanded.html" >}}

### "Voronoi" principle on the grid

{{< load_resource "map-voronoi.html" >}}

Use Manhatten distance for Voronoi principle.

{{< load_resource "map-voronoi-mnhttn.html" >}}

## Map with island

{{< load_resource "map-island.html" >}}

## Trail

{{< load_resource "map-trail.html" >}}
