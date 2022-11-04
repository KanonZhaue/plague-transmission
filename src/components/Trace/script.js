/* eslint-disable */

import { dt2t, getIni, t2dt } from "../../js/kit"
import { inject, watch, onMounted } from "vue"
import { injects } from "../../js/injects"
import { split_pages } from "../../js/kit"
import { last } from "lodash"
import { contourDensity } from "d3"
var d3 = require('d3')

export default {
    setup
}

var MAX_ROWS = 200000
var PAGE_DATA = {}
var PAGE_START = 1
var from = {}

function setup() {
    var ini = injects()
    watch(ini.force_role, () => yeah(ini), { immediate: false })
    watch(ini.stateupdated, () => yeah(ini), { immediate: false })
    watch(ini.trace_page, () => display(ini), { immediate: false })
    watch(ini.trace_days, () => yeah(ini), { immediate: false })
    onMounted(() => {
        make_legend()
        if (ini.iniChanged.value == 0) return
        yeah(ini)
    })
}

function yeah(ini) {
    // if(!loadPage(ini)) return //! 堆叠图版本不需要这一步
    display(ini)
}

function loadPage(ini) {
    let force_role = ini.force_role.value
    // console.log(force_role)
    let data = ini.scene.value.traceData(force_role, false)
    if (data == null) {
        ini.tips_content.value = "NOT INFECTED ~"
        ini.tips_display.value = true
        setTimeout(() => {
            ini.tips_display.value = false
        }, 2000)
        return false
    }
    PAGE_DATA = split_pages(data, MAX_ROWS, PAGE_START)
    ini.n_trace_pages.value = PAGE_DATA.size
    ini.trace_page.value = PAGE_START
    return true
}

function display(ini) {
    let _ini = getIni(ini)
    let raw = _ini.scene.traceData(ini.force_role.value, false)
    console.log(ini.force_role.value)
    if (raw == null) return false
    let data = {}
    for (let i = 0; i < raw.length; i++) {
        for (let j = 0; j < raw[i].length; j++) {
            if (raw[i][j].scene.name == '隔离区') continue
            if (data[raw[i][j].with] == undefined)
                data[raw[i][j].with] = []
            data[raw[i][j].with].push(raw[i][j])

        }
    }
    // console.log(data)
    var svg = d3.select('#trace-svg')
    svg.html('')

    var conf = {
        height: svg.node().clientHeight,
        width: svg.node().clientWidth + 500,
    }
    var margin = {
        left: 30,
        right: 10,
        top: 10,
        bottom: 10
    }
    var virus_road = ini.scene.value.virusRoad(ini.force_role.value)
    var scale = {
        // x: d3.scaleBand().domain(data.map(d=>d.id)).range([0,conf.width-margin.left-margin.right]),
        y: d3.scaleBand().domain(virus_road.map(d => d.id)).range([0, conf.height - margin.top - margin.bottom]),
    }
    let maxCount = 0
    let data_length = 0
    for (let k in data) {
        maxCount = Math.max(maxCount, data[k].length)
        data_length += 1
    }
    cell = {
        width: (conf.width - margin.left - margin.right) / maxCount,
        height: (conf.height - margin.top - margin.bottom) / virus_road.length
    }
    var lineCount = 0;
    var LWidth = d3.scaleLinear().domain([1, 10]).range([8, 2])
    var lineWidth = LWidth(data_length);
    if (data_length > 9) {
        lineWidth = 2;
    }

    cell.width = cell.height

    if (cell.width * maxCount < 500) {
        conf.width = 500 + margin.left + margin.right;
        lineCount = conf.width / cell.width
    }
    else {
        conf.width = margin.left + margin.right + cell.width * maxCount;
        lineCount = maxCount;
    }

    // conf.width = svg.node().clientWidth

    svg.attr('width', conf.width + 'px')
    // margin.left + margin.right + cell.width * maxCount

    var g = {
        axis: {
            y: svg.append('g')
                .attr('id', 'trace-svg-g-axis-y')
                .attr('transform', `translate(${margin.left},${margin.top})`).call(d3.axisLeft(scale.y))
            // y: axis_svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`).call(d3.axisLeft(scale.y))
        },
        blocks: svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`),
        lines: svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`),
    }
    let lineLength = conf.width - margin.left - margin.right

    let ForceRole = _ini.scene.findRoleById(_ini.force_role)

    function TextureGener(d, x, y) {
        let t = last(ForceRole.state).infected
        let state = d.role.state[t]
        return Texture[state.state](x, y)
    }

    for (let k in data) {
        let y = scale.y(parseInt(k))
        let tmp_g = g.blocks.append('g')
        tmp_g
            .selectAll('rect')
            .data(data[k])
            .join('rect')
            .attr('x', (d, i) => i * cell.width)
            .attr('y', y)
            .attr('height', cell.height)
            .attr('width', cell.width)
            .attr('fill', d => d.scene.color)
            .attr('class', 'hover-stroke')
            .on('click', e => {
                let d = e.path[0].__data__
                ini.trace_id.value = d.id
            })
            .append('title')
            .text(d => d.id)
        // texture
        tmp_g.selectAll('path')
            .data(data[k])
            .join('path')
            .attr('d', (d, i) => TextureGener(d, i * cell.width, y))
            .attr('stroke', '#333')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.6)
        g.lines
            .append('line')
            .attr('x1', 0)
            .attr('x2', lineLength)
            .attr('y1', y)
            .attr('y2', y)
            .call(stroke)
            .attr('stroke-width', lineWidth)
    }
    g.lines
        .append('line')
        .attr('x1', 0)
        .attr('x2', lineLength)
        .attr('y1', conf.height - margin.top - margin.bottom)
        .attr('y2', conf.height - margin.top - margin.bottom)
        .call(stroke)
        .attr('stroke-width', lineWidth)
    for (let i = 1; i <= lineCount; i++) {
        g.lines
            .append('line')
            .attr('x1', cell.width * i)
            .attr('x2', i * cell.width)
            .attr('y1', 0)
            .attr('y2', conf.height - margin.top - margin.bottom)
            .call(stroke)
            .attr('stroke-width', lineWidth)
    }

    // cell
    svg.append('text')
        .text('ID')
        .attr('x', 8)
        .attr('y', margin.top + 3)
        .attr('font-size', 12)
}

