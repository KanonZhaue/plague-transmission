/* eslint-disable */
var d3 = require('d3')
import { circleRandom, rectRandom } from "./random"
import { link_realName2alias } from "../conf/cls8"
import config from "../conf/config"
import { inject } from "vue"
import { dt2t, t2dt, mDistance, last } from "./kit"
export class Role {
    id = 0
    scenes = []
    roles = []
    links = {}
    conf = {}
    /**
     *  state = [{
     *
     *      state: [recovered|infectious|susceptible|exposed]
     *
     *      from:id,   如果当前时刻被传染了，则存入from，其中id为传染源，零号病人则自己感染自己
     *
     *      rehabilitation：康复期
     *
     *      incubation: 潜伏期
     *
     *  },...]
     */
    state = []   // 由Scene实例生成
    origin_state = []
    tick = 0
    coordination = []       // 各个tick，角色在场景内的坐标（单位:m），需要使用场景对象的坐标转换方法来转成屏幕像素
    origin_coordination = [] // 原始坐标， 没考虑隔离区
    constructor(_id) {
        if (_id === undefined) {
            console.log('WARN: 角色需要被分配一个ID')
        }
        else this.id = _id
    }

    /**
     * 这部分 传入 一个 Scene实例，
     * 然后 为 Role实例 生成 行动路径
     *
     * @param {{scenes:Array,roles:Array}} args
     */
    init = (args) => {
        var { roles, scenes, conf, links, isInfectious, Scene } = args
        console.log(scenes)
        this.SceneImp = Scene
        var done = true
        console.log(scenes)
        if (isInfectious) {
            this.state = [{ state: 'infectious', from: this.id, done }]
        }
        else {
            this.state = [{ state: 'susceptible', done }]
        }
        console.log(scenes)
        this.scenes = scenes
        this.conf = conf
        var ticks = Scene.injects.ticks.value
        this.tick = (ticks - 1) * Scene.injects.days.value
        this.roles = roles
        // this.links = links
        console.log(scenes)
        var mapOfScenes = {}
        for (let i = 0; i < scenes.length; i++) {
            mapOfScenes[scenes[i].name] = scenes[i]
            console.log(scenes[i])
        }
        this.mapOfScenes = mapOfScenes
        // console.log(this, mapOfScenes, scenes)
        // 生成 tick 坐标数据
        var abab = parseInt(Math.random() * scenes.length)
        // console.log(mapOfScenes,scenes[abab].name)
        // console.log(mapOfScenes[scenes[abab].name])
        // console.log(this.landing(0, mapOfScenes[scenes[abab].name]))
        var data = [this.landing(0, mapOfScenes[scenes[abab].name])] // 出生点都在第一个场景内

        this.stateTime = scenes[abab].avgTime;
        for (let i = 0; i <= this.tick; i++) {
            let T_state = this.stateTime;
            var p = this.P()
            var oldLength = data.length
            var currentScene = data[oldLength - 1].scene.name
            // var link = links[currentScene]
            var dt = t2dt(i)
            // console.log(p, oldLength, currentScene, link)\
            //p产生的随机数与role 的比较，得到去了哪个场景   。。。。
            if (T_state == 0) {
                var next = { name: "", k: 0 }
                var sum_popular = 0
                for (var k in scenes) {
                    // console.log(scenes[k], currentScene,)
                    if (scenes[k].name != currentScene) {
                        sum_popular += scenes[k].popularity;
                    }
                }
                var tmp = 0
                for (var k in scenes) {
                    // console.log(scenes[k], currentScene,)
                    if (scenes[k].name != currentScene) {
                        tmp += scenes[k].popularity / sum_popular
                        if (p <= tmp) {
                            next.name = scenes[k].name
                            next.k = k;
                            break
                        }
                    }
                }
                if (next.name == "")
                    next.name = currentScene
                // console.log(next)
                
                data.push(this.landing(i, mapOfScenes[next.name]))
                this.stateTime = scenes[next.k].avgTime;
            } else {
                // console.log(mapOfScenes[currentScene])
                data.push(this.landing(i, mapOfScenes[currentScene]))
                this.stateTime -= 1
            }

            // for (let s in link) {
            //     // console.log(s)
            //     sumP += link[s][dt.tick].role
            //     if (p <= sumP) {
            //         data.push(this.landing(i, mapOfScenes[s]))
            //         break
            //     }
            // }
            // // TODO:加上场景限制
            // if (data.length == oldLength) {
            //     data.push(this.landing(i, mapOfScenes[currentScene]))
            // }
        }
        this.origin_coordination = data
        this.coordination = this.origin_coordination
        // console.log(this, data)
    }

