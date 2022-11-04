/* eslint-disable */
import ini from "../conf/ini"
import { watch } from "vue"

export function t2dt(t) {
    var { ticks } = ini
    var _d = parseInt(t / (ticks - 1))
    return {
        day: _d,
        tick: t - _d * (ticks - 1)
    }
}

export function dt2t(day, tick) {
    var { ticks } = ini
    ticks--
    if (tick == undefined) {
        tick = day.tick
        day = day.day
    }
    var res = day * ticks + tick
    return res
}

/**曼哈顿距离 */
export function mDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

export function last(arr) {
    // console.log(arr)
    return arr.slice(-1)[0]
}

export function getIni(ini) {
    var _ini = {}
    for (let k in ini) {
        _ini[k] = ini[k].value
    }
    return _ini
}

/** 分页方法
 * @param {*[]} data 原始数据
 * @param {Number} max_r 一页最多有多少条数据
 */
export function split_pages(data, max_r, start = 0) {
    let len = data.length
    let base = 0, p = start
    let pages = {}
    while (len - base > 0) {
        let n_add = Math.min(len - base, max_r)
        let page = []
        for (let i = 0; i < n_add; i++) {
            page.push(data[base + i])
        }
        base += n_add
        pages[p++] = page
    }
    pages.size = p - start
    return pages
}

export function watches(injects, list, callback, opt) {
    for (let i = 0; i < list.length; i++) {
        watch(injects[list[i]], callback, opt)
    }
}

export function inNeighborhood(center, hood, targetValue) {
    if (targetValue > center - hood && targetValue < center + hood) {
        return true
    }
    return false
}

export function Euclidian(p1, p2) {
    return Math.sqrt(
        Math.pow((p1[0] - p2[0]), 2) + Math.pow((p1[1] - p2[1]), 2)
    )
}

// export function rectRandom(leftTop, rightBottom)