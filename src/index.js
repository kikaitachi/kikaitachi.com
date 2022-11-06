import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
  AxesHelper,
  GridHelper,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
var matrix = new Matrix4();
matrix.makeRotationX(-15 * Math.PI / 180);
camera.position.applyMatrix4(matrix);

const renderer = new WebGLRenderer({
  antialias: true
});
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

const size = 10;
const divisions = 10;

const gridHelper = new GridHelper(size, divisions);
scene.add(gridHelper);

scene.add(new AxesHelper());

document.body.appendChild(renderer.domElement);

const animate = () => {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