    sons = (t) => {
        if (t == undefined) {
            let tick = this.injects.currentTick.value
            let day = this.injects.currentDay.value
            t = dt2t(day, tick)
        }
        let rs = this.roles
        let nodes = {}
        for (let i = 0; i < rs.length; i++) {
            let r = rs[i]
            let state = r.state[t]
            if (state.state == 'susceptible') continue
            if (state.infected > t) continue
            nodes[r.id] = r.node()
        }
        for (let k in nodes) {
            if (k != nodes[k].from) {
                nodes[k].parent = nodes[nodes[k].from]
                nodes[nodes[k].from].children.push(nodes[k])
            }
        }
        let target = nodes[this.id]
        function count(root) {
            let n = 1
            for (let i = 0; i < root.children.length; i++) {
                n += count(root.children[i])
            }
            return n
        }
        return {
            sons: target,
            n: count(target)
        }
    }

    node = () => {
        var last_state = last(this.state)
        var root = {
            infected: last_state.infected,
            name: this.id,
            children: [],
            role: this,
            from: last_state.from != undefined ? last_state.from.id : this.id,
            parent: null,
            ancients: [],
            infected_in: this.infectedIn()
        }
        return root
    }

    nearby = (tick, filter) => {
        var { x, y } = this.coordination[tick]
        var sc = this.coordination[tick].scene.name
        var roles = this.SceneImp.contain[tick][sc]
        roles = d3.filter(roles, d => d.id != this.id)
        if (filter != undefined) {
            roles = d3.filter(roles, filter)
        }
        return d3.sort(roles, (a, b) => {
            var _a = a.coordination[tick]
                , _b = b.coordination[tick]
            return d3.ascending(mDistance(x, y, _a.x, _a.y), mDistance(x, y, _b.x, _b.y))
        })
    }

    traceData = (only_exposed = true) => {
        let infected = this.infectedIn()
        if (!infected) return null
        // let end = last(this.state).infected
        let end
        for (end = 0; end < this.state.length; end++) // when turn to be infectious
        {
            if (this.coordination[end].scene.name == link_realName2alias('隔离区')) break
        }
        // 追溯感染路径
        let virus_road = this.virusRoad()

        console.log('V_R', virus_road)
        let start = Math.max(0, t2dt(end).day - this.SceneImp.injects.trace_days.value)
        start = dt2t(start, 0)
        console.log(end, start)
        let data = {}
        let role_tick_record = {} // 防止重复
        for (let k = 0; k < virus_road.length; k++) {
            let center = virus_road[k]
            for (let i = start; i <= end; i++) {
                let place = center.coordination[i].scene
                let close_distance = this.SceneImp.injects.args.value[place.name].close_distance
                // console.log(this.SceneImp.injects.args.value[place.name])
                if (close_distance == undefined)
                    close_distance = this.SceneImp.injects.args.value.default.close_distance
                let nears = center.filterByDistance(i, close_distance)
                for (let j = 0; j < nears.length; j++) {
                    let near = nears[j]
                    if (data[near.id] == undefined) {
                        data[near.id] = []
                        role_tick_record[near.id] = {}
                    }
                    if (role_tick_record[near.id][i] == undefined) {
                        // console.log(near.id, "~~~")
                        data[near.id].push({
                            with: center.id,
                            tick: i,
                            scene: place,
                            role: near,
                            id: near.id,
                        })
                        role_tick_record[near.id][i] = 1
                    }
                }
            }
        }
        let trace = []
        for (let k in data) {
            let d = data[k]
            d.id = d[0].id
            trace.push(d)
        }
        // console.log(trace, "contact data")
        return trace
    }

