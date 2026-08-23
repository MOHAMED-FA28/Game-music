// ================================================================
//  كود الهالوين - الديكورات الموسمية (ثلج، قرع، أشباح، أوراق، بريق)
//  مستخرج من الملف الأصلي مع الحفاظ على جميع التفاصيل
// ================================================================

// --- الثوابت الخاصة بالهالوين ---
const PUMPKIN_GLB_URL = "https://cdn.jsdelivr.net/gh/MOHAMED-FA28/Game-music@b99f63478974ba12d2b1190fca49b809c4ffbe6b/halloween_pumpkin.glb";

// --- المتغيرات العامة للديكورات ---
let snowParticles = null;
let snowGeometry = null;
let snowPositions = null;
let snowVelocity = null;
let snowCount = 800;
let pumpkinModels = [];
let smallPumpkins = [];
let ghosts = [];
let leaves = null;
let sparkles = null;

// ================================================================
//  1. دالة تحميل نموذج القرع الرئيسي المزدوج (باستخدام GLTF)
// ================================================================
function loadTwoPumpkins(sceneRef) {
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load(PUMPKIN_GLB_URL, (gltf) => {
    const model = gltf.scene;
    // حساب حجم النموذج لتوحيد القياس
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const maxSize = Math.max(size.x, size.y, size.z);
    let scale = 1;
    if (maxSize > 0) {
      const targetSize = 3.0;
      scale = targetSize / maxSize;
    }

    // دالة مساعدة لإنشاء نسخة من القرع في موقع معين
    function createPumpkinAt(posX, posZ, rotY) {
      const clone = model.clone();
      clone.scale.setScalar(scale);
      // توسيط النموذج بحيث يكون قاعه عند y = -1
      clone.updateMatrixWorld(true);
      const cloneBox = new THREE.Box3().setFromObject(clone);
      const cloneCenter = new THREE.Vector3();
      cloneBox.getCenter(cloneCenter);
      clone.position.sub(cloneCenter);
      clone.updateMatrixWorld(true);
      const bottomBox = new THREE.Box3().setFromObject(clone);
      const bottomY = bottomBox.min.y;
      clone.position.y += -1 - bottomY;
      // تحديد الموقع النهائي
      clone.position.x = posX;
      clone.position.z = posZ;
      clone.rotation.y = rotY;
      // تفعيل الظلال
      clone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      sceneRef.add(clone);
      pumpkinModels.push(clone);
      return clone;
    }

    // إنشاء قرعين في مواقع متماثلة (يسار ويمين)
    const rotY = 5;  // يمكن تعديله حسب اتجاه النموذج
    createPumpkinAt(-6.5, -2.8, rotY);
    createPumpkinAt(6.5, -2.8, rotY);
    console.log('تم تحميل نموذجي القرع بنجاح');
  }, undefined, (error) => {
    console.warn('فشل تحميل نموذج القرع، إنشاء قرعين احتياطيين', error);
    createFallbackPumpkins(sceneRef);
  });
}

// ================================================================
//  2. إنشاء قرعين احتياطيين (بدون تحميل نموذج خارجي)
// ================================================================
function createFallbackPumpkins(sceneRef) {
  function createFallbackPumpkinAt(posX, posZ, rotY) {
    const group = new THREE.Group();
    const s = 1.0;
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.7, emissive: 0x442200, emissiveIntensity: 0.1 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.8 * s, 24, 24), bodyMat);
    body.scale.set(1, 0.9, 1);
    body.position.y = 0.6 * s;
    group.add(body);

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d5a1e, roughness: 0.9 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.15 * s, 0.25 * s, 8), stemMat);
    stem.position.y = 1.2 * s;
    stem.rotation.x = 0.2;
    group.add(stem);

    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const eyeGeo = new THREE.ConeGeometry(0.15 * s, 0.1 * s, 3);
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-0.3 * s, 0.75 * s, 0.7 * s);
    eye1.rotation.x = Math.PI / 2;
    eye1.rotation.z = 0.2;
    group.add(eye1);
    const eye2 = eye1.clone();
    eye2.position.set(0.3 * s, 0.75 * s, 0.7 * s);
    eye2.rotation.x = Math.PI / 2;
    eye2.rotation.z = -0.2;
    group.add(eye2);

    const mouthShape = new THREE.Shape();
    mouthShape.moveTo(-0.4 * s, 0);
    mouthShape.quadraticCurveTo(0, -0.3 * s, 0.4 * s, 0);
    const mouthGeo = new THREE.ShapeGeometry(mouthShape);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.5 * s, 0.75 * s);
    mouth.rotation.x = -0.2;
    group.add(mouth);

    group.position.set(posX, -1, posZ);
    group.rotation.y = rotY;
    sceneRef.add(group);
    pumpkinModels.push(group);
    return group;
  }

  createFallbackPumpkinAt(-6.5, -2.8, 0);
  createFallbackPumpkinAt(6.5, -2.8, 0);
  console.log('تم إنشاء قرعين احتياطيين');
}

