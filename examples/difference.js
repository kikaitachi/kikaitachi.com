translate({
  x: 1,
  y: 0,
  z: 0,
},
difference(
  sphere({
    radius: 0.5,
  }),
  cone({
    radiusTop: 0.25,
    radiusBottom: 0.5,
    height: 1,
  })
));
