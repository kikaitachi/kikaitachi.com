const positions = [];
const normals = [];

function visualize(openCascade, shape) {
  let geometries = []
  const ExpFace = new openCascade.TopExp_Explorer_1();
  for (ExpFace.Init(shape, openCascade.TopAbs_ShapeEnum.TopAbs_FACE, openCascade.TopAbs_ShapeEnum.TopAbs_SHAPE); ExpFace.More(); ExpFace.Next()) {
    const myShape = ExpFace.Current();
    const myFace = openCascade.TopoDS.Face_1(myShape);
    let inc;
    try {
      //in case some of the faces can not been visualized
      inc = new openCascade.BRepMesh_IncrementalMesh_2(myFace, 0.025, false, 0.125, false);
    } catch (e) {
      console.error(`failed to build incremental mesh: ${e}`);
      continue;
    }

    const aLocation = new openCascade.TopLoc_Location_1();
    const myT = openCascade.BRep_Tool.Triangulation(myFace, aLocation, 0 /* == Poly_MeshPurpose_NONE */);
    if (myT.IsNull()) {
      continue;
    }

    const pc = new openCascade.Poly_Connect_2(myT);
    const triangulation = myT.get();

    let vertices = new Float32Array(triangulation.NbNodes() * 3);

    // write vertex buffer
    for (let i = 1; i <= triangulation.NbNodes(); i++) {
      const t1 = aLocation.Transformation();
      const p = triangulation.Node(i);
      const p1 = p.Transformed(t1);
      vertices[3 * (i - 1)] = p1.X();
      vertices[3 * (i - 1) + 1] = p1.Y();
      vertices[3 * (i - 1) + 2] = p1.Z();
      p.delete();
      t1.delete();
      p1.delete();
    }

    // write normal buffer
    const myNormal = new openCascade.TColgp_Array1OfDir_2(1, triangulation.NbNodes());
    openCascade.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);

    let normals = new Float32Array(myNormal.Length() * 3);
    for (let i = myNormal.Lower(); i <= myNormal.Upper(); i++) {
      const t1 = aLocation.Transformation();
      const d1 = myNormal.Value(i);
      const d = d1.Transformed(t1);

      normals[3 * (i - 1)] = d.X();
      normals[3 * (i - 1) + 1] = d.Y();
      normals[3 * (i - 1) + 2] = d.Z();

      t1.delete();
      d1.delete();
      d.delete();
    }

    myNormal.delete();

    // write triangle buffer
    const orient = myFace.Orientation_1();
    const triangles = myT.get().Triangles();
    let indices;
    let triLength = triangles.Length() * 3;
    if (triLength > 65535)
      indices = new Uint32Array(triLength);
    else
      indices = new Uint16Array(triLength);

    for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
      const t = triangles.Value(nt);
      let n1 = t.Value(1);
      let n2 = t.Value(2);
      let n3 = t.Value(3);
      if (orient !== openCascade.TopAbs_Orientation.TopAbs_FORWARD) {
        let tmp = n1;
        n1 = n2;
        n2 = tmp;
      }

      indices[3 * (nt - 1)] = n1 - 1;
      indices[3 * (nt - 1) + 1] = n2 - 1;
      indices[3 * (nt - 1) + 2] = n3 - 1;
      t.delete();
    }
    triangles.delete();

    geometries.push({
      vertices: vertices,
      normals: normals,
      indices: indices,
    });

    pc.delete();
    aLocation.delete();
    myT.delete();
    inc.delete();
    myFace.delete();
    myShape.delete();
  }
  ExpFace.delete();
  return geometries;
}

const addShape = (oc, shape) => {
  visualize(oc, shape).forEach(tesselated => {
    for (let i = 0; i < tesselated.indices.length / 3; i++) {
      positions.push(
        tesselated.vertices[tesselated.indices[i * 3] * 3],
        tesselated.vertices[tesselated.indices[i * 3] * 3 + 1],
        tesselated.vertices[tesselated.indices[i * 3] * 3 + 2]
      );
      normals.push(
        tesselated.normals[tesselated.indices[i * 3] * 3],
        tesselated.normals[tesselated.indices[i * 3] * 3 + 1],
        tesselated.normals[tesselated.indices[i * 3] * 3 + 2]
      );
      positions.push(
        tesselated.vertices[tesselated.indices[i * 3 + 1] * 3],
        tesselated.vertices[tesselated.indices[i * 3 + 1] * 3 + 1],
        tesselated.vertices[tesselated.indices[i * 3 + 1] * 3 + 2]
      );
      normals.push(
        tesselated.normals[tesselated.indices[i * 3 + 1] * 3],
        tesselated.normals[tesselated.indices[i * 3 + 1] * 3 + 1],
        tesselated.normals[tesselated.indices[i * 3 + 1] * 3 + 2]
      );
      positions.push(
        tesselated.vertices[tesselated.indices[i * 3 + 2] * 3],
        tesselated.vertices[tesselated.indices[i * 3 + 2] * 3 + 1],
        tesselated.vertices[tesselated.indices[i * 3 + 2] * 3 + 2]
      );
      normals.push(
        tesselated.normals[tesselated.indices[i * 3 + 2] * 3],
        tesselated.normals[tesselated.indices[i * 3 + 2] * 3 + 1],
        tesselated.normals[tesselated.indices[i * 3 + 2] * 3 + 2]
      );
    }
  });
}