function make_legend() {
    let conf = {
        size: 18,
        width: 200,
        height: 20,
        text_left: 5,
    }
    let legend = d3.select('#trace-legend')
        .html('')
        .attr('height', 25)
        .attr('transform', 'translate(0, 2)')
        .attr('width', conf.width)
    let index2x = d3.scaleLinear().domain([0, 8]).range([0, conf.width])
    // legend
    let opt = { width: conf.size, height: conf.size }

    for (let i = 0; i < 4; i++) {
        legend.append('rect')
            .attr('x', index2x(i * 2))
            .attr('y', 0)
            .attr('width', conf.size)
            .attr('height', conf.size)
            .attr('fill', 'none')
            .attr('stroke', '#111')
            .attr('stroke-width', 1)

        let genFunc, text;
        if (i == 0) {
            genFunc = Texture.susceptible
            text = 'S'
        }
        else if (i == 1) {
            genFunc = Texture.exposed
            text = 'E'
        }
        else if (i == 2) {
            genFunc = Texture.infectious
            text = 'I'
        }
        else {
            genFunc = Texture.recovered
            text = "R"
        }

        legend.append('path')
            .attr('d', genFunc(index2x(i * 2), 0, opt))
            .attr('stroke', '#111')
            .attr('stroke-width', 1)

        legend.append('text')
            .text(text)
            .attr('x', index2x(i * 2 + 1))
            .attr('y', conf.size)
            .attr('font-size', conf.size * 1.5)
    }

    // function left_(n)
    // {
    //     return margin.left + (legend_conf.width+legend_conf.margin.text_left*2+legend_conf.fontSize)*n
    // }
    // let text_top = legend_conf.margin.top+legend_conf.height
    // // S
    // legend.append('rect')
    //     .attr('x', 0)
    //     .attr('y', 0)
    //     .attr('width', conf.size)
    //     .attr('height', conf.size)
    //     .attr('fill', 'none')
    //     .attr('stroke', '#111')
    //     .attr('stroke-wdth', 1)
    // legend.append('text')
    //     .attr('font-size', conf.size)
    //     .text('S')
    //     .attr('x', left_(0)+conf.size+legend_conf.margin.text_left)
    //     .attr('y', text_top)
    // // E
    // legend.append('rect')
    //     .attr('x', left_(1))
    //     .attr('y', legend_conf.margin.top)
    //     .attr('width', legend_conf.width)
    //     .attr('height', legend_conf.height)
    //     .attr('fill', 'none')
    //     .attr('stroke', '#111')
    //     .attr('stroke-wdth', 1)
    // legend.append('path')
    //     .attr('d', Texture.exposed(left_(1), legend_conf.margin.top, opt))
    //     .attr('fill', 'none')
    //     .attr('stroke', '#111')
    //     .attr('stroke-wdth', 1)
    // legend.append('text')
    //     .attr('font-size', legend_conf.fontSize)
    //     .text('E')
    //     .attr('x', left_(1)+legend_conf.width+legend_conf.margin.text_left)
    //     .attr('y', text_top)
    // // I
    // legend.append('rect')
    //     .attr('x', left_(2))
    //     .attr('y', legend_conf.margin.top)
    //     .attr('width', legend_conf.width)
    //     .attr('height', legend_conf.height)
    //     .attr('fill', 'none')
    //     .attr('stroke', '#111')
    //     .attr('stroke-wdth', 1)
    // legend.append('path')
    //     .attr('d', Texture.infectious(left_(2), legend_conf.margin.top, opt))
    //     .attr('fill', 'none')
    //     .attr('stroke', '#111')
    //     .attr('stroke-wdth', 1)
    // legend.append('text')
    //     .attr('font-size', legend_conf.fontSize)
    //     .text('I')
    //     .attr('x', left_(2)+legend_conf.width+legend_conf.margin.text_left)
    //     .attr('y', text_top)
    // // R
    // legend.append('rect')
    //     .attr('x', left_(3))
    //     .attr('y', legend_conf.margin.top)
    //     .attr('width', legend_conf.width)
    //     .attr('height', legend_conf.height)
    //     .attr('fill', 'none')
    //     .attr('stroke', '#111')
    //     .attr('stroke-wdth', 1)
    // legend.append('path')
    //     .attr('d', Texture.recovered(left_(3), legend_conf.margin.top, opt))
    //     .attr('fill', 'none')
    //     .attr('stroke', '#111')
    //     .attr('stroke-wdth', 1)
    // legend.append('text')
    //     .attr('font-size', legend_conf.fontSize)
    //     .text('R')
    //     .attr('x', left_(3)+legend_conf.width+legend_conf.margin.text_left)
    //     .attr('y', text_top)
}

