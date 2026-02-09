// engine.js

export class AimEngine {
  constructor({
    maxVelocity = 25,          // pixels por frame (velocity clamp)
    precisionThreshold = 2.5,  // velocidade abaixo disso ativa precision
    lowPassAlpha = 0.25        // usado pelo filtro externo
  }) {
    this.maxVelocity = maxVelocity;
    this.precisionThreshold = precisionThreshold;

    // Bézier cúbica (ease-out agressivo p/ flick, suave p/ precisão)
    this.bezier = {
      p0: 0.0,
      p1: 0.15,
      p2: 0.85,
      p3: 1.0
    };
  }

  // Bézier cúbica clássica
  cubicBezier(t) {
    const { p0, p1, p2, p3 } = this.bezier;
    const u = 1 - t;
    return (
      u * u * u * p0 +
      3 * u * u * t * p1 +
      3 * u * t * t * p2 +
      t * t * t * p3
    );
  }

  // Fallback linear
  linear(t) {
    return t;
  }

  applyAcceleration(delta) {
    const abs = Math.abs(delta);
    const sign = Math.sign(delta);

    const normalized = Math.min(abs / this.maxVelocity, 1);

    const curve = abs < this.precisionThreshold
      ? this.linear(normalized)
      : this.cubicBezier(normalized);

    return sign * curve * this.maxVelocity;
  }

  clampVelocity(delta) {
    if (delta > this.maxVelocity) return this.maxVelocity;
    if (delta < -this.maxVelocity) return -this.maxVelocity;
    return delta;
  }

  processDelta(rawDelta) {
    const accelerated = this.applyAcceleration(rawDelta);
    return this.clampVelocity(accelerated);
  }
}
