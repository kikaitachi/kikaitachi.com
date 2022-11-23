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
  )
);

difference(
  sphere({
    radius: 0.5,
  }),
  translate({
    x: -0.4,
    y: -0.4,
    z: -0.4,
  },
    box({
      width: 0.8,
      height: 0.8,
      depth: 0.8,
    })
  )
);
