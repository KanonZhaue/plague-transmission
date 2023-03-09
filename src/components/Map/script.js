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
        console.log("inia",ini)
        ini.isolation_tick.value = dt2t(ini.currentDay.value, ini.currentTick.value)
        ini.args.value['default'] = {
            beta: ini.beta,          // 传染概率β
            rho: ini.rho,           // 有效接触系数ρ
            delta: ini.delta,         // 感染者转换为隔离者的概率
            lambda: ini.lambda,        // λ是隔离解除速率
            theta: ini.theta,         // θ是潜伏者（E）相对于感染者传播能力的比值
            sigma: ini.sigma,         // σ为潜伏者（E）向感染者（I）的转化速率
            d: ini.d,             // 感染者的影响距离(社交距离)
            I_gamma: ini.I_gamma,       // I的恢复系数γ
            ISO_gamma: ini.ISO_gamma,     // 隔离者的恢复率
            close_distance: ini.close_distance // 密切接触距离
        }
        scene.generateRoles(N.value)

        scene.updateStateOfRoles()
        // scene.CountR0()
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
    watch(inject("delScene"), () => {
        scene.DelScene(ini["DelSceneIndex"].value)
    })
    return { ini }
}