const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
const DPR = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(DPR);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputEncoding = THREE.sRGBEncoding;

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 760;
const clock = new THREE.Clock();

const sceneA = new THREE.Scene();
sceneA.fog = new THREE.Fog(0x05070f, 60, 320);

const sceneB = new THREE.Scene();

const cam = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 8000);

function mkCanvas(w, h) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    return [cv, cv.getContext('2d')];
}
function rnd(a, b) { return a + Math.random() * (b - a) }

const TEX_SCALE = isMobile ? 0.6 : 1;
function planetTexture(opts) {
    const w = Math.round((opts.w || 512) * TEX_SCALE), h = Math.round((opts.h || 256) * TEX_SCALE);
    const [cv, ctx] = mkCanvas(w, h);
    const base = opts.base, light = opts.light, dark = opts.dark;
    
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, dark);
    grad.addColorStop(0.5, base);
    grad.addColorStop(1, dark);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (opts.bands) {
        
        const n = opts.bandCount || 14;
        for (let i = 0; i < n; i++) {
            const y = (i / n) * h;
            const bh = h / n;
            ctx.fillStyle = (i % 2 === 0) ? light : dark;
            ctx.globalAlpha = rnd(0.10, 0.32);
            ctx.fillRect(0, y, w, bh * rnd(0.6, 1.3));
        }
        ctx.globalAlpha = 1;
        
        for (let i = 0; i < 140; i++) {
            const y = rnd(0, h);
            const len = rnd(20, 140);
            const x = rnd(0, w);
            ctx.strokeStyle = Math.random() > 0.5 ? light : dark;
            ctx.globalAlpha = rnd(0.05, 0.18);
            ctx.lineWidth = rnd(1, 4);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + len / 2, y + rnd(-8, 8), x + len, y + rnd(-4, 4));
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    } else {
        
        const blobs = opts.blobs || 220;
        for (let i = 0; i < blobs; i++) {
            const x = rnd(0, w), y = rnd(0, h);
            const r = rnd(opts.minR || 3, opts.maxR || 22);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = Math.random() > 0.5 ? light : dark;
            ctx.globalAlpha = rnd(0.06, 0.22);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (opts.craters) {
            for (let i = 0; i < opts.craters; i++) {
                const x = rnd(0, w), y = rnd(0, h);
                const r = rnd(2, 9);
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = dark;
                ctx.globalAlpha = 0.35;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = light;
                ctx.globalAlpha = 0.18;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }
    
    const id = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < id.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 14;
        id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n;
    }
    ctx.putImageData(id, 0, 0);

    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
}

function earthTexture() {
    const w = Math.round(1024 * TEX_SCALE), h = Math.round(512 * TEX_SCALE);
    const [cv, ctx] = mkCanvas(w, h);
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, '#0a3d6b'); ocean.addColorStop(0.5, '#1768a8'); ocean.addColorStop(1, '#0a3d6b');
    ctx.fillStyle = ocean; ctx.fillRect(0, 0, w, h);

function landmass(cx, cy, scale, col) {
        ctx.fillStyle = col;
        ctx.beginPath();
        const pts = 14;
        for (let i = 0; i <= pts; i++) {
            const a = (i / pts) * Math.PI * 2;
            const r = scale * (0.6 + Math.random() * 0.6);
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r * 0.7;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
    ctx.globalAlpha = 0.92;
    landmass(w * 0.18, h * 0.32, 90, '#2e6b34');
    landmass(w * 0.22, h * 0.55, 120, '#3a7a3e');
    landmass(w * 0.5, h * 0.28, 70, '#5a7a35');
    landmass(w * 0.46, h * 0.5, 150, '#436b2e');
    landmass(w * 0.46, h * 0.72, 90, '#7a6a35');
    landmass(w * 0.72, h * 0.30, 110, '#3a6b3a');
    landmass(w * 0.78, h * 0.55, 80, '#2e5b34');
    landmass(w * 0.9, h * 0.62, 60, '#446b30');
    ctx.globalAlpha = 1;

for (let i = 0; i < 400; i++) {
        const x = rnd(0, w), y = rnd(0, h);
        ctx.fillStyle = Math.random() > 0.5 ? '#8a8a5a' : '#2a5a2a';
        ctx.globalAlpha = rnd(0.05, 0.15);
        ctx.beginPath(); ctx.arc(x, y, rnd(2, 8), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

ctx.fillStyle = '#eef6ff';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, 0, w, h * 0.045);
    ctx.fillRect(0, h * 0.955, w, h * 0.045);
    ctx.globalAlpha = 1;

for (let i = 0; i < 60; i++) {
        const x = rnd(0, w), y = rnd(0, h);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = rnd(0.05, 0.22);
        ctx.beginPath();
        ctx.ellipse(x, y, rnd(30, 90), rnd(8, 20), rnd(0, Math.PI), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 4;
    return tex;
}

function cloudsTexture() {
    const w = Math.round(1024 * TEX_SCALE), h = Math.round(512 * TEX_SCALE);
    const [cv, ctx] = mkCanvas(w, h);
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
        const x = rnd(0, w), y = rnd(0, h);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = rnd(0.10, 0.45);
        ctx.beginPath();
        ctx.ellipse(x, y, rnd(40, 120), rnd(10, 26), rnd(0, Math.PI), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 4;
    return tex;
}

function sunTexture() {
    const w = Math.round(1024 * TEX_SCALE), h = Math.round(512 * TEX_SCALE);
    const [cv, ctx] = mkCanvas(w, h);

ctx.fillStyle = '#ff8800'; ctx.fillRect(0, 0, w, h);

const cellCount = isMobile ? 180 : 420;
    const cells = [];
    for (let i = 0; i < cellCount; i++) cells.push([rnd(0, w), rnd(0, h)]);

for (const [cx, cy] of cells) {
        const r = rnd(8, 22);
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grd.addColorStop(0, 'rgba(255,230,120,0.82)'); 
        grd.addColorStop(0.55, 'rgba(255,160,30,0.55)');
        grd.addColorStop(1, 'rgba(180,60,0,0.0)');     
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
    }

for (let i = 0; i < (isMobile ? 800 : 2200); i++) {
        const x = rnd(0, w), y = rnd(0, h);
        
        let near = false;
        for (const [cx, cy] of cells) {
            const dx = x - cx, dy = y - cy;
            if (dx * dx + dy * dy < 100) { near = true; break; }
        }
        if (!near) {
            ctx.beginPath(); ctx.arc(x, y, rnd(1, 3), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(140,40,0,0.55)';
            ctx.fill();
        }
    }

const spotCount = Math.floor(rnd(3, 7));
    for (let s = 0; s < spotCount; s++) {
        const sx = rnd(w * 0.08, w * 0.92), sy = rnd(h * 0.12, h * 0.88);
        const sr = rnd(10, 24);
        
        const pen = ctx.createRadialGradient(sx, sy, sr * 0.35, sx, sy, sr);
        pen.addColorStop(0, 'rgba(100,30,0,0.92)');
        pen.addColorStop(1, 'rgba(200,90,10,0.0)');
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = pen; ctx.fill();
        
        const umb = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 0.38);
        umb.addColorStop(0, 'rgba(20,5,0,0.98)');
        umb.addColorStop(1, 'rgba(60,15,0,0.0)');
        ctx.beginPath(); ctx.arc(sx, sy, sr * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = umb; ctx.fill();
    }

for (let i = 0; i < (isMobile ? 30 : 80); i++) {
        const x = rnd(0, w), y = rnd(h * 0.05, h * 0.95);
        const len = rnd(30, 120);
        ctx.save();
        ctx.translate(x, y); ctx.rotate(rnd(-0.3, 0.3));
        const sg = ctx.createLinearGradient(-len / 2, 0, len / 2, 0);
        sg.addColorStop(0, 'rgba(255,255,180,0)');
        sg.addColorStop(0.5, `rgba(255,240,160,${rnd(0.18, 0.45)})`);
        sg.addColorStop(1, 'rgba(255,255,180,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(-len / 2, -rnd(1, 3), len, rnd(2, 6));
        ctx.restore();
    }

const limbGrd = ctx.createLinearGradient(0, 0, 0, h);
    limbGrd.addColorStop(0, 'rgba(60,10,0,0.55)');
    limbGrd.addColorStop(0.18, 'rgba(0,0,0,0)');
    limbGrd.addColorStop(0.82, 'rgba(0,0,0,0)');
    limbGrd.addColorStop(1, 'rgba(60,10,0,0.55)');
    ctx.fillStyle = limbGrd; ctx.fillRect(0, 0, w, h);

const id = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < id.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 10;
        id.data[i] += n; id.data[i + 1] += n * 0.6; id.data[i + 2] += n * 0.2;
    }
    ctx.putImageData(id, 0, 0);

    const tex = new THREE.CanvasTexture(cv);
    return tex;
}

function ringTexture() {
    const w = 512, h = 64;
    const [cv, ctx] = mkCanvas(w, h);
    for (let x = 0; x < w; x++) {
        const t = x / w;
        
        let a = 0.55 + 0.35 * Math.sin(t * 40) * 0.5 + 0.25 * Math.sin(t * 13);
        if (t > 0.55 && t < 0.6) a *= 0.15; 
        if (t < 0.06 || t > 0.95) a *= 0.3;
        a = Math.max(0, Math.min(1, a));
        const shade = 170 + Math.sin(t * 70) * 40;
        ctx.fillStyle = `rgba(${shade + 40},${shade + 20},${shade - 30},${a})`;
        ctx.fillRect(x, 0, 1, h);
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    return tex;
}

function starSprite() {
    const [cv, ctx] = mkCanvas(64, 64);
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
}
const STAR_SPRITE = starSprite();

function makeStars(scene, count = 2000, spread = 800, sizeMin = 0.6, sizeMax = 2.2) {
    const geo = new THREE.BufferGeometry();
    const pos = []; const sizes = []; const cols = [];
    for (let i = 0; i < count; i++) {
        
        const r = spread * 0.3 + Math.random() * spread * 0.7;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
        sizes.push(rnd(sizeMin, sizeMax));
        const tint = Math.random();
        if (tint > 0.92) { cols.push(1, 0.8, 0.6); }
        else if (tint > 0.85) { cols.push(0.7, 0.85, 1); }
        else { cols.push(1, 1, 1); }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const mat = new THREE.PointsMaterial({
        size: 1.6, sizeAttenuation: true, map: STAR_SPRITE, transparent: true,
        depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return pts;
}
const starsA = makeStars(sceneA, isMobile ? 900 : 1600, 600, 0.8, 2.4);
const starsB = makeStars(sceneB, isMobile ? 1800 : 3200, 4500, 0.6, 2.0);

(function milkyway() {
    const geo = new THREE.BufferGeometry();
    const pos = []; const cols = [];
    for (let i = 0; i < 2200; i++) {
        const a = Math.random() * Math.PI * 2;
        const band = (Math.random() - 0.5) * 0.35;
        const r = 1800 + Math.random() * 2200;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const y = band * r * 0.5 + (Math.random() - 0.5) * 200;
        pos.push(x, y, z);
        cols.push(0.75, 0.8, 0.95);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const mat = new THREE.PointsMaterial({
        size: 3, map: STAR_SPRITE, transparent: true, opacity: 0.35,
        depthWrite: false, vertexColors: true, blending: THREE.AdditiveBlending
    });
    sceneB.add(new THREE.Points(geo, mat));
})();

function groundTexture() {
    const w = 512, h = 512;
    const [cv, ctx] = mkCanvas(w, h);
    ctx.fillStyle = '#160d04'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2000; i++) {
        const x = rnd(0, w), y = rnd(0, h);
        ctx.fillStyle = Math.random() > 0.5 ? '#241606' : '#0d0702';
        ctx.globalAlpha = rnd(0.1, 0.3);
        ctx.fillRect(x, y, rnd(1, 3), rnd(1, 3));
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(18, 18);
    return tex;
}
const groundGeo = new THREE.PlaneGeometry(600, 600);
const groundMat = new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1, metalness: 0 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
sceneA.add(ground);

const horizonGeo = new THREE.RingGeometry(150, 500, 64);
const horizonMat = new THREE.MeshBasicMaterial({ color: 0x0a0f1c, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
const horizon = new THREE.Mesh(horizonGeo, horizonMat);
horizon.rotation.x = -Math.PI / 2; horizon.position.y = 0.05;
sceneA.add(horizon);

const slabMat = new THREE.MeshStandardMaterial({ color: 0x4d4f57, roughness: .95, metalness: .05 });
const slab = new THREE.Mesh(new THREE.CylinderGeometry(11, 12, 1.2, 8), slabMat);
slab.position.set(0, .6, 0);
slab.receiveShadow = true; slab.castShadow = true;
sceneA.add(slab);

const scorchGeo = new THREE.CircleGeometry(6, 32);
const scorchMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.55 });
const scorch = new THREE.Mesh(scorchGeo, scorchMat);
scorch.rotation.x = -Math.PI / 2; scorch.position.y = 1.21;
sceneA.add(scorch);

const towerMat = new THREE.MeshStandardMaterial({ color: 0x8a8f99, roughness: .6, metalness: .7 });
const towerGroup = new THREE.Group();
towerGroup.position.set(-6.5, 1.2, -1);
sceneA.add(towerGroup);
for (let i = 0; i < 4; i++) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(.35, 26, .35), towerMat);
    beam.position.set((i % 2 === 0 ? -1 : 1) * 1.1, 13, (i < 2 ? -1 : 1) * 1.1);
    beam.castShadow = true;
    towerGroup.add(beam);
}
for (let y = 2; y < 26; y += 2.6) {
    const cross = new THREE.Mesh(new THREE.BoxGeometry(2.4, .12, .12), towerMat);
    cross.position.set(0, y, 1.1); towerGroup.add(cross);
    const cross2 = cross.clone(); cross2.position.z = -1.1; towerGroup.add(cross2);
    const diag = new THREE.Mesh(new THREE.BoxGeometry(.1, 3.2, .1), towerMat);
    diag.position.set(1.1, y + 1.3, 0); diag.rotation.z = Math.PI / 5; towerGroup.add(diag);
}

const arm = new THREE.Mesh(new THREE.BoxGeometry(7.5, .5, .5), towerMat);
arm.position.set(4, 21, 0); arm.castShadow = true;
towerGroup.add(arm);

const towerLight = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
towerLight.position.set(0, 26.4, 0);
towerGroup.add(towerLight);

const trench = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.6, 13), new THREE.MeshStandardMaterial({ color: 0x1c1108, roughness: 1 }));
trench.position.set(0, .15, 0);
sceneA.add(trench);

function blockProp(x, z, w, h, d, col) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: col, roughness: .8, metalness: .3 }));
    m.position.set(x, h / 2 + 1.2, z); m.castShadow = true; m.receiveShadow = true;
    sceneA.add(m);
}
blockProp(14, 10, 3, 4, 3, 0x445055);
blockProp(-13, 12, 2.4, 3, 2.4, 0x3a4448);
blockProp(18, -6, 2, 5, 2, 0x505a60);

const rocketGroup = new THREE.Group();
rocketGroup.position.set(0, 1.2, 0);
sceneA.add(rocketGroup);

const hullMat = new THREE.MeshStandardMaterial({ color: 0xeceef2, roughness: .42, metalness: .62 });
const hullMatD = new THREE.MeshStandardMaterial({ color: 0xc7cad4, roughness: .5, metalness: .55 });
const noseMat = new THREE.MeshStandardMaterial({ color: 0xf2f3f6, roughness: .32, metalness: .58 });
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: .55, metalness: .5 });
const stripeMat = new THREE.MeshStandardMaterial({ color: 0xd61f1f, roughness: .45, metalness: .25 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x6fc6ff, roughness: .08, metalness: .15, transparent: true, opacity: .7, envMapIntensity: 1.2 });
const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x9aa0aa, roughness: .35, metalness: .85 });
const nozzleInMat = new THREE.MeshStandardMaterial({ color: 0x2b2b30, roughness: .6, metalness: .6 });
const finMat = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: .5, metalness: .4 });
const gridMat = new THREE.MeshStandardMaterial({ color: 0x2e313a, roughness: .55, metalness: .55 });