    virusRoad = () => {
        if (!this.infectedIn()) return []
        let tmp = this
        let virus_road = [tmp]
        while (true) {
            let from = last(tmp.state).from
            if (from.id == tmp.id) break
            virus_road.push(from)
            tmp = from
        }
        return virus_road
    }
    /**
     * @returns {{name:string,color:string}}
     */
    infectedIn = () => {
        var last_state = last(this.state)
        if (last_state.state == 'susceptible') return false
        return this.coordination[last_state.infected].scene
    }

    filterByDistance = (tick, distance, isOri = false) => {
        var { x, y } = (isOri ? this.origin_coordination : this.coordination)[tick]
        var maxX = x + distance, minX = x - distance,
            maxY = y + distance, minY = y - distance,
            rs = this.roles, res = [];
        distance *= distance;
        if (isOri) {
            for (let i = 0; i < rs.length; i++) {
                var target = rs[i].origin_coordination[tick]
                if (this.origin_coordination[tick].scene.name != target.scene.name) continue // 矩形map才需要这一行
                if (target.x > maxX || target.y > maxY || target.x < minX || target.y < minY || rs[i].id == this.id)
                    continue
                var dist = Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
                if (dist <= distance) res.push(rs[i])
            }
            return res
        }
        for (let i = 0; i < rs.length; i++) {
            var target = rs[i].coordination[tick]
            if (this.coordination[tick].scene.name != target.scene.name) continue // 矩形map才需要这一行
            if (target.x > maxX || target.y > maxY || target.x < minX || target.y < minY || rs[i].id == this.id)
                continue
            var dist = Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
            if (dist <= distance) res.push(rs[i])
        }
        return res
    }

    where = (tick, isOri = false) => {
        if (isOri)
            return this.origin_coordination[tick].scene
        return this.coordination[tick].scene
    }

    /**通过ID查找Role
     * 
     * @param {Number[]|Number} id
     * @returns {Role[]|Role}
     */
    findRole = (id) => {
        if (typeof id === typeof []) {
            var rs = []
            for (let i = 0; i < id.length; i++) {
                var _id = id[i]
                for (let j = 0; j < this.roles.length; j++) {
                    if (this.roles[j].id == _id) {
                        rs.push(this.roles[j])
                    }
                }
            }
            return rs
        } else {
            for (let i = 0; i < this.roles.length; i++) {
                if (this.roles[i].id == id) {
                    return this.roles[i]
                }
            }
        }
        return undefined
    }


    traceHighlightData = () => {
        if (!this.infectedIn()) return { nodes: [], links: [] }
        let nodes = this.virusRoad()
        nodes.push(this)
        let links = []
        // upper road
        for (let i = 0; i < nodes.length; i++) {
            let from = last(nodes[i].state).from
            if (from.id == nodes[i].id) continue
            links.push({
                source: from.id,
                target: nodes[i].id
            })
        }
        let rs = this.roles
        for (let i = 0; i < rs.length; i++) {
            let last_state = last(rs[i].state)
            console.log(last_state)
            if (last_state.state == 'susceptible') continue
            if (last_state.from.id == this.id) {
                nodes.push(rs[i])
                links.push({
                    source: last_state.from.id,
                    target: rs[i].id
                })
            }
        }
        return { nodes, links }
    }

    realCoordination2px = (d) => {
        // rect 转化坐标
        var y1 = d.scene.t.y(d.y)
        var x1 = x1 = d.scene.t.x(d.x)
        if (y1 > d.scene.t.rg)
            x1 = d.scene.t.x1(d.x)

        return {
            x: x1,
            y: y1
        }

        // 下面是圆形的坐标转换方式
        // return {
        //     x:this.SceneImp.t.rd2px.x(d.x),
        //     y:this.SceneImp.t.rd2px.y(d.y)
        // }
    }

