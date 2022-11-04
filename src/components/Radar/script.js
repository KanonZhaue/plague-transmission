/*eslint-disable*/
import { interpolate } from "d3"
import { onMounted } from "vue"
import { injects } from "../../js/injects"
import { getIni, inNeighborhood, last, watches } from "../../js/kit"
var d3 = require('d3')

var ini = {}
var trans = {}

export default { setup }

function setup() {
    ini = injects()
    console.log(ini, 'ini')

    // trans = {
    //     beta: ini['beta'].value,
    //     med: (ini['I_gamma'].value / 0.2) ** 0.5 * 2,
    //     delta: ini['delta'].value,
    //     dist: ini['d'].value / 3 * 7
    // }

    onMounted(() => {
        display()
    })
    watches(ini, args_name, () => display(), { immediate: false })
}

var range = {
    // "theta": { step: 0.01, min: 0.001, max: 1, accuracy: 2 },
    "beta": { step: 0.01, min: 0.001, max: 1, accuracy: 2 },
    "med": { step: 0.01, min: 0, max: 1, accuracy: 2 },
    // "I_gamma": { step: 0.001, min: 0.001, max: 0.05, accuracy: 3 },
    "delta": { step: 0.01, min: 0.001, max: 1, accuracy: 2 },
    // "ISO_gamma": { step: 0.001, min: 0.001, max: 0.5, accuracy: 3 },
    // "close_distance": { step: 0.01, min: 0.01, max: 10, accuracy: 2 },
    "dist": { step: 0.1, min: 0.01, max: 5, accuracy: 2 },
}



var mapOfArgs = {
    // theta: 'E/I',
    beta: '传染概率', //"S→E",  
    med: '医疗能力', //'E→I', 
    // I_gamma: 'I→R',
    delta: '管控力度', //'I→ISO',
    // ISO_gamma: 'ISO→R',
    // close_distance: 'close',
    dist: '传播距离' //'Range',
}

const PI = Math.PI
var args_name = Object.keys(range)

