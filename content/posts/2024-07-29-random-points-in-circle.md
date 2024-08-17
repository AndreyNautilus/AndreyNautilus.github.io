---
title: Random points in circle with uniform distribution
summary: angle = random(); distance = R * sqrt(random())  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2024-07-29T18:54:08+02:00'

tags: [procedural generation]
aliases:
  - 2024-07-29-random-point-in-circle
---

We need to generate a random point in a circle with uniform distribution.

A naive approach with polar coordinates by picking a random angle and a random distance
doesn't give uniform distribution - there are more points close to center and fewer points at the radius.
[This article](https://www.anderswallin.net/2009/05/uniform-random-points-in-a-circle-using-polar-coordinates/)
has explanation and visualization.

{{< random_points_in_circle >}}

## Correct formula for polar coordinates

In polar coordinates:

```
angle = random(0, 2 * PI)
distance = R * sqrt(random(0, 1))
```

Where `R` is the radius of the circle. And transformation to Cortesian coordinates:

```
x = distance * cos(angle)
y = distance * sin(angle)
```

[This article](https://www.anderswallin.net/2009/05/uniform-random-points-in-a-circle-using-polar-coordinates/)
and [StackOverflow threads](https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly)
give a mathematically correct explanation.

## Monte Carlo (multiple attempts)

Another approach is to generate uniformly distributed random points in the bounding box of the circle
and pick the first point that is inside the circle.

With `random()` being a uniformly random number, the naive approach for a point in a square:

```
x = random()
y = random()
```

give uniformly distributed points. And `x * x + y * y <= R * R` provides an easy test for
point being inside the circle.

Obvious drawback - undefined number of attempts, but with uniformly distributed points the average
amount of attempt should not be greater than 2 (on average we need `4 / PI` attempts).