// https://cdn.jsdelivr.net/npm/opencascade.js@2.0.0-beta.94e2944
import("/opencascade.full.js").then((module) => {
  module.default().then((oc) => {
    let current_shapes = [];

    const removeCurrentShape = (shape) => {
      current_shapes = current_shapes.filter(item => item !== shape);
      return shape;
    }

    const addCurrentShape = (shape) => {
      current_shapes.push(shape);
      return shape;
    }

    const difference = (...arguments) => {
      let result = arguments[0];
      removeCurrentShape(result);
      arguments.slice(1).flat().forEach(shape => {
        shape = removeCurrentShape(shape);
        let intermediate = new oc.BRepAlgoAPI_Cut_3(result, shape, new oc.Message_ProgressRange_1());
        intermediate.Build(new oc.Message_ProgressRange_1());
        result = intermediate.Shape();
      });
      return addCurrentShape(result);
    };
    const extrude = (params) => {
      const points = params.points;
      const height = params.height;
      const wire = new oc.BRepBuilderAPI_MakeWire_1();
      for (let i = 0; i < points.length - 1; i++) {
        const point1 = new oc.gp_Pnt_3(points[i].x, points[i].y, points[i].z);
        const point2 = new oc.gp_Pnt_3(points[i + 1].x, points[i + 1].y, points[i + 1].z);
        const edge = new oc.BRepBuilderAPI_MakeEdge_3(point1, point2).Edge();
        wire.Add_1(edge);
      }
      const face = new oc.BRepBuilderAPI_MakeFace_15(wire.Wire(), false).Face();
      const result = new oc.BRepPrimAPI_MakePrism_1(
        face,
        new oc.gp_Vec_4(0, height, 0),
        false,
        true).Shape();
      return addCurrentShape(result);
    };
    const intersection = (...arguments) => {
      let result = arguments[0];
      removeCurrentShape(result);
      arguments.slice(1).flat().forEach(shape => {
        shape = removeCurrentShape(shape);
        let intermediate = new oc.BRepAlgoAPI_Common_3(result, shape, new oc.Message_ProgressRange_1());
        intermediate.Build(new oc.Message_ProgressRange_1());
        result = intermediate.Shape();
      });
      return addCurrentShape(result);
    };
    const union = (...arguments) => {
      let result = arguments[0];
      removeCurrentShape(result);
      arguments.slice(1).flat().forEach(shape => {
        shape = removeCurrentShape(shape);
        let intermediate = new oc.BRepAlgoAPI_Fuse_3(result, shape, new oc.Message_ProgressRange_1());
        intermediate.Build(new oc.Message_ProgressRange_1());
        result = intermediate.Shape();
      });
      return addCurrentShape(result);
    };
    const box = (params) => {
      return addCurrentShape(new oc.BRepPrimAPI_MakeBox_2(
        params.width,
        params.height,
        params.depth
      ).Shape());
    };
    const cone = (params) => {
      return addCurrentShape(new oc.BRepPrimAPI_MakeCone_1(
        params.radiusTop,
        params.radiusBottom,
        params.height
      ).Shape());
    };
    const sphere = (params) => {
      return addCurrentShape(new oc.BRepPrimAPI_MakeSphere_1(
        params.radius
      ).Shape());
    };
    const translate = (params, ...shapes) => {
      const transformation = new oc.gp_Trsf_1();
      transformation.SetTranslation_1(new oc.gp_Vec_4(params.x, params.y, params.z));
      const translation = new oc.TopLoc_Location_2(transformation);
      shapes.forEach(shape => shape.Move(translation, true));
      return shapes;
    };
    const rotateX = (params, ...shapes) => {
      const transformation = new oc.gp_Trsf_1();
      transformation.SetRotation_1(
        new oc.gp_Ax1_2(new oc.gp_Pnt_3(0, 0, 0),
        new oc.gp_Dir_2(new oc.gp_Vec_4(1, 0, 0))), params.degrees * 0.0174533);
      const translation = new oc.TopLoc_Location_2(transformation);
      shapes.forEach(shape => shape.Move(translation, true));
      return shapes;
    };

    const loadFile = (content) => {
      current_shapes.length = 0;
      positions.length = 0;
      normals.length = 0;
      console.log(`Evaluating: ${content}`);
      eval('(function() {' + content + '})();current_shapes.forEach(shape => addShape(oc, shape));');
      const positionArray = new Float32Array(positions);
      const normalArray = new Float32Array(normals);
      console.log(`Posting ${positionArray.length} triangles`);
      self.postMessage({
        type: "draw",
        positions: positionArray,
        normals: normalArray,
      }, [positionArray.buffer, normalArray.buffer]);
    };

    const exportSTEP = () => {
      const fileName = "part.step";
      const writer = new oc.STEPControl_Writer_1();
      current_shapes.forEach(shape => {
        writer.Transfer(shape, oc.STEPControl_StepModelType.STEPControl_AsIs, true, new oc.Message_ProgressRange_1());
      });
      writer.Write(fileName);
      const content = oc.FS.readFile("/" + fileName, { encoding:"utf8" });
      oc.FS.unlink("/" + fileName);
      self.postMessage({
        type: "export",
        fileName: fileName,
        content: content,
      });
    };

    self.onmessage = (event) => {
      console.log(`Message from main script: ${event.data.type}`);
      switch (event.data.type) {
        case "file":
          loadFile(event.data.content);
          break;
        case "exportSTEP":
          exportSTEP();
          break;
      }
    }

    self.postMessage({
      type: "loaded"
    });
  });
});
