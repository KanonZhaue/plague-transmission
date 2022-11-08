/* eslint-disable */
import { reactive, inject, watch } from 'vue'
import { injects } from "../../js/injects"
import conf from "../../conf/cls8"
import { dt2t } from '../../js/kit'


var ini
export default function setup() {
    ini = injects()
    let node = conf.nodes
    console.log("node",node)
    let nodes = [{ value: 'default', label: 'default' }]
    for (let i = 0; i < node.length; i++) {
        nodes.push({
            value: node[i].name,
            label: node[i].name
        })
    }
    if (ini.seleted_scene.value == null)
        ini.seleted_scene.value = node[0].name
    
    watch(inject('changeConfig'), () => update_args(ini))
    watch(inject('seleted_scene'), () => update_panel(ini))
    watch(inject('med'), () => {
        ini['I_gamma'].value = (ini['med'].value / 2) ** 2 * 0.2
        ini['ISO_gamma'].value = (ini['med'].value / 5) ** 0.5
        ini['sigma'].value = 0.5 - 0.25 * ini['med'].value
        ini.radar_args_changed.value['I_gamma'] = 1
        ini.radar_args_changed.value['ISO_gamma'] = 1
        ini.radar_args_changed.value['sigma'] = 1
    })
    watch(inject('dist'), () => {
        ini['d'].value = ini['dist'].value / 7 * 3
        ini['close_distance'].value = ini['dist'].value / 7 * 4
        ini.radar_args_changed.value['d'] = 1
        ini.radar_args_changed.value['close_distance'] = 1
    })
    watch(inject('delta'), () => {
        ini.radar_args_changed.value['delta'] = 1
    })
    watch(inject('beta'), () => {
        ini.radar_args_changed.value['beta'] = 1
    })
    watch(inject("addScene"), () => {
        console.log('node1111',nodes)
        node = conf.nodes
        update_panel(ini)
    
    })
    return {
        chooseScene,
        ...ini, nodes,
        action_now: () => {
            ini.start_action.value = dt2t(ini.currentDay.value, ini.currentTick.value)
        },
        AddDialog() {
            document.getElementById("Tooltip").style.display = "block";
        },
    }
}

function chooseScene(name) {
    ini.seleted_scene.value = name
}

let keys = [
    "beta",
    "rho",
    "delta",
    "lambda",
    "theta",
    "sigma",
    "d",
    "I_gamma",
    "ISO_gamma",
    "close_distance",
]

function update_args(ini) {
    let scene = ini.seleted_scene.value
    // for(let i=0;i<keys.length;i++)
    for (let k in ini.radar_args_changed.value) {
        ini.args.value[scene][k] = ini[k].value
    }

}

export function update_panel(ini) {
    ini.radar_args_changed.value = {}
    let keys = [
        "beta",
        "rho",
        "delta",
        "lambda",
        "theta",
        "sigma",
        "d",
        "I_gamma",
        "ISO_gamma",
        "close_distance",
    ]
    let scene = ini.seleted_scene.value
    console.log("scene111",scene)
    for (let i = 0; i < keys.length; i++) {
        let v = ini.args.value[scene][keys[i]]
        ini[keys[i]].value = v == undefined ? ini.args.value.default[keys[i]] : v
    }
}