function display() {
    let _ini = getIni(ini)

    var svg = d3.select('#radar-svg')
    var conf = {
        width: 207,
        outerRadius: 0,
        fontSize: 14,
        n_ticks: 5,
        innerRadius: 10,
        margin: 20,
        stroke: '#111',
        stroke_width: 0.4,
        values_outRadius: 150,
        legend: { // 做一个竖着的legend
            height: 80,
            width: 10,
            color: {
                high: '#FD6585',
                low: '#FFD3A5',
            }
        }
    }

    // let bias_angle = PI/(args_name.length)
    let bias_angle = 0
    conf.outerRadius = conf.width / 2
    conf.values_outRadius = conf.width / 2 - conf.margin
    svg
        .attr('height', conf.width)
        .html('')
        .attr("viewBox", `${-conf.width / 2} ${-conf.width / 2} ${conf.width} ${conf.width}`)

    let values = []
    for (let i = 0; i < args_name.length; i++) {
        // values.push(trans[args_name[i]])
        values.push(ini[args_name[i]].value)
    }
    var scale = {
        x: d3.scaleBand().domain(args_name.map((d, i) => i)).range([0 + bias_angle, 2 * PI + bias_angle]).align(0),
        currentValues: d3.scaleBand().domain(values.map((d, i) => i)).range([0 + bias_angle, 2 * PI + bias_angle]).align(0),
        raidus: d3.scaleLinear().domain([0, conf.n_ticks - 1]).range([conf.innerRadius, conf.width / 2 - conf.margin]),
        angle: d3.scaleLinear().domain([0, args_name.length]).range([0, 2 * PI]),
    }

    var axis = {
        x: g => g.attr("text-anchor", "middle")
            .call(g => g.selectAll("g")
                .data(args_name)
                .join("g")
                .attr("transform", (d, i) => `
                    rotate(${((scale.x(i) + scale.x.bandwidth() / 2) * 180 / Math.PI - 90)})
                    translate(${conf.outerRadius + 3},0)
                    `)
                .call(g => g.append("text")
                    .attr("transform", (d, i) => (scale.x(i) + scale.x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                        ? "rotate(90)translate(0,16)"
                        : "rotate(-90)translate(0,-9)")
                    .text(d => mapOfArgs[d])))
            .attr('font-size', conf.fontSize),
        values: g => g.attr("text-anchor", "middle")
            .call(g => g.selectAll("g")
                .data(values)
                .join("g")
                .attr("transform", (d, i) => `
                    rotate(${((scale.currentValues(i) + scale.currentValues.bandwidth() / 2) * 180 / Math.PI - 90)})
                    translate(${conf.values_outRadius},0)
                    `)
                .call(g => g.append("line")
                    .attr("x2", -5)
                    .attr("stroke", "#111"))
                .call(g => g.append("text")
                    .attr("transform", (d, i) => (scale.currentValues(i) + scale.currentValues.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                        ? "rotate(90)translate(0,16)"
                        : "rotate(-90)translate(0,-9)")
                    .text(d => Math.round(d * 10000) / 10000)))
            .attr('font-size', conf.fontSize),
    }

    var g = {
        legend: svg.append('g'),
        ticks: svg.append('g'),
        line: svg.append('g'),
        bars: {
            control: svg.append('g').attr('id', 'radar-data-control'),
            show: svg.append('g').attr('id', 'radar-data-show'),
        },
        axis: {
            values: svg.append('g').call(axis.values),
            x: svg.append('g').call(axis.x),
        },
    }
    var arc = d3.arc()
    g.axis.values.on('click', e => {
        console.log(e)
    })
    g.ticks
        .selectAll('circle')
        .data(d3.range(conf.n_ticks))
        .join('circle')
        .attr('fill', 'none')
        .attr('r', d => scale.raidus(d))
        .attr('stroke', conf.stroke)
        .attr('stroke-width', conf.stroke_width)
    g.line
        .selectAll('line')
        .data(d3.range(args_name.length + 1).map(d => {
            let rad = scale.angle(d)
            // let r1 = scale.raidus(0)
            let r1 = 0
            let r2 = scale.raidus(conf.n_ticks - 1)
            return { rad, r1, r2 }
        }))
        .join('line')
        .attr('x1', d => Math.cos(d.rad) * d.r1)
        .attr('x2', d => Math.cos(d.rad) * d.r2)
        .attr('y1', d => Math.sin(d.rad) * d.r1)
        .attr('y2', d => Math.sin(d.rad) * d.r2)
        .attr('stroke', conf.stroke)
        .attr('stroke-width', conf.stroke_width)
    // console.log(args_name.length)
    for (let i = 0; i < args_name.length; i++) {
        let arc = d3.arc()
        // let value = trans[args_name[i]]
        let value = ini[args_name[i]].value
        // accuracy
        value = Math.round(value * Math.pow(10, range[args_name[i]].accuracy)) / Math.pow(10, range[args_name[i]].accuracy)
        let _range = range[args_name[i]]
        let colorMap = d3.scaleLinear().domain([_range.min, _range.max]).range([conf.legend.color.low, conf.legend.color.high])
        let radius = d3.scaleLinear().domain([_range.min, _range.max]).range([conf.innerRadius, conf.width / 2 - conf.margin])
        let step = _range.step
        for (let j = _range.min; j < _range.max; j += step) {   // 用于触发事件
            g.bars.show.append('path')
                .data([{
                    arg_name: args_name[i],
                    value: j
                }])
                // .attr('fill', colorMap(j))
                .attr('d', arc({
                    innerRadius: radius(j),
                    outerRadius: radius(j + step),
                    startAngle: scale.angle(i),
                    endAngle: scale.angle(i + 1),
                }))
                .attr('fill', 'rgba(0,0,0,0)')
                .attr('stroke-width', '1px')
                .on('click', (e) => {
                    let d = e.path[0].__data__

                    // trans[d.arg_name] = d.value
                    // console.log(trans, 'lll')
                    if (d.arg_name == 'med') {
                        ini['I_gamma'].value = (d.value / 2) ** 2 * 0.2
                        ini['ISO_gamma'].value = (d.value / 5) ** 0.5
                        ini['sigma'].value = 0.5 - 0.25 * d.value
                        ini.radar_args_changed.value['I_gamma'] = 1
                        ini.radar_args_changed.value['ISO_gamma'] = 1
                        ini.radar_args_changed.value['sigma'] = 1
                    }
                    else if (d.arg_name == 'dist') {
                        ini['d'].value = d.value / 7 * 3
                        ini['close_distance'].value = d.value / 7 * 4
                        ini.radar_args_changed.value['d'] = 1
                        ini.radar_args_changed.value['close_distance'] = 1
                    }

                    ini[d.arg_name].value = d.value
                    ini.radar_args_changed.value[d.arg_name] = 1

                    // console.log(ini.radar_args_changed.value, ini)
                })
                .append('title')
                .text(Math.round(j * 1000) / 1000)
        }

        for (let j = _range.min; j < value; j += step) {   // 用于展示数据

            g.bars.control.append('path')
                .attr('fill', colorMap(j))
                .attr('d', arc({
                    innerRadius: radius(j),
                    outerRadius: radius(j + step),
                    startAngle: scale.angle(i),
                    endAngle: scale.angle(i + 1),
                }))
        }
    }
}

function old_display() {
    var svg = d3.select('#radar-svg')
    svg.html('')
    let _ini = getIni(ini)
    let margin = 32
    let conf = {
        width: svg.node().clientHeight,
        r: svg.node().clientHeight / 2 - margin,
        baseline: {
            color: '#999',
            fontSize: 16,
        }
    }
    let g = {
        radar_area: svg.append('g'),
        base_circle: svg.append('g')
    }
    let radar_center = [conf.width / 2 - margin, conf.width / 2 - margin]
    svg.attr('width', conf.width)
    let node_positions = []
    for (let i = 0; i < args_name.length; i++) {
        let arg = args_name[i]
        let _range = range[arg]
        let angle = 2 * Math.PI / args_name.length * i
        let ticksValue = d3.range(_range.min, _range.max, _range.step).map(d => {
            return { arg, value: d }
        })
        let g = svg.append('g')
        node_positions.push([
            Math.cos(angle) * conf.r * _ini[arg] / _range.max + radar_center[0],
            Math.sin(angle) * conf.r * _ini[arg] / _range.max + radar_center[1]
        ])
        let text_offset = {
            x: 0,
            y: 0,
        }
        let tinyAngle = Math.PI / 10
        if (inNeighborhood(Math.PI, Math.PI / 2, angle))
            text_offset.x -= conf.baseline.fontSize * mapOfArgs[arg].length / 1.8
        if (inNeighborhood(0.5 * Math.PI, 0.5 * Math.PI, angle))
            text_offset.y += conf.baseline.fontSize / 2
        if (inNeighborhood(Math.PI, tinyAngle, angle) || inNeighborhood(0, tinyAngle, angle))
            text_offset.y += conf.baseline.fontSize / 4
        if (inNeighborhood(0.5 * Math.PI, tinyAngle, angle) || inNeighborhood(1.5 * Math.PI, tinyAngle, angle))
            text_offset.x -= conf.baseline.fontSize * mapOfArgs[arg].length / 4
        g.append('text')
            .text(Math.round(_ini[arg] * 100) / 100)
            .attr('x', Math.cos(angle) * conf.r * _ini[arg] / _range.max + radar_center[0])
            .attr('y', Math.sin(angle) * conf.r * _ini[arg] / _range.max + radar_center[1])
            .attr('font-size', conf.baseline.fontSize)
        g.attr('id', 'panel-arg-' + arg)
            .attr('transform', `translate(${margin}, ${margin})`)
            .append('line')
            .attr('x1', radar_center[0])
            .attr('y1', radar_center[1])
            .attr('x2', Math.cos(angle) * conf.r + radar_center[0])
            .attr('y2', Math.sin(angle) * conf.r + radar_center[1])
            .attr('stroke', conf.baseline.color)
            .attr('stroke-width', 0.5)
        g.selectAll('circle')
            .data(ticksValue)
            .join('circle')
            .attr('r', 5)
            .attr('opacity', 0)
            // .attr('fill','none')
            .attr('class', 'hover-stroke')
            .attr('cx', d => Math.cos(angle) * conf.r * d.value / _range.max + radar_center[0])
            .attr('cy', d => Math.sin(angle) * conf.r * d.value / _range.max + radar_center[1])
            .on('click', (e) => {
                let { arg, value } = e.path[0].__data__
                ini[arg].value = value
                console.log('cahnged')
            })
        g.append('text')
            .text(mapOfArgs[arg])
            .attr('x', Math.cos(angle) * conf.r + radar_center[0] + text_offset.x)
            .attr('y', Math.sin(angle) * conf.r + radar_center[1] + text_offset.y)
            .attr('font-size', conf.baseline.fontSize)

    }
    g.radar_area
        .attr('transform', `translate(${margin}, ${margin})`)
        .attr('id', 'data_radar')
        .append('path')
        .attr('d', function () {
            let path = d3.path()
            path.moveTo(node_positions[0][0], node_positions[0][1])
            for (let i = 0; i < node_positions.length - 1; i++) {
                path.lineTo(node_positions[i + 1][0], node_positions[i + 1][1])
            }
            path.lineTo(node_positions[0][0], node_positions[0][1])
            return path.toString()
        }())
        .attr('fill', 'rgba(12,12,12,0.2)')
        .attr('stroke', "#111")
        .attr('stroke-width', 0.5)
    for (let i = 1; i <= 3; i++)
        g.base_circle
            .append('circle')
            .attr('fill', 'none')
            .attr('stroke', conf.baseline.color)
            .attr('stroke-width', 0.5)
            .attr('cx', radar_center[0] + margin)
            .attr('cy', radar_center[1] + margin)
            .attr('r', conf.r / 3 * i)
}