let yCursor = 0; 

const skirt = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.65, 1.4, 32), darkMetal);
skirt.position.y = 0.7; skirt.castShadow = true;
rocketGroup.add(skirt);
yCursor = 1.4;

const stage1H = 13.5;
const stage1 = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, stage1H, 40), hullMat);
stage1.position.y = yCursor + stage1H / 2; stage1.castShadow = true;
rocketGroup.add(stage1);

for (let i = 1; i < 6; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.56, .025, 6, 40), darkMetal);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = yCursor + (stage1H / 6) * i;
    rocketGroup.add(ring);
}

const stripeGeo = new THREE.CylinderGeometry(1.565, 1.565, stage1H * 0.5, 40, 1, true, -0.18, 0.36);
const stripe = new THREE.Mesh(stripeGeo, stripeMat);
stripe.position.y = yCursor + stage1H * 0.62;
rocketGroup.add(stripe);

function landingLeg(angle) {
    const g = new THREE.Group();
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.16, 4.2, .12), new THREE.MeshStandardMaterial({ color: 0xb9bcc6, roughness: .4, metalness: .65 }));
    leg.position.y = 2.1;
    g.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(.5, .18, .5), darkMetal);
    foot.position.y = 4.2;
    g.add(foot);
    g.position.set(Math.sin(angle) * 1.6, 2.0, Math.cos(angle) * 1.6);
    g.rotation.y = -angle;
    g.rotation.z = Math.PI * 0.085;
    rocketGroup.add(g);
}
[Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75].forEach(landingLeg);

