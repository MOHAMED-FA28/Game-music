/**
 * =====================================================================
 *  كود JavaScript الخاص بعناصر أجواء العيد (كريسماس)
 *  تم استخراجه من المشروع الكامل، مع الحفاظ على جميع الخصائص والمواقع
 *  والحركات والأحجام كما هي.
 * =====================================================================
 */

// ===== المتغيرات العامة الخاصة بالكريسماس =====
let snowParticles = null;          // نظام الجسيمات (الثلج)
let snowGeometry = null;           // هندسة الجسيمات
let snowPositions = null;          // مصفوفة مواقع الجسيمات
let snowVelocity = null;           // مصفوفة سرعات الجسيمات (السقوط)
const snowCount = 800;             // عدد حبات الثلج
let christmasTrees = [];           // مصفوفة تحتوي على مجموعات الأشجار
let christmasGifts = [];           // مصفوفة تحتوي على مجموعات الهدايا
let starGlowLights = [];           // مصفوفة تحتوي على أضواء الشجرة مع بيانات الوميض
let treeOrnaments = [];            // مصفوفة تحتوي على كرات الزينة (اختياري)

// ===== متغيرات النص المتحرك "2027" =====
let yearTextSprite = null;         // كائن Sprite للنص
let yearTextX = 0;                 // الموضع الأفقي الحالي
const YEAR_TEXT_SPEED = 0.012;     // سرعة الحركة (بطيئة جداً)

// =====================================================================
//  دالة إنشاء النص المتحرك "2027" كـ Sprite ثلاثي الأبعاد
//  - يوضع في منتصف السماء (ارتفاع 5.5) وليس منتصف الشاشة
//  - يتحرك من اليمين إلى اليسار ببطء شديد
// =====================================================================
function createYearTextSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // رسم النص باللون الأبيض مع شفافية
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = 'bold 120px "Bebas Neue", "Luckiest Guy", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('2027', canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide
  });

  const sprite = new THREE.Sprite(material);
  // حجم مناسب للسماء
  sprite.scale.set(12, 3.8, 1);
  // الموضع: في منتصف السماء (ارتفاع 3.5، عمق -8)
  sprite.position.set(0, 3.5, -8);
  sprite.renderOrder = -1; // يظهر في الخلفية

  return sprite;
}

