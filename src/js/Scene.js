
var d3 = require('d3')
import conf, { link_realName2alias } from '../conf/cls8'
import { Role } from './Role'
import config from "../conf/config"
import { inject } from 'vue'
import ini from '../conf/ini'
import { injects, injectsValue } from "./injects"
import { dt2t, mDistance, last, getIni, buildNode, Euclidian } from './kit'
import colorsTable from '../components/River/colors'

export class Scene {
    size = { width: 0, height: 0 }    //场景的真实大小（单位：m）
    roles = []
    injects = {}
    contain = {}
    /**
     * @param {String} id
     * @param {{width:Number,height:Number}|[Number,Number]} size
     */
    constructor(selector = '#map-svg') {
        this.selector = selector
    }

    /** 绘制角色
     * @param {Number} tick
     */
    drawByTick = (tick, showLine) => {
        var roles = this.roles
        d3.select('#' + config.map.links.id).html('')
        var legend = d3.select('#map-legend')
        legend.html('')
        var colors = config.color
        var legend_data = []
            , legend_color = []
        for (let k in colors) {
            legend_data.push(k)
            legend_color.push(colors[k])
        }

        // 画角色
        var nodes_info = []
        for (let i = 0; i < roles.length; i++) {
            var _coor = roles[i].showNode(tick)
            nodes_info.push(_coor)
            if (showLine) {
                roles[i].showLink(tick)
            }
        }

        //! 下面是画voronoi， 已被删除！
        // 1.确定一个中心点   2.确定副中心点N个   3.distance(中心_i, 副中心_j) = scene_i.r
        /*
        let centers = this.nodes.map(d=>[d.center.x, d.center.y])
        let n_sub_center = 500
        let sub_centers = []
        function manhadun(p1, p2)
        {
            return mDistance(p1[0], p1[1], p2[0], p2[1])
        }
        for(let i=0; i<centers.length; i++)
        {
            let center = centers[i]
            let near_center = null
            for(let j=0; j<centers.length; j++)
            {
                if(j!=i)
                {
                    if(near_center==null) near_center = centers[j]
                    if(manhadun(center, near_center)>manhadun(center, centers[j]))
                        near_center = centers[j]
                }
            }
            let r = Euclidian(center, near_center)/2
            // let r = this.nodes[i].r
            for(let j=0; j<n_sub_center; j++)
            {
                let rad = 2*Math.PI/n_sub_center * j
                let sub_end = [
                    center[0]+Math.cos(rad)*r,
                    center[1]+Math.sin(rad)*r
                ]
                let distance = Euclidian(center, sub_end)
                let step = 3
                for(let k=0; k<step; k++)
                {
                    let sub = [
                        this.t.rd2px.x(center[0]+Math.cos(rad)*distance/step*k),
                        this.t.rd2px.y(center[1]+Math.sin(rad)*distance/step*k)
                    ]
                    sub.color = this.nodes[i].color
                    sub_centers.push(sub)
                }
            }
        }
        var delaunay=d3.Delaunay.from(sub_centers)
        var voronoi=new d3.Voronoi(delaunay)
        voronoi.xmax=this.svg.node().clientWidth
        voronoi.ymax=this.svg.node().clientHeight
        console.log(sub_centers, 'sub_centers')
        var voronoi_g=d3.select('#map-voronoi').html('')

        // region text anno

        // let centers=[]
        for(let i=0; i<sub_centers.length; i++)
        {
            //! voronoi drawing code is here
            voronoi_g.append('path')
                .attr('d',voronoi.renderCell(i))
                .attr('fill', sub_centers[i].color)
                .attr('stroke-width',1)
                .attr('stroke', sub_centers[i].color)
        }
        */

        // region text title
        // let region_title_fontSize = 15
        // for(let i=0; i<this.nodes.length; i++)
        // {
        //     let t = String(this.nodes[i].name)
        //     let ts = t.split(' ')
        //     let x = this.t.rd2px.x(this.nodes[i].center.x)
        //     ,   y = this.t.rd2px.y(this.nodes[i].center.y)
        //     if(ts.length == 1)
        //         voronoi_g
        //             .append('text')
        //             .attr('x', x)
        //             .attr('y', y)
        //             .text(t)
        //             .attr('font-size', region_title_fontSize)
        //     else
        //         voronoi_g
        //             .append('text')
        //             .selectAll('tspan')
        //             .data(ts)
        //             .join('tspan')
        //             .text(d=>d)
        //             .attr('x', x)
        //             .attr('y', (d, i)=>y+i*region_title_fontSize)
        //             .attr('font-size', region_title_fontSize)
        // }

        // for(let i=0;i<roles.length;i++)
        // {
        //     voronoi_g.append('path')
        //         .attr('d',voronoi.renderCell(i))
        //         .attr('fill',roles[i].coordination[tick].scene.color)
        //         .attr('stroke','#fff')
        //         .attr('stroke-width',0)
        //         .attr('opacity',0.5)
        // }
        // console.log(this.injects.start_isolation.value)
        var conf = {
            height: 45,
            width: 35,
            line: {
                width: 12,
                height: 10
            },
            fontSize: 8,
        }
            , margin = {
                top: this.injects.start_isolation.value ? this.svg.node().clientHeight / 2 - conf.height + 22 : this.svg.node().clientHeight - conf.height - 15,
                left: this.injects.start_isolation.value ? this.svg.node().clientWidth / 3 * 2 + conf.width + 8 : this.svg.node().clientWidth - conf.width
            }
            , x = d3.scaleLinear()
                .domain([0, legend_data.length - 1])
                .range([0, conf.width])
            , y = d3.scaleLinear()
                .domain([0, legend_data.length - 1])
                .range([conf.height, 0])
        // 画 legend
        legend
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .selectAll('rect')
            .data(['susceptible', 'exposed', 'infectious', 'recovered'].reverse())
            .join('rect')
            .attr('x', 0)
            .attr('y', (d, i) => y(i) - conf.line.height / 2)
            .attr('width', conf.line.width)
            .attr('height', conf.line.height)
            .attr('fill', d => config.color[d])
            .attr('stroke', '#111')
            .attr('stroke-width', 0.2)
        legend
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .selectAll('text')
            .data(['susceptible', 'exposed', 'infectious', 'recovered'].reverse())
            .join('text')
            .attr('x', conf.line.width + 4)
            .attr('y', (d, i) => y(i) + conf.fontSize / 3)
            .attr('font-size', conf.fontSize)
            .text(d => d[0].toUpperCase())
    }

    /**第n天，感染者接触的平均人数
     *
     * @return {

     *   exposed:{
     *
     *      incubation:{
     *
     *          x1:Number,
     *
     *          x2:Number
     *
     *      },
     *
     *      infected:{
     *
     *          x1:Number,
     *
     *          x2:Number
     *
     *      }
     *
     *  },
     *
     *   I:Number
     *
     * }
     */
    exposedData = (day) => {
        var res = {
            exposed: {
                incubation: {
                    x1: 0, x2: 0
                },
                infected: {
                    x1: 0, x2: 0
                }
            },
            I: 0
        }
        var rs = this.roles
        var I = 0, exposed = {}
        var { d, ticks } = injectsValue()
        var x2_d2 = 4 * d * d
            , x1_d2 = d * d
        for (let t = day * ticks; t < (day + 1) * ticks - 1; t++) {
            for (let i = 0; i < rs.length; i++) {
                if (rs[i].state[t].state == 'infectious') {
                    I++
                    var incubation = rs[i].state[t]
                    var { x, y } = rs[i].coordination[t]
                    for (let j = 0; j < rs.length; j++) {
                        if (rs[j].state[t].state == 'infectious') {
                            continue
                        }
                        var jCoordination = rs[j].coordination[tick]
                        var _x = jCoordination.x, _y = jCoordination.y
                        var distance = Math.pow(x - _x, 2) + Math.pow(y - _y, 2)
                        if (distance < x2_d2) {
                            exposed[rs[j].id] = 1
                        }
                    }
                }
            }
        }
        var E = Object.keys(exposed).length
        return E / I
    }