    //显示点，每次此移动后
    showNode = (tick) => {
        var data = this.coordination[tick]
        // console.log(data, this, tick)
        var svg = config.map.nodes.selector()
        var node_info = {
            ...this.realCoordination2px(data),
            state: this.state[tick].state,
            id: this.id,
            scene: data.scene
        }
        /**
         *  S - circle
         */
        svg
            .selectAll(config.map.node.id(this.id))
            .data([node_info])
            .join('circle')
            .attr('id', config.map.node.format + this.id)
            .attr('class', 'hover-stroke')
            .on('click', () => { this.SceneImp.injects.force_role.value = this.id })
            .transition()
            .duration(1000 / 3)
            .attr('fill', d => config.color[d.state])
            .attr('r', config.map.node.r)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr("stroke", "#111")
            .attr("stroke-opacity", 0.7)
            .attr("stroke-width", 1)
        // .attr('opacity',config.map.node.opacity)
        return node_info
        // config.map.g.nodes.id()
    }



    showLink = (tick) => {
        var center = this.realCoordination2px(this.coordination[tick])
        var nears = this.filterByDistance(tick, this.SceneImp.injects.d.value)
        var svg = d3.select('#' + config.map.links.id)
        for (let i = 0; i < nears.length; i++) {
            var near = nears[i]
            var { x, y } = this.realCoordination2px(near.coordination[tick])
            svg.append('line')
                .attr('x1', x)
                .attr('y1', y)
                .attr('x2', center.x)
                .attr('y2', center.y)
                .attr('stroke', '#999')
                .attr('stroke-width', 2)
        }
    }

    //随机数 
    P = () => {
        return Math.random()
    }

    //场景nei随机位置
    landing = (tick, scene) => {
        // console.log(tick, scene)
        return {
            tick,
            scene,
            // ...circleRandom(scene.scene_center, scene.r),
            //区域内随机位置
            ...rectRandom(scene.range.scene.left.top, scene.range.scene.right.bottom)
        }
    }

    land = (tick, scene) => {
        this.coordination[tick] = this.landing(tick, scene)
    }

    rezone = (tick) => // 重新规划路线, t in (tick, N) 都需要重新生成
    {
        let right = tick + 1 >= this.coordination.length ? this.coordination.length : tick + 1
        let data = this.coordination.slice(0, right)
        // let mapOfScenes = this.mapOfScenes
        let last_scene = last(data).scene
        if (last_scene.name == link_realName2alias('隔离区')) {
            let tmp = Array.from({ length: this.tick - tick + 1 }, (v, i) => {
                let d = { ...last(data) }
                d.tick = tick + i
                return d
            })
            this.coordination = data.concat(tmp)
        }
        else
            this.coordination = data.concat(this.coordination.slice(tick, this.coordination.length))
        // for(let i=tick; i<=this.tick; i++)
        // {
        //     let p = this.P()
        //     let oldLength = data.length
        //     let currentScene = data[oldLength-1].scene.name
        //     let link = this.links[currentScene]
        //     if(link==undefined || currentScene=='隔离区')
        //     {
        //         let new_coor = {...last(data)}
        //         new_coor.tick = i
        //         data.push(new_coor)
        //         continue
        //     }
        //     let dt = t2dt(i)
        //     let sumP = 0
        //     for(let s in link)
        //     {
        //         sumP += link[s][dt.tick].role
        //         if(p <= sumP)
        //         {
        //             data.push(this.landing(i,mapOfScenes[s]))
        //             break
        //         }
        //     }
        //     // TODO:加上场景限制
        //     if(data.length==oldLength)
        //     {
        //         data.push(this.landing(i,mapOfScenes[currentScene]))
        //     }
        // }
        // this.coordination=data
    }

    /**
     * 返回屏幕坐标
     *
     * return { x: Number, y: Number }
     */
    coordinate = () => {
        return {
            x: this._coordinate.x,
            y: this.coordinate.y
        }
    }
}