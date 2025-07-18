import { MathUtils } from "three";

/**
 * simple clamp function. Keeps the value between the min and max values
 * @param {int} num
 * @param {int} min
 * @param {int} max
 */
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
//

/**
 * Gradually changes a value towards a desired goal over time.
 * Based on Game Programming Gems 4 Chapter 1.10
 *
 * @param {int} current current position
 * @param {int} target target position
 * @param {object} velocity a object to store velocity. must be in the form {value: <int>}
 * @param {int} smoothTime smoothing factor between 0-1
 * @param {int} maxSpeed
 * @param {int} deltaTime
 */
function smoothDamp(
    current,
    target,
    velocity,
    smoothTime,
    maxSpeed,
    deltaTime,
) {
    smoothTime = Math.max(0.0001, smoothTime);
    let omega = 2 / smoothTime;

    let x = omega * deltaTime;
    let exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = current - target;
    let originalTo = target;

    // Clamp maximum speed
    let maxChange = maxSpeed * smoothTime;
    change = clamp(change, -maxChange, maxChange);
    target = current - change;

    let temp = (velocity.value + omega * change) * deltaTime;
    velocity.value = (velocity.value - omega * temp) * exp;
    let output = target + (change + temp) * exp;

    // Prevent overshooting
    if (originalTo - current > 0.0 == output > originalTo) {
        output = originalTo;
        velocity.value = (output - originalTo) / deltaTime;
    }

    return output;
}

/**
 * Gradually changes a value towards a desired goal over time.
 * Based on Game Programming Gems 4 Chapter 1.10
 *
 * @param {vec2} current current position
 * @param {vec2} target target position
 * @param {vec2} velocity a object to store velocity. must be in the form {value: <int>}
 * @param {int} smoothTime smoothing factor between 0-1
 * @param {int} maxSpeed
 * @param {int} deltaTime
 */
function smoothDampV3(
    current,
    target,
    velocity,
    smoothTime,
    maxSpeed,
    deltaTime,
) {
    current.x = smoothDamp(
        current.x,
        target.x,
        velocity.x,
        smoothTime,
        maxSpeed,
        deltaTime,
    );

    // current.y = smoothDamp(
    //     current.y,
    //     target.y,
    //     velocity.y,
    //     smoothTime,
    //     maxSpeed,
    //     deltaTime,
    // );

    current.z = smoothDamp(
        current.z,
        target.z,
        velocity.z,
        smoothTime,
        maxSpeed,
        deltaTime,
    );
}

export const MathUtilsExtended = {
    smoothDamp,
    smoothDampV3,
    ...MathUtils,
};
