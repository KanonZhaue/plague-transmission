/* eslint-disable */
import { onMounted, inject, watch } from 'vue'
import { injects } from '../../js/injects'
import { dt2t, last } from '../../js/kit'
import config from "../../conf/config"
import ini from '../../conf/ini'


var d3 = require('d3')

export function setup() {
    var svg = d3.select('#network-svg')
    var ini = injects()
    onMounted(() => {
        init(ini, 1)
        // network(ini)
    })
    function update() {
        network(ini)
        // spreadNetwork(ini)
        // spreadTree(ini)
        // console.log('update....network')
        // drawNetwork(ini)
    }
    let options = { immediate: false }
    watch(inject('currentTick'), () => { update() }, options)
    watch(inject('currentDay'), () => { update() }, options)
    watch(inject('stateUpdated'), () => { init(ini, 1) }, options)
    watch(ini.force_role, () => { init(ini, 0) }, options)
    // watch(ini.force_role, () => force_map(ini, 0), options)
    watch(ini.recoveryNetwork, () => init(ini, 1), options)
    watch(ini.tree_depth_filter, () => { filterByDepth(ini) }, options)
}

function filterByDepth(ini) {
    let depth = ini.tree_depth_filter.value
    if (depth == null) return
    let _ini = ini
    ini = getIni(ini)
    let { nodes, links } = ini.scene.network((ini.ticks - 1) * ini.days)
    let mapOfNodes = {}
    for (let i = 0; i < nodes.length; i++) {
        mapOfNodes[nodes[i].id] = nodes[i]
        nodes[i].children = []
        nodes[i].name = nodes[i].id
    }
    for (let i = 0; i < links.length; i++) {
        if (links[i].source != links[i].target)
            mapOfNodes[links[i].source].children.push(mapOfNodes[links[i].target])
    }
    let tree = d3.tree().separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)
    let root = tree(d3.hierarchy(mapOfNodes[0]))
    special_display(
        d3.filter(root.descendants(), d => d.depth <= depth).map(d => {
            return {
                id: d.data.id
            }
        }),
        d3.filter(root.links(), d => d.source.depth <= depth && d.target.depth <= depth).map(d => {
            return {
                source: d.source.data.id,
                target: d.target.data.id
            }
        }),
        _ini
    )
}

var bias = { x: 0, y: 0, r: 0 }

function tree2nodes(root, arr) {
    arr.push(root)
    if (root.children == undefined) return
    for (let i = 0; i < root.children.length; i++) {
        tree2nodes(root.children[i], arr)
    }
}


function nodes2links(nodes, arr) {
    for (let i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        if (node.children == undefined) continue
        var { x, y } = node
        for (let i = 0; i < node.children.length; i++) {
            arr.push({
                source: angle2xy(x, y),
                target: angle2xy(node.children[i].x, node.children[i].y)
                // source:{x,y},
                // target:{
                //     x:node.children[i].x,
                //     y:node.children[i].y
                // }
            })
        }
    }
}

function dishighlight() {
    let { nodes, links } = final_data
    for (let i = 0; i < nodes.length; i++) {
        d3.select('#' + struct_id.node(nodes[i]))
            .attr('opacity', 1)
            .attr('stroke', '#111')
            .attr('stroke-width', 0.7)
    }
    for (let i = 0; i < links.length; i++) {
        d3.select('#' + struct_id.link(links[i]))
            .attr('opacity', 0.7)
            .attr('stroke', '#aaa')
    }
}

var node_r = 8
var first = true
var final_data
var viewbox = { x: 0, y: 0, width: 0, height: 0, }

