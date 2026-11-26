import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { NUM_COLUMNS, NUM_WHEELS } from '../math/finiteDifferences.js';
import { soundEngine } from '../audio/soundEffects.js';

// Texture generator for engraved 0-9 figure wheels
function createDigitTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Aged bronze background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 128);
  bgGrad.addColorStop(0, '#8a652a');
  bgGrad.addColorStop(0.3, '#c99a4e');
  bgGrad.addColorStop(0.5, '#deb062');
  bgGrad.addColorStop(0.7, '#ba8b3f');
  bgGrad.addColorStop(1, '#66481a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 128);

  // Subtle horizontal brushing lines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let y = 0; y < 128; y += 3) {
    ctx.fillRect(0, y, 1024, 1);
  }

  // Draw 10 digits (0 to 9)
  const cellWidth = 1024 / 10;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 78px "Playfair Display", "Times New Roman", serif';

  for (let d = 0; d < 10; d++) {
    const cx = (d + 0.5) * cellWidth;

    // Engraved groove shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillText(d.toString(), cx, 66);

    // Engraved highlight rim
    ctx.fillStyle = 'rgba(255, 240, 200, 0.35)';
    ctx.fillText(d.toString(), cx, 62);

    // Core deep engraved number
    ctx.fillStyle = '#1e1408';
    ctx.fillText(d.toString(), cx, 64);

    // Vertical separating tick marks
    ctx.fillStyle = 'rgba(40, 25, 10, 0.6)';
    ctx.fillRect(d * cellWidth, 15, 3, 98);
    ctx.fillStyle = 'rgba(255, 230, 160, 0.3)';
    ctx.fillRect(d * cellWidth + 3, 15, 2, 98);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural paper roll texture for printer
function createPaperTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Antique cream parchment
  ctx.fillStyle = '#f8f5eb';
  ctx.fillRect(0, 0, 512, 1024);

  // Faint paper grain
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 1024;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.04)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Printed sample columns
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1a1815';
  ctx.textAlign = 'center';
  ctx.fillText('BABBAGE DIFFERENCE ENGINE NO. 2', 256, 40);
  ctx.font = '14px "Cinzel", serif';
  ctx.fillText('HER MAJESTY’S STATIONERY OFFICE • 1849', 256, 65);

  ctx.strokeStyle = '#8a652a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 80);
  ctx.lineTo(482, 80);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Static Camera Presets Map
const CAMERA_PRESETS = {
  full: { pos: new THREE.Vector3(0, 3.2, 11.5), look: new THREE.Vector3(0, 2.0, 0) },
  columns: { pos: new THREE.Vector3(0, 2.3, 5.2), look: new THREE.Vector3(0, 2.2, 0) },
  carriage: { pos: new THREE.Vector3(1.2, 2.4, 4.0), look: new THREE.Vector3(0.8, 2.0, 0) },
  printer: { pos: new THREE.Vector3(-4.6, 2.4, 3.8), look: new THREE.Vector3(-3.8, 2.0, 0) },
  crank: { pos: new THREE.Vector3(4.9, 2.0, 3.6), look: new THREE.Vector3(3.8, 1.7, 0) }
};