let cell = { height: 12, width: 12, }
var Texture = {
    'exposed': (x, y, opt) => {
        if (opt == undefined)
            opt = cell
        // X
        let path = d3.path()
        path.moveTo(x, y)
        path.lineTo(x + opt.width, y + opt.height)
        path.moveTo(x, y + opt.height)
        path.lineTo(x + opt.width, y)
        return path.toString()
    },
    'infectious': (x, y, opt) => {
        if (opt == undefined)
            opt = cell
        // / / /
        let path = d3.path()
        let w = opt.width / 2, h = opt.height / 2
        path.moveTo(x, y + h)
        path.lineTo(x + w, y)
        path.moveTo(x, y + opt.height)
        path.lineTo(x + opt.width, y)
        path.moveTo(x + w, y + opt.height)
        path.lineTo(x + opt.width, y + h)
        // \ \ \
        path.moveTo(x + w, y)
        path.lineTo(x + opt.width, y + h)
        path.moveTo(x, y)
        path.lineTo(x + opt.width, y + opt.height)
        path.moveTo(x, y + h)
        path.lineTo(x + w, y + opt.height)
        return path.toString()
    },
    'recovered': (x, y, opt) => {
        if (opt == undefined)
            opt = cell
        // V
        let path = d3.path()
        path.moveTo(x, y)
        path.lineTo(x + opt.width / 2, y + opt.height)
        path.moveTo(x + opt.width / 2, y + opt.height)
        path.lineTo(x + opt.width, y)
        return path.toString()
    },
    susceptible: () => ''
}