// =====================================================================
//  دالة إنشاء شجرة عيد الميلاد كاملة مع جميع التفاصيل:
//  - جذع، طبقات مخروطية، أغصان، زينة، إكليل مضيء، أضواء صغيرة، نجمة
// =====================================================================
function createChristmasTree(sceneRef, posX, posZ, scaleFactor, rotationY) {
  const treeGroup = new THREE.Group();
  const s = scaleFactor || 0.38;        // الحجم الأساسي
  const rotY = rotationY || Math.random() * Math.PI * 2;

  // ---- الجذع ----
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38 * s, 0.52 * s, 3.1 * s, 16),
    new THREE.MeshStandardMaterial({ color: 0x59331c, roughness: 0.95 })
  );
  trunk.position.y = 1.55 * s;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // ---- طبقات الشجرة (مخاريط متداخلة) ----
  function addLayer(radius, height, y) {
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(radius * s, height * s, 48, 4),
      new THREE.MeshStandardMaterial({ color: 0x0d6b3c, roughness: 0.82, metalness: 0.02 })
    );
    mesh.position.y = y * s;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    treeGroup.add(mesh);
    return mesh;
  }
  addLayer(3.45, 3.7, 3.1);
  addLayer(3.0, 3.45, 4.55);
  addLayer(2.5, 3.15, 5.9);
  addLayer(1.95, 2.85, 7.12);
  addLayer(1.4, 2.6, 8.2);

  // ---- أغصان صغيرة (عشوائية) ----
  const branchMat = new THREE.MeshStandardMaterial({ color: 0x12864d, roughness: 0.74 });
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const y = 2.6 + Math.random() * 5.2;
    let radius = 2.9;
    if (y > 4) radius = 2.35;
    if (y > 5.3) radius = 1.85;
    if (y > 6.8) radius = 1.3;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055 * s, 0.11 * s, radius * 0.85 * s, 8),
      branchMat
    );
    branch.position.set(
      Math.cos(angle) * radius * 0.45 * s,
      y * s,
      Math.sin(angle) * radius * 0.45 * s
    );
    branch.rotation.z = Math.sin(angle) * 0.35;
    branch.rotation.y = -angle;
    branch.castShadow = true;
    treeGroup.add(branch);
  }

  // ---- الزينة (كرات ملونة) ----
  const colors = [0xff273f, 0xffd34d, 0x3ec8ff, 0xffffff, 0xff67be];
  const ornamentPositions = [
    [0.0, 3.0, 3.1], [1.4, 3.25, 2.5], [-1.3, 3.35, 2.5],
    [0.8, 4.25, 2.8], [-1.4, 4.55, 2.1], [1.9, 4.55, 0.8],
    [-0.4, 4.65, -2.5], [0.0, 5.35, 2.65], [1.35, 5.65, 1.55],
    [-1.45, 5.7, 1.0], [0.45, 5.95, -2.0], [0.95, 6.55, 1.65],
    [-0.95, 6.7, 1.45], [1.2, 6.9, -0.5], [-0.8, 7.05, -0.9],
    [0.0, 7.55, 1.1], [0.7, 7.8, -0.6], [-0.55, 8.0, -0.5]
  ];
  ornamentPositions.forEach((p, idx) => {
    const color = colors[idx % colors.length];
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.17 * s * (0.85 + Math.random() * 0.35), 20, 20),
      new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.38,
        emissive: color,
        emissiveIntensity: 0.12
      })
    );
    ball.position.set(p[0] * s, p[1] * s, p[2] * s);
    ball.castShadow = true;
    treeGroup.add(ball);
    treeOrnaments.push(ball);

    // غطاء صغير للكرة
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035 * s, 0.035 * s, 0.08 * s, 10),
      new THREE.MeshStandardMaterial({ color: 0xd6d6d6, metalness: 0.8, roughness: 0.18 })
    );
    cap.position.set(p[0] * s, (p[1] + 0.2) * s, p[2] * s);
    treeGroup.add(cap);
  });

  // ---- الإكليل الحلزوني المضيء ----
  const garlandPoints = [];
  for (let y = 2.8; y <= 8.25; y += 0.085) {
    const t = (y - 2.8) / (8.25 - 2.8);
    const radius = (3.0 * (1 - t) + 0.75 * t) * s;
    const angle = y * 2.9;
    garlandPoints.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      y * s,
      Math.sin(angle) * radius
    ));
  }
  if (garlandPoints.length > 2) {
    const garlandCurve = new THREE.CatmullRomCurve3(garlandPoints);
    const garland = new THREE.Mesh(
      new THREE.TubeGeometry(garlandCurve, 200, 0.025 * s, 6, false),
      new THREE.MeshStandardMaterial({
        color: 0xffd44d,
        emissive: 0xff9d18,
        emissiveIntensity: 1.0,
        metalness: 0.3,
        roughness: 0.25
      })
    );
    treeGroup.add(garland);
  }

  // ---- أضواء صغيرة (وميض) ----
  const lightColors = [0xff3e58, 0xffdd55, 0x56d7ff, 0xffffff];
  for (let i = 0; i < 60; i++) {
    const t = i / 59;
    const y = 2.75 + t * 5.55;
    const radius = (3.05 * (1 - t) + 0.65 * t) * s;
    const angle = t * Math.PI * 18;
    const color = lightColors[i % lightColors.length];
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.045 * s, 8, 8),
      new THREE.MeshBasicMaterial({ color: color })
    );
    bulb.position.set(
      Math.cos(angle) * radius,
      y * s,
      Math.sin(angle) * radius
    );
    treeGroup.add(bulb);
    // تخزين معلومات الوميض
    starGlowLights.push({ mesh: bulb, color: color, phase: i * 0.72 });
  }

  // ---- النجمة في الأعلى ----
  const starGroup = new THREE.Group();
  starGroup.position.y = 9.72 * s;
  treeGroup.add(starGroup);

  const starShape = new THREE.Shape();
  const spikes = 5;
  const outer = 0.78 * s;
  const inner = 0.32 * s;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = Math.PI / 2 + i * Math.PI / spikes;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();
  const starGeo = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.22 * s,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.035 * s,
    bevelThickness: 0.035 * s
  });
  starGeo.center();
  const starMesh = new THREE.Mesh(
    starGeo,
    new THREE.MeshStandardMaterial({
      color: 0xffe98a,
      emissive: 0xffb300,
      emissiveIntensity: 2.2,
      metalness: 0.5,
      roughness: 0.18
    })
  );
  starMesh.castShadow = true;
  starGroup.add(starMesh);

  // ---- وضع المجموعة في المشهد ----
  treeGroup.position.set(posX, -1.14, posZ); // ارتفاع القاعدة -1.14
  treeGroup.rotation.y = rotY;
  sceneRef.add(treeGroup);
  christmasTrees.push(treeGroup);
  return treeGroup;
}