function init(ini, recover) {
    let _ini = ini

    ini = getIni(ini)
    // console.log(ini)
    let force_role = recover ? 0 : ini.force_role
    // console.log(force_role)
    final_data = ini.scene.network((ini.ticks - 1) * ini.days)
    let { nodes, links } = final_data
    // console.log(nodes, links, 'link')
    viewbox.width = 1519
    // 0, 0, 1519.5116669142799, 1909.8972490065576
    viewbox.height = 1909
    var svg = d3.select('#network-svg').attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)
    svg.html('')
    document.getElementById('network-svg').addEventListener('mousewheel', e => {
        let dy = e.deltaY
        let rate = viewbox.width / viewbox.height
        viewbox.height += 30 * (dy > 0 ? 1 : -1)
        viewbox.width = rate * viewbox.height
        viewbox.height = Math.abs(viewbox.height)
        viewbox.width = Math.abs(viewbox.width)
        d3.select('#network-svg')
            .attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)
    })
    svg.call(d3.drag().on('drag', e => {
        let nodes = final_data.root.descendants()
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].x += e.dx
            nodes[i].y += e.dy
        }
        d3.select('#spread-nodes')
            .selectAll('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
        d3.select('#spread-links')
            .selectAll('path')
            .attr('d', d3.linkHorizontal()
                .x(d => d.x)
                .y(d => d.y))
    }))
    var conf = {
        width: svg.node().clientWidth,
        height: svg.node().clientHeight,
        margin: 30
    }

    viewbox.x = conf.width / 3;
    viewbox.y = conf.height / 3
    node_r = config.map.node.r * viewbox.width / d3.select('#network-svg').node().clientWidth
    // console.log(node_r)
    // 画网络图使用的代码
    // build_network(_ini)

    // 画树- circular tree
    let mapOfNodes = {}
    for (let i = 0; i < nodes.length; i++) {
        mapOfNodes[nodes[i].id] = nodes[i]
        nodes[i].children = []
        nodes[i].name = nodes[i].id
    }
    for (let i = 0; i < links.length; i++) {
        if (links[i].source != links[i].target)
            mapOfNodes[links[i].source].children.push(mapOfNodes[links[i].target])
    }
    console.log(mapOfNodes)
    let tree = d3.tree()
        .size([2 * Math.PI,
        Math.max(conf.width, conf.height) / 2 + (force_role == 0 ? 1000 : 800) // +1000 为了扩大半径
        ])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)
    let root = tree(d3.hierarchy(mapOfNodes[force_role]))
    _ini.tree_max_depth.value = maxDepth(root)
    let scale = {
        r: d3.scaleLinear().domain([0, _ini.tree_max_depth.value]).range([5, 12])
    }
    final_data.root = root;
    // 极坐标->笛卡尔
    (function () {
        let nodes = root.descendants()
        for (let i = 0; i < nodes.length; i++) {
            let x = Math.cos(nodes[i].x) * nodes[i].y
            let y = Math.sin(nodes[i].x) * nodes[i].y
            nodes[i].x = x + 1 * conf.width + viewbox.x
            nodes[i].y = y + 1.5 * conf.height + viewbox.y
        }
    })()
    let g = {
        links: svg.append('g')
            .attr('id', 'spread-links'),
        nodes: svg.append('g')
            .attr('id', 'spread-nodes'),
    }
    // console.log(root.descendants(), root.links())


    g.nodes.selectAll('circle')
        .data(root.descendants())
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr("stroke", "#111")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width", d => d.data.id == ini.force_role ? 6 : 1)
        .attr('class', 'hover-stroke')
        .attr('id', d => struct_id.node(d.data))
        .attr("fill", d => d.data.id == 0 ? '#000' : d.data.role.state[d.data.role.state[713].infected].scene.color)
        //     // .attr("r", d=>scale.r( maxDepth(d) - d.depth ))
        .attr('r', node_r)
        .on('click', e => {
            // console.log(e)
            _ini.force_role.value = e.path[0].__data__.data.id

        })
        .append('title')
        .text(d => d.data.id);
    // console.log(root.links(), 'look')
    g.links.selectAll('path')
        .data(root.links())
        .join('path')
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr('id', d => struct_id.link({
            source: d.source.data,
            target: d.target.data
        }))
        .attr('d', d3.linkHorizontal()
            .x(d => d.x)
            .y(d => d.y))

    return // 不要legend
    let legend_conf = {
        r: 15,
        fontSize: 20,
        margin: {
            top: 10,
            bottom: 5,
            left: 10,
        },
        line_width: 10,
        arrow: {
            height: 3,
            width: 5
        },
        color: '#333'
    }
    // let legend = svg.append('g')
    let legend_svg = d3.select('#network-legend').html('')
    let legend = legend_svg.append('g')
    legend.attr('transform', `translate(${legend_conf.margin.left + legend_conf.r}, ${legend_conf.r + legend_conf.margin.top})`)
    legend
        .append('circle')
        .attr('r', legend_conf.r)
        .attr('fill', legend_conf.color)
    legend.append('line')
        .attr('stroke', legend_conf.color)
        .attr('x2', legend_conf.r)
        .attr('x1', legend_conf.r * 2 + legend_conf.line_width)
        .attr('y1', -legend_conf.r)
        .attr('y2', -legend_conf.r)
    legend.append('line')
        .attr('stroke', legend_conf.color)
        .attr('x2', legend_conf.r)
        .attr('x1', legend_conf.r * 2 + legend_conf.line_width)
        .attr('y1', legend_conf.r)
        .attr('y2', legend_conf.r)
    legend.append('line')
        .attr('x2', legend_conf.r * 2 + legend_conf.line_width / 2)
        .attr('x1', legend_conf.r * 2 + legend_conf.line_width / 2)
        .attr('y1', -legend_conf.r)
        .attr('y2', legend_conf.r)
        .attr('stroke', legend_conf.color)
    legend.append('text')
        .text('Number of infected persons')
        .attr('x', legend_conf.r * 2 + legend_conf.line_width / 2 + 2)
        .attr('y', legend_conf.fontSize / 3)
        .attr('font-size', legend_conf.fontSize)
    legend.append('path')
        .attr('d', () => {
            let path = d3.path()
            let center = [legend_conf.r * 2 + legend_conf.line_width / 2, -legend_conf.r]
            path.moveTo(center[0] - legend_conf.arrow.width / 2, center[1] + legend_conf.arrow.height)
            path.lineTo(center[0], center[1])
            path.moveTo(center[0], center[1])
            path.lineTo(center[0] + legend_conf.arrow.width / 2, center[1] + legend_conf.arrow.height)

            center = [center[0], legend_conf.r]
            path.moveTo(center[0] - legend_conf.arrow.width / 2, center[1] - legend_conf.arrow.height)
            path.lineTo(center[0], center[1])
            path.moveTo(center[0], center[1])
            path.lineTo(center[0] + legend_conf.arrow.width / 2, center[1] - legend_conf.arrow.height)
            return path.toString()
        })
        .attr('stroke', legend_conf.color)
        .attr('stroke-width', 1)

    return // 不要region的legend
    let title = ini.scene.nodes
    legend_conf = {
        width: 70,
        height: 120,
        line: {
            width: 12,
            height: 10
        },
        fontSize: 10,
        fontMargin: 6
    }
    var legend_margin = {
        // x:conf.width-legend_conf.width,
        x: 10,
        y: conf.height - legend_conf.height - 10,
    }
    var index2y = d3.scaleLinear().domain([0, title.length - 1]).range([0, legend_conf.height])
    legend = legend_svg.append('g')
    legend
        .attr('transform', `translate(${legend_margin.x},${legend_margin.y})`)
        .selectAll('rect')
        .data(title)
        .join('rect')
        .attr('x', 0)
        .attr('y', (d, i) => index2y(i) - legend_conf.line.height / 2)
        .attr('width', legend_conf.line.width)
        .attr('height', legend_conf.line.height)
        .attr('fill', d => d.color)
        .attr('stroke-width', '#111')
        .attr('stroke', '#111')
    legend
        .selectAll('text')
        .data(title)
        .join('text')
        .text(d => d.name)
        .attr('x', legend_conf.line.width + legend_conf.fontMargin)
        .attr('y', (d, i) => index2y(i) + legend_conf.fontSize / 3)
        .attr('font-size', legend_conf.fontSize)
}
//力导向图
function force_map(ini, recover) {
    let _ini = ini

    ini = getIni(ini)
    // console.log(ini)
    let force_role = recover ? 0 : ini.force_role
    // console.log(force_role)
    final_data = ini.scene.network((ini.ticks - 1) * ini.days)
    let { nodes, links } = final_data
    // console.log(nodes, links, 'link')
    viewbox.width = 1519
    // 0, 0, 1519.5116669142799, 1909.8972490065576
    viewbox.height = 1909
    var svg = d3.select('#network-svg').attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)
    svg.html('')

    // document.getElementById('network-svg').addEventListener('mousewheel', e => {
    //     let dy = e.deltaY
    //     let rate = viewbox.width / viewbox.height
    //     viewbox.height += 30 * (dy > 0 ? 1 : -1)
    //     viewbox.width = rate * viewbox.height
    //     viewbox.height = Math.abs(viewbox.height)
    //     viewbox.width = Math.abs(viewbox.width)
    //     d3.select('#network-svg')
    //         .attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)
    // })

    var conf = {
        width: svg.node().clientWidth,
        height: svg.node().clientHeight,
        margin: 30
    }

    viewbox.x = conf.width / 3;
    viewbox.y = conf.height / 3
    node_r = config.map.node.r * viewbox.width / d3.select('#network-svg').node().clientWidth

    let mapOfNodes = {}
    for (let i = 0; i < nodes.length; i++) {
        mapOfNodes[nodes[i].id] = nodes[i]
        nodes[i].children = []
        nodes[i].name = nodes[i].id
    }
    for (let i = 0; i < links.length; i++) {
        if (links[i].source != links[i].target)
            mapOfNodes[links[i].source].children.push(mapOfNodes[links[i].target])
    }
    // console.log(mapOfNodes)
    let tree = d3.tree()
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)
    let root = tree(d3.hierarchy(mapOfNodes[force_role]))


    let g = {
        links: svg.append('g')
            .attr('id', 'spread-links'),
        nodes: svg.append('g')
            .attr('id', 'spread-nodes'),
    }

    var edges_force = [], nodes_force = root.descendants(), trans = {}
    var num = 0, dep = 0;
    for (let i = 0; i < nodes_force.length; i++) {
        trans[nodes_force[i].data.id] = i

        console.log(num, dep)
        if (nodes_force[i].depth != dep && num > 20) {
            nodes_force.splice(i)
            break

        }
        if (nodes_force[i].parent != null) {
            edges_force.push({
                source: trans[nodes_force[i].parent.data.id],
                target: trans[nodes_force[i].data.id]
            })
        }
        dep = nodes_force[i].depth;
        num += 1
    }
    // console.log(nodes_force, edges_force)

    //新建一个力导向图
    var forceSimulation = d3.forceSimulation()
        .force("link", d3.forceLink())
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter())
        .force("collision", d3.forceCollide(30))
    //初始化力导向图，也就是传入数据
    //生成节点数据
    forceSimulation.nodes(nodes_force)
        .on("tick", ticked);//这个函数很重要，后面给出具体实现和说明
    //生成边数据
    forceSimulation.force("link")
        .links(edges_force)
        .distance(function (d) {//每一边的长度
            var dist = 0;
            var infected = d.target.data.infected
                , id = d.target.data.id
                , children = d.source.children
            for (let i = 0; i < children.length; i++) {
                if (infected >= children[i].data.infected)
                    dist++
            }
            return dist * 100;
        })

    forceSimulation.force('charge')
        .strength(-50)

    //设置图形的中心位置	
    forceSimulation.force("center")
        .x(viewbox.width / 2)
        .y(viewbox.height / 2);
    //在浏览器的控制台输出
    console.log(nodes_force);
    console.log(edges_force);

    //有了节点和边的数据后，我们开始绘制
    //绘制边
    var tmp_link = g.links.selectAll("line")
        .data(edges_force)
        .enter()
        .append("line")
        .attr("stroke", (d) => {
            // return "#555"
            return d.target.data.scene.color
        })
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 3)
        .attr("fill", "none")

    //绘制节点
    //老规矩，先为节点和节点上的文字分组
    var node_tmp = g.nodes.selectAll(".circleText")
        .data(nodes_force)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
            // console.log(d)
            var cirX = d.x;
            var cirY = d.y;
            return "translate(" + cirX + "," + cirY + ")";
        })
        .call(d3.drag()
            .on("start", started)
            .on("drag", dragged)
            .on("end", ended)
        );

    //绘制节点
    node_tmp.append("circle")
        .attr("r", node_r * 2)
        .attr("id", (d) => "c" + d.data.id)
        .attr("fill", function (d, i) {
            // return d.data.scene.color
            return "#fff"
        })
        .attr("stroke", "#111")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width", d => d.data.id == ini.force_role ? 6 : 1)
        .on('click', e => {
            // console.log(e)
            _ini.force_role.value = e.path[0].__data__.data.id

        })
        .append('title')
        .text(d => d.data.id);

    node_tmp.append("text")
        .attr("x", -10)
        .attr("y", -20)
        .attr("dy", 10)
        .attr('font-size', '50px')
        .text(function (d) {
            return d.data.id
        })


    function ticked() {
        // console.log(1)
        forceSimulation.alphaTarget(0.8).restart();
        tmp_link
            .attr("x1", function (d) {
                // console.log(d)
                return d.source.x;
            })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node_tmp
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    }
    function started(d, k) {
        // console.log(d, k, 1)
        if (!d.active) {
            forceSimulation.alphaTarget(0.8).restart();
        }
        k.fx = d.x;
        k.fy = d.y;
    }
    function dragged(d, k) {
        // console.log(d, k, 2)
        k.fx = d.x;
        k.fy = d.y;
    }
    function ended(d, k) {
        // console.log(d, 3)
        if (!d.active) {
            forceSimulation.alphaTarget(0);
        }
        k.fx = null;
        k.fy = null;
    }


}