function gridFin(angle) {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(.07, 1.9, 1.5), gridMat);
    g.add(frame);
    for (let i = -3; i <= 3; i++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(.06, .05, 1.5), new THREE.MeshStandardMaterial({ color: 0x3b3e48, roughness: .5, metalness: .5 }));
        bar.position.y = i * 0.27;
        g.add(bar);
    }
    for (let i = -2; i <= 2; i++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(.06, 1.9, .05), new THREE.MeshStandardMaterial({ color: 0x3b3e48, roughness: .5, metalness: .5 }));
        bar.position.z = i * 0.27;
        g.add(bar);
    }
    g.position.set(Math.sin(angle) * 1.62, yCursor + stage1H - 1.3, Math.cos(angle) * 1.62);
    g.rotation.y = -angle;
    rocketGroup.add(g);
}
[0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(gridFin);

yCursor += stage1H;

const interH = 1.1;
const inter = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.55, interH, 40), darkMetal);
inter.position.y = yCursor + interH / 2;
rocketGroup.add(inter);
yCursor += interH;

const stage2H = 5.2;
const stage2 = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.4, stage2H, 36), hullMatD);
stage2.position.y = yCursor + stage2H / 2; stage2.castShadow = true;
rocketGroup.add(stage2);
yCursor += stage2H;

const fairH = 6.6;
const fairing1 = new THREE.Mesh(new THREE.CylinderGeometry(1.19, 1.19, fairH, 40, 1, true, 0, Math.PI), noseMat);
fairing1.position.y = yCursor + fairH / 2; fairing1.castShadow = true;
rocketGroup.add(fairing1);
const fairing2 = new THREE.Mesh(new THREE.CylinderGeometry(1.185, 1.185, fairH, 40, 1, true, Math.PI, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xe2e4ea, roughness: .32, metalness: .58 }));
fairing2.position.y = yCursor + fairH / 2;
rocketGroup.add(fairing2);

const seamL = new THREE.Mesh(new THREE.BoxGeometry(.02, fairH, .02), darkMetal);
seamL.position.set(0, yCursor + fairH / 2, 1.19); rocketGroup.add(seamL);
const seamR = seamL.clone(); seamR.position.set(0, yCursor + fairH / 2, -1.19); rocketGroup.add(seamR);

const fairStripe = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, .55, 40), darkMetal);
fairStripe.position.y = yCursor + 1.0;
rocketGroup.add(fairStripe);

for (let i = 0; i < 3; i++) {
    const angle = i * (Math.PI * 2 / 3) + 0.5;
    const win = new THREE.Mesh(new THREE.CircleGeometry(.22, 16), glassMat);
    win.position.set(Math.sin(angle) * 1.21, yCursor - 1.4, Math.cos(angle) * 1.21);
    win.lookAt(new THREE.Vector3(Math.sin(angle) * 10, yCursor - 1.4, Math.cos(angle) * 10));
    rocketGroup.add(win);
    const frame = new THREE.Mesh(new THREE.TorusGeometry(.24, .045, 8, 16), darkMetal);
    frame.position.copy(win.position); frame.rotation.copy(win.rotation);
    rocketGroup.add(frame);
}

yCursor += fairH;

const noseH = 3.6;
const noseCone = new THREE.Mesh(new THREE.ConeGeometry(1.19, noseH, 40), noseMat);
noseCone.position.y = yCursor + noseH / 2; noseCone.castShadow = true;
rocketGroup.add(noseCone);
const noseTip = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 12), darkMetal);
noseTip.position.y = yCursor + noseH + 0.02;
rocketGroup.add(noseTip);

const enginePositions = [];
{
    const layout = [[0, 0, 1]]; 
    const ring1 = 4, ring2 = 4, r1 = 0.68, r2 = 1.18;
    for (let i = 0; i < ring1; i++) {
        const a = i * (Math.PI * 2 / ring1) + 0.0;
        layout.push([Math.sin(a) * r1, Math.cos(a) * r1, 0.85]);
    }
    for (let i = 0; i < ring2; i++) {
        const a = i * (Math.PI * 2 / ring2) + Math.PI / 4;
        layout.push([Math.sin(a) * r2, Math.cos(a) * r2, 0.78]);
    }
    layout.forEach(([x, z, scale]) => enginePositions.push([x, z, scale]));
}
const engineBells = [];
enginePositions.forEach(([ex, ez, scale]) => {
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(.16 * scale, .30 * scale, .85 * scale, 20), nozzleMat);
    bell.position.set(ex, 0.35, ez);
    bell.rotation.x = Math.PI; 
    bell.castShadow = true;
    rocketGroup.add(bell);
    engineBells.push(bell);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(.27 * scale, .05 * scale, .5 * scale, 20), nozzleInMat);
    inner.position.set(ex, 0.05, ez);
    inner.rotation.x = Math.PI;
    rocketGroup.add(inner);

const pump = new THREE.Mesh(new THREE.BoxGeometry(.18 * scale, .22 * scale, .18 * scale), darkMetal);
    pump.position.set(ex * 1.15, 0.85, ez * 1.15);
    rocketGroup.add(pump);
});

let flames = [];
let smokeParticles = [];
let sparks = [];

function flameMaterial(hueBase) {
    return new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hueBase, 1, 0.6),
        transparent: true, opacity: .88, depthWrite: false
    });
}

function createFlame(x, z, big, scale) {
    scale = scale || 1;
    const h = big ? (1.6 + Math.random() * 3.2) * scale : (0.45 + Math.random() * 0.7);
    const w = (big ? 0.5 : 0.22) * scale;
    const geo = new THREE.ConeGeometry(w, h, 10);
    const hue = big ? rnd(0.06, 0.13) : rnd(0.07, 0.12);
    const mat = flameMaterial(hue);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI; 
    mesh.position.set(x, -(h * 0.5 + 0.15), z);
    mesh.renderOrder = 2;
    rocketGroup.add(mesh);
    flames.push({ mesh, life: 0, maxLife: big ? (0.16 + Math.random() * 0.1) : (0.12 + Math.random() * 0.08) });
}

function createSpark(x, z) {
    const geo = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 1 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x + rnd(-0.3, 0.3), -0.3, z + rnd(-0.3, 0.3));
    rocketGroup.add(mesh);
    sparks.push({
        mesh, life: 0, maxLife: 0.5 + Math.random() * 0.6,
        vx: rnd(-2.5, 2.5), vy: rnd(2, 6), vz: rnd(-2.5, 2.5)
    });
}

