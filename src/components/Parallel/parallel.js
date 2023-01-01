/* eslint-disable */

import { objectToString } from '@vue/shared';
import { onMounted, inject, watch, resolveComponent } from 'vue'
import { injects } from '../../js/injects'
import { dt2t, last, t2dt } from '../../js/kit'

var d3 = require('d3');
var storylineView = document.getElementById('parallel-svg-mini')
var width = 1180
var height=56
var i
var tuliHeight = 30
    //记录框变化信息
    var FramTranformX = 0;
    var SvgTransformK = 4;
    var transformx = 0;
    var recommandY = -50;
    var xScaleOldTransformK = 4;
    var minMapWidth = 1120;
    var minMapHeight = 90;
    var liucunkongbai = 100;
    var rightBoundary = width / SvgTransformK;
    var leftBoundary = 0;
    var scale = 1;
var scaleValue = 1; // 缩放
var FramColor = "#DFE6F3"
var mouseOverColor = "#c1d1f7"
var dragRectColor = "#adb9d2"   
var backgroundColor = "#f2f2f2"
var startLeftLineX = 0;
var startRightLineX = 600;
var leftLineX = startLeftLineX;
var rightLineX = startRightLineX;
var topLineHeight = 10;
var dragRectWidth = 3;
var dragRectHeight = 26;
//故事线最上以及最下边的坐标
var topY = 0;
var bottomY = 80;
//故事线最左及最右边的坐标
var leftX = 10;
var rightX = 1200;
var rectHeight = bottomY - topY;
var minDistance = 100
var lineWidth = 3;
var xScaleCircleNum = 2;
var textArea = 6//textarea旨在为线上的数字留空间
function setup() {
    var ini = injects()
    watch(ini.force_role, () => display(ini), { immediate: false })
    watch(ini.stateupdated, () => display(ini), { immediate: false })
    watch(inject('stateUpdated'), () => display(ini), { immediate: false })
    // watch(ini.currentDay, () => display(ini), { immediate: false })
    // watch(ini.currentTick, () => display(ini), { immediate: false })
    // watch(ini.storyline_pattern, () => display(ini), { immediate: false })
    // onMounted(() => {
    //     display(ini)
    // })
}

// const session_size = 20; // 20
export { setup }
var scene = []
function display(_ini) {
    scene = []
    let ini = getIni(_ini);
    let { nodes, _rec } = ini.scene.storyline((ini.ticks - 1) * ini.days)
    console.log(nodes,_rec)
    console.log(ini);

    // console.log(nodes, _rec)
    //change
    let force_role = ini.scene.findRoleById(ini.force_role)


    // let { currentTick, currentDay } = ini;
    // let t = dt2t(currentDay, currentTick)
    // let ed_t = (ini.ticks - 1) * ini.days  //dt2t(ini.days, ini.ticks - 1)

    let tmp_loc = {
        // "Section 1": 0,
        // "Section 2": 1,
        // "Section 3": 2,
        // "Section 4": 3,
        // "Section 5": 4,
        // "Section 6": 5,
        // "isolated area": 6
    },
        tmp_char = {
            // [force_role.id]: force_role
        },
        loc_num_org = {}

    console.log(ini.scenes)
    console.log(loc_num_org)
    for (let i = 0; i <= ini.addScene; i++) {
        
        loc_num_org[ini.scenes[i]] = []
        
    }
    for(let j=0;j<ini.scenes.length;j++){
            scene.push(ini.scenes[j])
        }
    for(let i=0;i<Object.keys(ini.scenes).length;i++){
        tmp_loc[ini.scenes[i]] = i
    }
    console.log(loc_num_org)
    console.log(tmp_loc)
    console.log(scene)
    var now_id = force_role.id
    var ticks = []
    var pattern = ini.storyline_pattern
    // console.log(pattern)
    if (pattern == "transmission") {
        // 传播路径的数据
        let tmp = {}
        for (let i = 0; i < nodes[now_id].sons.length; i++) {
            tmp_char[nodes[now_id].sons[i]] = nodes[nodes[now_id].sons[i]]
            tmp[nodes[nodes[now_id].sons[i]].infected] = 1
        }

        // while (1) {
        for (let i = 0; i <= 1; i++) {
            tmp_char[now_id] = nodes[now_id]
            tmp[nodes[now_id].infected] = 1
            if (nodes[now_id].from == nodes[now_id].id)
                break
            now_id = nodes[now_id].from
        }
        for (var k in tmp) {
            ticks.push(parseInt(k))
        }

        // console.log(tmp_char)
    } else {
        //接触人员的数据
        let raw = ini.scene.traceData(ini.force_role, false)
        console.log(nodes[ini.force_role], ini.force_role)
        if (raw == null) return false
        // let data = []

        for (let i = 0; i < raw.length; i++) {
            for (let j = 0; j < raw[i].length; j++) {
                // console.log(raw[i].length)
                if (raw[i][j].scene.name == '隔离区') continue
                if (raw[i][j].with == ini.force_role && nodes[ini.force_role].infected <= raw[i][j].tick && raw[i][j].tick < nodes[ini.force_role].infected + 14) {
                    tmp_char[raw[i][j].id] = raw[i][j]
                    ticks.push(raw[i][j].tick)

                }
            }
        }
        ticks.push(nodes[ini.force_role].infected)
        // console.log(data)
        tmp_char[force_role.id] = nodes[force_role.id]
        // console.log(tmp_char, ticks)
        ticks.sort()
    }


    ticks.push(ticks[ticks.length - 1] + 2)



    /***************    *
     **  SESSIONS   *
     *****************/

    let sessions = {}, loc_num = {}
    console.log(ticks)
    console.log(ini.scenes)
    console.log(ini.scenes.length,"ini.scenesss")

    // zjaRectDatas = []
    console.log("tmp_char",tmp_char)
    console.log("sessions",sessions)
    for (let k in tmp_char) {
        let role = tmp_char[k].role
        // console.log(role)
        let session = sessions[k] = []
        // for (let i = t; i < ed_t && i < ((t + session_size) < ed_t ? (t + session_size) : ed_t); ++i) {
        for (let j = 0; j < ticks.length; j++) {
            let i = ticks[j]
            let { scene } = role.coordination[i]
            if (loc_num[i] == undefined) {
                loc_num[i] = {}
                for(let zjai=0;zjai<ini.scenes.length;zjai++){
                    console.log(Object.values(ini.scenes));
                    loc_num[i][Object.values(ini.scenes)[zjai]] = []
                }
                
            }
            console.log(loc_num)

            
            //scene就是场景，role.coordination就是人物的场景/坐标
            console.log(scene, role.coordination, i)
            let loc = scene.name
            //loc是所选场景的id
            if (tmp_loc[loc] === undefined) tmp_loc[loc] = loc
            // console.log(role.state[i], role.state[ticks[j - 1]])
            if ((j != 0 && role.state[i].state == 'exposed' && role.state[ticks[j - 1]].state == 'susceptible')) {//j!=0表示不是第一时刻，tick[j]时为exposed,tick[j-1]时为susceptible认为在这一时刻被感染
                console.log(role)
                loc_num[i][loc].push(tmp_char[k].id)
                // tempRectData = {}
                // tempRectData['startTick'] = role.state[role.tick].infected
                // tempRectData['scene'] = role.state[role.tick].scene
                // tempRectData['from'] = role.state[role.tick].from
                // tempRectData['to'] = role.id
                // zjaRectDatas.push(tempRectData)
            }  //|| (j == 0 && role.state[i].state != 'susceptible')

            console.log(loc_num)
            session.push({
                state: role.state[i].state,
                loc: tmp_loc[loc]
            })
        }
    }
    console.log(tmp_char, loc_num, sessions)


    let characters = [], locations = [];
    for (let k in tmp_char)
        characters.push({
            name: k,
            id: tmp_char[k].id
        })
console.log(characters)
console.log(tmp_loc)
    for (let k in tmp_loc)
        locations.push({
            name: k,
            id: tmp_loc[k]
        })

    // console.log(sessions)
    let story_data = { locations, sessions, characters }
    var tmp_text = []
    for (k in tmp_char) {
        tmp_text.push(k)
    }

    var _isdraw = 1;
    if (tmp_text.length == 1 && tmp_text[0] == '0')
        _isdraw = 0//只有一个人感染，则不画storyline

    console.log("story_data",story_data)
    parallel_draw(story_data, loc_num, force_role, ticks, tmp_char, _isdraw, scene)
}
var drag = d3.drag()
        .on("drag", dragged)
        .on("end", writeEndTransform)
