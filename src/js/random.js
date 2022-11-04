export function random(min, max) {
    return Math.random() * (max - min) + min;
}

export function circleRandom(center, r) {
    var a = Math.random() * Math.PI * 2
        , d = Math.random() * r
    return {
        x: center.x + Math.cos(a) * d,
        y: center.y + Math.sin(a) * d
    }
}

export function rectRandom(leftTop, rightBottom) {
    let x = Math.random() * (rightBottom[0] - leftTop[0]) + leftTop[0],
        y = Math.random() * (rightBottom[1] - leftTop[1]) + leftTop[1];


    return { x, y }
}