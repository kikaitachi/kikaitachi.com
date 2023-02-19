const points = [];
const numberOfTeeth = 14;
const segmentThickness = 28.5;
const k = numberOfTeeth * 2;
const R = segmentThickness / 2; //segmentThickness / (2 - 2.0 / numberOfTeeth);
const r = R / k;
const angularStep = 2.0;
const height = 2.5;
const jointHoleRadius = 2.1;
const screwHoleRadius = 2.1;

const screwHoles = [];
const scewsPerAxis = segmentThickness / 10;
for (let i = 0; i < scewsPerAxis - 1; i++) {
  for (let j = 0; j < scewsPerAxis; j++) {
    screwHoles.push(translate({
      x: -i * 10 - 10,
      y: j * 10 - segmentThickness / 2 + 5,
      z: 0,
    },
      cylinder({
        radius: screwHoleRadius,
        height: height,
      })
    ));
  }
}

const cycloidalGear = (R, r, k, angularStep) => {
  const points = [];
  for (let i = 0; i < k; i++) {
    for (let j = 0.0; j < 360.0 / k; j += angularStep) {
      const angle = (i * 360.0 / k + j) * Math.PI / 180;
      if (i % 2 == 0) {
        // https://en.wikipedia.org/wiki/Epicycloid
        points.push({
          x: (R + r) * Math.cos(angle) - r * Math.cos((R + r) / r * angle),
          y: (R + r) * Math.sin(angle) - r * Math.sin((R + r) / r * angle),
          z: 0,
        });
      } else {
        // https://en.wikipedia.org/wiki/Hypocycloid
        points.push({
          x: (R - r) * Math.cos(angle) + r * Math.cos((R - r) / r * angle),
          y: (R - r) * Math.sin(angle) - r * Math.sin((R - r) / r * angle),
          z: 0,
        });
      }
    }
  }
  points.push(points[0]);

  return extrude({
    points: points,
    x: 0,
    y: 0,
    z: height,
  });
};

const gear = cycloidalGear(R, r, k, angularStep);

difference(
  union(
    gear,
    translate({
      x: -segmentThickness + 5,
      y: -segmentThickness / 2,
      z: 0,
    },
      box({
        x: segmentThickness - 5,
        y: segmentThickness,
        z: height,
      })
    ),
    translate({
      x: R * 1.5,
      y: 0,
      z: 0
    },
    /*rotateZ({
      degrees: 360 / (2 * 3),
    },
    cycloidalGear(R / 2, (R / 2) / (2 * 3), 2 * 3, angularStep)
    ))*/
    rotateZ({
      degrees: 360 / (k / 2),
    },
    cycloidalGear(R / 2, r, k / 2, angularStep)
    ))
  ),
  cylinder({
    radius: jointHoleRadius,
    height: height,
  }),
  screwHoles,
  translate({
    x: 0,
    y: -R * 2,
    z: 0,
  },
    gear
  ),
  translate({
    x: 0,
    y: R * 2,
    z: 0,
  },
    gear
  )
);
