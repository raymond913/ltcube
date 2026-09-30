export type Vec3 = [number, number, number];

/**
 * The "hold view": looks at the front face from above and to the right, so the
 * front face is clearly the main face (about 2.5x as square-on as the right
 * face) and the right face is still readable. Every tutorial cube settles
 * here, because this is where the algorithm is performed from.
 *
 * Tuned from the suggested [1.8, 3, 5]: there the camera sits almost in the
 * right face's plane, so that face is edge-on and unreadable, and the cube
 * filled the viewer so tightly that labels above it were clipped.
 */
export const HOLD_VIEW: Vec3 = [3, 3.3, 5.6];

/**
 * Faces a learner can read from HOLD_VIEW. Anything on the back, left or
 * bottom is hidden, so a case whose key feature sits there starts at its spot
 * view (Substep.cameraPosition) with a floating label (Substep.spotLabels),
 * then glides here.
 */
export const HOLD_VISIBLE_FACES = ["U", "F", "R"] as const;