function maxDepth(root) {
    if (root.children == undefined) return root.depth
    let _depth_ = root.depth
    for (let i = 0; i < root.children.length; i++) {
        _depth_ = Math.max(_depth_, maxDepth(root.children[i]))
    }
    return _depth_
}

function traceHighlight(ini) {
    let forced = ini.force_role.value
    let { nodes, links } = ini.scene.value.findRoleById(forced).traceHighlightData()
    console.log(nodes, links, ini)
    special_display(nodes, links, ini)

    // highligh(nodes, links, {
    //     disimportant:{
    //         opacity: 0,
    //         stroke: '#aaa',
    //     },
    //     important: {
    //         opacity: 1,
    //         stroke: '#101010',
    //     },
    //     most_important:{
    //         stroke_width: 1.6,
    //         id: forced
    //     }
    // })
}



function highligh(nodes, links, opt) {
    let mapOfNodes = {}
    if (opt.disimportant != undefined) {
        for (let i = 0; i < final_data.nodes.length; i++) {
            let tmp = d3.select('#' + struct_id.node(final_data.nodes[i]))
            if (opt.disimportant.opacity != undefined)
                tmp.attr('opacity', opt.disimportant.opacity)
            if (opt.disimportant.stroke != undefined)
                tmp.attr('stroke', opt.disimportant.stroke)
        }
        for (let i = 0; i < final_data.links.length; i++) {
            let tmp = d3.select('#' + struct_id.link(final_data.links[i]))
            if (opt.disimportant.opacity != undefined)
                tmp.attr('opacity', opt.disimportant.opacity)
            if (opt.disimportant.stroke != undefined)
                tmp.attr('stroke', opt.disimportant.stroke)
            tmp.attr('stroke-width', 0)
        }
    }
    if (opt.important != undefined) {
        for (let i = 0; i < nodes.length; i++) {
            mapOfNodes[nodes[i].id] = nodes[i]
            let tmp = d3.select('#' + struct_id.node(nodes[i]))
            if (opt.important.opacity != undefined)
                tmp.attr('opacity', opt.important.opacity)
            if (opt.important.stroke != undefined)
                tmp.attr('stroke', opt.important.stroke)
            if (opt.most_important != undefined)
                if (nodes[i].id == opt.most_important.id)
                    tmp.attr('stroke-width', opt.most_important.stroke_width)
        }
        for (let i = 0; i < links.length; i++) {
            links[i] = {
                source: mapOfNodes[links[i].source],
                target: mapOfNodes[links[i].target]
            }
            let tmp = d3.select('#' + struct_id.link(links[i]))
            if (opt.important.opacity != undefined)
                tmp.attr('opacity', opt.important.opacity)
            if (opt.important.stroke != undefined)
                tmp.attr('stroke', opt.important.stroke)
            tmp.attr('stroke-width', 0.7)
        }
    }
}