// ================================================================
//  3. إنشاء قرع صغير (مجموعة من الكرات مع ساق)
// ================================================================
function createSmallPumpkin(scale) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  const material = new THREE.MeshStandardMaterial({ color: 0xe55b08, roughness: 0.7, emissive: 0x421400, emissiveIntensity: 0.25 });
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 18, 14), material);
    mesh.scale.set(0.58, 1, 0.48);
    mesh.position.x = Math.sin(angle) * 0.28;
    mesh.rotation.y = angle;
    mesh.castShadow = true;
    group.add(mesh);
  }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.35, 10), new THREE.MeshStandardMaterial({ color: 0x416e25 }));
  stem.position.y = 0.75;
  group.add(stem);
  return group;
}

// ================================================================
//  4. إنشاء شبح (جسم كروي مع ذيول وعيون)
// ================================================================
function createGhost(scale) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  const material = new THREE.MeshStandardMaterial({ color: 0xf4eaff, roughness: 0.55, emissive: 0x35174a, emissiveIntensity: 0.18 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 20), material);
  body.scale.set(0.9, 1.15, 0.75);
  body.position.y = 0.45;
  group.add(body);
  for (let i = 0; i < 4; i++) {
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), material);
    tail.scale.set(0.9, 0.55, 0.8);
    tail.position.set(-0.42 + i * 0.28, -0.32 + Math.abs(i - 1.5) * 0.06, 0);
    group.add(tail);
  }
  const black = new THREE.MeshBasicMaterial({ color: 0x18091e });
  const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), black);
  eye1.position.set(-0.22, 0.55, 0.62);
  const eye2 = eye1.clone();
  eye2.position.x = 0.22;
  group.add(eye1, eye2);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.035, 8, 20), black);
  mouth.scale.set(0.8, 1.3, 1);
  mouth.position.set(0, 0.32, 0.64);
  group.add(mouth);
  return group;
}

// ================================================================
//  5. إنشاء حلوى (3 أنواع)
// ================================================================
function createCandy(type) {
  const group = new THREE.Group();
  if (type === 0) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    stick.position.y = -0.2;
    group.add(stick);
    const candy = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), new THREE.MeshStandardMaterial({ color: 0xff315d, roughness: 0.3 }));
    candy.position.y = 0.12;
    group.add(candy);
  } else if (type === 1) {
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.35 }));
    group.add(center);
    const wrapper = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.25, 4), center.material);
    wrapper.rotation.z = Math.PI / 2;
    wrapper.position.x = -0.25;
    const wrapper2 = wrapper.clone();
    wrapper2.position.x = 0.25;
    group.add(wrapper, wrapper2);
  } else {
    const candy = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.5 }));
    candy.scale.y = 0.75;
    group.add(candy);
  }
  return group;
}

