import data from "../conf/ini"
import { inject } from "vue"

export function injects() {
    var res = {}
    for (let k in data) {
        console.log(k)
        res[k] = inject(k)
    }
    return res
}

export function injectsValue() {
    var res = {}
    for (let k in data) {
        res[k] = inject(k).value
    }
    return res
}