// =====================================================================
//  دالة إنشاء هدية (صندوق مع شريط)
// =====================================================================
function createGift(sceneRef, posX, posZ, color, size) {
  const sz = size || 0.6;                    // الحجم الأساسي
  const group = new THREE.Group();
  group.position.set(posX, -1.14 + 0.48 * sz, posZ); // ارتفاع القاعدة + نصف الارتفاع

  // صندوق
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.75 * sz, 0.65 * sz, 0.75 * sz),
    new THREE.MeshStandardMaterial({ color: color || 0xb9293d, roughness: 0.55 })
  );
  box.castShadow = true;
  box.receiveShadow = true;
  group.add(box);

  // شريط (صليب)
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0xffe6a5,
    metalness: 0.3,
    roughness: 0.25
  });
  const rx = new THREE.Mesh(
    new THREE.BoxGeometry(0.11 * sz, 0.68 * sz, 0.79 * sz),
    ribbonMat
  );
  const rz = new THREE.Mesh(
    new THREE.BoxGeometry(0.79 * sz, 0.68 * sz, 0.11 * sz),
    ribbonMat
  );
  group.add(rx);
  group.add(rz);

  sceneRef.add(group);
  christmasGifts.push(group);
  return group;
}

// =====================================================================
//  دالة إنشاء نظام الجسيمات الخاص بالثلج
// =====================================================================
function createSnowParticles(sceneRef) {
  const count = snowCount;
  const positions = new Float32Array(count * 3);
  const velocity = new Float32Array(count);

  // توزيع عشوائي في مربع 40x20x40
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    velocity[i] = 0.006 + Math.random() * 0.018; // سرعة سقوط متفاوتة
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.055,          // حجم حبة الثلج
    transparent: true,
    opacity: 0.82,
    depthWrite: false
  });

  const points = new THREE.Points(geo, mat);
  sceneRef.add(points);

  // تخزين المراجع للتحديث
  snowParticles = points;
  snowGeometry = geo;
  snowPositions = positions;
  snowVelocity = velocity;

  return points;
}