    /**以前是绘制必要的画布，现在是确定场景在画布中的分布 */
    svg_margin = {
        left: 20, right: 10,
        bottom: 20, top: 20,
    }
    init = () => {
        inject('scene').value = this
        var svg = d3.select(this.selector).html('')
        this.svg = svg

        var svgConf = config.map.svgConf
        svgConf.height = svg.node().clientHeight
        svgConf.width = svg.node().clientWidth
        var { column } = this.layout

        // console.log(row)
        // ----------------- voronoi -----------------
        // 计算场景中心点坐标
        // var stack={}
        // for(let i=0;i<=row;i++)
        // {
        //     stack[i]={}
        //     for(let j=0;j<=column;j++)
        //     {
        //         stack[i][j]={left:0,bottom:0}
        //     }
        // }
        // for(let r=1;r<=row;r++)
        // {
        //     for(let c=1;c<=column && (r-1)*column+c-1<this.nodes.length; c++)
        //     {
        //         var node=this.nodes[(r-1)*column+c-1]
        //         stack[r][c]={
        //             left:stack[r][c-1].left+node.size.x,
        //             bottom:stack[r-1][c].bottom+node.size.y
        //         }
        //         node.center={
        //             x:stack[r][c].left-node.size.x*0.5,
        //             y:stack[r][c].bottom-node.size.y*0.5
        //         }
        //     }
        // }

        // var max_x=0,max_y=0
        // for(let i=0;i<this.nodes.length;i++)
        // {
        //     var node=this.nodes[i]
        //     node.r=d3.min([node.size.x,node.size.y])/2
        //     max_x=d3.max([max_x,node.center.x+0.5*node.size.x])
        //     max_y=d3.max([max_y,node.center.y+0.5*node.size.y])
        // }
        // this.t={
        //     rd2px:{
        //         x:d3.scaleLinear().domain([0,max_x]).range([0,svgConf.width-margin.left-margin.right]),
        //         y:d3.scaleLinear().domain([0,max_y]).range([0,svgConf.height-margin.top-margin.bottom])
        //     },
        //     px2rd:{
        //         x:d3.scaleLinear().domain([0,svgConf.width]).range([0,max_x]),
        //         y:d3.scaleLinear().domain([0,svgConf.height]).range([0,max_y])
        //     }
        // }

        // var delaunay=d3.Delaunay.from(this.nodes.map(d=>[this.t.rd2px.x(d.center.x), this.t.rd2px.y(d.center.y)]))
        // var voronoi=new d3.Voronoi(delaunay)
        // voronoi.xmax=this.svg.node().clientWidth
        // voronoi.ymax=this.svg.node().clientHeight

        // for(let i=0; i<this.nodes.length; i++)
        // {
        //     let center = voronoi.cellPolygon(i)
        //     this.nodes[i].scene_center={
        //         x: this.t.px2rd.x(d3.mean(center.map(d=>d[0]))),
        //         y:this.t.px2rd.y(d3.mean(center.map(d=>d[1])))
        //     }
        // }



        // 画矩形边框
        // console.log(column, "row")
        this.DrawRect()
    }

