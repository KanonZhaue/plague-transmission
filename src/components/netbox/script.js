
import { onMounted, inject, watch } from 'vue'
import { injects } from '../../js/injects'
import { dt2t, last } from '../../js/kit'
var d3 = require('d3')

export function setup() {
    var svg = d3.select('#netbox-svg')
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
    var data = ini.scene.netbox((ini.ticks - 1) * ini.days)
    // console.log(data, 'box')


    // viewbox.width = 1519
    // // 0, 0, 1519.5116669142799, 1909.8972490065576
    // viewbox.height = 1909
    // var svg = d3.select('#netbox-svg').attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)
    // svg.html('')
    // document.getElementById('netbox-svg').addEventListener('mousewheel', e => {
    //     let dy = e.deltaY
    //     let rate = viewbox.width / viewbox.height
    //     viewbox.height += 30 * (dy > 0 ? 1 : -1)
    //     viewbox.width = rate * viewbox.height
    //     viewbox.height = Math.abs(viewbox.height)
    //     viewbox.width = Math.abs(viewbox.width)
    //     d3.select('#netbox-svg')
    //         .attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)
    // })
    // svg.call(d3.drag().on('drag', e => {


    // }))
    var svg = d3.select('#netbox-svg')
    svg.html('')

    var conf = {
        width: svg.node().clientWidth - 60,
        // height: svg.node().clientHeight - 60,
        row: 6,
        margin: 30
    }
    var box_conf = {
        r_width: conf.width / conf.row,
        r_height: conf.width / conf.row / 2,
        font_size: "20px",
        stroke_width: "2px",
    }


    var col = 0, row = 0
    for (let dep = 0; dep < data.length; dep++) {
        svg.append('rect')
            .attr("x", conf.margin)
            .attr("y", conf.margin + box_conf.r_height * col)
            .attr("width", box_conf.r_width / 3)
            .attr("height", box_conf.r_height * (parseInt((data[dep].length - 1) / conf.row) + 1))
            .attr('stroke-width', box_conf.stroke_width)
            .attr("stroke", "black")
            .attr('fill', '#ddd')
        svg.append('text')
            .text(dep)
            .attr('x', conf.margin + box_conf.r_width / 50)
            .attr('y', conf.margin + box_conf.r_height * (col + 0.8))
            .attr('font-size', box_conf.font_size)


        for (let k = 0; k < data[dep].length; k++) {
            row = k % conf.row;
            if (row == 0 && k != 0) {
                col++
            }
            svg.append('rect')
                .attr('id', "r" + data[dep][k].id)
                .attr('class', "role")
                .attr("x", conf.margin + box_conf.r_width / 3 + box_conf.r_width * row)
                .attr("y", conf.margin + box_conf.r_height * col)
                .attr("width", box_conf.r_width)
                .attr("height", box_conf.r_height)
                .attr('stroke-width', box_conf.stroke_width)
                .attr("stroke", "black")
                .attr('fill', () => data[dep][k].id == 0 ? '#555' : data[dep][k].scene.color)
                .on('click', () => {
                    d3.selectAll(".role").attr('stroke-width', 2).attr('stroke', 'black')
                    var h = data[dep][k]
                    var from = h.role.state[341].from.id
                    // console.log(h)
                    var son = h.sons
                    d3.select("#r" + String(data[dep][k].id)).attr('stroke', 'blue').attr('stroke-width', '2px')
                    d3.select("#r" + String(from)).attr('stroke', 'red').attr('stroke-width', '2px')
                    for (let i = 0; i < son.length; i++) {
                        d3.select("#r" + String(son[i])).attr('stroke', '#ff7300').attr('stroke-width', '2px')
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

            svg.append('text')
                .text(data[dep][k].id)
                .attr('x', conf.margin + box_conf.r_width / 3 + box_conf.r_width * row + box_conf.r_width / 5)
                .attr('y', conf.margin + box_conf.r_height * (col + 0.8))
                .attr('font-size', box_conf.font_size)
        }
        col += 1
    }
    svg.attr('height', conf.margin + box_conf.r_height * col + box_conf.r_height * (parseInt((data[data.length - 1].length - 1) / conf.row) + 1))


}

function getIni(ini) {
    var _ = {}
    for (let k in ini) {
        _[k] = ini[k].value
    }
    return _
}








//备份
// {
// // function filterByDepth(ini) {
// //     let depth = ini.tree_depth_filter.value
// //     if (depth == null) return
// //     let _ini = ini
// //     ini = getIni(ini)
// //     let { nodes, links } = ini.scene.network((ini.ticks - 1) * ini.days)
// //     let mapOfNodes = {}
// //     for (let i = 0; i < nodes.length; i++) {
// //         mapOfNodes[nodes[i].id] = nodes[i]
// //         nodes[i].children = []
// //         nodes[i].name = nodes[i].id
// //     }
// //     for (let i = 0; i < links.length; i++) {
// //         if (links[i].source != links[i].target)
// //             mapOfNodes[links[i].source].children.push(mapOfNodes[links[i].target])
// //     }
// //     let tree = d3.tree().separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)
// //     let root = tree(d3.hierarchy(mapOfNodes[0]))
// //     special_display(
// //         d3.filter(root.descendants(), d => d.depth <= depth).map(d => {
// //             return {
// //                 id: d.data.id
// //             }
// //         }),
// //         d3.filter(root.links(), d => d.source.depth <= depth && d.target.depth <= depth).map(d => {
// //             return {
// //                 source: d.source.data.id,
// //                 target: d.target.data.id
// //             }
// //         }),
// //         _ini
// //     )
// // }

// // var node_r = 8

// // var final_data
// // var viewbox = { x: 0, y: 0, width: 0, height: 0, }

// // function init(ini) {
// //     let _ini = ini

// //     ini = getIni(ini)
// //     final_data = ini.scene.network((ini.ticks - 1) * ini.days)
// //     let { nodes, links } = final_data
// //     // console.log(nodes, links, 'link')
// //     viewbox.width = 1519
// //     // 0, 0, 1519.5116669142799, 1909.8972490065576
// //     viewbox.height = 1909
// //     var svg = d3.select('#netbox-svg').attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)
// //     svg.html('')
// //     document.getElementById('netbox-svg').addEventListener('mousewheel', e => {
// //         let dy = e.deltaY
// //         let rate = viewbox.width / viewbox.height
// //         viewbox.height += 30 * (dy > 0 ? 1 : -1)
// //         viewbox.width = rate * viewbox.height
// //         viewbox.height = Math.abs(viewbox.height)
// //         viewbox.width = Math.abs(viewbox.width)
// //         d3.select('#netbox-svg')
// //             .attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)
// //     })
// //     // svg.call(d3.drag().on('drag', e => {
// //     //     let nodes = final_data.root.descendants()
// //     //     for (let i = 0; i < nodes.length; i++) {
// //     //         nodes[i].x += e.dx
// //     //         nodes[i].y += e.dy
// //     //     }
// //     //     d3.select('#spread-nodes')
// //     //         .selectAll('circle')
// //     //         .attr('cx', d => d.x)
// //     //         .attr('cy', d => d.y)
// //     //     d3.select('#spread-links')
// //     //         .selectAll('path')
// //     //         .attr('d', d3.linkHorizontal()
// //     //             .x(d => d.x)
// //     //             .y(d => d.y))
// //     // }))
// //     var conf = {
// //         width: svg.node().clientWidth,
// //         height: svg.node().clientHeight,
// //         margin: 30
// //     }


// //     let mapOfNodes = {}
// //     for (let i = 0; i < nodes.length; i++) {
// //         mapOfNodes[nodes[i].id] = nodes[i]
// //         nodes[i].children = []
// //         nodes[i].name = nodes[i].id
// //     }
// //     for (let i = 0; i < links.length; i++) {
// //         if (links[i].source != links[i].target)
// //             mapOfNodes[links[i].source].children.push(mapOfNodes[links[i].target])
// //     }
// //     let tree = d3.tree()
// //         .size([2 * Math.PI,
// //         Math.max(conf.width, conf.height) / 2 + 1000 // +1000 为了扩大半径
// //         ])
// //         .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

// //     let root = tree(d3.hierarchy(mapOfNodes[0]))
// //     _ini.tree_max_depth.value = maxDepth(root)
// //     let scale = {
// //         r: d3.scaleLinear().domain([0, _ini.tree_max_depth.value]).range([5, 12])
// //     }
// //     final_data.root = root;

// //     console.log(final_data)

// //     viewbox.x = conf.width / 3;
// //     viewbox.y = conf.height / 3
// //     node_r = config.map.node.r * viewbox.width / d3.select('#netbox-svg').node().clientWidth
// //     // console.log(node_r)
// //     // 画网络图使用的代码
// //     // build_network(_ini)

// //     // 画树- circular tree
// // }

// // function maxDepth(root) {
// //     if (root.children == undefined) return root.depth
// //     let _depth_ = root.depth
// //     for (let i = 0; i < root.children.length; i++) {
// //         _depth_ = Math.max(_depth_, maxDepth(root.children[i]))
// //     }
// //     return _depth_
// // }

// // function traceHighlight(ini) {
// //     let forced = ini.force_role.value
// //     let { nodes, links } = ini.scene.value.findRoleById(forced).traceHighlightData()
// //     special_display(nodes, links, ini)
// //     // highligh(nodes, links, {
// //     //     disimportant:{
// //     //         opacity: 0,
// //     //         stroke: '#aaa',
// //     //     },
// //     //     important: {
// //     //         opacity: 1,
// //     //         stroke: '#101010',
// //     //     },
// //     //     most_important:{
// //     //         stroke_width: 1.6,
// //     //         id: forced
// //     //     }
// //     // })
// // }


// // function network(ini) {
// //     let _ini = ini
// //     ini = getIni(ini)
// //     let { nodes, links } = ini.scene.network()
// //     special_display(nodes, links, _ini)
// //     // console.log('ini', nodes, links)
// // }

// // function special_display(nodes, links, ini) {
// //     let root = final_data.root
// //     let complete_tree = {
// //         nodes: root.descendants(),
// //         links: root.links()
// //     }
// //     let mapOfNodes = {}
// //     for (let i = 0; i < complete_tree.nodes.length; i++) {
// //         mapOfNodes[complete_tree.nodes[i].data.id] = complete_tree.nodes[i]
// //     }
// //     for (let i = 0; i < nodes.length; i++) {
// //         nodes[i] = mapOfNodes[nodes[i].id]
// //     }
// //     for (let i = 0; i < links.length; i++) {
// //         links[i] = {
// //             source: mapOfNodes[links[i].source],
// //             target: mapOfNodes[links[i].target]
// //         }
// //     }

// //     console.log(mapOfNodes, 'lxm')
// //     let scale = { r: d3.scaleLinear().domain([0, maxDepth(root)]).range([5, 12]) }
// //     let g = {
// //         nodes: d3.select('#spread-nodes').html(''),
// //         links: d3.select('#spread-links').html('')
// //     }

// //     // // 放缩
// //     // let border = {
// //     //     x: {
// //     //         max: d3.max(nodes, d=>d.x),
// //     //         min: d3.min(nodes, d=>d.x)
// //     //     },
// //     //     y: {
// //     //         max: d3.max(nodes, d=>d.y),
// //     //         min: d3.min(nodes, d=>d.y)
// //     //     }
// //     // }
// //     // let diff = {
// //     //     x: border.x.max - border.x.min,
// //     //     y: border.y.max - border.y.min
// //     // }
// //     // diff = {
// //     //     x: diff.x <= 0? d3.select('#netbox-svg').node().clientWidth : diff.x,
// //     //     y: diff.y <= 0? d3.select('#netbox-svg').node().clientWidth : diff.y,
// //     // }

// //     // for(let i=0; i<complete_tree.nodes.length; i++)
// //     // {
// //     //     complete_tree.nodes[i].x -= border.x.min
// //     //     complete_tree.nodes[i].y -= border.y.min
// //     // }
// //     // node_r = config.map.node.r * diff.x / d3.select('#netbox-svg').node().clientWidth
// //     // console.log(node_r)
// //     // viewbox.width = diff.x + node_r*3
// //     // viewbox.height = diff.y + node_r*3
// //     // let realSize = node_r* d3.select('#netbox-svg').node().clientWidth / diff.x
// //     // let lengthBias = {
// //     //     x:0, y:0
// //     // }
// //     // if(nodes.length==1)
// //     // {
// //     //     lengthBias.x += viewbox.width/2 +realSize
// //     //     lengthBias.y += viewbox.height/2 +realSize
// //     // }
// //     // for(let i=0; i<complete_tree.nodes.length; i++)
// //     // {
// //     //     let _node = complete_tree.nodes[i]
// //     //     _node.x += lengthBias.x
// //     //     _node.y += lengthBias.y
// //     // }
// //     // d3.select('#netbox-svg').attr('viewBox', `0, 0, ${viewbox.width}, ${viewbox.height}`)

// //     g.nodes.selectAll('circle')
// //         .data(nodes)
// //         .join('circle')
// //         .attr('cx', d => d.x)
// //         .attr('cy', d => d.y)
// //         .attr("stroke", "#111")
// //         .attr("stroke-opacity", 0.7)
// //         .attr("stroke-width", d => d.data.id == ini.force_role.value ? 6 : 1)
// //         .attr('class', 'hover-stroke')
// //         .attr('id', d => struct_id.node(d.data))
// //         .attr("fill", d => d.data.id == 0 ? '#000' : d.data.scene.color)
// //         //     // .attr("r", d=>scale.r( maxDepth(d) - d.depth ))
// //         .attr('r', node_r)
// //         .on('click', e => {
// //             ini.force_role.value = e.path[0].__data__.data.id
// //         })
// //         .append('title')
// //         .text(d => d.data.id);
// //     g.links.selectAll('path')
// //         .data(links)
// //         .join('path')
// //         .attr("stroke", "#555")
// //         .attr("stroke-opacity", 0.4)
// //         .attr("stroke-width", 1.5)
// //         .attr("fill", "none")
// //         .attr('id', d => struct_id.link({
// //             source: d.source.data,
// //             target: d.target.data
// //         }))
// //         .attr('d', d3.linkHorizontal()
// //             .x(d => d.x)
// //             .y(d => d.y))
// // }

// // var struct_id = {
// //     node: (node) => `nw-node-${node.id}`,
// //     link: (link) => `nw-link-${link.source.id}-${link.target.id}`
// // }

// // function getIni(ini) {
// //     var _ = {}
// //     for (let k in ini) {
// //         _[k] = ini[k].value
// //     }
// //     return _
// // }
// }
