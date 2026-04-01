---
title: Floor plans using BSP algorithm
# summary: "Post summary"  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2025-07-17T23:45:10+02:00'
draft: true  # draft mode by default
tags: [procedural generation, bsp, dungeon]
styles:
  - canvas-wrapper.css
---

{{< load_resource "test.html" >}}

## TODO:

1. BSP rectangle. Take rectangle, split into 2 parts, repeat for each part.
1. BSP dungeon. Same as BSP rectangle, but create smaller random rooms in each final rect.
1. BSP angular: Split not vert/horizontally, but at angle. Split into 2 polygons. Then split each polygon more.
1. BSP angular: city generator.

## References

- https://cxong.github.io/2021/02/bsp-lock-and-key
- https://www.squidi.net/three/entry.php?id=4