// ================================================================
//  6. الدالة الرئيسية لإضافة جميع ديكورات الهالوين إلى المشهد
// ================================================================
function addHalloweenDecorations(sceneRef) {
  if (!sceneRef) return;

  // 6.1 الثلج الأبيض (نقاط متحركة)
  const count = snowCount;
  const positions = new Float32Array(count * 3);
  const velocity = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    velocity[i] = 0.006 + Math.random() * 0.018;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.055, transparent: true, opacity: 0.82, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  sceneRef.add(points);
  snowParticles = points;
  snowGeometry = geo;
  snowPositions = positions;
  snowVelocity = velocity;

  // 6.2 تحميل القرع الرئيسي المزدوج (غير متزامن)
  loadTwoPumpkins(sceneRef);

  // 6.3 قرع صغير في أربعة مواقع
  const smallPositions = [
    [-3.5, -0.35, 0.5, 0.65],
    [3.5, -0.35, 0.5, 0.65],
    [-5, -0.55, -1, 0.45],
    [5, -0.55, -1, 0.45]
  ];
  for (const p of smallPositions) {
    const pumpkin = createSmallPumpkin(p[3]);
    pumpkin.position.set(p[0], p[1], p[2]);
    sceneRef.add(pumpkin);
    smallPumpkins.push(pumpkin);
  }

  // 6.4 أشباح متحركة
  const ghostData = [
    [-3.3, 2, -1.3, 0.8],
    [3.5, 2.5, -1.7, 0.65],
    [-5.3, 3.6, -2, 0.45],
    [5.2, 3.8, -2, 0.5]
  ];
  for (const p of ghostData) {
    const ghost = createGhost(p[3]);
    ghost.position.set(p[0], p[1], p[2]);
    sceneRef.add(ghost);
    ghosts.push({ mesh: ghost, x: p[0], y: p[1], phase: Math.random() * 6 });
  }

  // 6.5 حلوى متناثرة على الأرض (35 قطعة)
  const candies = [];
  for (let i = 0; i < 35; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 7;
    const candy = createCandy(i % 3);
    candy.position.set(Math.cos(angle) * radius, -0.75 + Math.random() * 0.08, Math.sin(angle) * radius - 1);
    candy.rotation.y = Math.random() * Math.PI;
    candy.scale.setScalar(0.55 + Math.random() * 0.45);
    sceneRef.add(candy);
    candies.push(candy);
  }

  // 6.6 أوراق الخريف (380 ورقة بألوان خريفية)
  const leafCount = 380;
  const leafPositions = new Float32Array(leafCount * 3);
  const leafVelocityArr = new Float32Array(leafCount);
  const leafPhaseArr = new Float32Array(leafCount);
  const leafColors = new Float32Array(leafCount * 3);
  const autumnColors = [
    [1, 0.25, 0.03],
    [1, 0.5, 0.05],
    [0.8, 0.12, 0.02],
    [1, 0.72, 0.1],
    [0.55, 0.08, 0.01]
  ];
  for (let i = 0; i < leafCount; i++) {
    leafPositions[i * 3] = (Math.random() - 0.5) * 16;
    leafPositions[i * 3 + 1] = Math.random() * 11;
    leafPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    leafVelocityArr[i] = 0.008 + Math.random() * 0.018;
    leafPhaseArr[i] = Math.random() * Math.PI * 2;
    const c = autumnColors[Math.floor(Math.random() * autumnColors.length)];
    leafColors[i * 3] = c[0];
    leafColors[i * 3 + 1] = c[1];
    leafColors[i * 3 + 2] = c[2];
  }
  const leafGeo = new THREE.BufferGeometry();
  leafGeo.setAttribute('position', new THREE.BufferAttribute(leafPositions, 3));
  leafGeo.setAttribute('color', new THREE.BufferAttribute(leafColors, 3));
  leaves = new THREE.Points(leafGeo, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
  sceneRef.add(leaves);

  // 6.7 جزيئات متلألئة (160 نقطة براقة)
  const sparkleCount = 160;
  const sparklePos = new Float32Array(sparkleCount * 3);
  for (let i = 0; i < sparkleCount; i++) {
    sparklePos[i * 3] = (Math.random() - 0.5) * 13;
    sparklePos[i * 3 + 1] = Math.random() * 8;
    sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 7;
  }
  const sparkleGeo = new THREE.BufferGeometry();
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
  sparkles = new THREE.Points(sparkleGeo, new THREE.PointsMaterial({ color: 0xffa84c, size: 0.035, transparent: true, opacity: 0.65, depthWrite: false }));
  sceneRef.add(sparkles);

  // حفظ المراجع في النافذة لتحديثها في حلقة الأنيميشن
  window.__candies = candies;
  window.__leafPositions = leafPositions;
  window.__leafVelocity = leafVelocityArr;
  window.__leafPhase = leafPhaseArr;
  window.__leafCount = leafCount;
  window.__leafGeo = leafGeo;
  window.__sparkles = sparkles;
}

// ================================================================
//  7. تحديث ديكورات الهالوين في كل إطار (حركة الثلج، الأشباح، الأوراق، البريق)
// ================================================================
function updateHalloweenDecorations(time) {
  // تحديث الثلج
  if (snowGeometry && snowPositions) {
    const pos = snowPositions;
    for (let i = 0; i < snowCount; i++) {
      pos[i * 3 + 1] -= snowVelocity[i];
      pos[i * 3] += Math.sin(time * 0.6 + i) * 0.0015;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 20;
        pos[i * 3] = (Math.random() - 0.5) * 40;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      }
    }
    snowGeometry.attributes.position.needsUpdate = true;
  }

  // تحديث الأشباح (حركة اهتزازية)
  for (const ghost of ghosts) {
    ghost.mesh.position.y = ghost.y + Math.sin(time * 1.1 + ghost.phase) * 0.22;
    ghost.mesh.position.x = ghost.x + Math.sin(time * 0.45 + ghost.phase) * 0.12;
    ghost.mesh.rotation.z = Math.sin(time * 0.8 + ghost.phase) * 0.08;
  }

  // تحديث الأوراق (سقوط مع حركة جانبية)
  if (window.__leafGeo && window.__leafPositions) {
    const positions = window.__leafPositions;
    const count = window.__leafCount;
    const vel = window.__leafVelocity;
    const phase = window.__leafPhase;
    for (let i = 0; i < count; i++) {
      const n = i * 3;
      positions[n + 1] -= vel[i];
      positions[n] += Math.sin(time * 0.9 + phase[i]) * 0.004;
      positions[n + 2] += Math.cos(time * 0.7 + phase[i]) * 0.003;
      if (positions[n + 1] < -0.9) {
        positions[n] = (Math.random() - 0.5) * 16;
        positions[n + 1] = 10 + Math.random() * 4;
        positions[n + 2] = (Math.random() - 0.5) * 8;
      }
    }
    window.__leafGeo.attributes.position.needsUpdate = true;
  }

  // وميض الجزيئات المتلألئة (تغيير الشفافية)
  if (window.__sparkles) {
    window.__sparkles.material.opacity = 0.45 + Math.sin(time * 2) * 0.18;
  }

  // تدوير الحلوى ببطء
  if (window.__candies) {
    for (const candy of window.__candies) {
      candy.rotation.y += 0.0008;
    }
  }
}