export type Vec2 = [number, number];

function addScalar(a: Vec2, b: number): Vec2 {
  return [a[0] + b, a[1] + b];
}

function addVec2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

function multiplyScalar(a: Vec2, b: number): Vec2{
  return [a[0]*b, a[1]*b];
}

export { addScalar, addVec2, multiplyScalar };