function parallel_draw(data, loc_num, force_role, ticks, tmp_char, _isdraw, scene) {
    console.log("sceneaaa",scene)
    console.log(loc_num)
    const svg = d3.select("#parallel-svg").html("")
    const miniSvg = d3.select("#parallel-svg-mini").html("")
    var minMapG = miniSvg.append("g").attr('id','minMapG')
    var storyLineG = svg.append("g").attr('id','storyLineG')
    var scenesG = svg.append("g").attr('id',"scenesG")
    


    const conf = {
        width: svg.node().clientWidth,
        height: 220,
        miniMapHeight:miniSvg.node().clientHeight,
        padding: {
            top: 10,
            bottom: 0,
            left: 12,
            right: 2,
        }
    }

    let { locations, sessions, characters } = data;
    // console.assert(locations instanceof Array && locations.length > 0, "variable `locations` is void. ")
    // console.assert(characters instanceof Array && characters.length > 0, "variable `characters` is void. ")
    // for (let i = 0; i < characters.length; i++) {
    //     if (characters[i].id == force_role.id) {
    //         var j = parseInt(characters.length / 2)
    //         console.log(i, j)
    //         var tmp = characters[i]
    //         characters[i] = characters[j]
    //         characters[j] = tmp
    //         // console.log(characters, force_role)
    //         break
    //     }
    // }
    const session_size = sessions[characters[0].id].length;
    // console.log("session size", session_size)
    let sceneDomain = []
    console.log("scenes",scene)
    for(let i=0;i<=scene.length;i++){
        sceneDomain.push(i)
    }
    console.log('sceneDomian',sceneDomain)
    const scale = {
        scenes: d3.scaleBand()
            .domain(sceneDomain)
            .range([conf.padding.top, conf.height - conf.padding.bottom - conf.padding.top * 2.5])
            .paddingInner(0.5)
        // .padding(0.3)
        ,
        ticks: d3.scaleBand()
            .domain(d3.range(ticks.length))
            .range([conf.padding.left, conf.width - conf.padding.right - conf.padding.left])
            .paddingInner(0.5)
            .paddingOuter(0),
    }



    var sce = [], s_i = locations.map(d => d.id)
    for (let i = 0; i < locations.length; i++) {
        sce.push(locations[i].name)
    }
    // console.log(s_i)
    var colors = {
        "Section 1": '#e67a7a',
        "Section 2": '#a7efe9',
        "Section 3": '#bad7df',
        "Section 4": '#30e3ca',
        "Section 5": '#fbac91',
        "Section 6": '#ffebb7',
        "Section 7": '#1891ac',
        "Section 8": '#87ceeb',
        "Section 9": '#f0e68c',
        "Section 10": '#32cd32',
        "Section 11": '#4269e1',
        "Section 12": '#7b68ee',

    }

    var colors_state = {
        recovered: '#7FB800',
        infectious: '#F6511D',
        susceptible: '#00A6ED',
        exposed: '#FFB400',
    }


    var Time = []
    for (let i = 0; i < ticks.length; i++) {
        // Time.push(t2dt(ticks[i]).day + " day " + t2dt(ticks[i]).tick + " tick")
        Time.push(t2dt(ticks[i]).day + "d" + t2dt(ticks[i]).tick + "t")
    }


    var time_ticks = d3.scaleBand()
        .domain(Time)
        .range([conf.padding.left, conf.width - conf.padding.right - conf.padding.left])
        .paddingInner(0.5)
        .paddingOuter(0)
    var xAxis1 = d3.axisTop().scale(time_ticks);



    var w = (scale.ticks(1) - scale.ticks(0))
    // for (let i = t; i < ed_t && i < ((t + session_size) < ed_t ? (t + session_size) : ed_t); ++i) {
    //绘制场景
    var h =(conf.height - conf.padding.bottom)/(sceneDomain.length-1)

    var op = 0.3
    console.log(ticks)
    console.log(loc_num)
    console.log(scene)
    console.log(tmp_char)
    let linesLeft = scale.ticks(0) + w / 2-20
    let linesRight = scale.ticks(ticks.length-1) + w / 2+20
    console.log(linesLeft,linesRight)
    // minMapG.attr("transform",`scaleX(${width/(linesRight-linesLeft)})`)
    let minmapGG = document.getElementById("minMapG")
    minmapGG.style.transform = `scaleX(${width/(linesRight-linesLeft)}) translateX(${linesLeft*(linesRight-linesLeft)/width})`
    // miniSvg.attr("transform",)
    for (let j = 0; j < ticks.length; j++) {
        let i = ticks[j]
        var h =(conf.height - conf.padding.bottom-tuliHeight)/(sceneDomain.length-1)
        var w = (scale.ticks(1) - scale.ticks(0)) / 2
        // var lt = scale.scenes(1)
        for (let zji = 0; zji < scene.length; zji++) {
            console.log(loc_num[i][scene[zji]])
            if (loc_num[i][scene[zji]].length > 0) {
                storyLineG.append('rect')
                    .attr("x", conf.padding.left + w * 2 * (j))
                    .attr("y", zji*h+tuliHeight)
                    .attr("width", w)
                    .attr("height", h)
                    .attr('rx',10)
                    .attr('stroke-width', 0.2)
                    .attr("stroke", "black")
                    .attr('fill', colors[Object.keys(colors)[zji]])
                    .attr("opacity", op)
                    .append("title")
                    .text(() => {
                        console.log(loc_num);
                        console.log(tmp_char);
                        var text_t = ""
                        for (let k = 0; k < loc_num[i][scene[zji]].length; k++) {
                            var id = loc_num[i][scene[zji]][k]
                            var from = tmp_char[id].from

                            text_t += "from " + from + " to " + id + "\n"

                        }

                        return text_t

                    })
            }



        }

        // if (loc_num[i]["Section 2"].length > 0) {
        //     svg.append('rect')
        //         .attr("x", conf.padding.left + w * 2 * (j))
        //         .attr("y", scale.scenes(1))
        //         .attr("width", w)
        //         .attr("height", h)
        //         .attr('stroke-width', 0.2)
        //         .attr("stroke", "black")
        //         .attr('fill', colors["Section 2"])
        //         .attr("opacity", op)
        //         .append("title")
        //         .text(() => {
        //             var text_t = ""
        //             for (let k = 0; k < loc_num[i]["Section 2"].length; k++) {
        //                 var id = loc_num[i]["Section 2"][k]
        //                 var from = tmp_char[id].from

        //                 text_t += "from " + from + " to " + id + "\n"

        //             }

        //             return text_t

        //         }
        //         )
        // }
        // if (loc_num[i]["Section 3"].length > 0) {
        //     svg.append('rect')
        //         .attr("x", conf.padding.left + w * 2 * (j))
        //         .attr("y", scale.scenes(2))
        //         .attr("width", w)
        //         .attr("height", h)
        //         .attr('stroke-width', 0.2)
        //         .attr("stroke", "black")
        //         .attr('fill', colors["Section 3"])
        //         .attr("opacity", op)
        //         .append("title")
        //         .text(() => {
        //             var text_t = ""
        //             for (let k = 0; k < loc_num[i]["Section 3"].length; k++) {
        //                 var id = loc_num[i]["Section 3"][k]
        //                 var from = tmp_char[id].from

        //                 text_t += "from " + from + " to " + id + "\n"

        //             }

        //             return text_t

        //         }
        //         )
        // }
        // if (loc_num[i]["Section 4"].length > 0) {
        //     svg.append('rect')
        //         .attr("x", conf.padding.left + w * 2 * (j))
        //         .attr("y", scale.scenes(3))
        //         .attr("width", w)
        //         .attr("height", h)
        //         .attr('stroke-width', 0.2)
        //         .attr("stroke", "black")
        //         .attr('fill', colors["Section 4"])
        //         .attr("opacity", op)
        //         .append("title")
        //         .text(() => {
        //             var text_t = ""
        //             for (let k = 0; k < loc_num[i]["Section 4"].length; k++) {
        //                 var id = loc_num[i]["Section 4"][k]
        //                 var from = tmp_char[id].from

        //                 text_t += "from " + from + " to " + id + "\n"

        //             }

        //             return text_t

        //         }
        //         )
        // }
        // if (loc_num[i]["Section 5"].length > 0) {
        //     svg.append('rect')
        //         .attr("x", conf.padding.left + w * 2 * (j))
        //         .attr("y", scale.scenes(4))
        //         .attr("width", w)
        //         .attr("height", h)
        //         .attr('stroke-width', 0.2)
        //         .attr("stroke", "black")
        //         .attr('fill', colors["Section 5"])
        //         .attr("opacity", op)
        //         .append("title")
        //         .text(() => {
        //             var text_t = ""
        //             for (let k = 0; k < loc_num[i]["Section 5"].length; k++) {
        //                 var id = loc_num[i]["Section 5"][k]
        //                 var from = tmp_char[id].from

        //                 text_t += "from " + from + " to " + id + "\n"

        //             }

        //             return text_t

        //         }
        //         )
        // }
        // if (loc_num[i]["Section 6"].length > 0) {
        //     svg.append('rect')
        //         .attr("x", conf.padding.left + w * 2 * (j))
        //         .attr("y", scale.scenes(5))
        //         .attr("width", w)
        //         .attr("height", h)
        //         .attr('stroke-width', 0.2)
        //         .attr("stroke", "black")
        //         .attr('fill', colors["Section 6"])
        //         .attr("opacity", op)
        //         .append("title")
        //         .text(() => {
        //             var text_t = ""
        //             for (let k = 0; k < loc_num[i]["Section 6"].length; k++) {
        //                 var id = loc_num[i]["Section 6"][k]
        //                 var from = tmp_char[id].from

        //                 text_t += "from " + from + " to " + id + "\n"

        //             }

        //             return text_t

        //         }
        //         )
        // }
        // if (loc_num[i]["isolated area"].length > 0) {
        //     svg.append('rect')
        //         .attr("x", conf.padding.left + w * 2 * (j))
        //         .attr("y", scale.scenes(6))
        //         .attr("width", w)
        //         .attr("height", h)
        //         .attr('stroke-width', 0.2)
        //         .attr("stroke", "black")
        //         .attr('fill', colors["isolated area"])
        //         .attr("opacity", op)
        //         .append("title")
        //         .text(() => {
        //             var text_t = ""
        //             for (let k = 0; k < loc_num[i]["isolated area"].length; k++) {
        //                 var id = loc_num[i]["isolated area"][k]
        //                 var from = tmp_char[id].from

        //                 text_t += "from " + from + " to " + id + "\n"

        //             }

        //             return text_t

        //         }
        //         )


        // }
    }

    minMapG.append("rect")
    .attr("id", "minMapBackGround")
    .attr("x", 0)
    .attr("y", 10)
    .attr("width",conf.width )
    .attr("height", conf.miniMapHeight-10)
    .attr("fill", backgroundColor)
    .attr("stroke", '#e9edf7')
    .attr("stroke-width", "3px")


    reDrawFram()



    // var scene = ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5", "Section 6"]
    var tuliPadding = 900/scene.length
    var tuli = scenesG.append("g")
        .selectAll("g")
        .data(scene)
        .enter()
        .append("g")
    tuli.append("rect")
        .attr("x", (d, i) => {

            return (i+1)*tuliPadding-35;
        })
        .attr("y", (d, i) => {
            return 4
        })
        .attr("width", (d, i) => 30)
        .attr("height", 20)
        .attr("fill", (d, i) => {
            return colors[Object.keys(colors)[i]]
        })
        .attr('rx',5)
    tuli.append("text")
        .text((d) => d)
        .attr("x", (d, i) => {

            return (i+1)*tuliPadding;
        })
        .attr("y", (d, i) => {
            return 18
        })
        .attr("fill", (d, i) => {
            // return colors[d]
        })
        .attr("font-size", 12)
        
    if (_isdraw) { // 仅一人感染时会报错
        
        var scene_scale_cell = conf.height-tuliHeight
        console.log(scene_scale_cell)
        if (locations.length > 1) {
            scene_scale_cell = scale.scenes(locations[0].id) - scale.scenes(locations[1].id)
            scene_scale_cell = Math.abs(scene_scale_cell)
        }
        // console.log(characters)
        console.log(locations)
        console.log(scene_scale_cell)


        let line = d3.line()
            .x(((d) => {
                // console.log(d)
                return d[0]
            }))
            .y((d) => d[1])
            .curve(d3.curveCardinal);

        let link = d3.linkHorizontal()
            .source((d) => {
                // console.log(d)
                return d[0]
            })
            .target((d) => d[1])

        //-------以时刻为对象画线--------//
        //将选中人物的线放在中间
        for (let i = 0; i < characters.length; i++) {
            if (characters[i].id == force_role.id) {
                var j = parseInt(characters.length / 2)
                var tmp = characters[i]
                characters[i] = characters[j]
                characters[j] = tmp
                // console.log(characters, force_role)
                break
            }
        }
        //场景内 线的位置关系
        console.log("ajack",characters)
        console.log("ajack",characters.map(d => {
            console.log(d)
            return d.id
        }))
        console.log(scene_scale_cell)
        let role_padding = d3.scaleBand()
            .domain(characters.map(d => {
                console.log(d)
                return d.id
            }))
            .range([0, scene_scale_cell])


        //绘制开始时刻线
        {
            // for (let i = 0; i < characters.length; i++) {
            //     var pre = sessions[characters[i].id][0].loc
            //     var line_data = [
            //         [scale.ticks(0), scale.scenes(pre) + role_padding(characters[i].id) + 2],
            //         [scale.ticks(0) + w / 2, scale.scenes(pre) + role_padding(characters[i].id) + 2],
            //     ]
            //     svg.append('g')
            //         .attr("class", () => "line" + characters[i].name)
            //         .append("path")
            //         .attr('d', line(line_data))
            //         .attr("opacity", (d, j) => {
            //             // console.log(tmp_char[characters[i].id], force_role.id)
            //             if (sessions[characters[i].id][0].state == "susceptible" && sessions[characters[i].id][1].state == "exposed" || force_role.id == characters[i].id)
            //                 return 1
            //             else if (characters[i].id == tmp_char[force_role.id].from)
            //                 return 1
            //             else
            //                 return 0.2
            //         })
            //         .attr('stroke', (d) => {
            //             return colors_state[sessions[characters[i].id][0].state]
            //         })
            //         .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
            //         .attr('fill', "none")
            // }
        }
        // console.log(ticks)

        //按规律 绘制中间时刻的线
        for (let t = 0; t < ticks.length - 1; t++) {

            for (let i = 0; i < characters.length; i++) {
                if (characters[i].id == force_role.id) {
                    var j = parseInt(characters.length / 2)
                    var tmp = characters[i]
                    // console.log(j)
                    characters[i] = characters[j]
                    characters[j] = tmp
                    // console.log(characters[i], force_role)

                }
            }

            for (let i = 0; i < characters.length; i++) {
                // console.log(tmp_char[characters[i].id].infected == ticks[t])
                if (tmp_char[characters[i].id].infected == ticks[t + 1]) {
                    var j = parseInt(characters.length / 2 - 1)
                    // console.log(j, i)
                    var tmp = characters[i]
                    characters[i] = characters[j]
                    characters[j] = tmp
                }
            }
            if (t == 0) {
                for (let i = 0; i < characters.length; i++) {
                    // console.log(tmp_char[characters[i].id].infected == ticks[t])
                    if (characters[i].id == tmp_char[force_role.id].from) {
                        var j = parseInt(characters.length / 2 + 0.5)
                        // console.log(j, i)
                        var tmp = characters[i]
                        characters[i] = characters[j]
                        characters[j] = tmp
                    }
                }
            }
            // console.log(characters, t)
            //场景内 线的位置关系
            let role_padding_second = d3.scaleBand()
                .domain(characters.map(d => {
                    // console.log(d)
                    if (d != undefined)
                        return d.id
                    else
                        characters.slice(0, 1)
                }))
                .range([0, scene_scale_cell])


            //左侧 感染后在场景内
            let textFlag = 0
            console.log("character",characters)
            for (let i = 0; i < characters.length; i++) {
                // storyLineG.selectAll(".storyLineId").remove()
                console.log("characters",characters)
                var pre = sessions[characters[i].id][t].loc
                console.log(characters[i].id,role_padding(characters[i].id))
                console.log(pre,h,role_padding(characters[i].id), h*(pre) + role_padding(characters[i].id) + 2+5)
                var line_data = [
                    [scale.ticks(t) + w / 2, h*(pre) + role_padding(characters[i].id) +tuliHeight],
                    [scale.ticks(t) + w*3/4-textArea, h*(pre) + role_padding(characters[i].id) +tuliHeight],
                ]
                console.log(line_data)
                storyLineG.append('g')
                    .attr("class", () => "line" + characters[i].name)
                    .append("path")
                    .attr('d', line(line_data))
                    .attr("opacity", (d, j) => {
                        if (t == 0)
                            if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (characters[i].id == tmp_char[force_role.id].from)
                                return 1
                            else
                                return 0.2
                        if (t > 0)
                            if (sessions[characters[i].id][t - 1].state == "susceptible" && sessions[characters[i].id][t].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else
                                return 0.2
                    })
                    .attr('stroke', (d) => {
                        return colors_state[sessions[characters[i].id][t].state]
                    })
                    .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
                    .attr('fill', "none")

                var LineG = d3.select(`.line${characters[i].name}`)
                LineG.append("text")
                    .text(()=>{
                        console.log(i)
                        return characters[i].name
                    })
                    .attr("class","storyLineId")
                    .attr('y',h*(pre) + role_padding(characters[i].id) +tuliHeight+2)
                    .attr('x',scale.ticks(t) + w *3/4-textArea)
                line_data = [
                    [scale.ticks(t) + w*3/4+textArea, h*(pre) + role_padding(characters[i].id) +tuliHeight],
                    [scale.ticks(t) + w, h*(pre) + role_padding(characters[i].id) +tuliHeight],
                ] 
                storyLineG.append('g')
                    .attr("class", () => "line" + characters[i].name)
                    .append("path")
                    .attr('d', line(line_data))
                    .attr("opacity", (d, j) => {
                        if (t == 0)
                            if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (characters[i].id == tmp_char[force_role.id].from)
                                return 1
                            else
                                return 0.2
                        if (t > 0)
                            if (sessions[characters[i].id][t - 1].state == "susceptible" && sessions[characters[i].id][t].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else
                                return 0.2
                    })
                    .attr('stroke', (d) => {
                        return colors_state[sessions[characters[i].id][t].state]
                    })
                    .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
                    .attr('fill', "none")
                
                

            }
            // if(textFlag){
            // for (let i = 0; i < characters.length; i++) {
            
            //     textFlag=1
            // }

            // }
            
            
            //中间 移动切换场景
            for (let i = 0; i < characters.length; i++) {
                var pre = sessions[characters[i].id][t].loc
                var cur = sessions[characters[i].id][t + 1].loc
                var line_data = [
                    [scale.ticks(t) + w, h*(pre) + role_padding(characters[i].id) + tuliHeight],
                    [scale.ticks(t + 1), h*(cur) + role_padding_second(characters[i].id) +tuliHeight],
                ]
                storyLineG.append('g')
                    .attr("class", () => "line" + characters[i].name)
                    .append("path")
                    .attr('d', link(line_data))
                    .attr("opacity", (d, j) => {
                        if (t == 0)
                            if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (characters[i].id == tmp_char[force_role.id].from)
                                return 1
                            else
                                return 0.2
                        if (t > 0)
                            if (sessions[characters[i].id][t - 1].state == "susceptible" && sessions[characters[i].id][t].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else
                                return 0.2
                    })
                    .attr('stroke', (d) => {
                        return colors_state[sessions[characters[i].id][t].state]
                    })
                    .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
                    .attr('fill', "none")
            }
            //右侧 进入新场景，未进行感染
            for (let i = 0; i < characters.length; i++) {
                var pre = sessions[characters[i].id][t + 1].loc
                var cur = sessions[characters[i].id][t + 1].loc
                var line_data = [
                    [scale.ticks(t + 1), h*(pre) + role_padding_second(characters[i].id) + tuliHeight],
                    [scale.ticks(t + 1) + w / 2, h*(cur) + role_padding_second(characters[i].id) + tuliHeight],
                ]
                storyLineG.append('g')
                    .attr("class", () => "line" + characters[i].name)
                    .append("path")
                    .attr('d', line(line_data))
                    .attr("opacity", (d, j) => {
                        if (t == 0)
                            if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (characters[i].id == tmp_char[force_role.id].from)
                                return 1
                            else
                                return 0.2
                        if (t > 0)
                            if (sessions[characters[i].id][t - 1].state == "susceptible" && sessions[characters[i].id][t].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else
                                return 0.2
                    })
                    .attr('stroke', (d) => {
                        return colors_state[sessions[characters[i].id][t].state]
                    })
                    .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
                    .attr('fill', "none")
            }
            //发生感染 聚焦到点
            for (let i = 0; i < characters.length; i++) {
                var pre = sessions[characters[i].id][t].loc
                var line_data = [
                    [scale.ticks(t) + w / 2, h*(pre) + role_padding(characters[i].id) + tuliHeight],
                    [scale.ticks(t) + w, h*(pre) + role_padding(characters[i].id) + tuliHeight],
                ]
                storyLineG.append('g')
                    .append("circle")
                    .attr("cx", (d) => {
                        return scale.ticks(t) + w / 2
                    })
                    .attr("cy", h*(pre) + role_padding(characters[i].id) +tuliHeight)
                    .attr("r", (d, j) => {
                        return 2
                    })
                    .attr("fill", (d, j) => {
                        return "none"
                    })
                    .attr("stroke", (d, j) => {
                        if (t > 0)
                            if (sessions[characters[i].id][t - 1].state == "susceptible" && sessions[characters[i].id][t].state == "exposed")
                                return "#111"
                            else
                                return "none"
                    })
                    .attr("stroke-width", (d, j) => {
                        return 1
                    })
                    .append("title")
                    .text(() => {
                        // console.log(tmp_char[characters[i].name])
                        var text_t = ""
                        var from = tmp_char[characters[i].name].from
                        var id = tmp_char[characters[i].name].id
                        text_t += "from " + from + " to " + id + "\n"

                        return text_t

                    })
            }

            role_padding = role_padding_second
        }
        //绘制最后时刻线
        {
            // for (let i = 0; i < characters.length; i++) {
            //     var pre = sessions[characters[i].id][ticks.length - 1].loc
            //     var line_data = [
            //         [scale.ticks(ticks.length - 1) + w / 2, scale.scenes(pre) + role_padding(characters[i].id) + 2],
            //         [scale.ticks(ticks.length - 1) + w, scale.scenes(pre) + role_padding(characters[i].id) + 2],
            //     ]
            //     svg.append('g')
            //         .attr("class", () => "line" + characters[i].name)
            //         .append("path")
            //         .attr('d', line(line_data))
            //         .attr("opacity", (d, j) => {
            //             if (sessions[characters[i].id][ticks.length - 2].state == "susceptible" && sessions[characters[i].id][ticks.length - 1].state == "exposed" || force_role.id == characters[i].id)
            //                 return 1
            //             else
            //                 return 0.2
            //         })
            //         .attr('stroke', (d) => {
            //             return colors_state[sessions[characters[i].id][ticks.length - 1].state]
            //         })
            //         .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
            //         .attr('fill', "none")
            // }
        }
        //-------以线为对象绘制-------//
        // console.log(characters, force_role)
        // while(1){

        //         var j = parseInt(characters.length / 2)

        //         var tmp = characters[0]
        //         characters[0] = characters[j]
        //         characters[j] = tmp
        //         // console.log(characters, force_role)
        //         break
        // }

        // for (let i = 0; i < characters.length; ++i) {
        //     let session = sessions[characters[i].id]
        //     // console.log(characters[i])
        //     // console.log(session_size)
        //     let line_data = d3.range(1, session_size + 1).map(idx => {
        //         let pre = session[idx - 1].loc
        //         if (tmp_char[characters[i].name].infected == ticks[idx - 1]) {
        //             return [
        //                 [scale.ticks(idx - 1) + w / 2, scale.scenes(pre) + (role_padding(tmp_char[characters[i].name].from)) + 2],
        //                 [scale.ticks(idx - 1) + w, scale.scenes(pre) + role_padding(characters[i].id) + (role_padding(tmp_char[characters[i].name].from) - role_padding(characters[i].id)) * 2 + 2],
        //             ]
        //         }
        //         return [
        //             [scale.ticks(idx - 1) + w / 2, scale.scenes(pre) + role_padding(characters[i].id) + 2],
        //             [scale.ticks(idx - 1) + w, scale.scenes(pre) + role_padding(characters[i].id) + 2],
        //         ]


        //     })

        //     let line_data_first = d3.range(1, session_size + 1).map(idx => {
        //         let pre = session[idx - 1].loc
        //         console.log(idx, ticks[idx - 1], tmp_char[characters[i].name], tmp_char[characters[i].name].id)
        //         if (tmp_char[characters[i].name].infected == ticks[idx - 1]) {
        //             return [
        //                 [scale.ticks(idx - 1), scale.scenes(pre) + role_padding(characters[i].id) + 2],
        //                 [scale.ticks(idx - 1) + w / 2, scale.scenes(pre) + (role_padding(tmp_char[characters[i].name].from)) + 2],
        //             ]
        //         }
        //         return [
        //             [scale.ticks(idx - 1), scale.scenes(pre) + role_padding(characters[i].id) + 2],
        //             [scale.ticks(idx - 1) + w / 2, scale.scenes(pre) + role_padding(characters[i].id) + 2],
        //         ]


        //     })

        //     let line_move = d3.range(1, session_size).map(idx => {
        //         let pre = session[idx - 1].loc,
        //             cur = session[idx].loc
        //         if (tmp_char[characters[i].name].infected == ticks[idx - 1]) {
        //             return [
        //                 [scale.ticks(idx - 1) + w, scale.scenes(pre) + role_padding(characters[i].id) + (role_padding(tmp_char[characters[i].name].from) - role_padding(characters[i].id)) * 2 + 2],
        //                 [scale.ticks(idx), scale.scenes(cur) + role_padding(characters[i].id) + 2],
        //             ]
        //         }
        //         return [
        //             [scale.ticks(idx) - w, scale.scenes(pre) + role_padding(characters[i].id) + 2],
        //             [scale.ticks(idx), scale.scenes(cur) + role_padding(characters[i].id) + 2],
        //         ]

        //     })

        //     // console.log(line_data)
        // svg.append('g')
        //     .attr("id", () => "line" + characters[i].name)
        //     .selectAll('path')
        //     .data(line_data)
        //     .join('path')
        //     .attr('d', line)
        //     .attr("opacity", (d, j) => {
        //         if (force_role.id == characters[i].id)
        //             return 1
        //         if (j < 2 && characters[i].id == force_role.state[force_role.tick].from.id)
        //             return 1
        //         // if (j < session.length - 1 && j > 0) {
        //         //     if (session[j].state == session[j + 1].state && session[j].state == session[j - 1].state)
        //         //         return 0.1
        //         // }
        //         // else if (j == 0) {
        //         //     if (session[j].state == session[j + 1].state)
        //         //         return 0.1
        //         // }
        //         // else if (j == session.length - 1) {
        //         //     if (session[j].state == session[j - 1].state)
        //         //         return 0.1
        //         // }
        //         if (j < session.length - 1 && j > 0) {
        //             if ((session[j].state == "susceptible" && session[j + 1].state == "exposed") || (session[j - 1].state == "susceptible" && session[j].state == "exposed"))
        //                 return 1
        //         }
        //         return 0.1
        //     })
        //     .attr('stroke', (d, i) => {
        //         return colors_state[session[i].state]
        //     })
        //     .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
        //     .attr('fill', "none")

        //     svg.append('g')
        //         .attr("id", () => "line" + characters[i].name)
        //         .selectAll('path')
        //         .data(line_data_first)
        //         .join('path')
        //         .attr('d', line)
        //         .attr("opacity", (d, j) => {
        //             if (force_role.id == characters[i].id)
        //                 return 1
        //             if (j < 2 && characters[i].id == force_role.state[force_role.tick].from.id)
        //                 return 1
        //             // if (j < session.length - 1 && j > 0) {
        //             //     if (session[j].state == session[j + 1].state && session[j].state == session[j - 1].state)
        //             //         return 0.1
        //             // }
        //             // else if (j == 0) {
        //             //     if (session[j].state == session[j + 1].state)
        //             //         return 0.1
        //             // }
        //             // else if (j == session.length - 1) {
        //             //     if (session[j].state == session[j - 1].state)
        //             //         return 0.1
        //             // }
        //             if (j < session.length - 1 && j > 0) {
        //                 if (session[j].state == "susceptible" && session[j + 1].state == "exposed" || session[j - 1].state == "susceptible" && session[j].state == "exposed")
        //                     return 1
        //             }
        //             return 0.1
        //         })
        //         .attr('stroke', (d, i) => {
        //             if (i != 0)
        //                 return colors_state[session[i - 1].state]
        //             else
        //                 return colors_state[session[i].state]
        //         })
        //         .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
        //         .attr('fill', "none")


        //     svg.append('g')
        //         .selectAll('path')
        //         .data(line_move)
        //         .join('path')
        //         .attr('d', link)
        //         .attr("opacity", (d, j) => {
        //             if (force_role.id == characters[i].id)
        //                 return 1
        //             if (j < 2 && characters[i].id == force_role.state[force_role.tick].from.id)
        //                 return 1
        //             // if (j < session.length - 1 && j > 0) {
        //             //     if (session[j].state == session[j + 1].state && session[j].state == session[j - 1].state)
        //             //         return 0.1
        //             // }
        //             // else if (j == 0) {
        //             //     if (session[j].state == session[j + 1].state)
        //             //         return 0.1
        //             // }
        //             // else if (j == session.length - 1) {
        //             //     if (session[j].state == session[j - 1].state)
        //             //         return 0.1
        //             // }
        //             if (j < session.length - 1 && j > 0) {
        //                 if (session[j].state == "susceptible" && session[j + 1].state == "exposed" || session[j - 1].state == "susceptible" && session[j].state == "exposed")
        //                     return 1
        //             }
        //             return 0.1
        //         })
        //         .attr('stroke', (d, i) => {
        //             return colors_state[session[i].state]
        //         })
        //         .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
        //         .attr('fill', "none")


        //     svg.append('g')
        //         .selectAll('circle')
        //         .data(line_data)
        //         .join('circle')
        //         .attr("cx", (d) => {
        //             // console.log(d[0][0])
        //             return d[0][0]
        //         })
        //         .attr("cy", (d) => d[0][1])
        //         .attr("r", () => {
        //             if (force_role.id == characters[i].id)
        //                 return 2
        //             else
        //                 return 1
        //         })
        //         .attr("fill", (d, j) => {
        //             // if (j < session.length - 1 && j > 0)
        //             //     if (session[j].state == session[j + 1].state && session[j].state == session[j - 1].state)
        //             //         return "none"
        //             // return colors_state[session[j].state]
        //             return "none"
        //         })



        //     svg.append('g')
        //         .selectAll('circle')
        //         .data(line_data)
        //         .join('circle')
        //         .attr("cx", (d) => {
        //             // console.log(d[0][0])
        //             return d[0][0]
        //         })
        //         .attr("cy", (d) => d[0][1])
        //         .attr("r", (d, j) => {
        //             var r = 0
        //             if (j != 0)
        //                 if (session[j - 1].state == "susceptible" && session[j].state == "exposed")
        //                     r = 1
        //             if (force_role.id == characters[i].id)
        //                 return r + 2
        //             else
        //                 return r + 1
        //         })
        //         .attr("fill", (d, j) => {
        //             // if (j < session.length - 1 && j > 0)
        //             //     if (session[j].state == session[j + 1].state && session[j].state == session[j - 1].state)
        //             //         return "none="
        //             // return colors_state[session[j].state]

        //             return "none"
        //         })
        //         .attr("stroke", (d, j) => {
        //             if (j != 0)
        //                 if (session[j - 1].state == "susceptible" && session[j].state == "exposed")
        //                     return "#111"
        //         })
        //         .attr("stroke-width", (d, j) => {
        //             if (j != 0)
        //                 if (session[j - 1].state == "susceptible" && session[j].state == "exposed")
        //                     return 1
        //         })
        //         .append("title")
        //         .text(() => {
        //             // console.log(tmp_char[characters[i].name])
        //             var text_t = ""
        //             var from = tmp_char[characters[i].name].from
        //             var id = tmp_char[characters[i].name].id
        //             text_t += "from " + from + " to " + id + "\n"

        //             return text_t

        //         })

        // }

        // .selectAll("path")
        // .data(d=>sessions[d.id].reduce((pre, cur, idx)=>[
        //     [scale.ticks(idx - 1), scale.scenes(pre)],
        //     [scale.ticks(idx),     scale.scenes(cur)],
        // ]))
        // .join("path")
        //     .attr('d', line)
        //     .attr('stroke', '#333')
        //     .attr("stroke-width", '2')

        scenesG.append('g')
            .attr('transform','translate(0,215)')
            .call(xAxis1);
    }
    if (_isdraw) { // 仅一人感染时会报错,代码同上面一样，目的在于在缩放图添加一个一样的图



        var scene_scale_cell = conf.height
        console.log(scene_scale_cell)
        if (locations.length > 1) {
            scene_scale_cell = scale.scenes(locations[0].id) - scale.scenes(locations[1].id)
            scene_scale_cell = Math.abs(scene_scale_cell)
        }
        // console.log(characters)
        console.log(locations)
        console.log(scene_scale_cell)

        var k=0.30


        let line = d3.line()
            .x(((d) => {
                // console.log(d)
                return d[0]
            }))
            .y((d) => d[1])
            .curve(d3.curveCardinal);

        let link = d3.linkHorizontal()
            .source((d) => {
                // console.log(d)
                return d[0]
            })
            .target((d) => d[1])

        //-------以时刻为对象画线--------//
        //将选中人物的线放在中间
        for (let i = 0; i < characters.length; i++) {
            if (characters[i].id == force_role.id) {
                var j = parseInt(characters.length / 2)
                var tmp = characters[i]
                characters[i] = characters[j]
                characters[j] = tmp
                // console.log(characters, force_role)
                break
            }
        }
        //场景内 线的位置关系
        console.log("ajack",characters)
        console.log("ajack",characters.map(d => {
            console.log(d)
            return d.id
        }))
        console.log(scene_scale_cell)
        let role_padding = d3.scaleBand()
            .domain(characters.map(d => {
                console.log(d)
                return d.id
            }))
            .range([0, scene_scale_cell])


        

        //按规律 绘制中间时刻的线
        for (let t = 0; t < ticks.length - 1; t++) {

            for (let i = 0; i < characters.length; i++) {
                if (characters[i].id == force_role.id) {
                    var j = parseInt(characters.length / 2)
                    var tmp = characters[i]
                    // console.log(j)
                    characters[i] = characters[j]
                    characters[j] = tmp
                    // console.log(characters[i], force_role)

                }
            }

            for (let i = 0; i < characters.length; i++) {
                // console.log(tmp_char[characters[i].id].infected == ticks[t])
                if (tmp_char[characters[i].id].infected == ticks[t + 1]) {
                    var j = parseInt(characters.length / 2 - 1)
                    // console.log(j, i)
                    var tmp = characters[i]
                    characters[i] = characters[j]
                    characters[j] = tmp
                }
            }
            if (t == 0) {
                for (let i = 0; i < characters.length; i++) {
                    // console.log(tmp_char[characters[i].id].infected == ticks[t])
                    if (characters[i].id == tmp_char[force_role.id].from) {
                        var j = parseInt(characters.length / 2 + 0.5)
                        // console.log(j, i)
                        var tmp = characters[i]
                        characters[i] = characters[j]
                        characters[j] = tmp
                    }
                }
            }
            // console.log(characters, t)
            //场景内 线的位置关系
            let role_padding_second = d3.scaleBand()
                .domain(characters.map(d => {
                    // console.log(d)
                    if (d != undefined)
                        return d.id
                    else
                        characters.slice(0, 1)
                }))
                .range([0, scene_scale_cell])


            //左侧 感染后在场景内
            console.log("character",characters)
            for (let i = 0; i < characters.length; i++) {
                // console.log(characters)
                var pre = sessions[characters[i].id][t].loc
                console.log(characters[i].id,role_padding(characters[i].id))
                console.log(pre,h,role_padding(characters[i].id), h*(pre) + role_padding(characters[i].id) + 2+5)
                var line_data = [
                    [scale.ticks(t) + w / 2, (h*(pre) + role_padding(characters[i].id) + 2+5)*k+10],
                    [scale.ticks(t) + w, (h*(pre) + role_padding(characters[i].id) + 2+5)*k+10],
                ]
                console.log(line_data)
                minMapG.append('g')
                    .attr("class", () => "line" + characters[i].name)
                    .append("path")
                    .attr('d', line(line_data))
                    .attr("opacity", (d, j) => {
                        if (t == 0)
                            if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (characters[i].id == tmp_char[force_role.id].from)
                                return 1
                            else
                                return 0.2
                        if (t > 0)
                            if (sessions[characters[i].id][t - 1].state == "susceptible" && sessions[characters[i].id][t].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else
                                return 0.2
                    })
                    .attr('stroke', (d) => {
                        return colors_state[sessions[characters[i].id][t].state]
                    })
                    .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
                    .attr('fill', "none")
            }
            //中间 移动切换场景
            for (let i = 0; i < characters.length; i++) {
                var pre = sessions[characters[i].id][t].loc
                var cur = sessions[characters[i].id][t + 1].loc
                var line_data = [
                    [scale.ticks(t) + w, (h*(pre) + role_padding(characters[i].id) + 2+5)*k+10],
                    [scale.ticks(t + 1), (h*(cur) + role_padding_second(characters[i].id) + 2+5)*k+10],
                ]
                minMapG.append('g')
                    .attr("class", () => "line" + characters[i].name)
                    .append("path")
                    .attr('d', link(line_data))
                    .attr("opacity", (d, j) => {
                        if (t == 0)
                            if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (characters[i].id == tmp_char[force_role.id].from)
                                return 1
                            else
                                return 0.2
                        if (t > 0)
                            if (sessions[characters[i].id][t - 1].state == "susceptible" && sessions[characters[i].id][t].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else
                                return 0.2
                    })
                    .attr('stroke', (d) => {
                        return colors_state[sessions[characters[i].id][t].state]
                    })
                    .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
                    .attr('fill', "none")
            }
            //右侧 进入新场景，未进行感染
            for (let i = 0; i < characters.length; i++) {
                var pre = sessions[characters[i].id][t + 1].loc
                var cur = sessions[characters[i].id][t + 1].loc
                var line_data = [
                    [scale.ticks(t + 1), (h*(pre) + role_padding_second(characters[i].id) + 2+5)*k+10],
                    [scale.ticks(t + 1) + w / 2, (h*(cur) + role_padding_second(characters[i].id) + 2+5)*k+10],
                ]
                minMapG.append('g')
                    .attr("class", () => "line" + characters[i].name)
                    .append("path")
                    .attr('d', line(line_data))
                    .attr("opacity", (d, j) => {
                        if (t == 0)
                            if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (characters[i].id == tmp_char[force_role.id].from)
                                return 1
                            else
                                return 0.2
                        if (t > 0)
                            if (sessions[characters[i].id][t - 1].state == "susceptible" && sessions[characters[i].id][t].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else if (sessions[characters[i].id][t].state == "susceptible" && sessions[characters[i].id][t + 1].state == "exposed" || force_role.id == characters[i].id)
                                return 1
                            else
                                return 0.2
                    })
                    .attr('stroke', (d) => {
                        return colors_state[sessions[characters[i].id][t].state]
                    })
                    .attr("stroke-width", (force_role.id == characters[i].id ? 4 : 2))
                    .attr('fill', "none")
            }
            //发生感染 聚焦到点
            for (let i = 0; i < characters.length; i++) {
                var pre = sessions[characters[i].id][t].loc
                var line_data = [
                    [scale.ticks(t) + w / 2, (h*(pre) + role_padding(characters[i].id) + 2+5)*k+10],
                    [scale.ticks(t) + w, (h*(pre) + role_padding(characters[i].id) + 2+5)*k+10],
                ]
                minMapG.append('g')
                    .append("circle")
                    .attr("cx", (d) => {
                        return scale.ticks(t) + w / 2
                    })
                    .attr("cy", (h*(pre) + role_padding(characters[i].id) + 2+5)*k+10)
                    .attr("r", (d, j) => {
                        return 2
                    })
                    .attr("fill", (d, j) => {
                        return "none"
                    })
                    .attr("stroke", (d, j) => {
                        if (t > 0)
                            if (sessions[characters[i].id][t - 1].state == "susceptible" && sessions[characters[i].id][t].state == "exposed")
                                return "#111"
                            else
                                return "none"
                    })
                    .attr("stroke-width", (d, j) => {
                        return 1
                    })
                    .append("title")
                    .text(() => {
                        // console.log(tmp_char[characters[i].name])
                        var text_t = ""
                        var from = tmp_char[characters[i].name].from
                        var id = tmp_char[characters[i].name].id
                        text_t += "from " + from + " to " + id + "\n"

                        return text_t

                    })
            }

            role_padding = role_padding_second
        }
        
    }
}
function dragged(event) {
        minDistance = 100
        {
            if ((this.id == "leftLine" || this.id == "leftDragRect") && rightLineX - event.x >= minDistance
                && event.x >= leftBoundary && event.x < Math.max(rightBoundary, rightX)) {
                this.style.cursor = "e-resize"
                d3.select("#leftLine")
                    .attr("x", event.x);
                d3.select("#leftDragRect")
                    .attr("x", event.x);

                leftLineX = event.x;
            }
            else if ((this.id == "rightLine" || this.id == "rightDragRect") && event.x - leftLineX >= minDistance
                && event.x <= Math.max(rightBoundary, rightX)) {
                this.style.cursor = "e-resize"
                d3.select("#rightLine")
                    .attr("x", event.x);
                d3.select("#rightDragRect")
                    .attr("x", event.x);
                rightLineX = event.x;
            }
            // console.log("leftLineX: ", leftLineX)
            // console.log("rightLineX: ", rightLineX);
            reDrawFram()
        }
    }
    function writeEndTransform() {
        transformx = FramTranformX;
        this.style.cursor = "default"
        console.log("drag:" + transformx)
    }
    var startFramX = 0;
    var endFramX = 0;
    var Framdrag = d3.drag()
        .on("start", writeStartPosition)
        .on("drag", dragFram)
        .on("end", writeEndPosition)
    var moveX = 0;
    function writeStartPosition(event) {
        console.log(event)
        startFramX = event.x;
        endFramX = startFramX;
    }
    function dragFram(event) {
        var storyLineG = d3.select("#storyLineG")
        moveX = event.x
        var hypoLeftX = leftLineX + moveX - startFramX
        var hypoRightX = rightLineX + moveX - startFramX

        if (hypoLeftX < leftBoundary || hypoLeftX > rightX || hypoRightX > Math.max(rightBoundary, rightX)) {
            moveX = endFramX
            hypoLeftX = leftLineX + moveX - startFramX
            hypoRightX = rightLineX + moveX - startFramX
        }
        d3.select("#leftLine")
            .attr("x", hypoLeftX)
        d3.select("#leftDragRect")
            .attr("x", hypoLeftX - dragRectWidth)
        d3.select("#rightDragRect")
            .attr("x", hypoRightX - dragRectWidth)
        d3.select("#rightLine")
            .attr("x", hypoRightX)
        d3.select("#topLine")
            .attr("x", hypoLeftX)
            .attr("width", rightLineX - leftLineX + lineWidth)
        d3.select("#bottomLine")
            .attr("x", hypoLeftX)
            .attr("width", rightLineX - leftLineX + lineWidth)
        d3.select("#centerRect")
            .attr("width", rightLineX - leftLineX + lineWidth)
            .attr("x", hypoLeftX - dragRectWidth)
        endFramX = moveX;
        computeY()
        storyLineG
            .attr("transform", "translate(" + [transformx - (moveX - startFramX) * scale * SvgTransformK, 0] + ") scale(" + SvgTransformK + ",1)")

        adjustAxes()
        xScaleG
            .attr("transform", "translate(" + [transformx - (moveX - startFramX) * scale * SvgTransformK,] + ")")

        // for (i = 0; i < click_flag.length; i++) {
        //     if (click_flag[i] == 1) {
        //         d3.select("#WordCloud" + i).remove();
        //         d3.select("#line" + i).remove();
        //         click_flag[i] = 0;
        //     }
        // }
    }
    function writeEndPosition() {
        leftLineX += endFramX - startFramX;
        rightLineX += endFramX - startFramX;
        transformx = transformx - (moveX - startFramX) * scale * SvgTransformK
        console.log("draw Fram:" + transformx)
    }
    function reDrawFram() {
        var minMapG = d3.select("#minMapG")
        var storyLineG = d3.select("#storyLineG")
        d3.select("#topLine").remove()
        d3.select("#bottomLine").remove()
        d3.select("#leftDragRect").remove()
        d3.select("#rightDragRect").remove()
        d3.select("#centerRect").remove()
        d3.select("#leftLine").remove()
        d3.select("#rightLine").remove()
        var centerRectWidth = rightLineX - leftLineX;
        minMapG.append("rect")
        .attr("id", "leftLine")
        .attr("width", lineWidth)
        .attr("height", rectHeight)
        .attr("x", leftLineX)
        .attr("y", topY)
        .attr("fill", FramColor)
        .on("mouseover", function () {
            this.style.cursor = "e-resize";
            d3.select(this).style("stroke", mouseOverColor)
        })
        .on("mouseout", function () {
            this.style.cursor = "default";
            d3.select(this).style("stroke", dragRectColor)
        })
        .call(drag)

    minMapG.append("rect")
        .attr("id", "rightLine")
        .attr("width", lineWidth)
        .attr("height", rectHeight)
        .attr("x", rightLineX)
        .attr("y", topY)
        .attr("fill", FramColor)
        .on("mouseover", function () {
            this.style.cursor = "e-resize";
            d3.select(this).style("stroke", mouseOverColor)
        })
        .on("mouseout", function () {
            this.style.cursor = "default";
            d3.select(this).style("stroke", dragRectColor)
        })
        .call(drag)
        minMapG.append("rect")
            .attr("id", "topLine")
            .attr("width", centerRectWidth + lineWidth)
            .attr("height", topLineHeight)
            .attr("x", leftLineX)
            .attr("y", topY)
            .attr("fill", FramColor)
            .attr('fill-opacity', 0.7)
            .on("mouseover", function () {
                d3.select(this).style("fill", mouseOverColor)
                this.style.cursor = "e-resize"
            })
            .on("mouseout", function () {
                d3.select(this).style("fill", FramColor)
                this.style.cursor = "default"
            })
            .call(Framdrag)
        minMapG.append("rect")
            .attr("id", "bottomLine")
            .attr("width", centerRectWidth + lineWidth)
            .attr("height", lineWidth)
            .attr("x", leftLineX)
            .attr("y", bottomY)
            .attr("fill", FramColor)
            .attr('fill-opacity', 0.7)

        minMapG.append("rect")
            .attr("id", "centerRect")
            .attr("width", centerRectWidth + lineWidth)
            .attr("height", rectHeight-topLineHeight)
            .attr("x", leftLineX)
            .attr("y", topY+topLineHeight)
            .attr("fill", mouseOverColor)
            .attr('fill-opacity', 0.1)

        minMapG.append("rect")
            .attr("id", "leftDragRect")
            .attr("width", 2 * dragRectWidth + lineWidth)
            .attr("height", dragRectHeight)
            .attr("x", leftLineX - dragRectWidth)
            .attr("y", topY + (rectHeight - dragRectHeight) / 2)
            .attr("fill", "white")
            .attr("stroke", dragRectColor)
            .on("mouseover", function () {
                this.style.cursor = "e-resize";
                d3.select(this).style("stroke", mouseOverColor)
            })
            .on("mouseout", function () {
                this.style.cursor = "default";
                d3.select(this).style("stroke", dragRectColor)
            })
            .call(drag)

        minMapG.append("rect")
            .attr("id", "rightDragRect")
            .attr("width", 2 * dragRectWidth + lineWidth)
            .attr("height", dragRectHeight)
            .attr("x", rightLineX - dragRectWidth)
            .attr("y", topY + (rectHeight - dragRectHeight) / 2)
            .attr("fill", "white")
            .attr("stroke", dragRectColor)
            .on("mouseover", function () {
                this.style.cursor = "e-resize";
                d3.select(this).style("stroke", mouseOverColor)
            })
            .on("mouseout", function () {
                this.style.cursor = "default";
                d3.select(this).style("stroke", dragRectColor)
            })
            .call(drag)

        SvgTransformK = ((width) / centerRectWidth)
        computeY()
        storyLineG
            .attr("transform", "translate(" + [- leftLineX * SvgTransformK * scale,0] + ") scale(" + (SvgTransformK) + ",1)")
        FramTranformX = - leftLineX * SvgTransformK * scale;

        adjustAxes()
        xScaleG
            .attr("transform", "translate(" + [- leftLineX * SvgTransformK * scale,] + ")")

        // for (i = 0; i < click_flag.length; i++) {
        //     if (click_flag[i] == 1) {
        //         d3.select("#WordCloud" + i).remove();
        //         d3.select("#line" + i).remove();
        //         click_flag[i] = 0;
        //     }
        // }

    }
    function computeY() {
        // recommandY = - (bottomY - topY) * SvgTransformK / 2
        recommandY = ((height - rectHeight * SvgTransformK) / 2 - topY * SvgTransformK)
    }
    const svg = d3.select("#parallel-svg")
    const miniSvg = d3.select("#parallel-svg-mini")
    var xScaleG = svg.append("g")
    function adjustAxes() {

        if (xScaleOldTransformK != SvgTransformK) {
            reSizeXScale()
        }
        xScaleOldTransformK = SvgTransformK
    }
    function reSizeXScale() {

        xScaleG.selectAll("*").remove()
        
        var cy = height - 30;
        // var cy = height - 330;
        var fontSize = 12
        var textY = cy - 5
        var cr = 5
        var xScaleColor = "#879bd7"
        var unitDistance = 30
        var rectLineHeight = 5
        // var endPageNum = dataresult1.length;
        // console.log(endPageNum, "endPageNum");
        // xScaleG.append("rect")
        //     .attr("id", "xScaleLine")
        //     .attr("height", 1)
        //     .attr("width", (keytips[1] - keytips[0]) * SvgTransformK)
        //     .attr("x", keytips[0] * SvgTransformK)
        //     .attr("y", cy + cr)
        //     .attr("fill", xScaleColor)
        //     .attr('fill-opacity', 0.8)


        // // var xScaleCircleNum = Math.round(((keytips[1] - keytips[0]) * SvgTransformK) / unitDistance);
        // // console.log("((keytips[1] - keytips[0]) * SvgTransformK)", ((keytips[1] - keytips[0]) * SvgTransformK));
        // // console.log("num", xScaleCircleNum);
        // var circleDistance = (keytips[1] - keytips[0]) * SvgTransformK / endPageNum;
        // // console.log("circleDistance", circleDistance);
        // // console.log(keytips);
        // // console.log(menuArray);
        var jiange = 10 - Math.round(SvgTransformK);
        if(jiange >= 3){
            jiange = 3;
        }
        else if(jiange > 1){
            jiange -= 1;
        }
        // console.log(SvgTransformK, "TT");
        // console.log(jiange);
        // console.log(circleDistance);
        var menuArray_num  = 1;
        var menuArray_num1 = 0;
        // for (var i = 0; i < endPageNum + 1; i++) {
        //     if(i % jiange == 0){
        //         // xScaleG.append("rect")
        //         // .attr("id", "xScaleCircle" + i)
        //         // .attr("height", rectLineHeight)
        //         // .attr("width", 1)
        //         // .attr("x", keytips[0] * SvgTransformK + i * circleDistance)
        //         // .attr("y", cy)
        //         // .attr("fill", xScaleColor)
        //         // .attr('fill-opacity', 0.8)

        //         // xScaleG.append("text")
        //         // .attr("id", "text" + i)
        //         // .attr("x", keytips[0] * SvgTransformK + i * circleDistance)
        //         // .attr("y", textY)
        //         // .attr('text-anchor', 'middle')
        //         // .text(i)
        //         // .attr("fill", xScaleColor)
        //         // .attr("font-size", fontSize + "px")
        //     }

        //     if(i == Math.round((menuArray[menuArray_num1 + 1].pagenum - menuArray[menuArray_num1].pagenum) / 2) + menuArray[menuArray_num1].pagenum){
        //         xScaleG.append("text")
        //         .attr("id", "text" + i)
        //         .attr("x", keytips[0] * SvgTransformK + i * circleDistance)
        //         .attr("y", textY + fontSize * 2)
        //         .attr('text-anchor', 'middle')
        //         .text(menuArray[menuArray_num1].title)
        //         .attr("fill", xScaleColor)
        //         .attr("font-size", fontSize / 1.1 + "px");
        //         menuArray_num1++;
        //     }

        //     // if(i == 0){
        //     //     xScaleG.append("rect")
        //     //     .attr("id", "xScaleCircle" + i)
        //     //     .attr("height", rectLineHeight)
        //     //     .attr("width", 1)
        //     //     .attr("x", keytips[0] * SvgTransformK + i * circleDistance)
        //     //     .attr("y", cy )
        //     //     .attr("fill", xScaleColor)
        //     //     .attr('fill-opacity', 1);
        //     //     menuArray_num++;
        //     // }

        //     // if(i == menuArray[menuArray_num].pagenum){
        //     //     xScaleG.append("rect")
        //     //     .attr("id", "xScaleCircle" + i)
        //     //     .attr("height", rectLineHeight)
        //     //     .attr("width", 1)
        //     //     .attr("x", keytips[0] * SvgTransformK + i * circleDistance)
        //     //     .attr("y", cy)
        //     //     .attr("fill", xScaleColor)
        //     //     .attr('fill-opacity', 1);
        //     //     menuArray_num++;
        //     // }


        //     // if(i == endPageNum){
        //     //     xScaleG.append("rect")
        //     //     .attr("id", "xScaleCircle" + i)
        //     //     .attr("height", rectLineHeight)
        //     //     .attr("width", 1)
        //     //     .attr("x", keytips[0] * SvgTransformK + i * circleDistance)
        //     //     .attr("y", cy)
        //     //     .attr("fill", xScaleColor)
        //     //     .attr('fill-opacity', 1);
        //     //     menuArray_num++;
        //     // }

        //     // xScaleG.append("rect")
        //     //     .attr("id", "xScaleCircle" + i)
        //     //     .attr("height", rectLineHeight)
        //     //     .attr("width", 1)
        //     //     .attr("x", keytips[0] * SvgTransformK + i * circleDistance)
        //     //     .attr("y", cy)
        //     //     .attr("fill", xScaleColor)
        //     //     .attr('fill-opacity', 0.8)

        //     // xScaleG.append("text")
        //     //     .attr("id", "text" + i)
        //     //     .attr("x", keytips[0] * SvgTransformK + i * circleDistance)
        //     //     .attr("y", textY)
        //     //     .attr('text-anchor', 'middle')
        //     //     .text(i)
        //     //     .attr("fill", xScaleColor)
        //     //     .attr("font-size", fontSize + "px")
        // }
    }
function getIni(ini) {
    var _ = {}
    for (let k in ini) {
        _[k] = ini[k].value
    }
    return _
}