function network(ini) {
    let _ini = ini
    ini = getIni(ini)
    let { nodes, links } = ini.scene.network()
    special_display(nodes, links, _ini)
    // console.log('ini', nodes, links)
}

function special_display(nodes, links, ini) {
    let root = final_data.root
    let complete_tree = {
        nodes: root.descendants(),
        links: root.links()
    }
    let mapOfNodes = {}
    for (let i = 0; i < complete_tree.nodes.length; i++) {
        mapOfNodes[complete_tree.nodes[i].data.id] = complete_tree.nodes[i]
    }
    for (let i = 0; i < nodes.length; i++) {
        nodes[i] = mapOfNodes[nodes[i].id]
    }
    for (let i = 0; i < links.length; i++) {
        links[i] = {
            source: mapOfNodes[links[i].source],
            target: mapOfNodes[links[i].target]
        }
    }

    // console.log(mapOfNodes, 'lxm')
    let scale = { r: d3.scaleLinear().domain([0, maxDepth(root)]).range([5, 12]) }
    let g = {
        nodes: d3.select('#spread-nodes').html(''),
        links: d3.select('#spread-links').html('')
    }

    // // 放缩
    // let border = {
    //     x: {
    //         max: d3.max(nodes, d=>d.x),
    //         min: d3.min(nodes, d=>d.x)
    //     },
    //     y: {
    //         max: d3.max(nodes, d=>d.y),
    //         min: d3.min(nodes, d=>d.y)
    //     }
    // }
    // let diff = {
    //     x: border.x.max - border.x.min,
    //     y: border.y.max - border.y.min
    // }
    // diff = {
    //     x: diff.x <= 0? d3.select('#network-svg').node().clientWidth : diff.x,
    //     y: diff.y <= 0? d3.select('#network-svg').node().clientWidth : diff.y,
    // }

    // for(let i=0; i<complete_tree.nodes.length; i++)
    // {
    //     complete_tree.nodes[i].x -= border.x.min
    //     complete_tree.nodes[i].y -= border.y.min
    // }
    // node_r = config.map.node.r * diff.x / d3.select('#network-svg').node().clientWidth
    // console.log(node_r)
    // viewbox.width = diff.x + node_r*3
    // viewbox.height = diff.y + node_r*3
    // let realSize = node_r* d3.select('#network-svg').node().clientWidth / diff.x
    // let lengthBias = {
    //     x:0, y:0
    // }
    // if(nodes.length==1)
    // {
    //     lengthBias.x += viewbox.width/2 +realSize
    //     lengthBias.y += viewbox.height/2 +realSize
    // }
    // for(let i=0; i<complete_tree.nodes.length; i++)
    // {
    //     let _node = complete_tree.nodes[i]
    //     _node.x += lengthBias.x
    //     _node.y += lengthBias.y
    // }
    // d3.select('#network-svg').attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)
    // console.log(nodes)
    g.nodes.selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr("stroke", "#111")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width", d => d.data.id == ini.force_role.value ? 6 : 1)
        .attr('class', 'hover-stroke')
        .attr('id', d => struct_id.node(d.data))
        .attr("fill", d => d.data.id == 0 ? '#000' : d.data.role.state[d.data.role.state[713].infected].scene.color)
        //     // .attr("r", d=>scale.r( maxDepth(d) - d.depth ))
        .attr('r', node_r)
        .on('click', e => {
            console.log(e.path[0].__data__.data.id)
            ini.force_role.value = e.path[0].__data__.data.id
        })
        .append('title')
        .text(d => d.data.id);
    g.links.selectAll('path')
        .data(links)
        .join('path')
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr('id', d => struct_id.link({
            source: d.source.data,
            target: d.target.data
        }))
        .attr('d', d3.linkHorizontal()
            .x(d => d.x)
            .y(d => d.y))
}

