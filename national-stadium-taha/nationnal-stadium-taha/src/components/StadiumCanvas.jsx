import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const STANDS = [
  { id: 'north', name: 'North Stand', price: 60, gate: 'A', a0: -2.25, a1: -0.9, blocks: ['112', '114', '116'] },
  { id: 'nw', name: 'North-West Corner', price: 50, gate: 'B', a0: -3.14, a1: -2.25, blocks: ['126', '128', '130'] },
  { id: 'west', name: 'West Stand', price: 90, gate: 'C', a0: 2.25, a1: 3.14, blocks: ['101', '103', '105'] },
  { id: 'south', name: 'South Stand', price: 75, gate: 'D', a0: 0.9, a1: 2.25, blocks: ['108', '110', '111'] },
  { id: 'east', name: 'East Stand', price: 110, gate: 'E', a0: -0.9, a1: 0.9, blocks: ['118', '120', '122'] },
];

const bowlPt = (a, rf, y) =>
  new THREE.Vector3(Math.cos(a) * (38 + rf * 16) * 1.16, y, Math.sin(a) * (32 + rf * 14) * 0.92);

const roundedRectPoints = (halfWidth, halfDepth, radius, segments = 12) => {
  const corners = [
    [halfWidth - radius, -halfDepth + radius, -Math.PI / 2],
    [halfWidth - radius, halfDepth - radius, 0],
    [-halfWidth + radius, halfDepth - radius, Math.PI / 2],
    [-halfWidth + radius, -halfDepth + radius, Math.PI],
  ];
  const points = [];

  corners.forEach(([cx, cz, startAngle]) => {
    for (let i = 0; i <= segments; i += 1) {
      const angle = startAngle + (Math.PI / 2) * (i / segments);
      points.push([cx + Math.cos(angle) * radius, cz + Math.sin(angle) * radius]);
    }
  });

  return points;
};

const roundedRectShape = (halfWidth, halfDepth, radius) => {
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth + radius, -halfDepth);
  shape.lineTo(halfWidth - radius, -halfDepth);
  shape.quadraticCurveTo(halfWidth, -halfDepth, halfWidth, -halfDepth + radius);
  shape.lineTo(halfWidth, halfDepth - radius);
  shape.quadraticCurveTo(halfWidth, halfDepth, halfWidth - radius, halfDepth);
  shape.lineTo(-halfWidth + radius, halfDepth);
  shape.quadraticCurveTo(-halfWidth, halfDepth, -halfWidth, halfDepth - radius);
  shape.lineTo(-halfWidth, -halfDepth + radius);
  shape.quadraticCurveTo(-halfWidth, -halfDepth, -halfWidth + radius, -halfDepth);
  return shape;
};

const createChairGeometry = () => {
  const parts = [
    [new THREE.BoxGeometry(1.05, 0.18, 0.72), [0, 0.12, 0]],
    [new THREE.BoxGeometry(1.05, 0.82, 0.16), [0, 0.58, -0.28]],
    ...[-0.4, 0.4].flatMap((x) =>
      [-0.28, 0.28].map((z) => [new THREE.BoxGeometry(0.1, 0.38, 0.1), [x, -0.07, z]])
    ),
  ];
  const geometries = parts.map(([geometry, position]) => {
    geometry.translate(...position);
    return geometry;
  });
  const chairGeometry = mergeGeometries(geometries);
  geometries.forEach((geometry) => geometry.dispose());
  return chairGeometry;
};

