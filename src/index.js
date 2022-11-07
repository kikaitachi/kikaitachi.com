import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
  AxesHelper,
  BufferAttribute,
  BufferGeometry,
  Color,
  GridHelper,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';
import { initOpenCascade } from "opencascade.js";
import openCascadeHelper from './openCascadeHelper';

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

const makePolygon = (openCascade) => {
  const builder = new openCascade.BRep_Builder();
  const aComp = new openCascade.TopoDS_Compound();
  builder.MakeCompound(aComp);
  const path = [[-2, 0, 0], [1, 0, 1], [5, 10, 0]].map(([x, y, z]) => new openCascade.gp_Pnt_3(x, y, z));
  const makePolygon = new openCascade.BRepBuilderAPI_MakePolygon_3(path[0], path[1], path[2], true);
  const wire = makePolygon.Wire();
  const f = new openCascade.BRepBuilderAPI_MakeFace_15(wire, false);
  builder.Add(aComp, f.Shape());
  return aComp;
}

const addShapeToScene = async (openCascade, shape, scene) => {
  openCascadeHelper.setOpenCascade(openCascade);
  const facelist = await openCascadeHelper.tessellate(shape);
  const [locVertexcoord, locNormalcoord, locTriIndices] = await openCascadeHelper.joinPrimitives(facelist);
  const tot_triangle_count = facelist.reduce((a, b) => a + b.number_of_triangles, 0);
  const [vertices, faces] = await openCascadeHelper.generateGeometry(tot_triangle_count, locVertexcoord, locNormalcoord, locTriIndices);

  const objectMat = new MeshStandardMaterial({
    color: new Color(0.9, 0.0, 0.0)
  });
  const geometry = new BufferGeometry();
  console.log(vertices);
  console.log(faces);

  const position = []
  for (let i = 0; i < faces.length; i++) {
    position.push(vertices[faces[i].a].x);
    position.push(vertices[faces[i].a].y);
    position.push(vertices[faces[i].a].z);
    position.push(vertices[faces[i].b].x);
    position.push(vertices[faces[i].b].y);
    position.push(vertices[faces[i].b].z);
    position.push(vertices[faces[i].c].x);
    position.push(vertices[faces[i].c].y);
    position.push(vertices[faces[i].c].z);
  }
  //geometry.vertices = vertices;
  //geometry.faces = faces;
  //const positions = new Float32Array( vertices.length * 3 );
  geometry.setAttribute( 'position', new BufferAttribute( new Float32Array(position), 3 ) );
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  const object = new Mesh(geometry, new MeshBasicMaterial( { color: 0xff0000 } ));
  object.name = "shape";
  object.rotation.x = -Math.PI / 2;
  scene.add(object);
}

initOpenCascade().then(openCascade => {
  addShapeToScene(openCascade, makePolygon(openCascade), scene);
});
