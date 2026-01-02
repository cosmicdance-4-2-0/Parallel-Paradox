export class RNG {
  constructor(seed = 1) {
    this.state = seed >>> 0;
    if (this.state === 0) this.state = 1;
  }

  next() {
    // xorshift32
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state;
  }

  nextFloat() {
    return this.next() / 0xffffffff;
  }
}
