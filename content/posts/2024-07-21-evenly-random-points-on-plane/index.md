---
title: Evenly distributed random points
summary: Bridson’s Algorithm to build Poisson disk distribution of points  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2024-07-21T20:16:16+02:00'
tags: [procedural generation]
aliases:
  - 05-evenly-random-points-on-plane
---

## "Random" points on a plane

We need to generate random, _evenly distributed_ points on a plane.
Possible use-cases:

- place objects in a game world (trees in a forest, grass and rocks in a field, etc);
- generate points for [Voronoi diagram](https://en.wikipedia.org/wiki/Voronoi_diagram)
  (with areas of similar size);

The simplest approach - to use uniformly distributed points with `(random(), random())` - doesn't work,
because there will be areas with high density of points and areas with no points at all.
Such distribution doesn't look _natural_.

{{< load_resource "uniform_distribution.html" >}}

## Jittered grid

Grids give even distribution, but the picture will not look _random_.
We can add a small displacement to every point and that will give a much better _randomized_ picture.

{{< load_resource "grid_distribution.html" >}}

We can choose the max displacement as slightly less than half of distance between 2 diagonal neibouring points.
This will ensure that each point will stay relatively close to the original position, but still shiftted enough
to form _random_ picture.

Pros:

- points are distributed fairy evenly: no major gaps and no major clusters;

Cons:

- some points can still be too close to each other (forming small clusters);
- some points may fall of the canvas due to shift (the shift can be re-generated increasing the risk of clusters)

## Poisson disk distribution

A solution to this problem is [Poisson disk sampling (or Poisson disk distribution)](https://en.wikipedia.org/wiki/Supersampling#Poisson_disk):
points are placed randomly, but not too close and not too far away from each other.

{{< load_resource "poisson_disk_distribution.html" >}}

[This article](https://bost.ocks.org/mike/algorithms/) compares randomly placed points with
Poisson disk distribution, and shows "best candidate" and [Bridson’s](https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf)
algorithms to build such distribution (with great examples and visualizations).

## Bridson’s algorithm for Poisson disk sampling

Summary of [this page](https://sighack.com/post/poisson-disk-sampling-bridsons-algorithm).
Bridson's algorithm allows us to generate random points with Poisson disk distribution.

Formal problem description: generate tightly packed random points maintaining minimal distance between them.

Algorithm parameters:

1. area where points should be generated;
1. `r` - minimum distance between any 2 points;
1. `k` - amount of attempts to generate a new point;

The algorithm uses a grid with `r/sqrt(2)` cell size. There could be at most 1 point in any grid cell.
The value of a cell is either an index of a generated point or `-1`.

The algorithm:

1. initialize _the grid_ that covers the requested area with `-1` in each cell;
1. generate an initial point `p0` and set the corresponding grid cell to `0` (the first point);
   initialize a list of _active points_ with index `0`;
1. pick a random index from _active points_ (let's say `p-i`). Generate up to `k` random points in annulus between `r`
   and `2r` form the selected point `p-i`; test every generated point if it's far enough (`dist >=r`)
   from already existing points (use the grid to test only nearby cells);
   - if a generated point is far enough from all existing points, add it to the list of _generated points_,
     update the _grid cell_ with its index and add this new point to _active points_;
   - if all `k` points are too close to already existing points, then remove `p-i` from _active points_;
1. repeat until list of _active points_ is empty;

Side notes:

- complexity is `O(N)`;
- easy to implement;
- the cluster of points grows _naturally_ from the starting point to all directions;
- easily extensible to 3D (and more dimensional) space;
- the number of points is not known until the generation process is complete (it's "generate _some_
  points with specific condition" rather than "generate N points");

## Links

- https://www.redblobgames.com/x/1830-jittered-grid/
- https://www.jasondavies.com/poisson-disc/