function clearFlames() {
    flames.forEach(f => { rocketGroup.remove(f.mesh); f.mesh.geometry.dispose(); f.mesh.material.dispose(); });
    flames = [];
    sparks.forEach(s => { rocketGroup.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose(); });
    sparks = [];
}

function smokeSpriteTexture() {
    const [cv, ctx] = mkCanvas(128, 128);
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(220,220,225,0.85)');
    g.addColorStop(0.5, 'rgba(180,180,190,0.45)');
    g.addColorStop(1, 'rgba(150,150,160,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
}
const SMOKE_TEX = smokeSpriteTexture();

function createSmokePuff(worldX, worldZ) {
    const mat = new THREE.SpriteMaterial({ map: SMOKE_TEX, transparent: true, opacity: .75, depthWrite: false });
    const spr = new THREE.Sprite(mat);
    const size = rnd(3, 6);
    spr.scale.set(size, size, 1);
    spr.position.set(worldX + rnd(-2.5, 2.5), 0.6 + rnd(0, 1.2), worldZ + rnd(-2.5, 2.5));
    sceneA.add(spr);
    smokeParticles.push({
        spr, life: 0, maxLife: rnd(2.4, 4),
        vx: rnd(-0.6, 0.6), vy: rnd(0.8, 1.8), vz: rnd(-0.6, 0.6),
        growth: rnd(1.8, 3.2)
    });
}

function updateExhaust(dt) {
    flames = flames.filter(f => {
        f.life += dt;
        const t = f.life / f.maxLife;
        f.mesh.material.opacity = (1 - t) * 0.88;
        f.mesh.scale.set(1 - t * 0.3, 1 + t * 0.7, 1 - t * 0.3);
        if (f.life >= f.maxLife) {
            rocketGroup.remove(f.mesh); f.mesh.geometry.dispose(); f.mesh.material.dispose();
            return false;
        }
        return true;
    });
    sparks = sparks.filter(s => {
        s.life += dt;
        s.mesh.position.x += s.vx * dt;
        s.mesh.position.y += s.vy * dt;
        s.mesh.position.z += s.vz * dt;
        s.vy -= dt * 9;
        const t = s.life / s.maxLife;
        s.mesh.material.opacity = 1 - t;
        if (s.life >= s.maxLife) {
            rocketGroup.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose();
            return false;
        }
        return true;
    });
    smokeParticles = smokeParticles.filter(p => {
        p.life += dt;
        p.spr.position.x += p.vx * dt;
        p.spr.position.y += p.vy * dt;
        p.spr.position.z += p.vz * dt;
        const t = p.life / p.maxLife;
        const sc = p.spr.scale.x + p.growth * dt;
        p.spr.scale.set(sc, sc, 1);
        p.spr.material.opacity = 0.75 * (1 - t);
        if (p.life >= p.maxLife) {
            sceneA.remove(p.spr); p.spr.material.dispose();
            return false;
        }
        return true;
    });
}

const engineGlows = [];
for (let i = 0; i < 4; i++) {
    const l = new THREE.PointLight(0xff5500, 0, 9);
    const a = i * (Math.PI / 2);
    l.position.set(Math.sin(a) * 0.6, 0.2, Math.cos(a) * 0.6);
    rocketGroup.add(l);
    engineGlows.push(l);
}

const ambA = new THREE.AmbientLight(0x223355, .55);
sceneA.add(ambA);
const moonLight = new THREE.DirectionalLight(0x9fb8ff, .9);
moonLight.position.set(-40, 70, -25);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
moonLight.shadow.camera.left = -40; moonLight.shadow.camera.right = 40;
moonLight.shadow.camera.top = 40; moonLight.shadow.camera.bottom = -40;
moonLight.shadow.camera.far = 200;
sceneA.add(moonLight);
const rimLight = new THREE.DirectionalLight(0xff8a4d, .35);
rimLight.position.set(25, 8, 35);
sceneA.add(rimLight);
const skyFill = new THREE.HemisphereLight(0x2a3a66, 0x100a04, .4);
sceneA.add(skyFill);

const fireLight = new THREE.PointLight(0xff6600, 0, 40);
fireLight.position.set(0, 2, 0);
sceneA.add(fireLight);
const blastLight = new THREE.PointLight(0xff8833, 0, 60);
blastLight.position.set(0, 1, 0);
sceneA.add(blastLight);

cam.position.set(26, 11, 34);
cam.lookAt(0, 11, 0);

const sunRadius = 6;
const sunGeo = new THREE.SphereGeometry(sunRadius, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture() });
const sun = new THREE.Mesh(sunGeo, sunMat);
sceneB.add(sun);

const chromoMesh = new THREE.Mesh(
    new THREE.SphereGeometry(sunRadius * 1.018, 48, 48),
    new THREE.MeshBasicMaterial({
        color: 0xff2200, transparent: true, opacity: 0.13,
        side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending
    })
);
sceneB.add(chromoMesh);

const coronaLayers = [];
const coronaDefs = [
    { mult: 1.10, col: 0xff5500, op: 0.22 },
    { mult: 1.25, col: 0xff7700, op: 0.11 },
    { mult: 1.50, col: 0xff9933, op: 0.05 },
    { mult: 1.90, col: 0xffbb66, op: 0.022 },
    { mult: 2.60, col: 0xffcc88, op: 0.009 },
];
for (const { mult, col, op } of coronaDefs) {
    const g = new THREE.Mesh(
        new THREE.SphereGeometry(sunRadius * mult, 32, 32),
        new THREE.MeshBasicMaterial({
            color: new THREE.Color(col), transparent: true, opacity: op,
            side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending
        })
    );
    sceneB.add(g);
    coronaLayers.push(g);
}

const sunGlowMat = new THREE.SpriteMaterial({
    map: STAR_SPRITE, color: 0xff9900, transparent: true, opacity: 0.38,
    depthWrite: false, blending: THREE.AdditiveBlending
});
const sunGlowSprite = new THREE.Sprite(sunGlowMat);
sunGlowSprite.scale.set(sunRadius * 5.5, sunRadius * 5.5, 1);
sceneB.add(sunGlowSprite);

const sunLight = new THREE.PointLight(0xfff3d6, 3.2, 3000, 1.6);
sceneB.add(sunLight);
const ambB = new THREE.AmbientLight(0x161830, .35);
sceneB.add(ambB);

const flareGroup = new THREE.Group();
sceneB.add(flareGroup);
const FLARES = [];
const FLARE_COLORS = [0xff6600, 0xff4400, 0xffaa00, 0xff8800, 0xff3300];

