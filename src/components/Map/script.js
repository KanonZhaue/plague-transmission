/* eslint-disable */
import { Scene } from '../../js/Scene'
import { onMounted, inject, watch, } from 'vue'
import { injects } from '../../js/injects'
import { dt2t } from '../../js/kit'
import config from '../../conf/config'
var d3 = require('d3')

export default function setup() {
    var ini = injects()
    var scene = new Scene('#map-svg')
    var distanceLine = inject('distanceLine')
    inject('scene').value = scene
    var { currentTick, currentDay, ticks, N, newScene } = injects()
    console.log(newScene)
    function updateMap() {
        // console.log('distance link:', distanceLine.value)
        scene.drawByTick(dt2t(currentDay.value, currentTick.value), distanceLine.value)
        // console.log('re -scene over!')
    }
    onMounted(() => {
        scene.loadDefault()
        scene.init()
        scene.generateRoles(N.value)
        scene.updateStateOfRoles()
        updateMap()
    })
    watch(inject('N'), (n, o) => {
        if (n < o) d3.select('#' + config.map.nodes.id).html('')
        scene.generateRoles(N.value)
        scene.updateStateOfRoles()
        updateMap()
    }, { immediate: false })
    watch(currentTick, () => { updateMap(scene) }, { immediate: false })
    watch(distanceLine, () => { updateMap(scene) }, { immediate: false })
    watch(currentDay, () => { updateMap(scene) }, { immediate: false })
    watch(inject('iniChanged'), () => {
        console.log(ini)
        ini.isolation_tick.value = dt2t(ini.currentDay.value, ini.currentTick.value)
        scene.updateStateOfRoles()
        updateMap(scene)
    }, { immediate: false })
    watch(inject("start_isolation"), () => {
        scene.AddScene()
        scene.DrawRect()
    })
    watch(inject("addScene"), () => {
        console.log(ini["newScene"])
        scene.AddScene(ini["newScene"].value)
    })
    return { ini }
}