    AddScene = (newScene) => {
        var nodes = this.nodes
        console.log(nodes, newScene.size)

        nodes.push({
            name: newScene.name,
            size: newScene.size, // 大小由用户设置
            avgTime: newScene.avgTime,
            popularity: newScene.popularity,
            distance: newScene.distance,
        })
        this.injects.scenes.value.push(newScene.name)
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].color = colorsTable[i]
        }
        // nodes = nodes.reverse()

        this.mapOfScene = {}

        for (let i = 0; i < nodes.length; i++) {
            this.mapOfScene[nodes[i].name] = nodes[i]
            this.injects.args.value[nodes[i].name] = {
                beta: undefined,   // 传染概率β
                rho: undefined,   // 有效接触系数ρ
                delta: undefined,   // 感染者转换为隔离者的概率
                lambda: undefined,   // λ是隔离解除速率
                theta: undefined,   // θ是潜伏者（E）相对于感染者传播能力的比值
                sigma: undefined,   // σ为潜伏者（E）向感染者（I）的转化速率
                d: undefined,   // 感染者的影响距离(社交距离)
                I_gamma: undefined,   // I的恢复系数γ
                ISO_gamma: undefined,   // 隔离者的恢复率
                close_distance: undefined,   // 密切接触距离
            }
        }
        this.nodes = nodes
        // this.links = links
        this.DrawRect()
        this.generateRoles(ini.N)
        this.updateStateOfRoles()
        this.drawByTick(dt2t(ini.currentDay, ini.currentTick), ini.distanceLine)
    }
    //删除参数中的index位场景
    DelScene = (SceneIndex) => {
        var nodes = this.nodes
        nodes.splice(SceneIndex,1)
        console.log("nodes",nodes,SceneIndex)
        this.injects.scenes.value.slice(SceneIndex,1)
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].color = colorsTable[i]
        }
        // nodes = nodes.reverse()
    
        this.nodes = nodes
        // this.links = links
        this.DrawRect()
        this.generateRoles(ini.N)
        this.updateStateOfRoles()
        this.drawByTick(dt2t(ini.currentDay, ini.currentTick), ini.distanceLine)
    }

    //问题：1加隔离区后场景大小记得改
    //问题：2新区域
    
    DrawRect = () => {
        var BoxDesigner = [[1,1],[2,1],[2,2],[2,2],[3,2],[3,2],[3,3],[3,3],[3,3],[4,3],[4,3],[4,3]]
        console.log(this)
        var svg = d3.select(this.selector).html('')
        this.svg = svg
        let margin = this.svg_margin
        var svgConf = config.map.svgConf
        svgConf.height = svg.node().clientHeight
        svgConf.width = svg.node().clientWidth
        var { column } = this.layout
        // var column
        // var row = Math.ceil(this.nodes.length / column)
var [column,row] = BoxDesigner[ini.scenes.length-1]
console.log(ini.scenes)
        let box = svg.append('g')
            .attr('transform', `translate(${config.map.boxes.padding.left},${config.map.boxes.padding.top})`)
            .attr('id', config.map.boxes.id)
        svg.append('g')
            .attr('id', 'map-voronoi')
        svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .attr('id', config.map.nodes.id)
        svg.append('g')
            .attr('id', 'map-legend')
        let cnt = 0;
        box.cell = {
            width: (svg.node().clientWidth - config.map.boxes.padding.left - config.map.boxes.padding.right) / column,
            w_isolated: (svg.node().clientWidth - config.map.boxes.padding.left - config.map.boxes.padding.right) / (column * 3),
            h_isolated: (svg.node().clientHeight - config.map.boxes.padding.top - config.map.boxes.padding.bottom) / (row * 5),
            // height: (svg.node().clientHeight - config.map.boxes.padding.top - config.map.boxes.padding.bottom - (svg.node().clientHeight - config.map.boxes.padding.top - config.map.boxes.padding.bottom) / (row + 2)) / (row - 1),
            height: (svg.node().clientHeight - config.map.boxes.padding.top - config.map.boxes.padding.bottom) / (row),
        }

        if (this.injects.start_isolation.value == true) {
            var p1 = [[0, 0],
            [box.cell.width + 0, 0],
            [box.cell.width + 0, 0 + box.cell.height - box.cell.h_isolated],
            [box.cell.width + 0 - box.cell.w_isolated, 0 + box.cell.height - box.cell.h_isolated],
            [box.cell.width + 0 - box.cell.w_isolated, 0 + box.cell.height],
            [0, 0 + box.cell.height],
            [0, 0]]

            var p2 = [[0 + box.cell.width, 0],
            [box.cell.width * 2 + 0, 0],
            [box.cell.width * 2 + 0, 0 + box.cell.height - box.cell.h_isolated],
            [0 + box.cell.width, 0 + box.cell.height - box.cell.h_isolated],
            [0 + box.cell.width, 0]]

            var p3 = [[0 + box.cell.width * 2, 0],
            [box.cell.width * 3 + 0, 0],
            [box.cell.width * 3 + 0, 0 + box.cell.height],
            [box.cell.width * 2 + 0 + box.cell.w_isolated, 0 + box.cell.height],
            [box.cell.width * 2 + 0 + box.cell.w_isolated, 0 + box.cell.height - box.cell.h_isolated],
            [0 + box.cell.width * 2, 0 + box.cell.height - box.cell.h_isolated],
            [0 + box.cell.width * 2, 0]]

            var p4 = [[0, 0 + box.cell.height],
            [box.cell.width + 0 - box.cell.w_isolated, 0 + box.cell.height],
            [box.cell.width + 0 - box.cell.w_isolated, 0 + box.cell.height + box.cell.h_isolated],
            [box.cell.width + 0, 0 + box.cell.height + box.cell.h_isolated],
            [box.cell.width + 0, 0 + box.cell.height * 2],
            [0, 0 + box.cell.height * 2],
            [0, 0 + box.cell.height]]

            var p5 = [[0 + box.cell.width, box.cell.height + box.cell.h_isolated],
            [box.cell.width * 2 + 0, box.cell.height + box.cell.h_isolated],
            [box.cell.width * 2 + 0, box.cell.height * 2],
            [0 + box.cell.width, 0 + box.cell.height * 2],
            [0 + box.cell.width, box.cell.height + box.cell.h_isolated]]

            var p6 = [[0 + box.cell.width * 2 + box.cell.w_isolated, box.cell.height],
            [box.cell.width * 3 + 0, box.cell.height],
            [box.cell.width * 3 + 0, box.cell.height * 2],
            [box.cell.width * 2 + 0, box.cell.height * 2],
            [box.cell.width * 2 + 0, box.cell.height + box.cell.h_isolated],
            [0 + box.cell.width * 2 + box.cell.w_isolated, 0 + box.cell.height + box.cell.h_isolated],
            [0 + box.cell.width * 2 + box.cell.w_isolated, box.cell.height]]

            var line = d3.line()
            box.append('path').attr('d', line(p1)).attr('fill', 'none').attr('stroke', '#111').attr('stroke-width', 1)
            box.append('text').text(this.nodes[0].name).attr('x', 0 + 2).attr('y', 0 + config.map.subtitle.fontSize).attr('font-size', config.map.subtitle.fontSize)
            box.append('path').attr('d', line(p2)).attr('fill', 'none').attr('stroke', '#111').attr('stroke-width', 1)
            box.append('text').text(this.nodes[1].name).attr('x', box.cell.width + 2).attr('y', 0 + config.map.subtitle.fontSize).attr('font-size', config.map.subtitle.fontSize)
            box.append('path').attr('d', line(p3)).attr('fill', 'none').attr('stroke', '#111').attr('stroke-width', 1)
            box.append('text').text(this.nodes[2].name).attr('x', box.cell.width * 2 + 2).attr('y', 0 + config.map.subtitle.fontSize).attr('font-size', config.map.subtitle.fontSize)
            box.append('path').attr('d', line(p4)).attr('fill', 'none').attr('stroke', '#111').attr('stroke-width', 1)
            box.append('text').text(this.nodes[3].name).attr('x', 0 + 2).attr('y', box.cell.height + config.map.subtitle.fontSize).attr('font-size', config.map.subtitle.fontSize)
            box.append('path').attr('d', line(p5)).attr('fill', 'none').attr('stroke', '#111').attr('stroke-width', 1)
            box.append('text').text(this.nodes[4].name).attr('x', box.cell.width + 2).attr('y', box.cell.height + box.cell.h_isolated + config.map.subtitle.fontSize).attr('font-size', config.map.subtitle.fontSize)
            box.append('path').attr('d', line(p6)).attr('fill', 'none').attr('stroke', '#111').attr('stroke-width', 1)
            box.append('text').text(this.nodes[5].name).attr('x', box.cell.width * 2 + box.cell.w_isolated + 2).attr('y', box.cell.height + config.map.subtitle.fontSize).attr('font-size', config.map.subtitle.fontSize)
            box.append('text').text("isolated area").attr('x', box.cell.width - box.cell.w_isolated + 2).attr('y', box.cell.height - box.cell.h_isolated + config.map.subtitle.fontSize).attr('font-size', config.map.subtitle.fontSize)




            let p = [p1, p2, p3, p4, p5, p6]
            for (let i = 0; i < 6; i++) {
                let node = this.nodes[i];
                let _x = p[i][0][0], _y = p[i][0][1];

                node.range = {
                    border: {
                        left: {
                            top: [p[i][0][0], p[i][0][1]],
                            bottom: [p[i][p[i].length - 2][0], p[i][p[i].length - 2][1]],
                        },
                        right: {
                            top: [p[i][1][0], p[i][1][1]],
                            bottom: [p[i][2][0], p[i][2][1]],
                        }
                    },
                    scene: {
                        left: {
                            top: [0, 0],
                            bottom: [0, node.size.y]
                        },
                        right: {
                            top: [node.size.x, 0],
                            bottom: [node.size.x, node.size.y]
                        }
                    }
                }
                if (i != 2 && i != 5 && i != 3)
                    node.t = {
                        x: d3.scaleLinear().domain([0, node.size.x]).range([p[i][0][0], p[i][1][0] - margin.left - margin.right]),
                        y: d3.scaleLinear().domain([0, node.size.y]).range([p[i][0][1], p[i][p[i].length - 2][1] - margin.bottom * 1.5]),
                        rg: p[i][2][1] - margin.bottom * 1.5,
                        x1: d3.scaleLinear().domain([0, node.size.x]).range([p[i][0][0], p[i][3][0] - margin.left - margin.right]),
                    }
                if (i == 3)
                    node.t = {
                        x: d3.scaleLinear().domain([0, node.size.x]).range([p[i][0][0], p[i][1][0] - margin.left - margin.right]),
                        y: d3.scaleLinear().domain([0, node.size.y]).range([p[i][0][1], p[i][p[i].length - 2][1] - margin.bottom * 1.5]),
                        rg: p[i][2][1],
                        x1: d3.scaleLinear().domain([0, node.size.x]).range([p[i][0][0], p[i][3][0] - margin.left - margin.right]),
                    }
                if (i == 2)
                    node.t = {
                        x: d3.scaleLinear().domain([0, node.size.x]).range([p[i][0][0], p[i][1][0] - margin.left - margin.right]),
                        y: d3.scaleLinear().domain([0, node.size.y]).range([p[i][0][1], p[i][2][1] - margin.bottom * 1.5]),
                        rg: p[i][p[i].length - 2][1] - margin.bottom * 1.5,
                        x1: d3.scaleLinear().domain([0, node.size.x]).range([p[i][p[i].length - 3][0], p[i][1][0] - margin.left - margin.right]),
                    }
                if (i == 5)
                    node.t = {
                        x: d3.scaleLinear().domain([0, node.size.x]).range([p[i][0][0], p[i][1][0] - margin.left - margin.right]),
                        y: d3.scaleLinear().domain([0, node.size.y]).range([p[i][0][1], p[i][2][1] - margin.bottom * 1.5]),
                        rg: p[i][p[i].length - 2][1],
                        x1: d3.scaleLinear().domain([0, node.size.x]).range([p[i][p[i].length - 3][0], p[i][1][0] - margin.left - margin.right]),
                    }
            }

            let node = this.nodes[6]
            node.range = {
                border: {
                    left: {
                        top: [p[0][3][0], p[0][3][1]],
                        bottom: [p[3][2][0], p[3][2][1]],
                    },
                    right: {
                        top: [p[2][4][0], p[2][4][1]],
                        bottom: [p[5][5][0], p[5][5][1]],
                    }
                },
                scene: {
                    left: {
                        top: [0, 0],
                        bottom: [0, 100]
                    },
                    right: {
                        top: [100, 0],
                        bottom: [100, 100]
                    }
                }
            }
            node.t = {
                x: d3.scaleLinear().domain([0, node.size.x]).range([p[0][3][0], p[2][4][0] - margin.left - margin.right]),
                y: d3.scaleLinear().domain([0, node.size.y]).range([p[0][3][1], p[3][2][1] - margin.bottom * 1.5]),
            }
        }
        else {
            console.log(row, column)
            for (let i = 0; i < row; ++i) {
                for (let j = 0; j < column && cnt < this.nodes.length; ++j) {
                    if (cnt++ > this.nodes.length) break
                    // 自动填充多余空间
                    // let n_fill = cnt < this.nodes.length ? 1 : (column - j)
                    let n_fill = 1
                    let node = this.nodes[cnt - 1];
                    let _x = j * box.cell.width, _y = i * box.cell.height;
                    let boxWidth = box.cell.width * n_fill,
                        boxHeight = box.cell.height

                    box.append('rect')
                        .attr('fill', 'none')
                        .attr('x', _x)
                        .attr('y', _y)
                        .attr('width', boxWidth)
                        .attr('height', boxHeight)
                        .attr('stroke', '#111')
                        .attr('stroke-width', 1)
                    box.append('text')
                        .text(this.nodes[cnt - 1].name)
                        .attr('x', _x + 2)
                        .attr('y', _y + config.map.subtitle.fontSize)
                        .attr('font-size', config.map.subtitle.fontSize)
                    node.range = {
                        border: {
                            left: {
                                top: [_x, _y],
                                bottom: [_x, _y + boxHeight],
                            },
                            right: {
                                top: [_x + boxWidth, _y],
                                bottom: [_x + boxWidth, _y + boxHeight],
                            }
                        },
                        scene: {
                            left: {
                                top: [0, 0],
                                bottom: [0, node.size.y]
                            },
                            right: {
                                top: [node.size.x, 0],
                                bottom: [node.size.x, node.size.y]
                            }
                        }
                    }
                    node.t = {
                        x: d3.scaleLinear().domain([0, node.size.x]).range([_x, _x + boxWidth - margin.left - margin.right]),
                        y: d3.scaleLinear().domain([0, node.size.y]).range([_y, _y + boxHeight - margin.bottom * 1.5]),
                    }
                }
            }
        }
    }
    //加载初始数据
    loadDefault = () => {
        console.log(conf,'jkjn kjnjknkj')
        this.injects = injects()
        this.conf = conf
        var nodes = conf.nodes
            , ticks = inject('ticks').value * inject('days').value
            , _default = conf.default

        if (this.injects.start_isolation.value == true) {
            nodes.push({
                name: link_realName2alias('隔离区'),
                size: { x: 100, y: 100 }
            })
        }

        // nodes = nodes.reverse()
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].id = nodes[i].name
            nodes[i].type = 'scene'
            nodes[i].color = colorsTable[i]
            nodes[i].avgTime = conf.avgtime[i]
            nodes[i].popularity = conf.popularity[i]
            if (nodes[i].size == undefined) {
                nodes[i].size = _default.size
            }
            this.injects.scenes.value.push(nodes[i].name)
        }
        // this.injects.scenes.value.push(nodes[0].name)

        // console.log(nodes)

        // console.log(this.injects.scenes.value)
        this.mapOfScene = {}
        this.injects.args.value['default'] = {
            beta: ini.beta,          // 传染概率β
            rho: ini.rho,           // 有效接触系数ρ
            delta: ini.delta,         // 感染者转换为隔离者的概率
            lambda: ini.lambda,        // λ是隔离解除速率
            theta: ini.theta,         // θ是潜伏者（E）相对于感染者传播能力的比值
            sigma: ini.sigma,         // σ为潜伏者（E）向感染者（I）的转化速率
            d: ini.d,             // 感染者的影响距离(社交距离)
            I_gamma: ini.I_gamma,       // I的恢复系数γ
            ISO_gamma: ini.ISO_gamma,     // 隔离者的恢复率
            close_distance: ini.close_distance // 密切接触距离
        }
        for (let i = 0; i < nodes.length; i++) {
            this.mapOfScene[nodes[i].name] = nodes[i]
            this.injects.args.value[nodes[i].name] = {
                beta: undefined,   // 传染概率β
                rho: undefined,   // 有效接触系数ρ
                delta: undefined,   // 感染者转换为隔离者的概率
                lambda: undefined,   // λ是隔离解除速率
                theta: undefined,   // θ是潜伏者（E）相对于感染者传播能力的比值
                sigma: undefined,   // σ为潜伏者（E）向感染者（I）的转化速率
                d: undefined,   // 感染者的影响距离(社交距离)
                I_gamma: undefined,   // I的恢复系数γ
                ISO_gamma: undefined,   // 隔离者的恢复率
                close_distance: undefined,   // 密切接触距离
            }
        }
        // var links = conf.links
        this.layout = conf.layout
        // this.links = links
        this.nodes = nodes
        this.ticks = ticks
        // console.log('links',links)
    }

    injectsValues = () => {
        var va = {}
        for (let k in this.injects) {
            va[k] = this.injects[k].value
        }
        return va
    }

    oriStateDataGener = () => {
        var rs = this.roles
        var { I, days, ticks, rehabilitation, incubation } = this.injectsValues()
        var ticksLength = ticks
        incubation *= ticksLength
        rehabilitation *= ticksLength
        ticks = dt2t(days - 1, ticks - 1)
        for (let t = 0; t <= ticks; t++) {
            if (t == 0)  // 初始化
            {
                for (let i = 0; i < rs.length; i++) {
                    if (i < I) {
                        rs[i].origin_state = [{
                            infected: 0,
                            state: 'infectious',
                            scene: rs[i].origin_coordination[t].scene,
                            from: rs[i],
                            rehabilitation: rehabilitation,
                            done: true
                        }]
                    }
                    else {
                        rs[i].origin_state = [{
                            scene: rs[i].origin_coordination[t].scene,
                            state: 'susceptible',
                            done: false
                        }]
                    }
                }
            }
            else {
                for (let i = 0; i < rs.length; i++) {
                    var _state = { ...last(rs[i].origin_state) }
                    _state.done = false
                    _state.scene = rs[i].origin_coordination[t].scene,
                        rs[i].origin_state.push(_state)
                }
            }
            let args = { ...this.injects.args.value }
            for (let k in args) {
                args[k] = { ...args[k] }
                for (let _ in args[k]) {
                    if (args[k][_] == undefined)
                        args[k][_] = args['default'][_]
                }
            }
            for (let i = 0; i < rs.length; i++) {
                var aim = rs[i]
                // if(aim.coordination)
                var aim_last = last(aim.origin_state)
                if (aim_last.state == 'infectious' || aim_last.state == 'exposed') {
                    let { beta, theta, d, sigma, I_gamma } = args[aim.where(t, true).name]
                    let E_beta = beta * theta
                    // I -> R
                    var aimP = Math.random()

                    if (aim_last.state == 'infectious' && aimP < I_gamma && !aim_last.done && aim_last.rehabilitation <= 0) {
                        aim_last.done = true
                        aim_last.state = 'recovered'
                        continue
                    } else if (aim_last.rehabilitation > 0) {
                        aim_last.rehabilitation--
                    }
                    // E -> I
                    if (aim_last.state == 'exposed' && aimP < sigma && !aim_last.done && aim_last.incubation <= 0) {
                        aim_last.done = true
                        aim_last.rehabilitation = rehabilitation
                        aim_last.state = 'infectious'
                    } else if (aim_last.incubation > 0) {
                        aim_last.incubation--
                    }
                    // S -> E
                    var neig = aim.filterByDistance(t, d, true)
                    // console.log("neig", neig.length)
                    for (let j = 0; j < neig.length; j++) {
                        var target = neig[j]
                        var target_last = last(target.origin_state)
                        if (target_last.done || target_last.state != 'susceptible') continue
                        var p = Math.random()
                        if ((p < beta && aim_last.state == 'infectious') || (p < E_beta && aim_last.state == 'exposed')) {
                            target_last.done = true
                            target_last.state = 'exposed'
                            target_last.incubation = incubation
                            target_last.from = aim
                            target_last.infected = t
                        }
                    }
                }
            }
        }
        // this.injects.stateUpdated.value++
    }

    updateStateOfRoles = () => {
        // 3
        var rs = this.roles
        var { I, days, ticks, rehabilitation, incubation } = this.injectsValues()
        // I_gamma/=12
        // I_gamma=Math.pow(I_gamma,1/12)
        // beta/=12
        var ticksLength = ticks
        incubation *= ticksLength
        rehabilitation *= ticksLength
        ticks = dt2t(days - 1, ticks - 1)
        // 路线初始化
        for (let i = 0; i < rs.length; i++) {
            rs[i].coordination = rs[i].origin_coordination.slice(0).map(d => {
                return { ...d }
            })
        }

        let start_tick = this.injects.start_action.value
        if (start_tick == null) start_tick = this.roles[0].origin_state.length
        for (let i = 0; i < rs.length; i++) {
            rs[i].state = rs[i].origin_state.slice(0, start_tick)
        }
        // if(this.injects.start_isolation.value)
        // {
        //     // 创建分支
        //     let iso_tick = this.injects.isolation_tick.value
        //     start_tick = iso_tick
        //     for(let i=0; i<rs.length; i++)
        //     {
        //         rs[i].state = rs[i].origin_state.slice(0, iso_tick)
        //     }
        // }

        for (let t = start_tick; t <= ticks; t++) {
            if (t == 0)  // 初始化
            {
                for (let i = 0; i < rs.length; i++) {
                    if (i < I) {
                        rs[i].state = [{
                            infected: 0,
                            state: 'infectious',
                            scene: rs[i].coordination[t].scene,
                            from: rs[i],
                            rehabilitation: rehabilitation,
                            done: true
                        }]
                    }
                    else {
                        rs[i].state = [{
                            scene: rs[i].coordination[t].scene,
                            state: 'susceptible',
                            done: false
                        }]
                    }
                }
            }
            else {
                for (let i = 0; i < rs.length; i++) {
                    var _state = { ...last(rs[i].state) }
                    _state.done = false
                    _state.scene = rs[i].coordination[t].scene,
                        rs[i].state.push(_state)
                }
            }
            let args = { ...this.injects.args.value }
            for (let k in args) {
                args[k] = { ...args[k] }
                for (let _ in args[k]) {
                    if (args[k][_] == undefined)
                        args[k][_] = args['default'][_]
                }
            }

            for (let i = 0; i < rs.length; i++) {
                var aim = rs[i]
                // if(aim.coordination)
                var aim_last = last(aim.state)
                if (aim_last.state == 'infectious' || aim_last.state == 'exposed') {
                    let { beta, theta, d, sigma, I_gamma, delta } = args[aim.where(t).name]
                    let E_beta = beta * theta
                    // I -> R
                    var aimP = Math.random()
                    if (aim_last.state == 'infectious' && aimP < I_gamma && !aim_last.done && aim_last.rehabilitation <= 0) {
                        // console.log('aimP', aimP)
                        aim_last.done = true
                        aim_last.state = 'recovered'
                        aim.land(t + 1, this.mapOfScene[link_realName2alias('宿舍')])
                        aim.rezone(t + 1)
                        continue
                    } else if (aim_last.rehabilitation > 0) {
                        aim_last.rehabilitation--
                    }
                    // I -> ISO
                    // console.log("你到底要不要隔离呀:", this.injects.start_isolation.value, t > this.injects.isolation_tick.value, aim_last.state == 'infectious', aimP < delta && !aim_last.done, aim_last.rehabilitation > 0, aim_last.scene.name != link_realName2alias('隔离区'))
                    if (this.injects.start_isolation.value && t > this.injects.isolation_tick.value && aim_last.state == 'infectious' && aimP < delta && !aim_last.done && aim_last.rehabilitation > 0 && aim_last.scene.name != link_realName2alias('隔离区')) {

                        aim.land(t, this.mapOfScene[link_realName2alias('隔离区')])
                        aim.rezone(t)
                    }
                    // E -> I
                    if (aim_last.state == 'exposed' && aimP < delta * 0.05 && !aim_last.done && aim_last.scene.name != link_realName2alias('隔离区')) {
                        aim.land(t, this.mapOfScene[link_realName2alias('隔离区')])
                        aim.rezone(t)
                    }
                    else if (aim_last.state == 'exposed' && aimP < sigma && !aim_last.done && aim_last.incubation <= 0) {
                        aim_last.done = true
                        aim_last.rehabilitation = rehabilitation
                        aim_last.state = 'infectious'
                    } else if (aim_last.incubation > 0) {
                        aim_last.incubation--
                    }
                    // S -> E
                    var neig = aim.filterByDistance(t, d)
                    for (let j = 0; j < neig.length; j++) {
                        var target = neig[j]
                        var target_last = last(target.state)
                        if (target_last.done || target_last.state != 'susceptible') continue
                        var p = Math.random()
                        if ((p < beta && aim_last.state == 'infectious') || (p < E_beta && aim_last.state == 'exposed')) {
                            target_last.done = true
                            target_last.state = 'exposed'
                            target_last.incubation = incubation
                            target_last.from = aim
                            target_last.infected = t
                        }
                    }
                }
            }
        }
        // console.log('state updated')
        this.injects.stateUpdated.value++
        // this.saveAllNetwork()
    }

    saveAllNetwork = (last_data, t) => {
        if (last_data == undefined) {
            this.saveAllNetwork([], 0)
            return
        }
        let limit = this.roles[0].tick
        if (t >= limit) {
            this.proceeded_network_data = last_data
            return
        }
        let { nodes, links } = this.network(t)
        let simulation = d3.forceSimulation(nodes)
        simulation
            .force('x', d3.forceX())
            .force('y', d3.forceY())
            .force('link', d3.forceLink(links)
                .id(d => d.id)
                .distance(5)
                .strength(1))
            .force('charge', d3.forceManyBody().strength(-10))
            .on('end', () => {
                last_data.push({ nodes, links })
                // console.log(t, ' over')
                this.saveAllNetwork(last_data, t + 1)
            })
        // for(let i=0)
    }

    /** 返回tick时刻各个场景的风险系数 [ (E+I)/2 ]
     * @param {Number} tick
     */
    riskDataByTick = (tick) => {
        var rs = this.roles
        var N = {}, I = {}, E = {}, statics = {}
        for (let i = 0; i < this.nodes.length; i++) {
            var sc = this.nodes[i].name
            N[sc] = 0
            I[sc] = 0
            E[sc] = 0
        }
        for (let i = 0; i < rs.length; i++) {
            var state = rs[i].state[tick]
            var sc = state.scene.name
            N[sc]++
            if (state.state == 'exposed')
                E[sc]++
            else if (state.state == 'infectious')
                I[sc]++
        }
        for (let k in N) {
            statics[k] = (E[k] + I[k]) / this.injects.N.value
            if (isNaN(statics[k]))
                statics[k] = 0
        }
        return statics
    }

    findRoleById = (uid = 0) => {
        var rs = this.roles
        for (let i = 0; i < rs.length; i++) {
            if (rs[i].id == uid) return rs[i]
        }
        return undefined
    }

    spreadTree = (uid = 0) => { // 哪里传来的，又传给谁
        let t = dt2t(this.injects.currentDay.value, this.injects.currentTick.value)
        var center = this.findRoleById(uid)
        if (center == undefined) {
            // console.log("查无此人: " + uid)
            return false
        }
        if (!center.infectedIn()) return false
        // let node = {}, rs = this.roles
        // for(let i=0; i<rs.length; i++)
        // {
        //     let aim = rs[i]
        //     if(last(aim.state).state!='susceptible')
        //         node[aim.id] = aim.node()
        // }
        // let core = node[uid]
        // for(let k in node)
        // {
        //     if(node[k].name!=node[k].from)
        //     {
        //         node[k].parent = node[node[k].from]
        //         node[node[k].from].children.push(node[k])
        //     }
        // }

        // function own(root, id)
        // {
        //     if(root.id==id) return true
        //     let children = root.children
        //     for(let i=0; i<children; i++)
        //     {
        //         if(own(children[i], id)) return true
        //     }
        //     return false
        // }

        // // 减枝前预处理
        // function addAncients(root, ancients)
        // {
        //     let children = root.children
        //     ancients = ancients.slice(0)
        //     ancients.push(root.name)
        //     root.ancients = ancients
        //     for(let i=0; i<children.length; i++)
        //     {
        //         addAncients(children[i], ancients)
        //     }
        // }
        // function cut(root)
        // {
        //     let parent = root.parent
        //     if(
        //         !own(root, uid)
        //         &&
        //         (
        //             (root.ancients.includes(uid) && root.infected>t)
        //             ||
        //             (!root.ancients.includes(uid) && core.infected<root.infected)
        //         )
        //     )
        //     {
        //         if(root.id==uid)
        //         {
        //             console.log('awsl')
        //         }
        //         parent.children = parent.children.splice(parent.children.indexOf(root),1)
        //     }
        //     else
        //     {
        //         let children = root.children
        //         for(let i=0; i<children.length; i++)
        //         {
        //             cut(children[i])
        //         }
        //     }
        // }

        // function count(root)
        // {
        //     let n = 1
        //     if(uid==root.id)
        //     {
        //         console.log('没想到吧！我没被删扌')
        //     }
        //     let children = root.children
        //     for(let i=0; i<children.length; i++)
        //     {
        //         n += count(children[i])
        //     }
        //     return n
        // }
        // addAncients(node[0], [])
        // console.log('count 1 :: ',count(node[0]))
        // cut(node[0])
        // console.log(node[0])
        // console.log('count 2 :: ',count(node[0]))
        // // console.log(node[0])
        // return node[0]

        // 垂杨柳(?)
        var core = center.node()
        if (last(center.state).state == 'susceptible') return core
        var node = {}, infected_by = {}
        var rs = this.roles
        for (let i = 0; i < rs.length; i++) {
            if (last(rs[i].state).state == 'susceptible') continue
            let target
            if (rs[i].id == this.id) target = core
            else target = rs[i].node()
            node[rs[i].id] = target
            if (infected_by[target.from] == undefined)
                infected_by[target.from] = []
            if (target.from != target.name) {
                infected_by[target.from].push(target)
            }
        }
        // upper
        var tmp = core
        while (1) {
            if (tmp.name == tmp.from) break
            let parent = node[tmp.from]
            tmp.parent = parent
            parent.children.push(tmp)
            tmp = parent
        }
        // down
        let queue = [core]
        while (queue.length > 0) {
            let target = queue.pop()
            let infected = infected_by[target.name]
            infected = infected == undefined ? [] : infected
            target.children = infected
            for (let i = 0; i < infected.length; i++) {
                infected[i].parent = target
            }
            if (infected.length > 0)
                queue = queue.concat(infected)
        }
        // return node[0]
        return tmp
    }

    network = (t) => {
        if (t == undefined) {
            let tick = this.injects.currentTick.value
            let day = this.injects.currentDay.value
            t = dt2t(day, tick)
        }
        var force_role = this.injects.force_role.value
        let rs = this.roles
        // console.log(this, rs, 'lxm')
        let nodes = [], links = [], _rec = {}
        for (let i = 0; i < rs.length; ++i) {
            let r = rs[i]
            //某一时刻是状态
            let state = r.state[t]
            // console.log(state, 'xm')
            if (state.state == 'susceptible') continue
            let from = state.from
            if (_rec[from.id] == undefined) {
                console.log(from)
                nodes.push({
                    id: from.id,
                    role: from,
                    infected: from.state[310].infected,
                    from: from.state[t].from.id,
                    state: from.state[t].state,
                    scene: r.state[state.infected].scene,
                    sons: r.sons(t)
                })
                _rec[from.id] = 1
            }
            if (_rec[r.id] == undefined) {
                nodes.push({
                    id: r.id,
                    role: r,
                    infected: r.state[310].infected,
                    from: state.from.id,
                    state: state.state,
                    scene: r.state[state.infected].scene,
                    sons: r.sons(t)
                })
                _rec[r.id] = 1
            }
            links.push({
                source: from.id,
                tick: state.infected,
                target: r.id,
                scene: r.coordination[state.infected].scene,
            })
        }

        function sumpoint(sons) {
            var k
            var sum = 0;
            sum = sons == undefined ? 0 : sons.length;
            k = sons == undefined ? 0 : sons.length;
            for (let i = 0; i < k; i++) {
                sum += sumpoint(f_s[sons[i]])
            }
            return sum

        }

        var f_s = []
        for (let k = 0; k < nodes.length; k++) {
            var from = nodes[k].from
            var id = nodes[k].id
            if (id != from) {
                if (f_s[from] == undefined) {
                    f_s[from] = []
                }
                f_s[from].push(id)
            }
        }
        // console.log(f_s)

        for (let i = 0; i < nodes.length; i++) {
            var d = nodes[i];
            d["son_num"] = (f_s[d.id] == undefined ? [] : f_s[d.id])
        }
        // console.log(nodes)
        return { nodes, links }
    }

    storyline = (t) => {
        if (t == undefined) {
            let tick = this.injects.currentTick.value
            let day = this.injects.currentDay.value
            console.log(day, tick)
            t = dt2t(day, tick)
        }

        // console.log(t)
        var rs = this.roles


        var nodes = [], _rec = {}
        for (let i = 0; i < rs.length; i++) {


            let r = rs[i]
            //某一时刻是状态
            let state = r.state[t]

            // console.log(r)

            if (state.state == 'susceptible') continue
            let from = state.from
            // console.log(from)
            if (_rec[from.id] == undefined) {
                nodes[from.id] = ({
                    id: from.id,
                    role: from,
                    from: from.state[t].from.id,
                    // state: from.state[t].state,
                    scene: r.coordination[state.infected].scene,
                    infected: from.state[t].infected,
                    // depth: Depth(from, from.state[t].infected),
                    // sons: r.sons(t)
                })
                _rec[from.id] = 1
            }

            if (_rec[r.id] == undefined) {
                nodes[r.id] = ({
                    id: r.id,
                    role: r,
                    from: state.from.id,
                    // state: state.state,
                    scene: r.coordination[state.infected].scene,
                    infected: state.infected,
                    // depth: Depth(r, state.infected),
                    // sons: r.sons(t)
                })
                _rec[r.id] = 1
            }
        }

        var f_s = []
        for (let k = 0; k < nodes.length; k++) {
            if (_rec[k] == undefined)
                continue
            var from = nodes[k].from
            var id = nodes[k].id
            if (id != from) {
                if (f_s[from] == undefined) {
                    f_s[from] = []
                }
                f_s[from].push(id)
            }
        }
        var data = [], lll = {}
        for (let i = 0; i < nodes.length; i++) {
            if (_rec[i] == undefined)
                continue
            var d = nodes[i];
            d["sons"] = f_s[d.id] == undefined ? [] : f_s[d.id]
            if (lll[d.depth] == undefined) {
                data[d.depth] = []
                lll[d.depth] = 1
            }

        }

        // console.log(nodes, _rec, "data")
        return { nodes, _rec };
    }

    netbox = (t) => {
        if (t == undefined) {
            let tick = this.injects.currentTick.value
            let day = this.injects.currentDay.value
            t = dt2t(day, tick)
        }
        var rs = this.roles
        // console.log(rs, t, 'lxm')

        var R = {}
        function Depth(r, t) {
            // console.log(r, t, r.id)
            if (R[r.id] == undefined) {
                if (r.id == r.state[t].from.id) {
                    R[r.id] = { depth: 0 }
                }
                else {
                    R[r.id] = { depth: Depth(r.state[t].from, r.state[t].from.state[t].infected) + 1 }
                }
            }

            var d = R[r.id].depth
            return d;

        }

        var nodes = [], _rec = {}
        for (let i = 0; i < rs.length; i++) {

            let r = rs[i]
            //某一时刻是状态
            let state = r.state[t]

            if (state.state == 'susceptible') continue
            let from = state.from
            // console.log(from)
            if (_rec[from.id] == undefined) {
                nodes.push({
                    id: from.id,
                    role: from,
                    from: from.state[t].from.id,
                    // state: from.state[t].state,
                    scene: r.coordination[state.infected].scene,
                    depth: Depth(from, from.state[t].infected),
                    // sons: r.sons(t)
                })
                _rec[from.id] = 1
            }

            if (_rec[r.id] == undefined) {
                nodes.push({
                    id: r.id,
                    role: r,
                    from: state.from.id,
                    // state: state.state,
                    scene: r.coordination[state.infected].scene,
                    depth: Depth(r, state.infected),
                    // sons: r.sons(t)
                })
                _rec[r.id] = 1
            }
        }
        // console.log(nodes, 'lll')
        var f_s = []
        for (let k = 0; k < nodes.length; k++) {
            var from = nodes[k].from
            var id = nodes[k].id
            if (id != from) {
                if (f_s[from] == undefined) {
                    f_s[from] = []
                }
                f_s[from].push(id)
            }
        }
        // console.log(f_s)

        var box_data = [], lll = {}
        for (let i = 0; i < nodes.length; i++) {
            var d = nodes[i];
            d["sons"] = f_s[d.id] == undefined ? [d.id] : f_s[d.id]
            if (lll[d.depth] == undefined) {
                box_data[d.depth] = []
                lll[d.depth] = 1
            }
            box_data[d.depth].push(d)
        }
        // console.log(box_data)
        return box_data;
    }

    sunburst = (t) => {
        if (t == undefined) {
            let tick = this.injects.currentTick.value
            let day = this.injects.currentDay.value
            t = dt2t(day, tick)
        }
        var rs = this.roles
        var R = {}
        function Depth(r, t) {
            // console.log(r, t, r.id)
            if (R[r.id] == undefined) {
                if (r.id == r.state[t].from.id) {
                    R[r.id] = { depth: 0 }
                }
                else {
                    R[r.id] = { depth: Depth(r.state[t].from, r.state[t].from.state[t].infected) + 1 }
                }
            }
            var d = R[r.id].depth
            return d;
        }

        function sumpoint(sons) {
            var k
            var sum = 0;
            sum = sons == undefined ? 0 : sons.length;
            k = sons == undefined ? 0 : sons.length;
            for (let i = 0; i < k; i++) {
                sum += sumpoint(f_s[sons[i]])
            }
            return sum

        }

        var nodes = [], _rec = {}
        for (let i = 0; i < rs.length; i++) {

            let r = rs[i]
            //某一时刻是状态
            let state = r.state[t]

            if (state.state == 'susceptible') continue
            let from = state.from
            // console.log(from)
            if (_rec[from.id] == undefined) {
                nodes.push({
                    id: from.id,
                    role: from,
                    from: from.state[t].from.id,
                    // state: from.state[t].state,
                    scene: r.coordination[state.infected].scene,
                    depth: Depth(from, from.state[t].infected),
                    // sons: r.sons(t)
                })
                _rec[from.id] = 1
            }

            if (_rec[r.id] == undefined) {
                nodes.push({
                    id: r.id,
                    role: r,
                    from: state.from.id,
                    // state: state.state,
                    scene: r.coordination[state.infected].scene,
                    depth: Depth(r, state.infected),
                    // sons: r.sons(t)
                })
                _rec[r.id] = 1
            }
        }
        // console.log(nodes, 'lll')
        var f_s = []
        for (let k = 0; k < nodes.length; k++) {
            var from = nodes[k].from
            var id = nodes[k].id
            if (id != from) {
                if (f_s[from] == undefined) {
                    f_s[from] = []
                }
                f_s[from].push(id)
            }
        }
        // console.log(f_s)


        var data = [], lll = {}
        for (let i = 0; i < nodes.length; i++) {
            var d = nodes[i];
            d["sons"] = f_s[d.id] == undefined ? [d.id] : f_s[d.id]
            d["son_num"] = sumpoint(f_s[d.id]) + 1
            if (lll[d.depth] == undefined) {
                data[d.depth] = []
                lll[d.depth] = 1
            }
            data[d.depth].push(d)
        }
        for (let i = 0; i < rs.length; i++) {
            if (f_s[i] == [] || f_s[i] == undefined) {
                f_s[i] = [i]
            }
        }

        return { data, f_s };
    }

    traceData = (uid, only_exposed = true) => {
        return this.findRoleById(uid).traceData(only_exposed)
    }

    virusRoad = (uid = 0) => {
        return this.findRoleById(uid).virusRoad()
    }

    riverData = () => {
        var ini = getIni(this.injects)
        var river_content = ini.river_content
        var { ticks, days } = ini
        var T = (ticks - 1) * days
            , data = {}
            , show = this.injects.river_show.value
            , li = {}
        if (show == null) return data
        for (let i = 0; i < show.length; i++) {
            li[show[i]] = 1
        }
        for (let i = 0; i < this.nodes.length; i++) {
            // data[this.nodes[i].name]=Array.from({length:T},()=>0)
            data[this.nodes[i].name] = []
        }
        var rs = this.roles
        for (let i = 0; i < T; i++) {
            var _ = { susceptible: 0, exposed: 0, infectious: 0, recovered: 0, N: 0 }
                , scene_data = {}
            for (let j = 0; j < this.nodes.length; j++) {
                scene_data[this.nodes[j].name] = { ..._ }
            }
            for (let j = 0; j < rs.length; j++) {
                if (river_content == 'normal' || ((i == 0 || rs[j].state[i].state != rs[j].state[i - 1].state) && river_content == 'delta')) // delta
                {
                    var r = rs[j].state[i]
                    scene_data[r.scene.name][r.state]++
                    scene_data[r.scene.name].N++
                }
            }
            for (let k in scene_data) {
                var n = 0
                for (let s in li) {
                    n += scene_data[k][s]
                }
                data[k].push(n)
            }
        }
        return data
    }

    name2color = (scene_name) => {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].name == scene_name) {
                return this.nodes[i].color
            }
        }
        return '#111111';
    }

    /**
     * @param {Number} tick
     */
    spreadNetworkData = (tick) => {
        if (tick == undefined) {
            tick = (this.injects.ticks.value - 1) * this.injects.days.value - 1
        }
        var links = [], nodes = [], rec = {}
        for (let i = 0; i < this.roles.length; i++) {
            // var state=last(this.roles[i].state)
            var state = this.roles[i].state[tick]
            if (state.state == "susceptible" || state.state == 'exposed') continue
            var sid = state.from.id, tid = this.roles[i].id
            if (rec[sid] == undefined) {
                rec[sid] = 1
                nodes.push({ id: sid, role: state.from })
            }
            if (rec[tid] == undefined) {
                rec[tid] = 1
                nodes.push({ id: tid, role: this.roles[i] })
            }
            if (sid == tid) continue
            links.push({
                source: sid,
                target: tid,
                tick: state.infected
            })
        }
        var roles = {}
        for (let i = 0; i < nodes.length; i++) {
            roles[nodes[i].id] = {
                name: nodes[i].id,
                role: nodes[i].role,
                children: []
            }
        }
        for (let i = 0; i < links.length; i++) {
            var { source, target, tick } = links[i]
            roles[source].children.push(roles[target])
        }
        return { nodes, links, tree: roles[0] }
    }

    /**社交网络 */
    socialDataByTick = (tick) => {
        var nodes = [], links = []
            , mapOfNodes = {}
            , rs = this.roles
            , count = {}
            , hist = []
            , d = this.injects.d.value
        function touch(source, target, _T) {
            function genRec(s, t) {
                return `${_T}-${s.id}-${t.id}`
            }
            var rec = [genRec(source, target), genRec(target, source)]
            if (hist.includes(rec[0]) || hist.includes(rec[1])) {
                return false
            } else {
                hist.push(rec[0])
            }
            var sid = source.id, tid = target.id
            if (count[sid] == undefined) {
                count[sid] = {}
                count[sid][tid] = 1
            } else if (count[sid][tid] == undefined) {
                count[sid][tid] = 1
            } else {
                count[sid][tid]++
            }
        }
        for (let i = 0; i < rs.length; i++) {
            nodes.push(rs[i])
            mapOfNodes[rs[i].id] = rs[i]
        }
        for (let t = 0; t < tick; t++) {
            for (let i = 0; i < rs.length; i++) {
                var center = rs[i]
                var nears = center.filterByDistance(t, d)
                for (let n = 0; n < nears.length; n++) {
                    touch(center, nears[n], t)
                }
            }
        }
        for (let sid in count) {
            var _ = count[sid]
            for (let tid in _) {
                links.push({
                    display: true,
                    source: mapOfNodes[sid],
                    target: mapOfNodes[tid],
                    weight: _[tid]
                })
            }
        }
        return { nodes, links }
    }

    /**返回网络图的数据*/
    touchDataByTick = (t) => {
        // var nodes={},links={}
        // var __={
        //     type:'scene',
        //     id:'--center--'
        // }
        var __ = this.nodes[0]
        var nodes = [__]
            , links = []
        var rec = {}, rs = this.roles, d = this.injects.d.value
        for (let i = 0; i < rs.length; i++) {
            rec[rs[i].id] = {}
            for (let j = 0; j < rs.length; j++) {
                rec[rs[i].id][rs[j].id] = 0;
            }
        }
        for (let i = 1; i < this.nodes.length; i++) {
            nodes.push(this.nodes[i])
            links.push({
                distance: 150,
                display: false,
                source: __,
                target: this.nodes[i]
            })
        }
        for (let i = 0; i < rs.length; i++) {
            var center = rs[i]
            var { x, y } = center.coordination[t]
            var scene = center.where(t)
            var sc = scene.name
                , size = scene.size
            var nears = center.filterByDistance(t, d)
            // if(nodes[sc]==undefined)
            // {
            //     nodes[sc]=[this.mapOfScene[sc]]
            // }
            // nodes[sc].push(center)
            nodes.push(center)
            links.push({
                display: false,
                scene: sc,
                distance: Math.sqrt(Math.pow(this.t.rd2px.x(Math.abs(x - scene.center.x)), 2) + Math.pow(this.t.rd2px.y(Math.abs(y - scene.center.y)), 2)),
                source: this.mapOfScene[sc],
                target: center
            })
            // if(links[sc]==undefined)
            // {
            //     links[sc]=[]
            // }
            // // scene -> role
            // links[sc].push({
            //     source:this.mapOfScene[sc],
            //     target:center
            // })
            for (let j = 0; j < nears.length; j++) {
                var near = nears[j]
                if (rec[center.id][near.id] == 0 && rec[near.id][center.id] == 0) {
                    rec[center.id][near.id] = 1
                    rec[near.id][center.id] = 1
                    // links[sc].push({
                    //     source:center,
                    //     target:near
                    // })
                    links.push({
                        distance: 40,
                        display: true,
                        source: center,
                        target: near
                    })
                    // if(!nodes[sc].includes(center))
                    // {
                    //     nodes[sc].push(center)
                    // }
                    // if(!nodes[sc].includes(near))
                    // {
                    //     nodes[sc].push(near)
                    // }
                }
            }
        }
        return { nodes, links }
    }

    generateRoles = (n = 1000) => {
        this.roles = []
        console.log(this,"AAAAAAAAAAAAAAAAAA")
        var I_0 = this.injects.I.value
        console.log(this)
        for (let i = 0; i < n; i++) {
            var role = new Role(i)
            role.init({
                links: this.links,
                scenes: this.nodes,
                roles: this.roles,
                conf: this.conf,
                Scene: this,
                isInfectious: i < I_0 ? true : false,
            })
            this.roles.push(role)
        }
        console.log(this.roles)
        this.oriStateDataGener()
    }

    randomTicks = (n) => {
        var res = []
        for (let i = 0; i < n; i++) {
            res.push(Math.random())
        }
        return res
    }
}