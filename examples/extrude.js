const points = [];
const numberOfTeeth = 15;
const segmentThickness = 20;
const k = numberOfTeeth * 2;
const R = segmentThickness / 2; //segmentThickness / (2 - 2.0 / numberOfTeeth);
const r = R / k;
const angularStep = 0.5;
const height = 3;
const jointHoleRadius = 1.1;

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

const gear = extrude({
  points: points,
  x: 0,
  y: 0,
  z: height,
});

difference(
  union(
    gear,
    translate({
      x: -segmentThickness,
      y: -segmentThickness / 2,
      z: 0,
    },
      box({
        x: segmentThickness,
        y: segmentThickness,
        z: height,
      })
    )
  ),
  cylinder({
    radius: jointHoleRadius,
    height: height,
  }),
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