var struct_id = {
    node: (node) => `nw-node-${node.id}`,
    link: (link) => `nw-link-${link.source.id}-${link.target.id}`
}

function spreadTree(ini) {
    ini = getIni(ini)
    var tick = dt2t(ini.currentDay, ini.currentTick)
    var data = ini.scene.spreadNetworkData(tick)
    var svg = d3.select('#network-svg')
    svg.html('')
    var offset = { x: 0, y: 0 }
    // svg=svg.append('g')
    var conf = {
        height: svg.node().clientHeight,
        width: svg.node().clientWidth
    }
    var root = d3.hierarchy(data.tree)
    var tree = d3.tree()
        .size([2 * Math.PI, d3.min([conf.width, conf.height]) / 2])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)
    tree(root)
    var Genline = d3.linkRadial().angle(d => d.x).radius(d => d.y)
    // var Genline=d3.linkHorizontal().x(d=>d.x).y(d=>d.y)
    // var nodes=[], links=[]
    // tree2nodes(root,nodes)
    // nodes2links(nodes,links)
    var nodes = root.descendants()
        , links = root.links()
    console.log('nodes', nodes)
    var g = {
        links() {
            svg.append('g')
                .attr('transform', `translate(${conf.width / 2},${conf.height / 2})`)
                .selectAll('path')
                .data(links)
                .join('path')
                .attr('d', Genline)
                .attr('fill', 'none')
                .attr('stroke', '#ccc')
                .attr('stroke-width', 1)
        },
        nodes() {
            svg.append('g')
                .attr('transform', `translate(${conf.width / 2},${conf.height / 2})`)
                .selectAll('circle')
                .data(nodes)
                .join('circle')
                .attr('class', 'hover-stroke')
                .attr("transform", d => `
                rotate(${d.x * 180 / Math.PI - 90})
                translate(${d.y},0)
                `)
                .attr("fill", d => {
                    var state = d.data.role.state
                    return config.color[state[tick].state]
                })
                .attr('r', 4)
                .attr('opacity', config.map.node.opacity)
        }
    }
    g.links()
    g.nodes()

    function drag_svg() {
        function dragged(event) {
            var dx = event.dx,
                dy = event.dy;
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].x += dx
                nodes[i].y += dy
            }
        }
        return d3.drag().on("drag", dragged);
    }
    // svg.call(drag_svg())
}

