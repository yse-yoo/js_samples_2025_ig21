import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';

export let outerPolygon = [];
export let innerPolygon = [];

export async function loadTrack(scene) {
    const res = await fetch('assets/track.json');
    const json = await res.json();

    const outerPoints = json.outer.map(p => new THREE.Vector3(p.x, p.y, 0));
    const innerPoints = json.inner.map(p => new THREE.Vector3(p.x, p.y, 0));

    const outerCurve = new THREE.CatmullRomCurve3(outerPoints, true);
    const innerCurve = new THREE.CatmullRomCurve3(innerPoints, true);

    outerPolygon = outerCurve.getPoints(600).map(p => new THREE.Vector2(p.x, p.y));
    innerPolygon = innerCurve.getPoints(600).map(p => new THREE.Vector2(p.x, p.y));
    closePolygon(outerPolygon);
    closePolygon(innerPolygon);

    const shape = new THREE.Shape();
    shape.moveTo(outerPolygon[0].x, outerPolygon[0].y);
    outerPolygon.forEach(p => shape.lineTo(p.x, p.y));

    const innerPath = new THREE.Path();
    innerPolygon.forEach((p, i) => {
        if (i === 0) innerPath.moveTo(p.x, p.y);
        else innerPath.lineTo(p.x, p.y);
    });

    shape.holes.push(innerPath);

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
        color: '#444444', // ← 任意の色（暗いグレー）
        side: THREE.DoubleSide
    });
    scene.add(new THREE.Mesh(geometry, material));

const outerGuard = createGuardMeshFromPolygon(outerPolygon, 6, '#ffffff');
scene.add(outerGuard);

const innerGuard = createGuardMeshFromPolygon(innerPolygon, 6, '#ffffff');
scene.add(innerGuard);
}

function closePolygon(points) {
    if (points.length < 2) return;
    if (points[0].distanceToSquared(points[points.length - 1]) > 1e-6) {
        points.push(points[0].clone());
    }
}

export function isPointInPolygon(point, polygon) {
    let inside = false;
    const x = point.x, y = point.y;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / ((yj - yi) + 1e-6) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function createGuardMeshFromPolygon(polygon, width = 4, color = '#ffffff') {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const up = new THREE.Vector3(0, 0, 1); // z軸
    for (let i = 0; i < polygon.length - 1; i++) {
        const p1 = polygon[i];
        const p2 = polygon[i + 1];

        const dir = new THREE.Vector2().subVectors(p2, p1).normalize();
        const normal = new THREE.Vector2(-dir.y, dir.x).multiplyScalar(width / 2);

        // 左右2点ずつ（四角の2つの三角形）
        const a = new THREE.Vector3(p1.x + normal.x, p1.y + normal.y, 2);
        const b = new THREE.Vector3(p1.x - normal.x, p1.y - normal.y, 2);
        const c = new THREE.Vector3(p2.x + normal.x, p2.y + normal.y, 2);
        const d = new THREE.Vector3(p2.x - normal.x, p2.y - normal.y, 2);

        // 三角形2つ
        vertices.push(...a.toArray(), ...b.toArray(), ...c.toArray());
        vertices.push(...b.toArray(), ...d.toArray(), ...c.toArray());
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    return new THREE.Mesh(geometry, material);
}