function stroke(g) {
    g.attr('stroke', 'white')
}

function display_new_old(ini) {
    let data = PAGE_DATA[ini.trace_page.value]
    if (!data) return false
    var svg = d3.select('#trace-svg').html('')

    var conf = {
        height: svg.node().clientHeight,
        width: svg.node().clientWidth
    }
    var margin = {
        left: 30,
        right: 10,
        top: 30,
        bottom: 10
    }
    var virus_road = ini.scene.value.virusRoad(ini.force_role.value)
    var scale = {
        x: d3.scaleBand().domain(data.map(d => d.id)).range([0, conf.width - margin.left - margin.right]),
        y: d3.scaleBand().domain(virus_road.map(d => d.id)).range([0, conf.height - margin.top - margin.bottom]),
    }
    // console.log(data.map(d=>d.id))
    cell = {
        width: (conf.width - margin.left - margin.right) / data.length,
        height: (conf.height - margin.top - margin.bottom) / virus_road.length
    }
    cell.width = cell.height
    // cell
    var g = {
        // line: svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`),
        block: svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`),
        // axis: {
        //     x: svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`).call(d3.axisTop(scale.x)),
        //     y: svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`).call(d3.axisLeft(scale.y))
        // },
    }

    for (let i = 0; i < data.length; i++) {
        // g.line
        //     .append('line')
        //     .attr('x1', scale.x(data[i].id))
        //     .attr('x2', scale.x(data[i].id))
        //     .attr('y1', scale.y(virus_road[0].id))
        //     .attr('y2', scale.y(virus_road[virus_road.length-1].id)+cell.height)
        //     .attr('stroke', '#999')
        //     .attr('stroke-width', 0.5)
        g.block.append('g')
            .selectAll('rect')
            .data(data[i])
            .join('rect')
            .attr('x', scale.x(data[i].id))
            .attr('y', d => scale.y(d.with))
            .attr('height', cell.height)
            .attr('width', cell.width)
            .attr('class', 'hover-stroke')
            .attr('fill', d => d.scene.color)
            .on('click', e => {
                let d = e.path[0].__data__
                console.log(d)
                ini.trace_id.value = d.id
            })
            .append('title')
            .text(data[i].id)
    }
    // for(let i=0; i<virus_road.length; i++)
    // {
    //     g.line
    //         .append('line')
    //         .attr('x1', 0)
    //         .attr('x2', conf.width-margin.left-margin.right)
    //         .attr('y1', scale.y(virus_road[i].id)+cell.height)
    //         .attr('y2', scale.y(virus_road[i].id)+cell.height)
    //         .attr('stroke', '#999')
    //         .attr('stroke-width', 0.5)
    // }
}