function createSolarFlare() {
    const angle = Math.random() * Math.PI * 2;
    const elevation = (Math.random() - 0.5) * Math.PI * 0.5; 
    const arcHeight = sunRadius * (0.55 + Math.random() * 0.75);
    const col = FLARE_COLORS[Math.floor(Math.random() * FLARE_COLORS.length)];
    const life = 5.0 + Math.random() * 4.0; 

    const nx = Math.cos(angle) * Math.cos(elevation);
    const ny = Math.sin(elevation);
    const nz = Math.sin(angle) * Math.cos(elevation);

    const tx = -Math.sin(angle), tz = Math.cos(angle);

    const pts = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const arcEnvelope = Math.sin(t * Math.PI);     
        const r = sunRadius * 1.01 + arcHeight * arcEnvelope;
        const lean = (t - 0.5) * sunRadius * 0.4;          
        pts.push(new THREE.Vector3(
            nx * r + tx * lean,
            ny * r,
            nz * r + tz * lean
        ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeR = 0.10 + Math.random() * 0.08;
    const geo = new THREE.TubeGeometry(curve, 24, tubeR, 5, false);
    const mat = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geo, mat);
    flareGroup.add(mesh);

const glowMat = new THREE.SpriteMaterial({
        map: STAR_SPRITE, color: col,
        transparent: true, opacity: 0, depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Sprite(glowMat);
    glow.position.copy(curve.getPoint(0.5)); 
    glow.scale.set(sunRadius * 0.38, sunRadius * 0.38, 1);
    flareGroup.add(glow);

    FLARES.push({ mesh, glow, mat, glowMat, maxLife: life, age: 0 });
}

for (let i = 0; i < 2; i++) createSolarFlare();
let flareSpawnTimer = 0;

const PLANETS = [
    {
        name: 'Mercury', radius: 0.62, orbitR: 18, speed: 4.15, tilt: 0.001,
        tex: () => planetTexture({ base: '#9a9a9a', light: '#c4c4c4', dark: '#5a5a5a', blobs: 260, craters: 60, minR: 1, maxR: 8 }),
        fact: ['☿ Smallest planet', '🌡 −180°C to 430°C', '📅 88-day year', '📏 4,879 km diameter']
    },
    {
        name: 'Venus', radius: 1.15, orbitR: 28, speed: 1.62, tilt: 0.001,
        tex: () => planetTexture({ base: '#d9b25a', light: '#f0d68a', dark: '#a8843a', blobs: 160, minR: 6, maxR: 20 }),
        atmo: 0xffcc66, atmoOpacity: .22,
        fact: ['♀ Hottest planet', '🌡 465°C surface', '💨 Crushing CO₂ atmosphere', '🔄 Spins backwards']
    },
    {
        name: 'Earth', radius: 1.25, orbitR: 40, speed: 1.00, tilt: 0.41, hasMoon: true,
        tex: earthTexture,
        atmo: 0x5fa8ff, atmoOpacity: .20,
        fact: ['🌍 Our home!', '💧 71% ocean coverage', '🌙 1 natural moon', '📅 365.25-day year']
    },
    {
        name: 'Mars', radius: 0.86, orbitR: 54, speed: .53, tilt: 0.44,
        tex: () => planetTexture({ base: '#b5481e', light: '#d97a4a', dark: '#7a2c10', blobs: 220, craters: 50, minR: 1, maxR: 9 }),
        fact: ['♂ The Red Planet', '🏔 Olympus Mons: tallest volcano', '🌡 −60°C average', '🌙 2 small moons']
    },
    {
        name: 'Jupiter', radius: 3.4, orbitR: 78, speed: .084, tilt: 0.05, bands: true,
        tex: () => planetTexture({ base: '#caa06a', light: '#e8cfa0', dark: '#9a6f3e', bands: true, bandCount: 16, w: 1024, h: 512 }),
        fact: ['♃ Largest planet', '🌀 Great Red Spot: 300yr storm', '🌙 95 known moons', '📏 11× Earth’s diameter']
    },
    {
        name: 'Saturn', radius: 2.9, orbitR: 106, speed: .034, tilt: 0.47, hasRings: true, bands: true,
        tex: () => planetTexture({ base: '#e3cf97', light: '#f3e6bb', dark: '#bba467', bands: true, bandCount: 10, w: 1024, h: 512 }),
        fact: ['♄ Iconic ring system', '💨 1,800 km/h winds', '🌙 146 known moons', '🪐 Rings are mostly ice']
    },
    {
        name: 'Uranus', radius: 1.9, orbitR: 132, speed: .012, tilt: 1.71,
        tex: () => planetTexture({ base: '#9fe3e3', light: '#c8f3f3', dark: '#6cbcbc', blobs: 60, minR: 10, maxR: 30 }),
        fact: ['⛄ Ice giant', '🌡 −224°C: coldest atmosphere', '↔ Rotates on its side', '🌙 27 known moons']
    },
    {
        name: 'Neptune', radius: 1.85, orbitR: 158, speed: .006, tilt: 0.49,
        tex: () => planetTexture({ base: '#3f5fd8', light: '#6f8df0', dark: '#283e9a', blobs: 60, minR: 10, maxR: 30 }),
        fact: ['🌊 Windiest planet', '💨 2,100 km/h winds', '📅 165-year orbit', '🌙 14 known moons']
    },
];

const planetMeshes = [];
const planetAngles = PLANETS.map(() => Math.random() * Math.PI * 2);
const planetPivots = [];

PLANETS.forEach((p, i) => {
    const pivot = new THREE.Object3D();
    sceneB.add(pivot);
    planetPivots.push(pivot);

const orbitGeo = new THREE.TorusGeometry(p.orbitR, .04, 6, 200);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .10 });
    const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
    orbitRing.rotation.x = Math.PI / 2;
    sceneB.add(orbitRing);

    const tex = p.tex();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: .85, metalness: .05 });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(p.radius, 48, 48), mat);
    sphere.rotation.z = p.tilt || 0;
    sphere.castShadow = true; sphere.receiveShadow = true;

    if (p.atmo) {
        const atmo = new THREE.Mesh(
            new THREE.SphereGeometry(p.radius * 1.07, 32, 32),
            new THREE.MeshBasicMaterial({ color: p.atmo, transparent: true, opacity: p.atmoOpacity, side: THREE.BackSide })
        );
        sphere.add(atmo);
    }
    if (p.name === 'Earth') {
        const clouds = new THREE.Mesh(
            new THREE.SphereGeometry(p.radius * 1.018, 40, 40),
            new THREE.MeshStandardMaterial({ map: cloudsTexture(), transparent: true, opacity: .55, depthWrite: false, roughness: 1 })
        );
        sphere.add(clouds);
        sphere.userData.clouds = clouds;
    }

    if (p.hasMoon) {
        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(p.radius * 0.27, 20, 20),
            new THREE.MeshStandardMaterial({ map: planetTexture({ base: '#aaaaaa', light: '#cfcfcf', dark: '#6b6b6b', blobs: 160, craters: 50, minR: 1, maxR: 6 }), roughness: .95 })
        );
        const moonPivot = new THREE.Object3D();
        sphere.add(moonPivot);
        moon.position.set(p.radius * 2.6, 0, 0);
        moonPivot.add(moon);
        sphere.userData.moonPivot = moonPivot;
    }

    if (p.hasRings) {
        const ringTex = ringTexture();
        const innerR = p.radius * 1.4, outerR = p.radius * 2.5;
        const ringGeo = new THREE.RingGeometry(innerR, outerR, 128, 1);
        
        const posAttr = ringGeo.attributes.position;
        const uvAttr = ringGeo.attributes.uv;
        const v3 = new THREE.Vector3();
        for (let vi = 0; vi < posAttr.count; vi++) {
            v3.fromBufferAttribute(posAttr, vi);
            const dist = v3.length();
            const t = (dist - innerR) / (outerR - innerR);
            uvAttr.setXY(vi, t, 0.5);
        }
        uvAttr.needsUpdate = true;
        const rings = new THREE.Mesh(
            ringGeo,
            new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, side: THREE.DoubleSide })
        );
        rings.rotation.x = Math.PI / 2 - 0.34;
        sphere.add(rings);
    }

    sphere.position.set(p.orbitR, 0, 0);
    pivot.add(sphere);

const labelEl = document.createElement('div');
    labelEl.className = 'planet-label';
    labelEl.textContent = p.name;
    document.getElementById('ui').appendChild(labelEl);

    planetMeshes.push({ mesh: sphere, data: p, pivot, index: i, baseScale: 1, label: labelEl });
});

const asteroidBelt = new THREE.Group();
sceneB.add(asteroidBelt);
{
    const count = isMobile ? 220 : 420;
    const geo = new THREE.IcosahedronGeometry(0.12, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x8a8378, roughness: 1, metalness: 0 });
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
        const r = rnd(63, 71);
        const a = Math.random() * Math.PI * 2;
        const y = rnd(-1.5, 1.5);
        dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        dummy.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        const s = rnd(0.4, 1.6);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
    }
    asteroidBelt.add(inst);
    asteroidBelt.userData.angles = new Float32Array(count).map(() => Math.random() * Math.PI * 2);
}

const solarCam = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, .1, 12000);
solarCam.position.set(0, 70, 145);
solarCam.lookAt(0, 0, 0);

const camTarget = { theta: Math.atan2(145, 0), phi: Math.acos(70 / Math.hypot(0, 70, 145)), radius: Math.hypot(0, 70, 145) };
let camCurrent = { theta: camTarget.theta, phi: camTarget.phi, radius: camTarget.radius };
let userDragging = false;
let autoRotate = true;
let dragStart = null;

