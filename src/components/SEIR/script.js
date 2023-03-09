/* eslint-disable */
import { onMounted, inject, watch } from 'vue'
import { injectsValue, injects } from '../../js/injects'
import config from "../../conf/config"
import { dt2t, getIni, t2dt } from "../../js/kit"
var d3 = require('d3')


export function drawSEIRByReality(_ini) {
    let ini = getIni(_ini)
    let start_isolation = ini.start_isolation
    let isolation_tick = ini.isolation_tick
    let _t = 1 / ini.ticks
    let svg = d3.select('#SEIR-svg')
    let conf = {
        height: svg.node().clientHeight,
        width: svg.node().clientWidth,
        margin: {
            left: 35,
            right: 5,
            top: 22,
            bottom: 17
        }
    }
    svg.html('')
    var x = d3.scaleLinear()
        .domain([0, ini.days])
        .range([0, conf.width - conf.margin.left - conf.margin.right])
        , y = d3.scaleLinear()
            .domain([0, ini.N])
            .range([conf.height - conf.margin.top - conf.margin.bottom, 0])
    // var axis=svg.append('g')
    //             .attr('id','SEIR-axis-g')
    //             .attr('transform',`translate(${conf.margin.left},${conf.margin.top})`)

    var axis = {
        y: svg.append('g').attr('transform', `translate(${conf.margin.left}, ${conf.margin.top})`),
        x: svg.append('g').attr('transform', `translate(${conf.margin.left}, ${conf.height - conf.margin.bottom})`),
        fontSize: 12,
    }
    var tick_value = d3.range(0, ini.days, (ini.days - 1) / 15).map(d => Math.round(d))
    var tick_ticks = tick_value.slice(0)
    tick_ticks[tick_ticks.length - 1] = 'day'
    // X axis
    axis.x.append('line')
        .attr('x1', 0)
        .attr('x2', x(ini.days))
        .attr('stroke', '#111')
        .attr('stroke-width', 1)
    for (let i = 0; i < tick_ticks.length; ++i) {
        axis.x
            .append('text')
            .attr('x', x(tick_value[i]))
            .attr('y', axis.fontSize + 2)
            .text(tick_ticks[i])
            .attr('style', 'text-anchor:middle;')
            .attr('font-size', axis.fontSize)
        axis.x
            .append('line')
            .attr('x1', x(tick_value[i]))
            .attr('x2', x(tick_value[i]))
            .attr('y2', 5)
            .attr('stroke', '#111')
            .attr('stroke-width', 1)
    }
    // Y
    tick_value = d3.range(0, ini.N, (ini.N - 1) / 8).map(d => Math.round(d))
    tick_ticks = tick_value.slice(0)
    tick_ticks[tick_value.length - 1] = 'N'
    axis.y.append('line')
        .attr('x1', x(0))
        .attr('x2', x(0))
        .attr('y1', y(0))
        .attr('y2', y(ini.N))
        .attr('stroke', '#111')
        .attr('stroke-width', 1)
    for (let i = 0; i < tick_value.length; ++i) {
        axis.y
            .append('text')
            .text(tick_ticks[i])
            .attr('y', y(tick_value[i]) + axis.fontSize / 3)
            .attr('x', x(0) - 5 - axis.fontSize * tick_ticks[i].toString().length / 2 - 5)
            .attr('font-size', axis.fontSize)
        axis.y.append('line')
            .attr('stroke', '#111')
            .attr('stroke-width', 1)
            .attr('x1', x(0))
            .attr('x2', x(0) - 5)
            .attr('y1', y(tick_value[i]))
            .attr('y2', y(tick_value[i]))
    }

    // axis.append('g')
    //     .call(d3.axisBottom(x))
    //     // .call(d3.axisBottom(d3.scaleBand().domain(x_ticks).range([0, conf.width-conf.margin.left-conf.margin.right])))
    //     .attr('transform',`translate(${0},${conf.height-conf.margin.top-conf.margin.bottom})`)
    // axis.append('g')
    //     .call(d3.axisLeft(y))
    // return
    var { scene, ticks, days } = ini
    function index2x(i) {
        var dt = t2dt(i)
        return x(dt.day + _t * dt.tick)
    }
    ticks = dt2t(days - 1, ticks - 1)
    var rs = scene.roles
    var Sy = [], Ey = [], Iy = [], Ry = [], ISOy = []
    var ori = {
        Sy: [], Ey: [], Iy: [], Ry: [], ISOy: []
    }
        , now = {
            Sy: [], Ey: [], Iy: [], Ry: [], ISOy: []
        }
    for (let t = 0; t <= ticks; t++) {
        var _s = 0, _e = 0, _i = 0, _r = 0, _iso = 0,
            ori_s = 0, ori_e = 0, ori_i = 0, ori_r = 0, ori_iso = 0
        for (let i = 0; i < rs.length; i++) {
            // if(start_isolation)
            // {
            var _state = rs[i].state[t]
            if (_state.state == 'susceptible') {
                _s++
            } else if (_state.state == 'exposed') {
                _e++
            } else if (_state.state == 'infectious') {
                _i++
            } else if (_state.state == 'recovered') {
                _r++
            } else {
                _iso++
            }
            // }

            let ori_state = rs[i].origin_state[t]
            if (ori_state.state == 'susceptible') {
                ori_s++
            } else if (ori_state.state == 'exposed') {
                ori_e++
            } else if (ori_state.state == 'infectious') {
                ori_i++
            } else if (ori_state.state == 'recovered') {
                ori_r++
            } else {
                ori_iso++
            }
        }
        // if(start_isolation)
        // {
        Sy.push(_s)
        Ey.push(_e)
        Iy.push(_i)
        Ry.push(_r)
        ISOy.push(_iso)
        // }

        ori.Sy.push(ori_s)
        ori.Ey.push(ori_e)
        ori.Iy.push(ori_i)
        ori.Ry.push(ori_r)
        ori.ISOy.push(ori_iso)
    }
    function liner(points) {
        var path = d3.path()
        for (let i = 0; i < points.length - 1; i++) {
            var p = points[i], p2 = points[i + 1]
            path.moveTo(p[0], p[1])
            path.lineTo(p2[0], p2[1])
        }
        return path
    }
    // if(start_isolation)
    // {
    console.log('原始数据和现在的数据对比：', ori, { Sy, Ey, Iy, Ry })
    var SCoor = Sy.map((d, i) => [index2x(i), y(d)])
        , ECoor = Ey.map((d, i) => [index2x(i), y(d)])
        , ICoor = Iy.map((d, i) => [index2x(i), y(d)])
        , RCoor = Ry.map((d, i) => [index2x(i), y(d)])
        , ISOCoor = ISOy.map((d, i) => [index2x(i), y(d)])
    // }

    var oriCoor = {
        SCoor: ori.Sy.map((d, i) => [index2x(i), y(d)]),
        ECoor: ori.Ey.map((d, i) => [index2x(i), y(d)]),
        ICoor: ori.Iy.map((d, i) => [index2x(i), y(d)]),
        RCoor: ori.Ry.map((d, i) => [index2x(i), y(d)]),
        ISOCoor: ori.ISOy.map((d, i) => [index2x(i), y(d)]),
    }

    var lines = svg.append('g')
        .attr('transform', `translate(${conf.margin.left},${conf.margin.top})`)

    function drawLine(data, color) {
        lines
            .append('path')
            .attr('d', liner(data))
            .attr('stroke', color)
            .attr('stroke-width', 2)
    }
    // 不光滑直线
    // drawLine(SCoor,config.color.susceptible)
    // drawLine(ECoor,config.color.exposed)
    // drawLine(ICoor,config.color.infectious)
    // drawLine(RCoor,config.color.recovered)

    // 光滑曲线...
    function curvesGener(data, color) {
        let linear = d3.line(d => d[0], d => d[1])
        lines.append('path')
            .attr('d', linear(data))
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('fill', 'none')
    }
    curvesGener(SCoor, config.color.susceptible)
    curvesGener(ECoor, config.color.exposed)
    curvesGener(ICoor, config.color.infectious)
    curvesGener(RCoor, config.color.recovered)

    function centerPosition(p1, p2) {
        return [
            (p1[0] + p2[0]) / 2,
            (p1[1] + p2[1]) / 2
        ]
    }

    function CmpLineGener(points) {
        var path = d3.path()
        let start = ini.isolation_tick
        if (!start_isolation) start = 0
        for (let i = start; i < points.length - 1; i += (i % 3 == 0 ? 3 : 1)) {
            var p = points[i], p2 = points[i + 1]
            path.moveTo(p[0], p[1])
            path.lineTo(p2[0], p2[1])
        }
        return path
    }

    function drawCmpLine(data, color) {
        lines
            .append('path')
            .attr('d', CmpLineGener(data))
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '3 2')
    }

    drawCmpLine(oriCoor.SCoor, config.color.susceptible)
    drawCmpLine(oriCoor.ECoor, config.color.exposed)
    drawCmpLine(oriCoor.ICoor, config.color.infectious)
    drawCmpLine(oriCoor.RCoor, config.color.recovered)

    // 隔离分割线
    if (start_isolation)
        svg.append('g')
            .attr('transform', `translate(${conf.margin.left},${conf.margin.top})`)
            .append('line')
            .attr('stroke', 'red')
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '3 2')
            .attr('x1', x(t2dt(ini.isolation_tick).day))
            .attr('x2', x(t2dt(ini.isolation_tick).day))
            .attr('y1', y(ini.N))
            .attr('y2', y(0))

    // hover展示的数据线
    var dataline_conf = {
        fontSize: 10,
        offset: {
            S: -0,
            E: -0,
            I: -0,
            R: -0
        }
    }
    var tick0_x = index2x(0) - conf.margin.left
    var dataWindow = {
        g: svg.append('g').attr('id', 'dataline-window'),
        width: 105,
        height: 70,
        offset: {
            x: 10,
            y: 10,
        },
        fontSize: 10,
        margin: {
            left: 5,
            right: 5,
            top: 10,
            bottom: 10,
        },
        colorMap: [
            config.color.susceptible,
            config.color.exposed,
            config.color.infectious,
            config.color.recovered
        ],
        shown: false,
        textMap: ['susceptible', 'exposed', 'infectious', 'recovered']
    }
    for (let i = 0; i < Sy.length; i++) {
        var dataline = svg.append('g')
            .attr('class', 'seir-tick-data')
            .attr('transform', `translate(${conf.margin.left},${conf.margin.top})`)
        var linePath = d3.path()
        linePath.moveTo(index2x(i), y(0))
        linePath.lineTo(index2x(i), y(ini.N))
        dataline.append('path')
            .attr('d', linePath.toString())
            .attr('stroke', 'rgba(1,1,1,0.4)')
            .attr('stroke-width', 0.5)

        dataline
            .on('mousemove', e => {
                if (dataWindow.shown == true) dataWindow.shown = false
                var { offsetX, offsetY, layerX, layerY } = e
                var offset = dataWindow.offset
                var x = layerX + offset.x,
                    y = layerY + offset.y
                // 边界判定
                if (x + dataWindow.width > conf.width) x = conf.width - dataWindow.width - offset.x
                if (y + dataWindow.height > conf.height) y = conf.height - dataWindow.height - offset.y
                dataWindow.g.html('')
                dataWindow.g
                    .append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', dataWindow.width)
                    .attr('height', dataWindow.height)
                    .attr('fill', '#fff')
                    .attr('stroke', '#111')
                    .attr('stroke-width', 1)
                var y_scale = d3.scaleLinear()
                    .domain([0, 3])
                    .range([0, dataWindow.height - dataWindow.margin.top - dataWindow.margin.bottom])
                dataWindow.g
                    .selectAll('text')
                    .data([Sy[i], Ey[i], Iy[i], Ry[i]])
                    .join('text')
                    .text((d, i) => `${dataWindow.textMap[i]}: ${d}`)
                    .attr('fill', (d, i) => dataWindow.colorMap[i])
                    .attr('x', x + dataWindow.margin.left)
                    .attr('y', (d, i) => y_scale(i) + y + dataWindow.fontSize / 3 + dataWindow.margin.top)
                    .attr('font-size', dataWindow.fontSize)
                dataWindow.shown = true
            })
            .on('mouseout', () => {
                if (dataWindow.shown == true) {
                    dataWindow.g.html('')
                    dataWindow.shown = false
                }
            })
    }
    //legend
    let legend = {
        scale: {
            x: null, y: null,
        },
        height: conf.margin.top,
        width: conf.width,
        fontSize: 15,
        line: {
            width: 12,
            height: 4,
            color: '#111'
        },
        lineType: {
            height: 2,
        },
        margin: {
            top: 10,
            left: 5, right: 20,
        },
        g: svg.append('g')
    }
    legend.scale.x = d3.scaleLinear().domain([0, 8]).range([0, legend.width - legend.margin.left - legend.fontSize - legend.line.width])
    legend.scale.y = d3.scaleLinear().domain([0, 1]).range([0, legend.height])
    legend.g.attr('transform', `translate(${legend.margin.left}, ${legend.margin.top})`)
    let seir_legend_g = legend.g.append('g')
    let line_type_legend = legend.g.append('g').attr('transform', 'translate(5, 0)')
    let seir_ = ['susceptible', 'exposed', 'infectious', 'recovered']
    seir_legend_g.selectAll('rect')
        .data(seir_)
        .join('rect')
        .attr('x', (d, i) => legend.scale.x(i))
        .attr('y', 0)
        .attr('width', legend.line.width)
        .attr('height', legend.line.height)
        .attr('fill', d => config.color[d])
    seir_legend_g.selectAll('text')
        .data(seir_)
        .join('text')
        .text(d => d.toUpperCase()[0])
        .attr('font-size', legend.fontSize)
        .attr('x', (d, i) => legend.scale.x(i) + legend.line.width + 5)
        .attr('y', legend.fontSize / 3)
    let line_type = ['origin', 'interposed']
    line_type_legend.selectAll('line')
        .data(line_type)
        .join('line')
        .attr('x1', (d, i) => legend.scale.x(i + 4) + 38 * i)
        .attr('x2', (d, i) => legend.scale.x(i + 4) + legend.line.width + 38 * i)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', '#111')
        .attr('stroke-width', legend.lineType.height)
        .attr('stroke-dasharray', d => `1.5 ${d == 'origin' ? 2 : 0}`)
    line_type_legend.selectAll('text')
        .data(line_type)
        .join('text')
        .attr('x', (d, i) => legend.scale.x(i + 4) + legend.line.width + 40 * i + 3)
        .attr('y', legend.fontSize / 3)
        .text(d => d)
        .attr('font-size', legend.fontSize)
}

