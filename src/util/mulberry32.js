

export function mulberry32(seed=0) {
    let state = seed;

    function next(min=0, max=1) {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        const val = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        return val * (max - min) + min;
    }

    return { next };
}