function clampPhi(p) { return Math.max(0.25, Math.min(Math.PI - 0.25, p)); }

function solarPointerDown(x, y) {
    userDragging = true; autoRotate = false;
    dragStart = { x, y, theta: camTarget.theta, phi: camTarget.phi };
}
function solarPointerMove(x, y) {
    if (!userDragging || !dragStart) return;
    const dx = (x - dragStart.x) / innerWidth;
    const dy = (y - dragStart.y) / innerHeight;
    camTarget.theta = dragStart.theta - dx * 4;
    camTarget.phi = clampPhi(dragStart.phi - dy * 3);
}
function solarPointerUp() { userDragging = false; }
function solarZoom(delta) {
    camTarget.radius = Math.max(20, Math.min(420, camTarget.radius + delta));
}

let focusedPlanet = null;
let focusReturnPos = null;   
let focusReturnLookAt = null;   
let focusTween = 0;      
let focusTweenDir = 0;      
const FOCUS_TWEEN_SPEED = 1.4;  

let camPos = new THREE.Vector3().copy(solarCam.position);
let camLook = new THREE.Vector3(0, 0, 0);
let camPosFrom = new THREE.Vector3();
let camLookFrom = new THREE.Vector3();
let camPosTo = new THREE.Vector3();
let camLookTo = new THREE.Vector3();

function focusPlanet(pm) {
    if (focusedPlanet === pm) { unfocusPlanet(); return; }

focusReturnPos = solarCam.position.clone();
    focusReturnLookAt = camLook.clone();

    focusedPlanet = pm;
    autoRotate = false;

camPosFrom.copy(solarCam.position);
    camLookFrom.copy(camLook);

_computeFocusTarget(pm, camPosTo, camLookTo);

    focusTween = 0;
    focusTweenDir = 1;
}

function _computeFocusTarget(pm, outPos, outLook) {
    const wp = new THREE.Vector3();
    pm.mesh.getWorldPosition(wp);
    outLook.copy(wp);

const dist = pm.data.radius * 5.5 + 6;
    
    const dir = solarCam.position.clone().sub(wp).normalize();
    
    if (dir.lengthSq() < 0.01) dir.set(0, 0.6, 1).normalize();
    outPos.copy(wp).addScaledVector(dir, dist);
    
    outPos.y += pm.data.radius * 1.2;
}

function unfocusPlanet() {
    if (!focusReturnPos) return;

    camPosFrom.copy(solarCam.position);
    camLookFrom.copy(camLook);
    camPosTo.copy(focusReturnPos);
    camLookTo.copy(focusReturnLookAt);

    focusedPlanet = null;
    focusReturnPos = null;
    focusReturnLookAt = null;
    focusTween = 0;
    focusTweenDir = -1;

    focusCard.style.display = 'none';
    backBtn.style.display = 'none';
    
    if (activeScene === 'solar') relaunchBtn.style.display = '';
}

function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

const focusCard = document.createElement('div');
focusCard.id = 'focus-card';
focusCard.style.cssText = `
  position:fixed; left:20px; top:50%; transform:translateY(-50%);
  background:rgba(2,6,28,0.92); border:1px solid rgba(100,180,255,0.4);
  border-radius:18px; padding:20px 24px; color:#dceaff; font-size:14px;
  line-height:1.7; pointer-events:all; display:none; max-width:240px;
  box-shadow:0 0 40px rgba(60,130,255,0.25),0 8px 32px rgba(0,0,0,0.6);
  backdrop-filter:blur(8px); z-index:20; transition:opacity .35s ease;
  font-family:'Segoe UI',system-ui,Arial,sans-serif;
`;
document.body.appendChild(focusCard);

const backBtn = document.createElement('button');
backBtn.textContent = '← Back';
backBtn.style.cssText = `
  position:fixed; bottom:5%; right:20px;
  padding:11px 22px; font-size:13px; font-weight:700; letter-spacing:1px;
  background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.8);
  border:1px solid rgba(255,255,255,0.25); border-radius:40px;
  cursor:pointer; display:none; z-index:20; backdrop-filter:blur(4px);
  font-family:inherit; transition:background .15s,color .15s;
`;
backBtn.addEventListener('mouseenter', () => { backBtn.style.background = 'rgba(255,255,255,0.16)'; backBtn.style.color = '#fff'; });
backBtn.addEventListener('mouseleave', () => { backBtn.style.background = 'rgba(255,255,255,0.08)'; backBtn.style.color = 'rgba(255,255,255,0.8)'; });
backBtn.addEventListener('click', unfocusPlanet);
document.body.appendChild(backBtn);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-9, -9);
const tooltip = document.getElementById('tooltip');

let state = 'idle';
let stateTime = 0;
let rocketY = 0;
let rocketVY = 0;
let camShake = 0;
let activeScene = 'launch';

const launchBtn = document.getElementById('launch-btn');
const skipBtn = document.getElementById('skip-btn');
const countdownEl = document.getElementById('countdown');
const liftoffText = document.getElementById('liftoff-text');
const enteringMsg = document.getElementById('entering-msg');
const relaunchBtn = document.getElementById('relaunch-btn');
const solarLabel = document.getElementById('solar-label');
const hint = document.getElementById('hint');
const loadingEl = document.getElementById('loading');

function setState(s) { state = s; stateTime = 0; }

function enterSolarScene() {
    activeScene = 'solar';
    launchFlameActive = false;
    clearFlames();
    enteringMsg.style.opacity = 0;
    setTimeout(() => { enteringMsg.style.display = 'none'; }, 450);
    relaunchBtn.style.display = '';
    solarLabel.style.display = '';
    hint.style.display = '';
    requestAnimationFrame(() => { solarLabel.style.opacity = 1; hint.style.opacity = 1; });
    setState('solar');
}

launchBtn.addEventListener('click', () => {
    launchBtn.style.display = 'none';
    skipBtn.style.display = 'none';
    setState('countdown');
});

skipBtn.addEventListener('click', () => {
    launchBtn.style.display = 'none';
    skipBtn.style.display = 'none';
    enterSolarScene();
});

relaunchBtn.addEventListener('click', () => {
    relaunchBtn.style.display = 'none';
    solarLabel.style.display = 'none'; solarLabel.style.opacity = 0;
    hint.style.display = 'none'; hint.style.opacity = 0;
    tooltip.style.display = 'none';
    
    rocketY = 0; rocketVY = 0;
    rocketGroup.position.set(0, 1.2, 0);
    rocketGroup.rotation.set(0, 0, 0);
    launchFlameActive = false;
    clearFlames();
    smokeParticles.forEach(p => { sceneA.remove(p.spr); p.spr.material.dispose(); });
    smokeParticles = [];
    engineGlows.forEach(l => l.intensity = 0);
    fireLight.intensity = 0;
    blastLight.intensity = 0;
    cam.position.set(26, 11, 34);
    cam.lookAt(0, 11, 0);
    launchBtn.style.display = '';
    skipBtn.style.display = '';
    activeScene = 'launch';
    setState('idle');
});

function updateMouseFromEvent(clientX, clientY) {
    mouse.x = (clientX / innerWidth) * 2 - 1;
    mouse.y = -(clientY / innerHeight) * 2 + 1;
}

canvas.addEventListener('mousemove', e => {
    updateMouseFromEvent(e.clientX, e.clientY);
    if (activeScene === 'solar') solarPointerMove(e.clientX, e.clientY);
    positionTooltip(e.clientX, e.clientY);
});
canvas.addEventListener('mousedown', e => {
    if (activeScene === 'solar') {
        solarPointerDown(e.clientX, e.clientY);
        
        _clickStart = { x: e.clientX, y: e.clientY };
    }
});
window.addEventListener('mouseup', e => {
    if (activeScene === 'solar' && _clickStart) {
        const dx = e.clientX - _clickStart.x, dy = e.clientY - _clickStart.y;
        if (Math.sqrt(dx * dx + dy * dy) < 6) {
            
            if (hoveredPlanet) {
                focusPlanet(hoveredPlanet);
                if (focusedPlanet) {
                    tooltip.style.display = 'none';
                    focusCard.style.display = 'block';
                    focusCard.innerHTML = `<strong style="display:block;font-size:18px;color:#ffd166;margin-bottom:10px;letter-spacing:.5px">${focusedPlanet.data.name}</strong>`
                        + focusedPlanet.data.fact.map(r => `<div style="margin:3px 0">${r}</div>`).join('');
                    backBtn.style.display = '';
                }
            } else if (focusedPlanet) {
                unfocusPlanet();
            }
        }
        _clickStart = null;
    }
    solarPointerUp();
});
let _clickStart = null;