export function setup() {
    var ini = injects()
    onMounted(() => {
        // 初始化高度
        // var title_height=document.querySelector('#SEIR .card-title').offsetHeight
        // var map_svg_height=document.querySelector('#SEIR').offsetHeight-title_height
        // var svg=d3.select('#SEIR-svg')
        // svg.attr('height',map_svg_height)
        if (inject('stateUpdated').value > 0) {
            // drawSEIRByComputed(ini)
            drawSEIRByReality(ini)
        }
        // watch(inject(''),()=>{
        //     // drawSEIR(ini)
        // },{immediate:false})
        watch(ini.iniChanged,()=>{
            console.log(ini)
            drawSEIRByReality(ini)
        },{immediate:false})
        watch(inject('stateUpdated'), () => {
            // drawSEIRByComputed(ini)
            drawSEIRByReality(ini)
            // console.log('SEIR updated')
        }, { immediate: false })
    })
    return {}
}




export function drawSEIRByComputed(_ini) {
    // ini 是 refImpl
    var ini = {}
    for (let k in _ini) {
        ini[k] = _ini[k].value
    }
    var { scene, N, days, ticks, rho, q, r, theta, delta, lambda, beta, sigma, I_gamma, ISO_gamma, S, E, I, R, ISO } = ini
    var c = r

    // 计算参数
    var _sum = 0, touchData = scene.touchData
    console.log(touchData)
    for (let k in touchData) {
        if (touchData[k].length > 0) {
            // _sum.push(d3.sum(touchData[k])/touchData[k].length)
            _sum += d3.sum(touchData[k]) / touchData[k].length
        }
        else {
            // _sum.push(0)
            _sum += 0
        }
    }
    var _aver = _sum / Object.keys(touchData).length * ticks
    console.log("aver", _aver)
    c = _aver
    // c=_sum.map(d=>d*ticks)

    var svg = d3.select('#SEIR-svg')
    var conf = {
        height: svg.node().clientHeight,
        width: svg.node().clientWidth,
        margin: {
            left: 35,
            right: 5,
            top: 5,
            bottom: 25
        }
    }
    svg.html('')
    var x = d3.scaleLinear()
        .domain([0, ini.days])
        .range([0, conf.width - conf.margin.left - conf.margin.right])
        , y = d3.scaleLinear()
            .domain([0, ini.N])
            .range([conf.height - conf.margin.top - conf.margin.bottom, 0])
    var axis = svg.append('g')
        .attr('id', 'SEIR-axis-g')
        .attr('transform', `translate(${conf.margin.left},${conf.margin.top})`)
    let x_ticks = d3.range(0, ini.days, 1)
    x_ticks[x_ticks.length - 1] = '(day)'
    axis.append('g').call(d3.axisBottom(x))
        .attr('transform', `translate(${0},${conf.height - conf.margin.top - conf.margin.bottom})`)
    axis.append('g').call(d3.axisLeft(y))
    var Sy = [S], Ey = [E], Iy = [I], Ry = [R], ISOy = [ISO]
    // var beta=I_r*I_beta
    var _t = 1 / ini.ticks
    for (let i = 0; i < days; i++) {
        for (let t = 0; t < ticks - 1; t++) {
            var T = dt2t(i, t)
            // var _S=S+(-(c*beta*S*(I+theta*E)/N+rho*c*q*(1-beta)*S*(1+theta*E)+lambda*ISO))*_t
            //    ,_E=E+(c*beta*(1-q)*S*(I+theta*E)/N-sigma*E)*_t
            //    ,_I=I+(sigma*E-(delta*I+I_gamma)*I)*_t
            //    ,_R=R+(I_gamma*I+ISO_gamma*ISO)*_t
            //    ,_ISO=ISO+(rho*c*q*(1-beta)*S*(I+theta*E)-lambda*ISO)*_t
            var _S = S + (-(c * beta * S * (I + theta * E) / N)) * _t
                , _E = E + (c * beta * (1 - q) * S * (I + theta * E) / N - sigma * E) * _t
                , _I = I + (sigma * E - (I_gamma * I)) * _t
                , _R = R + (I_gamma * I) * _t
                , _ISO = ISO + (rho * c * q * (1 - beta) * S * (I + theta * E) - lambda * ISO) * _t
            // var _S=S+(-(c[T]*beta*S*(I+theta*E)/N))*_t
            //    ,_E=E+(c[T]*beta*(1-q)*S*(I+theta*E)/N-sigma*E)*_t
            //    ,_I=I+(sigma*E-(I_gamma*I))*_t
            //    ,_R=R+(I_gamma*I)*_t
            //    ,_ISO=ISO+(rho*c[T]*q*(1-beta)*S*(I+theta*E)-lambda*ISO)*_t
            S = _S
            E = _E
            I = _I
            R = _R
            ISO = _ISO
            Sy.push(S)
            Ey.push(E)
            Iy.push(I)
            Ry.push(R)
            ISOy.push(ISO)
        }
    }
    _ini.SEIR_data.value = {
        Sy, Ey, Iy, Ry, ISOy
    }
    function index2x(i) {
        var dt = t2dt(i)
        return x(dt.day + _t * dt.tick)
    }
    //// 画曲线
    function drawScatter(data, color) {
        var svg = d3.select('#SEIR-svg')
        svg
            .append('g')
            .attr('transform', `translate(${conf.margin.left},${conf.margin.top})`)
            .selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', (d, i) => index2x(i))
            .attr('cy', d => y(d))
            .attr('r', 2)
            .attr('fill', color)
    }

    // 画曲线
    function liner(points) {
        var path = d3.path()
        for (let i = 0; i < points.length - 1; i++) {
            var p = points[i], p2 = points[i + 1]
            path.moveTo(p[0], p[1])
            path.lineTo(p2[0], p2[1])
        }
        return path
    }
    var SCoor = Sy.map((d, i) => [index2x(i), y(d)])
        , ECoor = Ey.map((d, i) => [index2x(i), y(d)])
        , ICoor = Iy.map((d, i) => [index2x(i), y(d)])
        , RCoor = Ry.map((d, i) => [index2x(i), y(d)])
        , ISOCoor = ISOy.map((d, i) => [index2x(i), y(d)])

    var lines = svg.append('g')
        .attr('transform', `translate(${conf.margin.left},${conf.margin.top})`)
    function drawLine(data, color) {
        lines
            .append('path')
            .attr('d', liner(data))
            .attr('stroke', color)
            .attr('stroke-width', 2)
    }
    drawLine(SCoor, config.color.susceptible)
    drawLine(ECoor, config.color.exposed)
    drawLine(ICoor, config.color.infectious)
    drawLine(RCoor, config.color.recovered)
}