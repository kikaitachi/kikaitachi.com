const points = [];
const R = 40;
const k = 32;
const r = R / k;
const angularStep = 0.2;
const height = 5;

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

union(
  extrude({
    points: points,
    x: 0,
    y: 0,
    z: height,
  }),
  translate({
    x: -(R + 20),
    y: -R,
    z: 0,
  },
    box({
      x: R + 20,
      y: 2 * R,
      z: height,
    })
  )
);