canvas.addEventListener('wheel', e => {
    if (activeScene === 'solar') { e.preventDefault(); solarZoom(e.deltaY * 0.05); }
}, { passive: false });

canvas.addEventListener('touchstart', e => {
    const t = e.touches[0];
    updateMouseFromEvent(t.clientX, t.clientY);
    if (activeScene === 'solar') {
        solarPointerDown(t.clientX, t.clientY);
        _touchClickStart = { x: t.clientX, y: t.clientY };
    }
    positionTooltip(t.clientX, t.clientY);
}, { passive: true });
canvas.addEventListener('touchmove', e => {
    const t = e.touches[0];
    updateMouseFromEvent(t.clientX, t.clientY);
    if (activeScene === 'solar') solarPointerMove(t.clientX, t.clientY);
    positionTooltip(t.clientX, t.clientY);
    e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend', e => {
    if (activeScene === 'solar' && _touchClickStart && e.changedTouches.length) {
        const t = e.changedTouches[0];
        const dx = t.clientX - _touchClickStart.x, dy = t.clientY - _touchClickStart.y;
        if (Math.sqrt(dx * dx + dy * dy) < 12) {
            
            updateMouseFromEvent(t.clientX, t.clientY);
            raycaster.setFromCamera(mouse, solarCam);
            const hits2 = raycaster.intersectObjects(planetMeshes.map(p => p.mesh), true);
            if (hits2.length) {
                let obj = hits2[0].object;
                while (obj.parent && !planetMeshes.find(p => p.mesh === obj)) obj = obj.parent;
                const pm = planetMeshes.find(p => p.mesh === obj);
                if (pm) {
                    focusPlanet(pm);
                    if (focusedPlanet) {
                        tooltip.style.display = 'none';
                        relaunchBtn.style.display = 'none';
                        focusCard.style.display = 'block';
                        focusCard.innerHTML = `<strong style="display:block;font-size:18px;color:#ffd166;margin-bottom:10px;letter-spacing:.5px">${focusedPlanet.data.name}</strong>`
                            + focusedPlanet.data.fact.map(r => `<div style="margin:3px 0">${r}</div>`).join('');
                        backBtn.style.display = '';
                    }
                }
            } else if (focusedPlanet) {
                unfocusPlanet();
            }
        }
        _touchClickStart = null;
    }
    solarPointerUp();
    tooltip.style.display = (tooltip.style.display === 'block') ? 'block' : 'none';
}, { passive: true });
let _touchClickStart = null;

function positionTooltip(clientX, clientY) {
    let tx = clientX + 18, ty = clientY - 24;
    const maxW = 240;
    if (tx + maxW > innerWidth) tx = clientX - maxW - 10;
    if (ty < 10) ty = 10;
    if (ty + 140 > innerHeight) ty = innerHeight - 150;
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';
}

let launchFlameTimer = 0;
let idleFlameTimer = 0;
let launchFlameActive = false;
let smokeTimer = 0;

function render() {
    requestAnimationFrame(render);
    const dt = Math.min(clock.getDelta(), .05);
    stateTime += dt;

    if (activeScene === 'launch') {
        updateLaunch(dt);
        renderer.render(sceneA, cam);
    } else {
        updateSolar(dt);
        renderer.render(sceneB, solarCam);
    }
}

function updateLaunch(dt) {
    towerLight.material.color.setHex(Math.sin(stateTime * 6) > 0 ? 0xff2222 : 0x330000);

    if (state === 'idle') {
        rocketGroup.rotation.z = Math.sin(stateTime * .6) * .003;
        idleFlameTimer += dt;
        if (idleFlameTimer > .06) {
            idleFlameTimer = 0;
            enginePositions.slice(0, 1).forEach(([x, z]) => createFlame(x, z, false));
        }
        engineGlows.forEach(l => { l.intensity = .5 + Math.sin(stateTime * 12) * .2; });
        fireLight.intensity = .8 + Math.sin(stateTime * 10) * .25;
    }

    if (state === 'countdown') {
        const n = 3 - Math.floor(stateTime);
        if (n >= 1) {
            countdownEl.style.display = 'block';
            countdownEl.textContent = n;
            const frac = stateTime % 1;
            countdownEl.style.transform = `translate(-50%,-50%) scale(${1 + (.85 - frac) * .3})`;
            countdownEl.style.opacity = frac < 0.5 ? 1 : Math.max(0, 2 - frac * 2);
        }
        cam.position.lerp(new THREE.Vector3(20, 12, 28), .012);
        cam.lookAt(0, 12, 0);
        idleFlameTimer += dt;
        if (idleFlameTimer > .06) { idleFlameTimer = 0; enginePositions.slice(0, 1).forEach(([x, z]) => createFlame(x, z, false)); }
        engineGlows.forEach(l => { l.intensity = .8 + Math.sin(stateTime * 15) * .3; });
        fireLight.intensity = 1.4 + Math.sin(stateTime * 12) * .4;

        if (stateTime >= 3) {
            countdownEl.style.display = 'none';
            liftoffText.style.display = 'block';
            liftoffText.style.animation = 'none'; void liftoffText.offsetWidth;
            liftoffText.style.animation = 'liftPop .5s ease-out forwards';
            launchFlameActive = true;
            camShake = 1;
            setState('launch');
        }
    }

    if (state === 'launch') {
        launchFlameTimer += dt;
        if (launchFlameTimer > .022) {
            launchFlameTimer = 0;
            enginePositions.forEach(([x, z]) => createFlame(x, z, true));
            if (Math.random() > 0.5) enginePositions.forEach(([x, z]) => { if (Math.random() > 0.7) createSpark(x, z); });
        }
        smokeTimer += dt;
        if (smokeTimer > .05) { smokeTimer = 0; for (let k = 0; k < 3; k++) createSmokePuff(0, 0); }
        engineGlows.forEach(l => { l.intensity = 6 + Math.random() * 3; });
        fireLight.intensity = 10 + Math.random() * 4;
        blastLight.intensity = 6 + Math.random() * 3;
        camShake = Math.max(0, camShake - .5 * dt);

        if (stateTime > .8) {
            liftoffText.style.display = 'none';
            rocketVY = .08;
            setState('ascent');
        }
    }

    if (state === 'ascent') {
        rocketVY += dt * 4.2;
        rocketY += rocketVY * dt * 60;
        rocketGroup.position.y = 1.2 + rocketY;
        rocketGroup.rotation.z = Math.sin(stateTime * .3) * .018;
        rocketGroup.rotation.x = Math.sin(stateTime * .22) * .01;

        launchFlameTimer += dt;
        if (launchFlameTimer > .022) {
            launchFlameTimer = 0;
            enginePositions.forEach(([x, z]) => createFlame(x, z, true, 1 + rocketY * 0.01));
        }
        smokeTimer += dt;
        if (smokeTimer > .06 && rocketY < 18) { smokeTimer = 0; for (let k = 0; k < 2; k++) createSmokePuff(0, 0); }

        engineGlows.forEach(l => { l.intensity = 6 + Math.random() * 3; });
        fireLight.intensity = Math.max(0, 8 - rocketY * 0.5);
        blastLight.intensity = Math.max(0, 5 - rocketY * 0.4);

        const targetY = Math.min(rocketGroup.position.y * .55, 90);
        cam.position.lerp(new THREE.Vector3(32, targetY + 9, 50), .028);
        cam.lookAt(0, rocketGroup.position.y + 6, 0);

        camShake = Math.max(0, camShake - .3 * dt);

        if (stateTime > 4.2 && stateTime < 7) {
            enteringMsg.style.display = 'block';
            enteringMsg.style.opacity = Math.min(1, (stateTime - 4.2) * 1.6);
        }
        if (stateTime > 7) {
            enterSolarScene();
        }
    }

    updateExhaust(dt);

    if (camShake > .01) {
        const s = camShake * .4;
        cam.position.x += (Math.random() - .5) * s;
        cam.position.y += (Math.random() - .5) * s * .5;
    }
}

