/* eslint-disable */
import { injects } from "../../js/injects"
import { onMounted, watch, inject } from "@vue/runtime-core"
import { dt2t, getIni, watches } from "../../js/kit"
var d3 = require('d3')

export function setup() {
    var ini = injects()
    console.log(ini.river_show)
    onMounted(() => {
        update(ini)
    })
    let list = ['stateupdated', 'river_show', 'river_content', 'river_range', 'currentTick', 'currentDay']
    watches(ini, list, () => update(ini))
    return {
        river_show: inject('river_show')
    }
}

var between = [0, -1]

function update(ini) {
    ini = getIni(ini)
    var river_content = ini.river_content
    let { river_range, currentTick, currentDay } = ini
    currentTick = dt2t(currentDay, currentTick)
    let range = [
        Math.max(0, currentTick - river_range),
        Math.min((ini.ticks - 1) * ini.days, currentTick + river_range)
    ]
    var SCENE = ini.scene
    var d = SCENE.riverData()
    for (let k in d) {
        d[k] = d[k].slice(range[0], range[1])
    }
    var rdata = genRiverData(d)
    if (rdata == undefined) return
    var { data, title } = rdata
    var stack = d3.stack()
        // .offset(d3.stackOffsetSilhouette)
        .offset(d3.stackOffsetWiggle)
        .keys(title)
    data = stack(data)
    console.log(data)
    // if(between[1]==-1) between[1] = data[0].length
    let maxValue, minValue
    try {
        maxValue = data[0][0][0]
        minValue = data[0][0][0]
    }
    catch {
        console.log('ERR: undefined maxValue/minValue in .River.script.js')
        return
    }
    for (let i = 0; i < data.length; i++) {
        let tmp_arr_max = data[i].map(d => d[1])
        let tmp_arr_min = data[i].map(d => d[0])
        maxValue = Math.max(maxValue, d3.max(tmp_arr_max))
        minValue = Math.min(minValue, d3.min(tmp_arr_min))
    }
    var svg = d3.select('#river-svg')
    svg.html('')
    var conf = {
        width: svg.node().clientWidth,
        height: svg.node().clientHeight,
    }
    var margin = {
        left: 40,
        right: 5,
        bottom: 14,
        top: 3
    }
    var x = d3.scaleLinear()
        .domain([range[0], range[1] - 1])
        // .domain([0,data[0].length])
        .range([0, conf.width - margin.left - margin.right])
        , y = d3.scaleLinear()
            .domain([minValue, maxValue])
            // .domain([river_content=="normal"?-ini.N/2:-maxValue, river_content=="normal"?ini.N/2:maxValue])
            .range([conf.height - margin.top - margin.bottom, 0])
    //  ,  slider=d3.scaleLinear()
    //         .domain([0,data[0].length])
    //         .range([0,conf.width-margin.left-margin.right])
    let step = (range[1] - range[0] >= 20 ? 20 : range[1] - range[0])
    var axis = {
        x: d3.axisBottom(x).ticks(10).tickValues(d3.range(range[0], range[1] - 1, parseInt((range[1] - range[0]) / step))),
        y: d3.axisLeft(y).ticks(10),
        fontSize: 12,
        // slider:d3.axisTop(slider).ticks(20)
    }
    var g = {
        river: svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`),
        axis: {
            x: svg.append('g')
                .attr('transform', `translate(${margin.left},${conf.height - margin.bottom})`)
            // .call(axis.x)
            ,
            y: svg.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`)
            // .call(axis.y)
            ,
            // slider:svg.append('g')
            //     .attr('transform',`translate(${margin.left},${conf.height-1})`)
            //     .call(axis.slider),
        },
        legend: svg.append('g')
    }
    // 手动画坐标轴
    // X
    g.axis.x.append('line')
        .attr('x1', 0)
        .attr('x2', x(range[1] - 1))
        .attr('stroke', '#111')
        .attr('stroke-width', 1)
    for (let i = range[0]; i <= range[1] - 1; i += (range[1] - range[0] - 0.1) / 13) {
        let tick_value = (i + (range[1] - range[0] - 0.1) / 15) > range[1] - 1 ? 'tick' : Math.round(i)
        g.axis.x
            .append('text')
            .attr('x', x(i))
            .attr('y', axis.fontSize + 2)
            .text(tick_value)
            .attr('style', 'text-anchor:middle;')
            .attr('font-size', axis.fontSize)
        g.axis.x
            .append('line')
            .attr('x1', x(i))
            .attr('x2', x(i))
            .attr('y2', 5)
            .attr('stroke', '#111')
            .attr('stroke-width', 1)
    }
    // Y
    g.axis.y.append('line')
        .attr('x1', x(range[0]))
        .attr('x2', x(range[0]))
        .attr('y1', y(minValue))
        .attr('y2', y(maxValue))
        .attr('stroke', '#111')
        .attr('stroke-width', 1)
    for (let i = minValue; i <= maxValue; i += (maxValue - minValue - 1) / 10) {
        let tick_value = ((i + (maxValue - minValue - 1) / 10) > maxValue ? 'N' : Math.round(i)).toString()
        g.axis.y
            .append('text')
            .text(tick_value)
            .attr('y', y(i) + axis.fontSize / 3)
            .attr('x', x(range[0]) - 5 - axis.fontSize * tick_value.length / 2 - 5)
            .attr('font-size', axis.fontSize)
        g.axis.y.append('line')
            .attr('stroke', '#111')
            .attr('stroke-width', 1)
            .attr('x1', x(range[0]))
            .attr('x2', x(range[0]) - 5)
            .attr('y1', y(i))
            .attr('y2', y(i))
    }

    var area = d3.area()
        .x((d, i) => x(i + range[0]))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveBasis)
    console.log(data)
    g.river
        .selectAll('path')
        .data(data)
        .join('path')
        .attr('d', area)
        .attr('fill', (d, i) => SCENE.name2color(title[i]))

    // slider
    // g.slider
    //     .append('line')
    //     .attr('x1',0)
    //     .attr('x2',x(data[0].length))
    //     .attr('y1',margin.bottom)
    //     .attr('y2',margin.bottom)
    //     .attr('stroke','#333')
    //     .attr('stroke-width',2)

    // // legend
    // var legend_conf={
    //     width:70,
    //     height:90,
    //     line:{
    //         width:12,
    //         height:6
    //     },
    //     fontSize:10,
    //     fontMargin:6
    // }
    // var legend_margin={
    //     x:conf.width-legend_conf.width,
    //     y:10,
    // }
    // var index2y=d3.scaleLinear().domain([0,title.length-1]).range([0,legend_conf.height])
    // g.legend
    //     .attr('transform',`translate(${legend_margin.x},${legend_margin.y})`)
    //     .selectAll('rect')
    //     .data(title)
    //     .join('rect')
    //     // .attr('d',(d,i)=>{
    //     //     var path=d3.path()
    //     //     path.moveTo(0,index2y(i))
    //     //     path.lineTo(legend_conf.line.width,index2y(i))
    //     //     return path.toString()
    //     // })
    //     .attr('x', 0)
    //     .attr('y', (d, i)=>index2y(i)-legend_conf.line.height/2)
    //     .attr('width', legend_conf.line.width)
    //     .attr('height', legend_conf.line.height)
    //     .attr('fill', d=>SCENE.name2color(d))
    //     .attr('stroke-width','#111')
    //     .attr('stroke','#111')
    // g.legend
    //     .selectAll('text')
    //     .data(title)
    //     .join('text')
    //     .text(d=>d)
    //     .attr('x',legend_conf.line.width+legend_conf.fontMargin)
    //     .attr('y',(d,i)=>index2y(i)+legend_conf.fontSize/3)
    //     .attr('font-size',legend_conf.fontSize)
}

function genRiverData(data) {
    if (!data) return undefined
    var d = [], keys = []
    for (let k in data) {
        keys.push(k)
    }
    for (let i = 0; i < data[keys[0]].length; i++) {
        let cell = {}
        for (let k = 0; k < keys.length; k++) {
            cell[keys[k]] = data[keys[k]][i]
        }
        d.push(cell)
    }
    return {
        data: d,
        title: keys
    }
}