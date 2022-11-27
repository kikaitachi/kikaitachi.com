const points = [];
const R = 0.5;
const k = 32;
const r = R / k;
const angularStep = 0.2;

for (let i = 0; i < k; i++) {
  for (let j = 0.0; j < 360.0 / k; j += angularStep) {
    const angle = (i * 360.0 / k + j) * Math.PI / 180;
    if (i % 2 == 0) {
      points.push({
        x: (R + r) * Math.cos(angle) - r * Math.cos((R + r) / r * angle),
        y: 0,
        z: (R + r) * Math.sin(angle) - r * Math.sin((R + r) / r * angle),
      });
    } else {
      points.push({
        x: (R - r) * Math.cos(angle) + r * Math.cos((R - r) / r * angle),
        y: 0,
        z: (R - r) * Math.sin(angle) - r * Math.sin((R - r) / r * angle),
      });
    }
  }
}
points.push(points[0]);

extrude({
  points: points,
  height: 0.25
});
