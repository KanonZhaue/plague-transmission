
import { path } from 'd3'
import { onMounted, inject, watch } from 'vue'
import { injects } from '../../js/injects'
import { dt2t, last } from '../../js/kit'
var d3 = require('d3')

export function setup() {
    var svg = d3.select('#sunburst-svg')
    var ini = injects()
    onMounted(() => {
        init(ini)
        // network(ini)
    })
    // function update() {
    //     init(ini)
    //     // spreadNetwork(ini)
    //     // spreadTree(ini)
    //     // console.log('update....network')
    //     // drawNetwork(ini)
    // }
    // let options = { immediate: false }
    // watch(inject('currentTick'), () => { update() }, options)
    // watch(inject('currentDay'), () => { update() }, options)
    // watch(inject('stateUpdated'), () => { init(ini) }, options)
    // watch(ini.force_role, () => traceHighlight(ini), options)
    // watch(ini.recoveryNetwork, () => init(ini), options)
    // watch(ini.tree_depth_filter, () => { filterByDepth(ini) }, options)
}



function init(ini) {
    ini = getIni(ini)
    // console.log(ini, 'here')
    let { data, f_s } = ini.scene.sunburst((ini.ticks - 1) * ini.days)
    console.log(data, 'sunburst')
    var son_num = [], sss = [], rrr = []
    for (let dep = 0; dep < data.length; dep++) {
        var num = 0
        rrr[dep] = data[dep].length
        for (let k = 0; k < data[dep].length; k++) {
            num += data[dep][k].son_num
            sss[data[dep][k].id] = data[dep][k].son_num
        }
        son_num.push(num)
    }

    // console.log(rrr)

    var svg = d3.select('#sunburst-svg')
    svg.html('')

    var conf = {
        width: svg.node().clientWidth - 60,
        height: svg.node().clientHeight - 60,
        margin: 30
    }
    var sun_conf = {
        x: conf.margin + conf.width / 2,
        y: conf.margin + conf.height / 2,
        R: conf.width < conf.height ? conf.width : conf.height,
        depth: data.length,
        r: 60,//(conf.width < conf.height ? conf.width : conf.height) / data.length,
    }

    var R_scale = d3.scaleLinear().domain([d3.min(rrr), d3.max(rrr)]).range([5, 50])
    var inner = 0
    var outer = 0

    var arc = d3.arc()
    // svg.append("path")
    // .attr("d", arc({
    //     innerRadius: inner,
    //     outerRadius: outer,
    //     startAngle: 0,
    //     endAngle: Math.PI * 2,
    // }))
    // .attr('fill', '#555')
    // .attr("transform", "translate(" + sun_conf.x + "," + sun_conf.y + ")")


    // var color = ["black", "red", "blue", "yellow"]
    var angle = [0]
    var range = [2 * Math.PI]
    for (let dep = 0; dep < data.length; dep++) {//data.length
        var start = 0;
        var end = 0;
        inner = outer;
        outer = R_scale(data[dep].length) + inner
        // console.log(inner, outer, R_scale(data[dep].length), data[dep].length)
        for (let k = 0; k < data[dep].length; k++) {
            // console.log(data[dep][k].from)

            var n = k % data[dep].length
            start = angle[data[dep][k].from]
            if (dep == 0)
                end = 2 * Math.PI
            else
                if (data[dep].length > data[dep - 1].length)
                    end = range[data[dep][k].from] * data[dep][n].son_num / sss[data[dep][n].from] + angle[data[dep][k].from]
                else {
                    end = range[data[dep][k].from] / f_s[data[dep][k].from].length + angle[data[dep][k].from]
                }
            angle[data[dep][k].from] = end
            angle[data[dep][k].id] = start
            if (range[data[dep][k].id] == undefined)
                range[data[dep][k].id] = end - start


            // if (data[dep][n].sons[0] == data[dep][n].id)
            //     continue


            // }
            // else {
            // console.log(data[dep][n], start, end, 2 * Math.PI)



            svg.append("path")
                .attr("d", arc({
                    innerRadius: inner,
                    outerRadius: outer,
                    startAngle: start,
                    endAngle: end,
                }))
                .attr('id', "ro" + data[dep][k].id)
                .attr('class', "ro")
                .attr('fill', data[dep][k].id == 0 ? '#555' : data[dep][k].scene.color)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.001)
                .attr("transform", "translate(" + sun_conf.x + "," + sun_conf.y + ")")
                .on('mousemove', () => {
                    d3.selectAll(".ro").attr('stroke-width', 0.001).attr('stroke', 'black')
                    var h = data[dep][k]
                    var from = h.role.state[341].from.id
                    console.log(h)
                    var son = h.sons
                    d3.select("#ro" + String(data[dep][k].id)).attr('stroke', 'blue').attr('stroke-width', '1px')
                    d3.select("#ro" + String(from)).attr('stroke', 'red').attr('stroke-width', '1px')
                    for (let i = 0; i < son.length; i++) {
                        d3.select("#ro" + String(son[i])).attr('stroke', '#ff7300').attr('stroke-width', '1px')
                    }
                })
                .append('title').text(() => {
                    var h = data[dep][k]
                    var from = h.role.state[341].from.id
                    var son = h.sons
                    var s = ""
                    for (let i = 0; i < son.length; i++) {
                        s += " " + son[i] + ","
                    }
                    return "from:" + from + " sons:" + s
                })

            // }
        }

    }

    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    function zoomed(event) {
        // console.log(event)
        const { transform } = event;
        console.log(transform)
        svg.attr("transform", transform);
        svg.attr("stroke-width", 1 / transform.k);
        // dat_g.attr("transform", transform);
        // dat_g.attr("stroke-width", 1 / transform.k);
    }

    svg.call(zoom)



}

function getIni(ini) {
    var _ = {}
    for (let k in ini) {
        _[k] = ini[k].value
    }
    return _
}

