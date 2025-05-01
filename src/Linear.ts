type Vec2 = number[]

function addScalar(a: Vec2, b: number): Vec2 {
  return [a[0] + b, a[1] + b];
}

function addVec2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export { addScalar, addVec2 };