function sline(d) {
    var path = d3.path()
    path.moveTo(d.source.x, d.source.y)
    path.lineTo(d.target.x, d.target.y)
    return path.toString()
    // var path=d3.path()
    // path.moveTo(d.source.x,d.source.y)
    // var cpx=(d.source.x+d.target.x)*0.6,
    //     cpy=(d.source.y+d.target.y)*0.6
    // cpx=Math.round(cpx)
    // cpy=Math.round(cpy)
    // path.quadraticCurveTo(cpx,cpy,d.target.x,d.target.y)
    // return path.toString()
}

function diagonal(d) {
    return "M" + d.source.x + "," + d.source.y
        + "C" + d.source.x + "," + (d.source.y + d.target.y) / 2
        + " " + d.target.x + "," + (d.source.y + d.target.y) / 2
        + " " + d.target.x + "," + d.target.y;
};

function showUntil(ini) {
    ini = getIni(ini)
    var t = dt2t(ini.currentDay, ini.currentTick)
    var ticks = (ini.ticks - 1) * ini.days
    for (let i = 0; i < ticks; i++) {
        if (i < t) {
            d3.selectAll(`.nw-tick-${i}`)
                .attr('opacity', 1)
        }
        else {
            d3.selectAll(`.nw-tick-${i}`)
                .attr('opacity', 0)
        }
    }
}

function getIni(ini) {
    var _ = {}
    for (let k in ini) {
        _[k] = ini[k].value
    }
    return _
}

function spreadNetwork(ini) {
    ini = getIni(ini)
    var t = dt2t(ini.currentDay, ini.currentTick)
    var { nodes, links } = ini.scene.spreadNetworkData()
    var svg = d3.select('#network-svg')
    svg.html('')
    var conf = {
        height: svg.node().clientHeight,
        width: svg.node().clientWidth
    }
    var g = {
        g: svg.append('g').attr('id', 'nw-g'),
        nodes: svg,
        links: svg,
        simulation: d3.forceSimulation(nodes)
    }
    g.links = g.g.append('g').attr('id', 'nw-links-g')
    g.nodes = g.g.append('g').attr('id', 'nw-nodes-g')
    g.simulation
        .force("link", d3.forceLink(links).id((d) => d.id))
        // .force("many-body", d3.forceManyBody())
        // .force('charge',d3.forceManyBody())
        .force('collision', d3.forceCollide(8).iterations(3))
        .force("center", d3.forceCenter(conf.width / 2, conf.height / 2))
    g.links = g.links.selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('class', d => `nw-tick-${last(d.target.role.state).infected}`)
    g.nodes = g.nodes.selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 3)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('fill', d => nodeColor(d.role.state[t].state))
        .attr('class', d => `nw-tick-${last(d.role.state).infected}`)

    function drag_svg() {
        function dragged(event) {
            var cx = event.dx,
                cy = event.dy;
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].x += cx;
                nodes[i].y += cy;
            }
            g.links
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
            g.nodes
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y);
        }
        return d3.drag().on("drag", dragged);
    }

    g.simulation
        .on("end", () => {
            g.links
                .attr('id', d => `link-${d.source.id}-${d.target.id}`)
                .attr("x1", (d) => {
                    return d.source.x
                })
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
            g.nodes
                .attr("cx", d => d.x)
                .attr('cy', d => d.y)
            svg.call(drag_svg())
        });
}