export const DifferenceEngine3D = forwardRef(function DifferenceEngine3D({
  engineState,
  isXRay = false,
  showLabels = true,
  cameraPreset = 'full',
  onCrankTurned,
  isAutoRunning = false,
  autoSpeed = 1
}, ref) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  // Subsystem 3D tracking references
  const wheelsMapRef = useRef([]); // [col][wheel] -> Mesh
  const helicalShaftsRef = useRef([]); // 7 helical shafts
  const mainCamshaftRef = useRef(null);
  const crankAssemblyRef = useRef(null);
  const crankHandleGripRef = useRef(null);
  const onCrankTurnedRef = useRef(onCrankTurned);
  useEffect(() => {
    onCrankTurnedRef.current = onCrankTurned;
  }, [onCrankTurned]);
  const printerHammerRef = useRef(null);
  const printerTypewheelsRef = useRef([]);
  const printerPaperRef = useRef(null);
  const framePartsRef = useRef([]);

  // Animation and interaction state
  const crankAngleRef = useRef(0);
  const targetCameraPosRef = useRef(new THREE.Vector3(0, 3.2, 11.5));
  const targetCameraLookRef = useRef(new THREE.Vector3(0, 2.0, 0));
  const [screenLabels, setScreenLabels] = useState([]);

  // Subsystem locations for 3D overlay pins
  const subsystemAnchors = useRef([
    { id: 'col0', name: 'Column 0: Running Value f(x)', pos: new THREE.Vector3(-2.8, 3.8, 0.4) },
    { id: 'diffCols', name: 'Columns 1–7: Difference Orders Δ¹..Δ⁷', pos: new THREE.Vector3(0.4, 3.8, 0.4) },
    { id: 'helical', name: 'Helical Carry Shafts (Spiral Sweep)', pos: new THREE.Vector3(-0.8, 2.2, 0.2) },
    { id: 'camshaft', name: 'Main Camshaft & Bell-Crank Linkages', pos: new THREE.Vector3(0, 0.4, -0.6) },
    { id: 'crank', name: 'Reduction Gear Hand Crank', pos: new THREE.Vector3(4.1, 1.6, 0.1) },
    { id: 'printer', name: 'Integral Stereotype & Printing Carriage', pos: new THREE.Vector3(-4.4, 2.2, 0.3) }
  ]);

  const setCameraView = React.useCallback((presetName) => {
    const p = CAMERA_PRESETS[presetName] || CAMERA_PRESETS.full;
    targetCameraPosRef.current.copy(p.pos);
    targetCameraLookRef.current.copy(p.look);
  }, []);

  // Expose manual step and camera methods
  useImperativeHandle(ref, () => ({
    triggerCrankStep(degrees = 90) {
      crankAngleRef.current += (degrees * Math.PI) / 180;
      soundEngine.playCrankTick();
    },
    resetCamera() {
      setCameraView('full');
    }
  }));



  useEffect(() => {
    if (cameraPreset) {
      setCameraView(cameraPreset);
    }
  }, [cameraPreset, setCameraView]);

  // X-Ray Mode Material Transparency Update
  useEffect(() => {
    framePartsRef.current.forEach((mesh) => {
      if (mesh && mesh.material) {
        if (isXRay) {
          mesh.material.transparent = true;
          mesh.material.opacity = 0.18;
          mesh.material.wireframe = false;
        } else {
          mesh.material.transparent = false;
          mesh.material.opacity = 1.0;
        }
        mesh.material.needsUpdate = true;
      }
    });
  }, [isXRay]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0e1014);
    scene.fog = new THREE.FogExp2(0x0e1014, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 3.2, 11.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // Keep camera above floor
    controls.minDistance = 2.0;
    controls.maxDistance = 22.0;
    controls.target.set(0, 2.0, 0);

    // 2. Victorian Gallery Lighting
    const ambientLight = new THREE.AmbientLight(0xffecd8, 0.7);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff6e6, 2.0);
    mainKeyLight.position.set(6, 10, 8);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    mainKeyLight.shadow.bias = -0.0001;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xd9ebff, 1.1);
    fillLight.position.set(-8, 6, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffe8ba, 1.4);
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    // Floor Spotlights for Victorian dramatic exhibition feel
    const floorSpot = new THREE.SpotLight(0xffdfa0, 3.5, 14, Math.PI / 6, 0.4);
    floorSpot.position.set(0, 8, 4);
    floorSpot.target.position.set(0, 2, 0);
    scene.add(floorSpot);
    scene.add(floorSpot.target);

    // 3. Materials
    const digitTexture = createDigitTexture();
    const paperTexture = createPaperTexture();

    const castIronMat = new THREE.MeshStandardMaterial({
      color: 0x181a1d,
      roughness: 0.85,
      metalness: 0.45
    });

    const gunmetalBronzeMat = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      roughness: 0.32,
      metalness: 0.88,
      map: digitTexture
    });

    const polishedBrassMat = new THREE.MeshStandardMaterial({
      color: 0xdaa520,
      roughness: 0.22,
      metalness: 0.92
    });

    const polishedSteelMat = new THREE.MeshStandardMaterial({
      color: 0xd6dadf,
      roughness: 0.25,
      metalness: 0.96
    });

    const woodPlinthMat = new THREE.MeshStandardMaterial({
      color: 0x2b1408,
      roughness: 0.45,
      metalness: 0.05
    });

    const printerLeadMat = new THREE.MeshStandardMaterial({
      color: 0x555861,
      roughness: 0.5,
      metalness: 0.6
    });

    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfbf8ee,
      roughness: 0.92,
      metalness: 0.02,
      map: paperTexture
    });

    // 4. Museum Floor & Mahogany Plinth
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x08090b,
      roughness: 0.7,
      metalness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.01;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Heavy Oiled Mahogany Base Plinth (11 ft scale)
    const plinthGeo = new THREE.BoxGeometry(11.2, 0.4, 4.0);
    const plinthMesh = new THREE.Mesh(plinthGeo, woodPlinthMat);
    plinthMesh.position.set(0, 0.2, 0);
    plinthMesh.receiveShadow = true;
    plinthMesh.castShadow = true;
    scene.add(plinthMesh);
    framePartsRef.current.push(plinthMesh);

    // Brass Bevel Edge Trim around Plinth
    const trimGeo = new THREE.BoxGeometry(11.28, 0.05, 4.08);
    const trimMesh = new THREE.Mesh(trimGeo, polishedBrassMat);
    trimMesh.position.set(0, 0.4, 0);
    scene.add(trimMesh);

    // 5. Massive Gothic Cast-Iron End Frames & Top Crossbeam
    const createEndFrame = (xPos) => {
      const frameGroup = new THREE.Group();
      frameGroup.position.x = xPos;

      // Vertical Stanchions
      const leftCol = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.0, 0.45), castIronMat);
      leftCol.position.set(0, 2.2, -0.9);
      leftCol.castShadow = true;
      frameGroup.add(leftCol);

      const rightCol = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.0, 0.45), castIronMat);
      rightCol.position.set(0, 2.2, 0.9);
      rightCol.castShadow = true;
      frameGroup.add(rightCol);

      // Gothic Arch Cross-Tie
      const archTop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 2.2), castIronMat);
      archTop.position.set(0, 4.1, 0);
      archTop.castShadow = true;
      frameGroup.add(archTop);

      const archMid = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 2.2), castIronMat);
      archMid.position.set(0, 2.2, 0);
      frameGroup.add(archMid);

      const archBot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 2.3), castIronMat);
      archBot.position.set(0, 0.45, 0);
      frameGroup.add(archBot);

      // Ornate lightening oval / diamond in cast iron
      const diamondMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 6), castIronMat);
      diamondMesh.rotation.z = Math.PI / 2;
      diamondMesh.position.set(0, 3.2, 0);
      frameGroup.add(diamondMesh);

      scene.add(frameGroup);
      framePartsRef.current.push(leftCol, rightCol, archTop, archMid, archBot, diamondMesh);
      return frameGroup;
    };

    createEndFrame(-3.5); // Left End Frame
    createEndFrame(3.4);  // Right End Frame

    // Heavy Top Bridge Beam
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 0.8), castIronMat);
    topBeam.position.set(-0.05, 4.25, 0);
    topBeam.castShadow = true;
    scene.add(topBeam);
    framePartsRef.current.push(topBeam);

    // Front Brass Nameplate engraved: "CHARLES BABBAGE • DIFFERENCE ENGINE NO. 2 • 1849"
    const plateGeo = new THREE.BoxGeometry(4.2, 0.22, 0.04);
    const plateMesh = new THREE.Mesh(plateGeo, polishedBrassMat);
    plateMesh.position.set(-0.05, 4.25, 0.42);
    scene.add(plateMesh);

    // Bottom Structural Rails
    const bottomRailFront = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.2, 0.25), castIronMat);
    bottomRailFront.position.set(-0.05, 0.5, 0.8);
    scene.add(bottomRailFront);

    const bottomRailBack = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.2, 0.25), castIronMat);
    bottomRailBack.position.set(-0.05, 0.5, -0.8);
    scene.add(bottomRailBack);
    framePartsRef.current.push(bottomRailFront, bottomRailBack);

    // 6. Eight Number Columns (31 Figure Wheels Each = 248 Figure Wheels)
    const wheelRadius = 0.28;
    const wheelHeight = 0.082;
    const wheelSpacing = 0.105;
    const colStartX = -2.8;
    const colStepX = 0.8;
    const wheelBaseY = 0.72;

    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelHeight, 36);
    const gearRingGeo = new THREE.CylinderGeometry(wheelRadius * 0.9, wheelRadius * 0.9, 0.02, 16);
    const separatorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);
    const spindleGeo = new THREE.CylinderGeometry(0.042, 0.042, 3.45, 16);

    const wheelsMatrix = [];

    for (let c = 0; c < NUM_COLUMNS; c++) {
      const colX = colStartX + c * colStepX;
      const colWheels = [];

      // Vertical polished steel spindle shaft
      const spindle = new THREE.Mesh(spindleGeo, polishedSteelMat);
      spindle.position.set(colX, wheelBaseY + (NUM_WHEELS * wheelSpacing) / 2, 0);
      spindle.castShadow = true;
      scene.add(spindle);

      // Top and Bottom Bearing Blocks (Cast Brass)
      const topBearing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.32), polishedBrassMat);
      topBearing.position.set(colX, 4.15, 0);
      scene.add(topBearing);

      const botBearing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.32), polishedBrassMat);
      botBearing.position.set(colX, 0.58, 0);
      scene.add(botBearing);

      // Column Header Brass Indicator Tag
      const tagGeo = new THREE.BoxGeometry(0.48, 0.14, 0.04);
      const tagMesh = new THREE.Mesh(tagGeo, polishedBrassMat);
      tagMesh.position.set(colX, 4.02, 0.28);
      scene.add(tagMesh);

      for (let w = 0; w < NUM_WHEELS; w++) {
        const wheelY = wheelBaseY + w * wheelSpacing;

        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(colX, wheelY, 0);

        // Bronze Engraved Figure Wheel
        const wheelMesh = new THREE.Mesh(wheelGeo, gunmetalBronzeMat);
        wheelMesh.castShadow = true;
        wheelGroup.add(wheelMesh);

        // Attached 10-tooth brass driving gear underneath each wheel
        const gearMesh = new THREE.Mesh(gearRingGeo, polishedBrassMat);
        gearMesh.position.y = -wheelHeight / 2 - 0.01;
        wheelGroup.add(gearMesh);

        // Brass Carry Warning Flag Lever (trips forward on 9->0 roll)
        const tripLeverGeo = new THREE.BoxGeometry(0.08, 0.03, 0.16);
        const tripLever = new THREE.Mesh(tripLeverGeo, polishedBrassMat);
        tripLever.position.set(0.16, 0, 0.15);
        tripLever.rotation.y = -0.3;
        wheelGroup.add(tripLever);

        scene.add(wheelGroup);
        colWheels.push({ group: wheelGroup, tripLever, currentAngle: 0, targetAngle: 0 });

        // Brass separator washer between wheels
        if (w < NUM_WHEELS - 1) {
          const sepMesh = new THREE.Mesh(separatorGeo, polishedBrassMat);
          sepMesh.position.set(colX, wheelY + wheelSpacing / 2, 0);
          scene.add(sepMesh);
        }
      }
      wheelsMatrix.push(colWheels);
    }
    wheelsMapRef.current = wheelsMatrix;

    // 7. Seven Helical Carry Shafts with 30 Spiral Carry Arms each
    const helicalShafts = [];
    const carryArmGeo = new THREE.BoxGeometry(0.18, 0.022, 0.045);
    const helicalSpindleGeo = new THREE.CylinderGeometry(0.026, 0.026, 3.38, 14);

    for (let h = 0; h < NUM_COLUMNS - 1; h++) {
      const shaftX = colStartX + h * colStepX + colStepX / 2;
      const shaftGroup = new THREE.Group();
      shaftGroup.position.set(shaftX, wheelBaseY + (NUM_WHEELS * wheelSpacing) / 2, 0.12);

      // Steel vertical shaft
      const shaftMesh = new THREE.Mesh(helicalSpindleGeo, polishedSteelMat);
      shaftGroup.add(shaftMesh);

      // 30 spiral carry arms staggered around the shaft in a continuous helix
      const armsList = [];
      for (let a = 0; a < NUM_WHEELS - 1; a++) {
        const armMesh = new THREE.Mesh(carryArmGeo, polishedBrassMat);
        const relY = (a - (NUM_WHEELS - 1) / 2) * wheelSpacing;
        const spiralAngle = (a / (NUM_WHEELS - 1)) * Math.PI * 2; // Full 360 deg helix
        armMesh.position.set(0, relY, 0);
        armMesh.rotation.y = spiralAngle;
        shaftGroup.add(armMesh);
        armsList.push(armMesh);
      }

      scene.add(shaftGroup);
      helicalShafts.push({ group: shaftGroup, arms: armsList, rotSpeed: 0 });
    }
    helicalShaftsRef.current = helicalShafts;

    // 8. Main Drive Camshaft & Bell-Crank Linkages (Lower Rear)
    const mainShaftGroup = new THREE.Group();
    mainShaftGroup.position.set(0, 0.65, -0.65);

    const mainShaftBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 7.8, 16),
      polishedSteelMat
    );
    mainShaftBar.rotation.z = Math.PI / 2;
    mainShaftGroup.add(mainShaftBar);

    // Cam Lobes along the shaft
    for (let i = 0; i < 16; i++) {
      const camLobe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16),
        polishedBrassMat
      );
      camLobe.rotation.z = Math.PI / 2;
      camLobe.position.set(-3.2 + i * 0.45, 0.04, 0);
      mainShaftGroup.add(camLobe);

      // Bell crank rocker arm
      const rockerArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.6, 0.12),
        polishedSteelMat
      );
      rockerArm.position.set(-3.2 + i * 0.45, 0.35, 0.15);
      rockerArm.rotation.x = 0.3;
      mainShaftGroup.add(rockerArm);
    }
    scene.add(mainShaftGroup);
    mainCamshaftRef.current = mainShaftGroup;

    // 9. Crank Handle and Reduction Gear Train (Right Flank)
    const crankGroup = new THREE.Group();
    crankGroup.position.set(3.7, 1.6, 0);

    // Large reduction spur gear (Brass)
    const spurGear = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.1, 32),
      polishedBrassMat
    );
    spurGear.rotation.z = Math.PI / 2;
    crankGroup.add(spurGear);

    // Pinion gear
    const pinionGear = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.12, 20),
      polishedSteelMat
    );
    pinionGear.rotation.z = Math.PI / 2;
    pinionGear.position.set(0.08, -0.6, 0);
    crankGroup.add(pinionGear);

    // Crank arm
    const crankArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.75, 0.12),
      castIronMat
    );
    crankArm.position.set(0.12, 0.32, 0);
    crankGroup.add(crankArm);

    // Turned wooden handle
    const crankHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.35, 16),
      woodPlinthMat
    );
    crankHandle.rotation.x = Math.PI / 2;
    crankHandle.position.set(0.26, 0.65, 0.15);
    crankGroup.add(crankHandle);
    crankHandleGripRef.current = crankHandle;

    scene.add(crankGroup);
    crankAssemblyRef.current = crankGroup;

    // 10. Integral Printing & Stereotyping Subsystem (Left Flank)
    const printerGroup = new THREE.Group();
    printerGroup.position.set(-4.25, 0.65, 0);

    // Printer cast-iron mounting bracket
    const printBracket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.4, 0.8), castIronMat);
    printBracket.position.set(0, 1.6, 0);
    printerGroup.add(printBracket);
    framePartsRef.current.push(printBracket);

    // 31 Typeface Wheels in Printer Lead
    const typewheels = [];
    const typeGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.07, 24);
    for (let w = 0; w < NUM_WHEELS; w++) {
      const typeMesh = new THREE.Mesh(typeGeo, printerLeadMat);
      typeMesh.position.set(0.25, w * wheelSpacing, 0);
      printerGroup.add(typeMesh);
      typewheels.push(typeMesh);
    }
    printerTypewheelsRef.current = typewheels;

    // Heavy Cam-Driven Impression Hammer
    const hammerArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.8, 0.35), castIronMat);
    hammerArm.position.set(-0.25, 1.8, 0.4);
    printerGroup.add(hammerArm);
    printerHammerRef.current = hammerArm;

    // Stereotype Casting Tray (Soft plaster/metal plate tray)
    const stereoTray = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 1.4), printerLeadMat);
    stereoTray.position.set(-0.35, 0.25, 0.4);
    printerGroup.add(stereoTray);

    // Brass Paper Feed Roll and Reel
    const paperReelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.7, 24),
      paperMat
    );
    paperReelMesh.rotation.z = Math.PI / 2;
    paperReelMesh.position.set(-0.35, 3.2, 0.45);
    printerGroup.add(paperReelMesh);

    // Continuous Printed Paper Strip Ribbon
    const paperStripGeo = new THREE.PlaneGeometry(0.65, 2.6);
    const paperStrip = new THREE.Mesh(paperStripGeo, paperMat);
    paperStrip.position.set(-0.35, 1.6, 0.72);
    printerGroup.add(paperStrip);
    printerPaperRef.current = paperStrip;

    // Brass Paper Catch Tray
    const catchTray = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.6), polishedBrassMat);
    catchTray.position.set(-0.35, 0.1, 0.85);
    printerGroup.add(catchTray);

    scene.add(printerGroup);

    // 11. Responsive Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 12. Main Render & Animation Loop
    let animationFrameId;
    let lastTime = performance.now();
    let accumulatedCrank = 0;

    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Handle Auto-Run Crank Rotation
      if (isAutoRunning) {
        const crankDelta = dt * 1.8 * autoSpeed;
        crankAngleRef.current += crankDelta;
        accumulatedCrank += crankDelta;

        if (accumulatedCrank >= Math.PI / 5) {
          soundEngine.playCrankTick();
          accumulatedCrank = 0;
        }

        // Complete full 360-degree cycle
        if (crankAngleRef.current >= Math.PI * 2) {
          crankAngleRef.current %= (Math.PI * 2);
          if (onCrankTurnedRef.current) {
            onCrankTurnedRef.current();
          }
        }
      }

      // Smooth Camera Transition to Target Preset
      camera.position.lerp(targetCameraPosRef.current, dt * 3.5);
      controls.target.lerp(targetCameraLookRef.current, dt * 3.5);
      controls.update();

      // Rotate Crank Handle & Reduction Gearbox
      if (crankAssemblyRef.current) {
        crankAssemblyRef.current.rotation.x = crankAngleRef.current;
      }

      // Rotate Main Camshaft (1:1 with crank through reduction)
      if (mainCamshaftRef.current) {
        mainCamshaftRef.current.rotation.x = -crankAngleRef.current;
      }

      // Mechanical Subsystem Phases based on Crank Angle (0 to 2*PI)
      const normalizedAngle = crankAngleRef.current % (Math.PI * 2);

      // Phase 2: Helical Carry Sweep (Angle between PI/2 and 4*PI/3)
      const isCarryPhase = normalizedAngle > Math.PI * 0.4 && normalizedAngle < Math.PI * 1.4;
      helicalShaftsRef.current.forEach((shaft) => {
        if (shaft.group) {
          if (isCarryPhase) {
            shaft.group.rotation.y += dt * 6.0;
          }
        }
      });

      // Phase 4: Printer Hammer Strike (Angle between 5*PI/3 and 2*PI)
      if (printerHammerRef.current) {
        if (normalizedAngle > Math.PI * 1.65 && normalizedAngle < Math.PI * 1.95) {
          printerHammerRef.current.rotation.x = Math.sin((normalizedAngle - Math.PI * 1.65) * 10) * 0.35;
        } else {
          printerHammerRef.current.rotation.x = 0;
        }
      }

      // Update 248 Figure Wheels to Match Mathematical Engine State
      if (engineState && wheelsMapRef.current.length === NUM_COLUMNS) {
        for (let c = 0; c < NUM_COLUMNS; c++) {
          const colDigits = engineState.columns[c];
          for (let w = 0; w < NUM_WHEELS; w++) {
            const digit = colDigits ? colDigits[w] : 0;
            const targetRot = (digit / 10) * (Math.PI * 2);
            const wheelData = wheelsMapRef.current[c][w];
            if (wheelData && wheelData.group) {
              // Smoothly interpolate wheel rotation
              wheelData.group.rotation.y = THREE.MathUtils.lerp(
                wheelData.group.rotation.y,
                targetRot,
                dt * 8.0
              );

              // Visual trip lever when carry warning is active
              const hasCarry = engineState.carryWarnings && engineState.carryWarnings[c][w];
              if (wheelData.tripLever) {
                wheelData.tripLever.rotation.y = THREE.MathUtils.lerp(
                  wheelData.tripLever.rotation.y,
                  hasCarry ? 0.35 : -0.3,
                  dt * 10.0
                );
              }
            }
          }
        }
      }

      // Update Typeface Wheels from Column 0
      if (engineState && printerTypewheelsRef.current.length === NUM_WHEELS) {
        const col0Digits = engineState.columns[0];
        for (let w = 0; w < NUM_WHEELS; w++) {
          const digit = col0Digits ? col0Digits[w] : 0;
          const targetRot = (digit / 10) * (Math.PI * 2);
          const typeMesh = printerTypewheelsRef.current[w];
          if (typeMesh) {
            typeMesh.rotation.y = THREE.MathUtils.lerp(typeMesh.rotation.y, targetRot, dt * 8.0);
          }
        }
      }

      // Calculate Screen-Space 2D Coordinates for 3D Overlay Labels
      if (showLabels && camera) {
        const labelsData = subsystemAnchors.current.map((anchor) => {
          const v = anchor.pos.clone();
          v.project(camera);
          const isBehind = v.z > 1;
          const x = ((v.x + 1) / 2) * width;
          const y = ((-v.y + 1) / 2) * height;
          return {
            id: anchor.id,
            name: anchor.name,
            x,
            y,
            visible: !isBehind && x > 0 && x < width && y > 0 && y < height
          };
        });
        setScreenLabels(labelsData);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [engineState, isAutoRunning, autoSpeed, showLabels]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Spatial Interactive Subsystem Labels */}
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {screenLabels.map((lbl) =>
            lbl.visible ? (
              <div
                key={lbl.id}
                style={{
                  transform: `translate(${lbl.x}px, ${lbl.y}px)`,
                  transition: 'transform 0.05s linear'
                }}
                className="absolute -translate-x-1/2 -translate-y-full mb-3 flex flex-col items-center group pointer-events-auto"
              >
                <div className="bg-[#1b1916]/90 text-[#e6c989] text-[11px] font-serif border border-[#8a652a] px-2.5 py-1 rounded-sm shadow-xl tracking-wider uppercase backdrop-blur-md whitespace-nowrap flex items-center gap-1.5 hover:border-[#daa520] hover:text-[#fff1c4] transition-all">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#daa520] animate-pulse"></span>
                  {lbl.name}
                </div>
                <div className="w-[1px] h-3 bg-gradient-to-b from-[#8a652a] to-transparent"></div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
});
