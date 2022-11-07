/* eslint-disable */

import { objectToString } from '@vue/shared';
import { onMounted, inject, watch, resolveComponent } from 'vue'
import { injects } from '../../js/injects'
import { dt2t, last, t2dt } from '../../js/kit'

var d3 = require('d3');

function setup() {
    var ini = injects()
    watch(ini.force_role, () => display(ini), { immediate: false })
    watch(ini.stateupdated, () => display(ini), { immediate: false })
    watch(inject('stateUpdated'), () => display(ini), { immediate: false })
    // watch(ini.currentDay, () => display(ini), { immediate: false })
    // watch(ini.currentTick, () => display(ini), { immediate: false })
    // watch(ini.storyline_pattern, () => display(ini), { immediate: false })
    onMounted(() => {
        display(ini)
    })
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
        tmp_loc[ini.scenes[i]] = i
        loc_num_org[ini.scenes[i]] = []
        scene.push(ini.scenes[i])
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
    console.log(ini.scenes.length)

    // zjaRectDatas = []
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


    parallel_draw(story_data, loc_num, force_role, ticks, tmp_char, _isdraw, scene)
}



function parallel_draw(data, loc_num, force_role, ticks, tmp_char, _isdraw, scene) {
    console.log(scene)
    console.log(loc_num)
    const svg = d3.select("#parallel-svg").html("")

    const conf = {
        width: svg.node().clientWidth,
        height: svg.node().clientHeight,
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


    const scale = {
        scenes: d3.scaleBand()
            .domain([0, 1, 2, 3, 4, 5, 6])
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
        "isolated area": '#1891ac',
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
    var xAxis1 = d3.axisBottom().scale(time_ticks);



    var w = scale.ticks(1) - scale.ticks(0)
    // for (let i = t; i < ed_t && i < ((t + session_size) < ed_t ? (t + session_size) : ed_t); ++i) {
    //绘制场景
    var h = s_i.length == 1 ? (conf.height - conf.padding.bottom) : (scale.scenes(1) - scale.scenes(0))
    var op = 0.4
    console.log(ticks)
    console.log(loc_num)
    console.log(scene)
    console.log(tmp_char)
    for (let j = 0; j < ticks.length; j++) {
        let i = ticks[j]
        var h = s_i.length == 1 ? (conf.height - conf.padding.bottom) : (scale.scenes(1) - scale.scenes(0))
        var w = (scale.ticks(1) - scale.ticks(0)) / 2
        // var lt = scale.scenes(1)
        for (let zji = 0; zji < scene.length; zji++) {
            console.log(loc_num[i][scene[zji]])
            if (loc_num[i][scene[zji]].length > 0) {
                svg.append('rect')
                    .attr("x", conf.padding.left + w * 2 * (j))
                    .attr("y", scale.scenes(zji))
                    .attr("width", w)
                    .attr("height", h)
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

    // var scene = ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5", "Section 6"]
    var tuli = svg.append("g")
        .selectAll("g")
        .data(scene)
        .enter()
        .append("g")
    tuli.append("rect")
        .attr("x", (d, i) => {

            return 0;
        })
        .attr("y", (d, i) => {
            return scale.scenes(i) + 5
        })
        .attr("width", (d, i) => i == 6 ? 70 : 45)
        .attr("height", h - 10)
        .attr("fill", (d, i) => {
            return colors[Object.keys(colors)[i]]
        })
    tuli.append("text")
        .text((d) => d)
        .attr("x", (d, i) => {

            return 0;
        })
        .attr("y", (d, i) => {
            return scale.scenes(i) + 5 + 15
        })
        .attr("fill", (d, i) => {
            // return colors[d]
        })
        .attr("font-size", 9)

    if (_isdraw) { // 仅一人感染时会报错
        let scene_scale_cell = conf.height
        if (locations.length > 1) {
            scene_scale_cell = scale.scenes(locations[0].id) - scale.scenes(locations[1].id)
            scene_scale_cell = Math.abs(scene_scale_cell)
        }
        // console.log(characters)


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
        let role_padding = d3.scaleBand()
            .domain(characters.map(d => {
                // console.log(d)
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
            for (let i = 0; i < characters.length; i++) {
                // console.log(characters)
                var pre = sessions[characters[i].id][t].loc
                var line_data = [
                    [scale.ticks(t) + w / 2, scale.scenes(pre) + role_padding(characters[i].id) + 2],
                    [scale.ticks(t) + w, scale.scenes(pre) + role_padding(characters[i].id) + 2],
                ]
                svg.append('g')
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
                    [scale.ticks(t) + w, scale.scenes(pre) + role_padding(characters[i].id) + 2],
                    [scale.ticks(t + 1), scale.scenes(cur) + role_padding_second(characters[i].id) + 2],
                ]
                svg.append('g')
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
                    [scale.ticks(t + 1), scale.scenes(pre) + role_padding_second(characters[i].id) + 2],
                    [scale.ticks(t + 1) + w / 2, scale.scenes(cur) + role_padding_second(characters[i].id) + 2],
                ]
                svg.append('g')
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
                    [scale.ticks(t) + w / 2, scale.scenes(pre) + role_padding(characters[i].id) + 2],
                    [scale.ticks(t) + w, scale.scenes(pre) + role_padding(characters[i].id) + 2],
                ]
                svg.append('g')
                    .append("circle")
                    .attr("cx", (d) => {
                        return scale.ticks(t) + w / 2
                    })
                    .attr("cy", scale.scenes(pre) + role_padding(characters[i].id) + 2)
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

        svg.append('g')
            .call(xAxis1);
    }
}

function getIni(ini) {
    var _ = {}
    for (let k in ini) {
        _[k] = ini[k].value
    }
    return _
}