export const StadiumCanvas = forwardRef(function StadiumCanvas(props, ref) {
  const containerRef = useRef(null);
  const cbRef = useRef(props);
  cbRef.current = props;
  const apiRef = useRef(null);

  useImperativeHandle(ref, () => ({
    skipIntro: () => apiRef.current?.skipIntro(),
    setNight: (n) => apiRef.current?.setNight(n),
    setMode: (m) => apiRef.current?.setMode(m),
    goBackStep: () => apiRef.current?.goBackStep(),
  }));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b152b);
    scene.fog = new THREE.FogExp2(0x0b152b, 0.0025);

    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.5, 900);
    camera.position.set(110, 48, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.touchAction = 'none';
    el.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0x8bb4ff, 0x162238, 0.7);
    const sun = new THREE.DirectionalLight(0xfff4df, 1.1);
    sun.position.set(90, 140, 70);
    sun.castShadow = true;
    scene.add(hemi, sun);

    const floods = [[-46, -32], [46, -32], [-46, 32], [46, 32]].map(([x, z]) => {
      const spot = new THREE.SpotLight(0xdbeafe, 1.0, 180, Math.PI / 3.2, 0.5);
      spot.position.set(x, 36, z);
      scene.add(spot);
      return spot;
    });

    // Ville, rivière & routes
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xd9d2c5, roughness: 0.95 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(750, 750), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const riverShape = new THREE.Shape();
    riverShape.moveTo(-360, -75);
    riverShape.bezierCurveTo(-120, -105, 80, -35, 360, -90);
    riverShape.lineTo(360, -135);
    riverShape.bezierCurveTo(80, -75, -120, -145, -360, -115);
    riverShape.closePath();
    const riverMat = new THREE.MeshStandardMaterial({ color: 0x6296c7, roughness: 0.25 });
    const river = new THREE.Mesh(new THREE.ShapeGeometry(riverShape), riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.y = 0.08;
    scene.add(river);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0xc2b9aa, roughness: 0.9 });
    [[-160, 0, 720, 8], [0, -160, 8, 720], [95, 0, 6, 720]].forEach(([x, z, w, d]) => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), roadMat);
      r.position.set(x, 0.06, z);
      scene.add(r);
    });

    const parkMat = new THREE.MeshStandardMaterial({ color: 0x85898b, roughness: 0.9 });
    const plazaShape = roundedRectShape(84, 70, 30);
    const plazaHolePoints = roundedRectShape(68, 52, 24).getPoints().reverse();
    const plazaHole = new THREE.Path();
    plazaHolePoints.forEach((point, index) => {
      if (index === 0) plazaHole.moveTo(point.x, point.y);
      else plazaHole.lineTo(point.x, point.y);
    });
    plazaHole.closePath();
    plazaShape.holes.push(plazaHole);
    const plaza = new THREE.Mesh(
      new THREE.ExtrudeGeometry(plazaShape, { depth: 0.6, bevelEnabled: false }),
      parkMat
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    scene.add(plaza);

    const bldgMat = new THREE.MeshStandardMaterial({ color: 0xc8c0b4, roughness: 0.85 });
    [
      [-110, -55, 22, 10, 14], [-135, -30, 18, 14, 18], [-115, 45, 24, 9, 16],
      [115, -45, 20, 12, 18], [130, 35, 24, 16, 20], [105, 70, 18, 8, 14],
      [-45, 115, 26, 11, 16], [35, 115, 22, 13, 18], [-65, -125, 25, 10, 16],
      [45, -130, 28, 12, 14], [140, -110, 22, 14, 18],
      [-92, -92, 24, 15, 20], [-92, 4, 20, 20, 18], [-80, 82, 18, 13, 22],
      [88, -92, 23, 18, 18], [92, 8, 20, 15, 22], [82, 92, 24, 12, 18],
      [-28, 96, 20, 17, 18], [22, -98, 18, 14, 22],
    ].forEach(([x, z, w, h, d]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bldgMat);
      m.position.set(x, h / 2, z);
      m.castShadow = true;
      scene.add(m);
    });

    // Pelouse, lignes & buts
    const turf = new THREE.Mesh(
      new THREE.PlaneGeometry(72, 48),
      new THREE.MeshStandardMaterial({ color: 0x2f8f46, roughness: 0.85 })
    );
    turf.rotation.x = -Math.PI / 2;
    turf.position.y = 0.35;
    turf.receiveShadow = true;
    scene.add(turf);

    for (let i = -5; i <= 5; i += 2) {
      const s = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 46),
        new THREE.MeshStandardMaterial({ color: 0x37a150, roughness: 0.85 })
      );
      s.rotation.x = -Math.PI / 2;
      s.position.set(i * 6, 0.36, 0);
      scene.add(s);
    }

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const addLine = (x, z, w, d) => {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lineMat);
      l.rotation.x = -Math.PI / 2;
      l.position.set(x, 0.38, z);
      scene.add(l);
    };
    addLine(0, -22, 66, 0.35); addLine(0, 22, 66, 0.35);
    addLine(-33, 0, 0.35, 44.35); addLine(33, 0, 0.35, 44.35); addLine(0, 0, 0.35, 44);
    addLine(-25, 0, 0.35, 22); addLine(-29, -11, 8, 0.35); addLine(-29, 11, 8, 0.35);
    addLine(25, 0, 0.35, 22); addLine(29, -11, 8, 0.35); addLine(29, 11, 8, 0.35);
    const centerRing = new THREE.Mesh(new THREE.RingGeometry(5.5, 5.85, 40), lineMat);
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.y = 0.38;
    scene.add(centerRing);

    [-33, 33].forEach((xPos) => {
      const g = new THREE.Group();
      const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5.2, 8), postMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(0, 2.2, 0);
      g.add(bar);
      [-2.6, 2.6].forEach((z) => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.2, 8), postMat);
        p.position.set(0, 1.1, z);
        g.add(p);
      });
      const net = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 2.1, 5.1),
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.45 })
      );
      net.position.set(xPos < 0 ? -0.8 : 0.8, 1.05, 0);
      g.add(net);
      g.position.set(xPos, 0.35, 0);
      scene.add(g);
    });

    // Stadium exterior: rounded rectangular shell with a continuous roof opening.
    const facadeDetails = [];
    const facadePoints = roundedRectPoints(78, 62, 28);
    const wallVertices = [];
    for (let y = 0.65; y < 18.5; y += 1) {
      const nextY = Math.min(y + 1, 18.5);
      const taper = (height) => 1 - ((height - 0.65) / 17.85) * 0.025;
      facadePoints.forEach(([x, z], i) => {
        const [nextX, nextZ] = facadePoints[(i + 1) % facadePoints.length];
        const lowerScale = taper(y);
        const upperScale = taper(nextY);
        wallVertices.push(
          x * lowerScale, y, z * lowerScale,
          nextX * lowerScale, y, nextZ * lowerScale,
          nextX * upperScale, nextY, nextZ * upperScale,
          x * lowerScale, y, z * lowerScale,
          nextX * upperScale, nextY, nextZ * upperScale,
          x * upperScale, nextY, z * upperScale
        );
      });
    }
    const shellGeometry = new THREE.BufferGeometry();
    shellGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wallVertices, 3));
    shellGeometry.computeVertexNormals();
    const shell = new THREE.Mesh(
      shellGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xb9c2ca, metalness: 0.72, roughness: 0.34, side: THREE.DoubleSide,
      })
    );
    scene.add(shell);
    facadeDetails.push(shell);

    for (let y = 1.2; y <= 18; y += 0.85) {
      const scale = 1 - ((y - 0.65) / 17.85) * 0.025;
      const points = roundedRectPoints(78 * scale, 62 * scale, 28 * scale).map(
        ([x, z]) => new THREE.Vector3(x, y, z)
      );
      const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
      const rib = new THREE.Mesh(
        new THREE.TubeGeometry(curve, points.length * 2, 0.22, 6, true),
        new THREE.MeshStandardMaterial({ color: 0xd7dce0, metalness: 0.85, roughness: 0.28 })
      );
      scene.add(rib);
      facadeDetails.push(rib);
    }

    const glassBandPoints = roundedRectPoints(78.5, 62.5, 28.5).map(
      ([x, z]) => new THREE.Vector3(x, 14.4, z)
    );
    const glassBand = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(glassBandPoints, true), 400, 0.75, 8, true),
      new THREE.MeshStandardMaterial({ color: 0x263746, metalness: 0.45, roughness: 0.24 })
    );
    scene.add(glassBand);
    facadeDetails.push(glassBand);

    const roofShape = roundedRectShape(78, 62, 28);
    const roofOpening = roundedRectShape(48, 32, 18);
    roofOpening.getPoints().reverse().forEach((point, index, points) => {
      if (index === 0) roofShape.holes.push(new THREE.Path());
      const hole = roofShape.holes[0];
      if (index === 0) hole.moveTo(point.x, point.y);
      else hole.lineTo(point.x, point.y);
      if (index === points.length - 1) hole.closePath();
    });
    const roof = new THREE.Mesh(
      new THREE.ShapeGeometry(roofShape, 12),
      new THREE.MeshStandardMaterial({ color: 0xe2e6e9, metalness: 0.72, side: THREE.DoubleSide, roughness: 0.34 })
    );
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = 19;
    scene.add(roof);
    facadeDetails.push(roof);
    const roofDetails = [roof];

    [50, 56, 62, 68, 74].forEach((halfWidth) => {
      const halfDepth = halfWidth * (62 / 78);
      const points = roundedRectPoints(halfWidth, halfDepth, Math.min(28, halfDepth - 1)).map(
        ([x, z]) => new THREE.Vector3(x, 19.1, z)
      );
      const roofRib = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 400, 0.2, 6, true),
        new THREE.MeshStandardMaterial({ color: 0xf1f3f5, metalness: 0.82, roughness: 0.3 })
      );
      scene.add(roofRib);
      facadeDetails.push(roofRib);
      roofDetails.push(roofRib);
    });

    const sbCanvas = document.createElement('canvas');
    sbCanvas.width = 512; sbCanvas.height = 160;
    const sctx = sbCanvas.getContext('2d');
    sctx.fillStyle = '#07142b'; sctx.fillRect(0, 0, 512, 160);
    sctx.fillStyle = '#38bdf8'; sctx.font = 'bold 48px sans-serif';
    sctx.textAlign = 'center'; sctx.fillText('RMA   0 : 0   BAR', 256, 95);
    const sb = new THREE.Mesh(
      new THREE.BoxGeometry(16, 5.2, 0.8),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sbCanvas) })
    );
    sb.position.set(0, 21, -43);
    scene.add(sb);

    const setStadiumShellVisible = (visible) => {
      sb.visible = visible;
      facadeDetails.forEach((mesh) => { mesh.visible = visible; });
    };
    const setStadiumRoofVisible = (visible) => {
      roofDetails.forEach((mesh) => { mesh.visible = visible; });
    };

    // Blocs & Sièges
    const blockMeshes = [];
    const seatMeshes = [];
    const chairGeometry = createChairGeometry();
    const seatGroup = new THREE.Group();
    scene.add(seatGroup);
    const overviewSeatGroup = new THREE.Group();
    scene.add(overviewSeatGroup);

    STANDS.forEach((st) => {
      const span = st.a1 - st.a0;
      st.blocks.forEach((blockId, idx) => {
        const a0 = st.a0 + (span * idx) / st.blocks.length + 0.02;
        const a1 = st.a0 + (span * (idx + 1)) / st.blocks.length - 0.02;
        const geo = new THREE.BufferGeometry();
        const verts = [];
        for (let i = 0; i < 6; i++) {
          const t0 = a0 + ((a1 - a0) * i) / 6;
          const t1 = a0 + ((a1 - a0) * (i + 1)) / 6;
          const p00 = bowlPt(t0, 0, 2), p10 = bowlPt(t1, 0, 2);
          const p01 = bowlPt(t0, 1, 14.5), p11 = bowlPt(t1, 1, 14.5);
          verts.push(
            p00.x, p00.y, p00.z, p10.x, p10.y, p10.z, p11.x, p11.y, p11.z,
            p00.x, p00.y, p00.z, p11.x, p11.y, p11.z, p01.x, p01.y, p01.z
          );
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(
          geo,
          new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.55, side: THREE.DoubleSide })
        );
        mesh.visible = false;
        mesh.userData = {
          standId: st.id, standName: st.name, blockId,
          price: blockId === '128' ? 70 : st.price,
          gate: st.gate, midAngle: (a0 + a1) / 2, a0, a1,
        };
        scene.add(mesh);
        blockMeshes.push(mesh);
      });
    });

    const overviewSeatInstances = { free: [], sold: [] };
    const seatTransform = new THREE.Object3D();
    STANDS.forEach((stand) => {
      const span = stand.a1 - stand.a0;
      stand.blocks.forEach((blockId, blockIndex) => {
        const a0 = stand.a0 + (span * blockIndex) / stand.blocks.length + 0.02;
        const a1 = stand.a0 + (span * (blockIndex + 1)) / stand.blocks.length - 0.02;
        for (let row = 1; row <= 14; row += 1) {
          const rowFactor = (row - 1) / 13;
          for (let seat = 1; seat <= 16; seat += 1) {
            const pos = bowlPt(
              a0 + ((a1 - a0) * (seat - 0.5)) / 16,
              rowFactor,
              2.5 + rowFactor * 11.2
            );
            const sold = (row * 7 + seat * 13) % 5 === 0 && !(row === 8 && seat === 9);
            seatTransform.position.copy(pos);
            seatTransform.scale.setScalar(1.25);
            seatTransform.lookAt(0, pos.y - 2, 0);
            seatTransform.updateMatrix();
            overviewSeatInstances[sold ? 'sold' : 'free'].push(seatTransform.matrix.clone());
          }
        }
      });
    });

    [
      ['free', 0x2563eb],
      ['sold', 0x64748b],
    ].forEach(([type, color]) => {
      const instances = overviewSeatInstances[type];
      const material = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
      const mesh = new THREE.InstancedMesh(chairGeometry, material, instances.length);
      instances.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      overviewSeatGroup.add(mesh);
    });

    const buildSeats = (b) => {
      while (seatGroup.children.length) seatGroup.remove(seatGroup.children[0]);
      seatMeshes.length = 0;
      for (let r = 1; r <= 14; r++) {
        const rf = (r - 1) / 13;
        for (let s = 1; s <= 16; s++) {
          const pos = bowlPt(b.a0 + ((b.a1 - b.a0) * (s - 0.5)) / 16, rf, 2.5 + rf * 11.2);
          const sold = (r * 7 + s * 13) % 5 === 0 && !(r === 8 && s === 9);
          const m = new THREE.Mesh(
            chairGeometry,
            new THREE.MeshStandardMaterial({ color: sold ? 0x64748b : 0x2563eb, roughness: 0.4 })
          );
          m.position.copy(pos);
          m.lookAt(0, pos.y - 2, 0);
          m.userData = {
            row: r, seat: s, sold, blockId: b.blockId,
            standName: b.standName, price: b.price, gate: b.gate, worldPos: pos.clone(),
          };
          seatGroup.add(m);
          seatMeshes.push(m);
        }
      }
    };

    let mode = 'intro', introP = 0;
    let activeStandId = null, activeBlock = null, activeSeat = null, hoveredBlockId = null;

    const camPos = new THREE.Vector3(110, 48, 120);
    const camLook = new THREE.Vector3(0, 5, 0);
    const curLook = new THREE.Vector3(0, 5, 0);
    let theta = 0.85, phi = 0.9, radius = 175, seatZoom = 34, yaw = 0, pitch = -0.14;

    const applyLighting = (night) => {
      scene.background.setHex(night ? 0x0b152b : 0xcfe4f7);
      scene.fog.color.setHex(night ? 0x0b152b : 0xcfe4f7);
      hemi.intensity = night ? 0.55 : 1.0;
      sun.intensity = night ? 0.45 : 1.25;
      groundMat.color.setHex(night ? 0x1f2937 : 0xd9d2c5);
      riverMat.color.setHex(night ? 0x1d3b5f : 0x5b9bd5);
      parkMat.color.setHex(night ? 0x353a3d : 0x85898b);
      bldgMat.color.setHex(night ? 0x334155 : 0xcac2b5);
      roadMat.color.setHex(night ? 0x27303f : 0xbfb5a5);
      floods.forEach((f) => {
        f.intensity = night ? 1.2 : 0;
      });
    };
    applyLighting(true);

    const highlight = () => {
      blockMeshes.forEach((m) => {
        const d = m.userData;
        if (activeBlock?.blockId === d.blockId) m.material.color.setHex(0x60a5fa);
        else if (hoveredBlockId === d.blockId) m.material.color.setHex(0x38bdf8);
        else if (activeStandId === d.standId) m.material.color.setHex(0x3b82f6);
        else m.material.color.setHex(0x2563eb);
      });
      seatMeshes.forEach((m) => {
        const d = m.userData;
        if (d.sold) m.material.color.setHex(0x64748b);
        else if (activeSeat && d.row === activeSeat.row && d.seat === activeSeat.seat)
          m.material.color.setHex(0xfacc15);
        else m.material.color.setHex(0x2563eb);
      });
    };

    const capturePreview = (sd) => {
      const sp = camera.position.clone(), sl = curLook.clone();
      camera.position.copy(sd.worldPos).add(new THREE.Vector3(0, 1.5, 0));
      camera.lookAt(0, 1.5, 0);
      renderer.render(scene, camera);
      const url = renderer.domElement.toDataURL('image/jpeg', 0.65);
      camera.position.copy(sp);
      camera.lookAt(sl);
      renderer.render(scene, camera);
      return url;
    };

    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let down = false, lx = 0, ly = 0, dist = 0;

    const setPtr = (cx, cy) => {
      const r = renderer.domElement.getBoundingClientRect();
      ptr.x = ((cx - r.left) / r.width) * 2 - 1;
      ptr.y = -((cy - r.top) / r.height) * 2 + 1;
    };

    const onDown = (e) => { down = true; lx = e.clientX; ly = e.clientY; dist = 0; };
    const onMove = (e) => {
      if (down) {
        const dx = e.clientX - lx, dy = e.clientY - ly;
        dist += Math.hypot(dx, dy); lx = e.clientX; ly = e.clientY;
        if (mode === 'view') {
          yaw -= dx * 0.0045;
          pitch = Math.max(-0.55, Math.min(0.45, pitch - dy * 0.0035));
        } else if (mode !== 'intro') {
          theta -= dx * 0.005;
          phi = Math.max(0.45, Math.min(1.25, phi - dy * 0.004));
        }
        return;
      }
      if (mode === 'block' || mode === 'seat') {
        setPtr(e.clientX, e.clientY);
        ray.setFromCamera(ptr, camera);
        const seatHits = ray.intersectObjects(seatMeshes);
        if (seatHits.length > 0) {
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }
      if (mode === 'stand' || mode === 'block') {
        setPtr(e.clientX, e.clientY);
        ray.setFromCamera(ptr, camera);
        const hits = ray.intersectObjects(blockMeshes);
        if (hits.length > 0) {
          const d = hits[0].object.userData;
          if (hoveredBlockId !== d.blockId) {
            hoveredBlockId = d.blockId;
            highlight();
            cbRef.current.onHoverChange({
              title: mode === 'stand' ? d.standName : `Block ${d.blockId}`,
              price: d.price,
              subtitle: mode === 'stand' ? '1,365 seats left' : d.standName,
            });
          }
          renderer.domElement.style.cursor = 'pointer';
        } else {
          if (hoveredBlockId !== null) {
            hoveredBlockId = null;
            highlight();
            cbRef.current.onHoverChange(null);
          }
          renderer.domElement.style.cursor = 'grab';
        }
      } else {
        renderer.domElement.style.cursor = mode === 'view' ? 'move' : 'default';
      }
    };

    const onUp = (e) => {
      if (!down) return;
      down = false;
      if (dist > 8) return;
      setPtr(e.clientX, e.clientY);
      ray.setFromCamera(ptr, camera);

      if (mode === 'stand') {
        const hits = ray.intersectObjects(blockMeshes);
        if (hits.length > 0) {
          const d = hits[0].object.userData;
          activeStandId = d.standId; activeBlock = d; hoveredBlockId = null;
          blockMeshes.forEach((m) => { m.visible = false; });
          overviewSeatGroup.visible = false;
          setStadiumShellVisible(true);
          setStadiumRoofVisible(false);
          buildSeats(d); mode = 'block'; highlight();
          cbRef.current.onHoverChange(null);
          cbRef.current.onStandSelected({ standName: d.standName, blockId: d.blockId, price: d.price });
        }
      } else if (mode === 'block' || mode === 'seat') {
        const sHits = ray.intersectObjects(seatMeshes);
        if (sHits.length > 0) {
          const sd = sHits[0].object.userData;
          if (sd.sold) { cbRef.current.onToast('This seat is already sold'); return; }
          activeSeat = sd; mode = 'seat'; highlight();
          cbRef.current.onSeatSelected({
            standName: sd.standName, tier: 'Lower tier', blockId: sd.blockId,
            row: sd.row, seat: sd.seat, gate: sd.gate, price: sd.price,
            previewDataUrl: capturePreview(sd),
          });
          return;
        }
        const bHits = ray.intersectObjects(blockMeshes);
        if (bHits.length > 0) {
          const d = bHits[0].object.userData;
          activeBlock = d;
          blockMeshes.forEach((m) => { m.visible = false; });
          overviewSeatGroup.visible = false;
          setStadiumShellVisible(true);
          setStadiumRoofVisible(false);
          buildSeats(d); mode = 'block'; highlight();
          cbRef.current.onBlockSelected({ standName: d.standName, blockId: d.blockId, price: d.price });
        }
      }
    };

    const onWheel = (e) => {
      if (mode === 'block' || mode === 'seat') {
        seatZoom = Math.max(18, Math.min(60, seatZoom + e.deltaY * 0.035));
      } else if (mode === 'overview' || mode === 'stand') {
        radius = Math.max(105, Math.min(260, radius + e.deltaY * 0.08));
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    dom.addEventListener('wheel', onWheel, { passive: true });

    apiRef.current = {
      skipIntro: () => {
        if (mode === 'intro') {
          mode = 'overview';
          applyLighting(false);
          overviewSeatGroup.visible = true;
          setStadiumRoofVisible(false);
          cbRef.current.onIntroDone();
        }
      },
      setNight: applyLighting,
      setMode: (m) => {
        mode = m;
        if (m === 'stand' || m === 'overview') {
          activeStandId = null; activeBlock = null; activeSeat = null;
          overviewSeatGroup.visible = true;
          blockMeshes.forEach((block) => { block.visible = m === 'stand'; });
          setStadiumShellVisible(true);
          setStadiumRoofVisible(false);
          while (seatGroup.children.length) seatGroup.remove(seatGroup.children[0]);
        } else if (m === 'view') {
          overviewSeatGroup.visible = false;
          yaw = 0; pitch = -0.14;
          setStadiumShellVisible(true);
          setStadiumRoofVisible(false);
        } else {
          overviewSeatGroup.visible = false;
        }
        highlight();
      },
      goBackStep: () => {
        if (mode === 'view') mode = 'seat';
        else if (mode === 'seat') { activeSeat = null; mode = 'block'; }
        else if (mode === 'block') {
          activeBlock = null; activeStandId = null;
          overviewSeatGroup.visible = true;
          blockMeshes.forEach((m) => { m.visible = true; });
          setStadiumShellVisible(true);
          setStadiumRoofVisible(false);
          while (seatGroup.children.length) seatGroup.remove(seatGroup.children[0]);
          seatMeshes.length = 0;
          mode = 'stand';
        }
        highlight();
      },
    };

    const clock = new THREE.Clock();
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      if (mode === 'intro') {
        introP += dt * 0.16;
        if (introP < 0.65) {
          const a = introP * 2.2;
          camPos.set(Math.cos(a) * 115, 42 - introP * 15, Math.sin(a) * 115);
          camLook.set(0, 8, 0);
        } else if (introP < 1.0) {
          applyLighting(false);
          camPos.set(95, 78, 125); camLook.set(0, 0, 12);
        } else {
          mode = 'overview';
          applyLighting(false);
          overviewSeatGroup.visible = true;
          setStadiumRoofVisible(false);
          cbRef.current.onIntroDone();
        }
      } else if (mode === 'overview' || mode === 'stand') {
        camPos.set(
          Math.cos(theta) * Math.sin(phi) * radius,
          Math.cos(phi) * radius + 15,
          Math.sin(theta) * Math.sin(phi) * radius
        );
        camLook.set(0, 3, 0);
      } else if (mode === 'block' && activeBlock) {
        const f = bowlPt(activeBlock.midAngle, 0.65, 8);
        const inward = new THREE.Vector3(Math.cos(activeBlock.midAngle), 0, Math.sin(activeBlock.midAngle));
        camPos.copy(f).addScaledVector(inward, -seatZoom).add(new THREE.Vector3(0, 20, 0));
        camLook.copy(f).add(new THREE.Vector3(0, 2, 0));
      } else if (mode === 'seat' && activeSeat) {
        const f = activeSeat.worldPos;
        const inward = f.clone().setY(0).normalize();
        camPos.copy(f).addScaledVector(inward, -Math.min(seatZoom * 0.35, 12)).add(new THREE.Vector3(0, 5, 0));
        camLook.copy(f).add(new THREE.Vector3(0, 1, 0));
      } else if (mode === 'view' && activeSeat) {
        const eye = activeSeat.worldPos.clone().add(new THREE.Vector3(0, 1.5, 0));
        camPos.copy(eye);
        const dir = new THREE.Vector3(0, 0, 0).sub(eye).normalize();
        const totalYaw = Math.atan2(dir.x, dir.z) + yaw;
        const lookDir = new THREE.Vector3(
          Math.sin(totalYaw) * Math.cos(pitch),
          Math.sin(pitch),
          Math.cos(totalYaw) * Math.cos(pitch)
        );
        camLook.copy(eye).addScaledVector(lookDir, 30);
      }

      const spd = mode === 'view' ? 0.18 : 0.08;
      camera.position.lerp(camPos, spd);
      curLook.lerp(camLook, spd);
      camera.lookAt(curLook);
      renderer.render(scene, camera);
    };

    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    cbRef.current.onReady();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (el.contains(dom)) el.removeChild(dom);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
});