let hoveredPlanet = null;
const _v3proj = new THREE.Vector3();
const _wp = new THREE.Vector3();

function updateSolar(dt) {
    PLANETS.forEach((p, i) => {
        planetAngles[i] += p.speed * dt * .12;
        const px = Math.cos(planetAngles[i]) * p.orbitR;
        const pz = Math.sin(planetAngles[i]) * p.orbitR;
        planetMeshes[i].mesh.position.set(px, 0, pz);
        planetMeshes[i].mesh.rotation.y += dt * (p.name === 'Venus' ? -.25 : .45);
        if (planetMeshes[i].mesh.userData.clouds) {
            planetMeshes[i].mesh.userData.clouds.rotation.y += dt * 0.06;
        }
        if (planetMeshes[i].mesh.userData.moonPivot) {
            planetMeshes[i].mesh.userData.moonPivot.rotation.y += dt * 0.6;
        }
    });

asteroidBelt.rotation.y += dt * 0.015;

sun.rotation.y += dt * 0.018;
    
    const pulse = Math.sin(stateTime * 0.18) * 0.004 + Math.sin(stateTime * 0.31) * 0.003;
    coronaLayers.forEach((g, i) => {
        const s = 1 + pulse * (1 + i * 0.15);
        g.scale.set(s, s, s);
    });

flareSpawnTimer += dt;
    if (flareSpawnTimer > 3.5 + Math.random() * 3.0) { 
        flareSpawnTimer = 0;
        createSolarFlare();
    }
    for (let fi = FLARES.length - 1; fi >= 0; fi--) {
        const f = FLARES[fi];
        f.age += dt;
        const t = f.age / f.maxLife;
        
        let alpha;
        if (t < 0.20) alpha = t / 0.20;
        else if (t < 0.80) alpha = 1.0;
        else alpha = 1.0 - (t - 0.80) / 0.20;
        alpha = Math.max(0, Math.min(1, alpha));
        f.mat.opacity = alpha * 0.70;
        f.glowMat.opacity = alpha * 0.40;
        if (f.age >= f.maxLife) {
            flareGroup.remove(f.mesh); f.mesh.geometry.dispose(); f.mat.dispose();
            flareGroup.remove(f.glow); f.glowMat.dispose();
            FLARES.splice(fi, 1);
        }
    }
    flareGroup.rotation.y = stateTime * 0.016;

if (focusTweenDir !== 0) {
        focusTween = Math.min(1, focusTween + dt * FOCUS_TWEEN_SPEED);
        const t = easeInOut(focusTween);

if (focusTweenDir === 1 && focusedPlanet) {
            _computeFocusTarget(focusedPlanet, camPosTo, camLookTo);
        }

        solarCam.position.lerpVectors(camPosFrom, camPosTo, t);
        camLook.lerpVectors(camLookFrom, camLookTo, t);
        solarCam.lookAt(camLook);

        if (focusTween >= 1) {
            const wasZoomingOut = focusTweenDir === -1;
            focusTweenDir = 0;
            if (wasZoomingOut) autoRotate = true;
        }
    } else if (focusedPlanet) {
        
        _computeFocusTarget(focusedPlanet, camPosTo, camLookTo);
        solarCam.position.lerp(camPosTo, Math.min(1, dt * 2.2));
        camLook.lerp(camLookTo, Math.min(1, dt * 2.2));
        solarCam.lookAt(camLook);
    } else if (!userDragging) {
        
        if (autoRotate) camTarget.theta += dt * 0.045;
        camCurrent.theta += (camTarget.theta - camCurrent.theta) * Math.min(1, dt * 4);
        camCurrent.phi += (camTarget.phi - camCurrent.phi) * Math.min(1, dt * 4);
        camCurrent.radius += (camTarget.radius - camCurrent.radius) * Math.min(1, dt * 4);

        const r = camCurrent.radius;
        solarCam.position.set(
            r * Math.sin(camCurrent.phi) * Math.cos(camCurrent.theta),
            r * Math.cos(camCurrent.phi),
            r * Math.sin(camCurrent.phi) * Math.sin(camCurrent.theta)
        );
        camLook.set(0, 0, 0);
        solarCam.lookAt(0, 0, 0);
    } else {
        
        camCurrent.theta += (camTarget.theta - camCurrent.theta) * Math.min(1, dt * 4);
        camCurrent.phi += (camTarget.phi - camCurrent.phi) * Math.min(1, dt * 4);
        camCurrent.radius += (camTarget.radius - camCurrent.radius) * Math.min(1, dt * 4);
        const r = camCurrent.radius;
        solarCam.position.set(
            r * Math.sin(camCurrent.phi) * Math.cos(camCurrent.theta),
            r * Math.cos(camCurrent.phi),
            r * Math.sin(camCurrent.phi) * Math.sin(camCurrent.theta)
        );
        solarCam.lookAt(0, 0, 0);
    }

planetMeshes.forEach(pm => {
        pm.mesh.getWorldPosition(_v3proj);
        const screenV = _v3proj.clone().project(solarCam);
        const sx = (screenV.x * 0.5 + 0.5) * innerWidth;
        const sy = (-screenV.y * 0.5 + 0.5) * innerHeight;
        const behind = screenV.z > 1;
        const lbl = pm.label;
        if (behind) { lbl.style.display = 'none'; return; }

        const worldDist = solarCam.position.distanceTo(_v3proj);
        const fade = Math.max(0.1, Math.min(1, 90 / worldDist));
        lbl.style.display = '';
        lbl.style.left = sx + 'px';
        lbl.style.top = (sy - pm.data.radius * 28 - 14) + 'px';
        lbl.style.opacity = focusedPlanet && focusedPlanet !== pm ? '0.06' : String(Math.min(fade * 1.6, 1));
        lbl.style.transform = `translateX(-50%) scale(${Math.max(0.75, Math.min(1.3, fade * 1.5))})`;
        lbl.style.fontSize = focusedPlanet === pm ? '15px' : '11px';
        lbl.style.color = focusedPlanet === pm ? '#ffd166' : '#b8d8ff';
        lbl.style.textShadow = focusedPlanet === pm
            ? '0 0 20px #ffd166, 0 0 50px #ffaa00'
            : '0 0 10px rgba(80,160,255,0.9), 0 1px 3px rgba(0,0,0,0.8)';
    });

raycaster.setFromCamera(mouse, solarCam);
    const meshArray = planetMeshes.map(p => p.mesh);
    const hits = raycaster.intersectObjects(meshArray, true);
    if (hits.length) {
        let obj = hits[0].object;
        while (obj.parent && !planetMeshes.find(p => p.mesh === obj)) obj = obj.parent;
        const pm = planetMeshes.find(p => p.mesh === obj);
        if (pm) {
            hoveredPlanet = pm;
            if (!focusedPlanet) {
                tooltip.style.display = 'block';
                tooltip.innerHTML = `<strong>${pm.data.name}</strong>` + pm.data.fact.map(r => `<span class="row">${r}</span>`).join('');
            }
        }
    } else {
        hoveredPlanet = null;
        if (!isMobile) tooltip.style.display = 'none';
    }
}

const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes liftPop{
  0%{transform:translate(-50%,-50%) scale(.4);opacity:0}
  50%{transform:translate(-50%,-50%) scale(1.15);opacity:1}
  100%{transform:translate(-50%,-50%) scale(1);opacity:1}
}`;
document.head.appendChild(styleTag);

function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    cam.aspect = w / h; cam.updateProjectionMatrix();
    solarCam.aspect = w / h; solarCam.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 200));

requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        loadingEl.classList.add('hide');
    });
});

render();