function nodeColor(state) {
    return config.color[state]
}

function sceneNetwork(ini) {
    var t = dt2t(ini.currentDay, ini.currentTick)
    var { nodes, links } = ini.scene.touchDataByTick(t)
    var svg = d3.select('#network-svg')
    svg.html('')
    var conf = {
        height: svg.node().clientHeight,
        width: svg.node().clientWidth
    }
    // console.log('Nwtwork data:',nodes,links)
    // var NODES=[],LINKS=[]
    // for(let sc in links)
    // {
    //     var _links=links[sc]
    //         ,_nodes=nodes[sc]
    //     _links=_links.map(d=>{
    //         return {
    //             source:d.source.id,
    //             target:d.target.id
    //         }
    //     })
    //     _nodes=_nodes.map(d=>{
    //         return {
    //             id:d.id,
    //             data:d
    //         }
    //     })
    //     for(let i=0;i<_nodes.length;i++)
    //     {
    //         NODES.push(_nodes[i])
    //     }
    //     for(let i=0;i<_links.length;i++)
    //     {
    //         LINKS.push(_links[i])
    //     }
    //     // var g={
    //     //     g:svg.append('g').attr('id',sc),
    //     //     nodes:svg,
    //     //     links:svg,
    //     //     simulation:d3.forceSimulation(_nodes)
    //     // }
    //     // g.links=g.g.append('g').attr('id',sc+'-links-g')
    //     // g.nodes=g.g.append('g').attr('id',sc+'-nodes-g')
    //     // g.simulation
    //     //     .force("link",d3.forceLink(_links).id((d) => d.id))
    //     //     // .force("many-body", d3.forceManyBody().strength(-0.5))
    //     //     .force("center", d3.forceCenter(conf.width / 2, conf.height / 2))
    //     //     .force('collision',d3.forceCollide(ini.collision))
    //     // g.links=g.links.selectAll('line')
    //     //     .data(_links)
    //     //     .join('line')
    //     //     .attr('stroke','#ccc')
    //     //     .attr('stroke-width',1)
    //     // g.nodes=g.nodes.selectAll('circle')
    //     //     .data(_nodes)
    //     //     .join('circle')
    //     //     .attr('r',3)
    //     //     .attr('stroke','#fff')
    //     //     .attr('stroke-width',1)
    //     //     .attr('fill',d=>nodeColor(d.data.state[t].state))
    //     // console.log(_nodes,_links)
    //     // g.simulation
    //     //     .on("end", () => {
    //     //         console.log(sc,_nodes,_links)
    //     //         g.links
    //     //             .attr('id',d=>`link-${d.source.id}-${d.target.id}`)
    //     //             .attr("x1", (d) => {
    //     //                 return d.source.x
    //     //             })
    //     //             .attr("y1", (d) => d.source.y)
    //     //             .attr("x2", (d) => d.target.x)
    //     //             .attr("y2", (d) => d.target.y);
    //     //         g.nodes
    //     //             .attr("cx", d =>d.x)
    //     //             .attr('cy',d=>d.y)
    //     //         // node_g.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    //     //     });
    // }
    var _max = {}, _min = {}
    for (let i = 0; i < links.length; i++) {
        var sc = links[i].scene
        var dist = links[i].distance
        if (sc == undefined) continue
        if (_max[sc] == undefined) {
            _max[sc] = dist
            _min[sc] = dist
        }
        else {
            _max[sc] = d3.max([_max[sc], dist])
            _min[sc] = d3.min([_min[sc], dist])
        }
    }
    console.log('_MAX', _max, _min)
    var T = {}
    for (let k in _max) {
        T[k] = d3.scaleLinear()
            .domain([_min[k], _max[k]])
            .range([0, 150])
    }
    function distance(link) {
        if (link.scene != undefined) {
            return T[link.scene](link.distance)
        }
        return link.distance
    }
    var g = {
        g: svg.append('g').attr('id', 'nw-g'),
        nodes: svg,
        links: svg,
        simulation: d3.forceSimulation(nodes)
    }
    g.links = g.g.append('g').attr('id', 'links-g')
    g.nodes = g.g.append('g').attr('id', 'nodes-g')
    g.simulation
        .force("link", d3.forceLink(links).id((d) => d.id).distance(d => distance(d)))
        .force("many-body", d3.forceManyBody().strength(-1))
        .force("center", d3.forceCenter(conf.width / 2, conf.height / 2).strength(1.5))
    // .force('collision',d3.forceCollide(ini.collision))
    g.links = g.links.selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#ccc')
        .attr('stroke-width', d => d.display ? 1 : 0)
    g.nodes = g.nodes.selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 3)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('fill', d => d.type == 'scene' ? 'rgba(0,0,0,0)' : nodeColor(d.state[t].state))
    // .attr('fill','#333')
    g.simulation
        .on("end", () => {
            g.links
                .attr('id', d => `link-${d.source.id}-${d.target.id}`)
                .attr("x1", (d) => {
                    return d.source.x
                })
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
            g.nodes
                .attr("cx", d => d.x)
                .attr('cy', d => d.y)
        });
    // for()
}