function old_display(ini) {
    let to = PAGE_DATA[ini.trace_page.value]
    if (!to) return
    var svg = d3.select('#trace-svg')
    svg.html('')

    var conf = {
        height: svg.node().clientHeight,
        width: svg.node().clientWidth,
    }
    var margin = {
        left: 30,
        right: 10,
        top: 30,
        bottom: 10
    }
    var scale = {
        x: d3.scaleLinear().domain([0, ini.days.value]).range([0, conf.width - margin.left - margin.right]),
        y: d3.scaleLinear().domain([0, MAX_ROWS]).range([0, conf.height - margin.top - margin.bottom])
    }
    var rect_width = scale.x(1) - scale.x(0)
    // scale.y=d3.scaleLinear().domain([0,to.length+1]).range([0,rect_width*(1+to.length)])
    var rect_height = scale.y(1) - scale.y(0)
    var g = {
        axis: {
            x: svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`).call(d3.axisTop(scale.x)),
            y: svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`).call(d3.axisLeft(scale.y).ticks(to.length + 1))
        },
        border: svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`),
        sub_rect: svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`),
        sup_rect: svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`),
        // redline:svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`)
    }

    for (let i = 1; i <= ini.days.value; i++) {
        g.border
            .append('line')
            .attr('stroke-width', 0.5)
            .attr('stroke', '#333')
            .attr('x1', scale.x(i))
            .attr('x2', scale.x(i))
            .attr('y1', scale.y(0))
            .attr('y2', scale.y(MAX_ROWS))
    }
    for (let i = 1; i <= MAX_ROWS; i++) {
        g.border
            .append('line')
            .attr('stroke-width', 0.5)
            .attr('stroke', '#333')
            .attr('x1', 0)
            .attr('x2', scale.x(ini.days.value))
            .attr('y1', scale.y(i))
            .attr('y2', scale.y(i))
    }
    // from.day=t2dt(from.tick).day
    // g.redline
    //     .append('line')
    //     .attr('stroke','red')
    //     .attr('stroke-width',1)
    //     .attr('stroke-dasharray','3 2')
    //     .attr('x1',scale.x(t2dt(from.tick).day))
    //     .attr('x2',scale.x(t2dt(from.tick).day))
    //     .attr('y1',scale.y(0))
    //     .attr('y2',scale.y(MAX_ROWS+1))
    for (let i = 0; i < to.length; i++) {
        // console.log(to[i])
        to[i] = to[i].map(d => {
            // console.log(d.id)
            d.day = t2dt(d.tick).day
            return d
        })
        svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .selectAll('rect')
            .data(to[i])
            .join('rect')
            .attr('class', 'hover-stroke')
            .attr('x', d => scale.x(d.day))
            .attr('y', scale.y(i))
            .attr('fill', d => d.scene.color)
            .attr('height', rect_height)
            .attr('width', rect_width)
            .on('mouseover', (e) => {
                let d = e.path[0].__data__
                ini.tips_content.value = build_tips_content(ini.force_role.value, d.id, d.scene.name, d.tick)
                ini.tips_display.value = true
            })
            .on('mouseout', () => {
                ini.tips_display.value = false
            })
            .on('click', (e) => {
                let d = e.path[0].__data__
                ini.force_role.value = d.id
                ini.tips_display.value = false
            })
    }
    console.log(to, ')')
    // return
    // g.sub_rect
    //     .selectAll('rect')
    //     .data(to)
    //     .join('rect')
    //     .attr('x',d=>scale.x(d.day))
    //     .attr('y',(d,i)=>scale.y(i))
    //     .attr('fill',d=>d.scene.color)
    //     // .attr('height',rect_width)
    //     .attr('height',rect_height)
    //     .attr('width',rect_width)
    //     .on('mouseover',(e)=>{
    //         let d = e.path[0].__data__
    //         ini.tips_content.value = build_tips_content(ini.force_role.value, d.id , d.scene.name)
    //         ini.tips_display.value = true
    //     })
    //     .on('mouseout',()=>{
    //         ini.tips_display.value = false
    //     })
    // g.sup_rect
    //     .selectAll('rect')
    //     .data([from])
    //     .join('rect')
    //     .attr('x',d=>scale.x(d.day))
    //     .attr('y',(d,i)=>scale.y(i))
    //     .attr('fill',d=>d.scene.color)
    //     // .attr('height',rect_width)
    //     .attr('height',rect_height)
    //     .attr('width',rect_width)
    //     .on('mouseover',()=>{
    //         ini.tips_content.value = build_tips_content(from.id, ini.force_role.value, from.scene.name)
    //         ini.tips_display.value = true
    //     })
    //     .on('mouseout',()=>{
    //         ini.tips_display.value = false
    //     })
}

function build_tips_content(from, to, scene_name, t) {
    return `
        <table>
            <tr>
                <td>Where</td>
                <td>${scene_name}</td>
            </tr>
            <tr>
                <td>Who</td>
                <td>${to}</td>
            </tr>
            <tr>
                <td>When</td>
                <td>${t}</td>
            </tr>
        </table>
    `
}
// <tr>
//     <td>From</td>
//     <td>${from}</td>
// </tr>