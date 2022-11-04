/*eslint-disable */
import {ref, onMounted, watch} from 'vue'
import { injects } from "../../js/injects"
import { dt2t, getIni, t2dt } from '../../js/kit'

export default {
    setup
}

var ini, playing = ref(false)
var interval, gap = 1000/3
var limit_tick
var day, tick
var now_tick = ref(0)

function setup() {
    ini = injects()
    update_tick(tick)
    watch(ini.currentDay, ()=>update_tick())
    watch(ini.currentTick, ()=>update_tick())
    return {playing, play:main, breakPlayer, now_tick, restart, run_from}
}
function update_tick()
{
    day = ini.currentDay.value
    tick = ini.currentTick.value
    tick = dt2t(day, tick)
    let {day, tick} = t2dt(tick)
    now_tick.value = `${day}-${tick}`
}

function tick_formatter(t)
{
    let {day, tick} = t2dt(t)
    return `${day}-${tick}`
}

function main()
{
    clearInterval(interval)
    if(day == undefined){
        tick = 0
        limit_tick = ini.scene.value.roles[0].tick
        ini.currentTick.value = 0
        ini.currentDay.value = 0
    }
    play()
}

function run_from()
{
    breakPlayer()
    day = ini.currentDay.value
    tick = ini.currentTick.value
    tick = dt2t(day, tick)
    play()
}

function play()
{
    interval = setInterval(() => {
        if(tick > limit_tick)
        {
            breakPlayer()
            return
        }
        // ini.scene.value.drawByTick(tick)
        let tmp = t2dt(tick)
        ini.currentTick.value = tmp.tick
        ini.currentDay.value = tmp.day
        // now_tick.value = tick_formatter(tick)
        update_tick()
        tick += 1
    }, gap);
    playing.value = true
}

function restart()
{
    breakPlayer()
    tick = 0
    limit_tick = ini.scene.value.roles[0].tick
    play()
}

function breakPlayer()
{
    clearInterval(interval)
    playing.value = false
}