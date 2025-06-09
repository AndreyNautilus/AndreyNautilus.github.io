---
title: 0 hex world map
# summary: "Post summary"  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2025-06-05T19:38:16+02:00'
draft: true  # draft mode by default
tags: [procgen]
scripts:
  - hex-grid.js
  - perlin.js
  - render.js
---

{{< load_resource "map.html" >}}

### References

- Implementation of Perlin Noise is taken from https://github.com/josephg/noisejs