function socialNetwork(ini) {
    var t = dt2t(ini.currentDay, ini.currentTick)
    var { nodes, links } = ini.scene.socialDataByTick(t)
    console.log(links)
    var svg = d3.select('#network-svg')
    svg.html('')
    var conf = {
        height: svg.node().clientHeight,
        width: svg.node().clientWidth
    }
    var g = {
        g: svg.append('g').attr('id', 'nw-g'),
        nodes: svg,
        links: svg,
        simulation: d3.forceSimulation(nodes)
    }
    g.links = g.g.append('g').attr('id', 'links-g')
    g.nodes = g.g.append('g').attr('id', 'nodes-g')
    g.simulation
        .force("link", d3.forceLink(links).id((d) => d.id).distance(d => d.weight * 80))
        .force("many-body", d3.forceManyBody().strength(-0.4))
        .force("center", d3.forceCenter(conf.width / 2, conf.height / 2).strength(1.5))
    // .force('collision',d3.forceCollide(ini.collision))
    g.links = g.links.selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#ccc')
        .attr('stroke-width', d => d.display ? 1 : 0)
    g.nodes = g.nodes.selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 3)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('fill', d => d.type == 'scene' ? 'rgba(0,0,0,0)' : nodeColor(d.state[t].state))
    // .attr('fill','#333')
    g.simulation
        .on("end", () => {
            g.links
                .attr('id', d => `link-${d.source.id}-${d.target.id}`)
                .attr("x1", (d) => {
                    return d.source.x
                })
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
            g.nodes
                .attr("cx", d => d.x)
                .attr('cy', d => d.y)
        });
}

function drawNetwork(_ini) {
    var ini = {}
    for (let k in _ini) {
        ini[k] = _ini[k].value
    }
    if (ini.showSocialNetwork % 2 == 0) {
        sceneNetwork(ini)
    }
    else {
        socialNetwork(ini)
    }
}

function angle2xy(x, y) {
    var _ = x * Math.PI / 180
    return {
        x: y * Math.cos(_),
        y: y * Math.sin(_)
    }
}

function build_network(ini) {
    let _ini = ini
    ini = getIni(ini)
    let { nodes, links } = final_data
    var svg = d3.select('#network-svg')
    svg.html('')
    var conf = {
        width: svg.node().clientWidth,
        height: svg.node().clientHeight,
        margin: 30
    }
    let g = {
        links: svg.append('g')
            .attr('transform', `translate(${conf.margin}, ${conf.margin})`)
            .selectAll('line')
            .data(links)
            .join('line'),
        nodes: svg.append('g')
            .attr('transform', `translate(${conf.margin}, ${conf.margin})`)
            .selectAll('circle')
            .data(nodes)
            .join('circle')
    }
    let scale = {
        r: d3.scaleLinear().domain([0, d3.max(nodes, d => d.sons.n)]).range([5, 12]),
        link:
        {
            width: d3.scaleLinear().domain([0, ini.scene.roles[0].tick]).range([2, 1]),
            length: d3.scaleLinear().domain([0, d3.max(nodes, d => d.sons.n)]).range([70, 120]),
        }
    }
    var simulation = d3.forceSimulation(nodes)

    simulation
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .force('link', d3.forceLink(links)
            .id(d => d.id)
            .distance(5)
            .strength(1))
        .force('charge', d3.forceManyBody().strength(-50))
        .on('end', () => {
            console.log('simulation ended...')
            let x = d3.scaleLinear()
                .domain([d3.min(nodes, d => d.x), d3.max(nodes, d => d.x)])
                .range([0, conf.width - conf.margin * 2])
            let y = d3.scaleLinear()
                .domain([d3.min(nodes, d => d.y), d3.max(nodes, d => d.y)])
                .range([conf.height - conf.margin * 2, 0])
            g.links
                .attr('x1', d => x(d.source.x))
                .attr('x2', d => x(d.target.x))
                .attr('y1', d => y(d.source.y))
                .attr('y2', d => y(d.target.y))
                .attr('id', d => struct_id.link(d))
                .transition()
                .attr('opacity', 0.8)
                .attr('stroke', '#aaa')
                .attr('stroke-width', d => scale.link.width(d.tick))
            g.nodes
                .attr('class', 'hover-stroke')
                .attr('id', d => struct_id.node(d))
                .attr('cx', d => x(d.x))
                .attr('cy', d => y(d.y))
                .on('click', e => {
                    _ini.force_role.value = e.path[0].__data__.id
                })
                .transition()
                .attr('r', d => scale.r(d.sons.n))
                .attr('fill', d => d.scene.color)
                .attr('stroke', '#111')
                .attr('stroke-width', 0.7)
        })
}