// =====================================================================
//  دالة تحديث الثلج (تتحرك لأسفل مع تمايل جانبي)
// =====================================================================
function updateSnow(time) {
  if (!snowGeometry || !snowPositions) return;
  const pos = snowPositions;
  for (let i = 0; i < snowCount; i++) {
    // سقوط رأسي
    pos[i * 3 + 1] -= snowVelocity[i];
    // تمايل جانبي (حركة جيبية)
    pos[i * 3] += Math.sin(time * 0.6 + i) * 0.0015;

    // إعادة التدوير عند الوصول للأرض
    if (pos[i * 3 + 1] < 0) {
      pos[i * 3 + 1] = 20;
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
  }
  snowGeometry.attributes.position.needsUpdate = true;
}

// =====================================================================
//  دالة تحديث أضواء الشجرة (وميض نابض)
// =====================================================================
function updateTreeLights(time) {
  for (const bulb of starGlowLights) {
    // تذبذب بين 0.7 و 1.4 تقريباً
    const pulse = 0.65 + Math.sin(time * 3 + bulb.phase) * 0.35;
    bulb.mesh.scale.setScalar(0.7 + pulse * 0.55);
    bulb.mesh.material.opacity = 0.7 + pulse * 0.3;
  }
}

// =====================================================================
//  دالة إضافة جميع ديكورات الكريسماس إلى المشهد (استدعاء شامل)
// =====================================================================
function addChristmasDecorationsToScene(sceneRef) {
  if (!sceneRef) return;

  // 1. إنشاء نظام الثلج
  createSnowParticles(sceneRef);

  // 2. وضع الشجرتين في الخلفية (z أبعد) وبعيدة عن الحواف
  const treePositions = [
    { x: -6.5, z: -2.8, rot: 0.3 },
    { x: 6.5, z: -2.8, rot: 2.7 }
  ];
  for (const pos of treePositions) {
    const scale = 0.45;              // حجم الشجرة
    createChristmasTree(sceneRef, pos.x, pos.z, scale, pos.rot);
  }

  // 3. وضع 12 هدية بألوان متنوعة في مواقع متفرقة
  const giftColors = [0xb9293d, 0x2074b8, 0xd39b21, 0x4caf50, 0x9c27b0, 0xff5722, 0x00bcd4, 0xffeb3b];
  const giftPositions = [
    { x: -5.0, z: -3.5, color: giftColors[0] },
    { x: -4.0, z: 4.0, color: giftColors[1] },
    { x: -2.5, z: -5.5, color: giftColors[2] },
    { x: -1.0, z: 5.0, color: giftColors[3] },
    { x: 1.5, z: -4.5, color: giftColors[4] },
    { x: 3.0, z: 5.5, color: giftColors[5] },
    { x: 4.5, z: -3.0, color: giftColors[6] },
    { x: 6.0, z: 3.5, color: giftColors[7] },
    { x: -6.0, z: 1.5, color: giftColors[0] },
    { x: 5.5, z: -1.5, color: giftColors[1] },
    { x: -3.0, z: -1.0, color: giftColors[2] },
    { x: 2.0, z: 1.0, color: giftColors[3] }
  ];
  for (const gp of giftPositions) {
    const size = 0.55 + Math.random() * 0.2; // حجم عشوائي بين 0.55 و 0.75
    createGift(sceneRef, gp.x, gp.z, gp.color, size);
  }
}

// =====================================================================
//  مثال على كيفية استخدام هذه الدوال داخل الحلقة الرئيسية
//  (تم استخراج الأجزاء من mainLoop و init3D)
// =====================================================================

/*
  // داخل دالة init3D (بعد إنشاء المشهد):
  // ===== إضافة النص المتحرك "2027" =====
  yearTextSprite = createYearTextSprite();
  scene.add(yearTextSprite);

  // ===== إضافة ديكورات الكريسماس =====
  addChristmasDecorationsToScene(scene);

  // داخل دالة mainLoop (حلقة الرندر):
  const time = Date.now() * 0.001;
  // تحديث الثلج وأضواء الأشجار
  updateSnow(time);
  updateTreeLights(time);

  // تحريك النص "2027" من اليمين إلى اليسار ببطء
  if (yearTextSprite) {
    yearTextX += YEAR_TEXT_SPEED;
    if (yearTextX > 22) {
      yearTextX = -22;
    }
    yearTextSprite.position.x = yearTextX;
  }
*/

// =====================================================================
//  ملخص الخصائص والمواقع والأحجام:
//  - الثلج: 800 حبة، حجم 0.055، سرعة سقوط 0.006-0.024، تمايل جانبي.
//  - الأشجار: ارتفاع ~10 وحدات، موضعها (-6.5, -2.8) و (6.5, -2.8) بمقياس 0.45.
//  - الهدايا: 12 صندوق، أحجام 0.55-0.75، موزعة في جميع أنحاء المشهد.
//  - النص المتحرك: حجم 12x3.8، سرعة 0.012 وحدة/إطار، يتحرك بين -22 و 22 على المحور X.
//  - أضواء الشجرة: 60 مصباح، ألوان مختلفة، وميض بتردد 3 راديان/ثانية.
//  - الإكليل: حلزوني حول الشجرة، لون ذهبي مشع.
//  - النجمة: في أعلى الشجرة، مضيئة بقوة.
//  - الزينة: 18 كرة ملونة بأحجام متفاوتة.
// =====================================================================