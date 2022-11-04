/* eslint-disable */
import { Scene } from '../../js/Scene'
import { onMounted, inject, watch, } from 'vue'
import { injects } from '../../js/injects'
import { dt2t } from '../../js/kit'
import config from '../../conf/config'
var d3=require('d3')
export default function setup() {
    var scene=new Scene('#map-svg')
    var distanceLine=inject('distanceLine')
    var ini=injects()
    inject('scene').value=scene
    scene.loadDefault()
    var {currentTick,currentDay,ticks,N,}=injects()
    scene.generateRoles(N.value)
    function updateMap(){
        sceneNetwork(ini)
    }
    onMounted(()=>{
        // 初始化高度
        var title_height=document.querySelector('#Map .card-title').offsetHeight
        var map_svg_height=document.querySelector('#Map').offsetHeight-title_height
        var svg=d3.select('#map-svg')
        svg.attr('height',map_svg_height)
        scene.init()
        scene.updateStateOfRoles()
        updateMap()
    })
    watch(currentTick,()=>{updateMap()})
    watch(distanceLine,()=>{updateMap()})
    watch(currentDay,()=>{updateMap()})
    watch(inject('iniChanged'),()=>{
        scene.updateStateOfRoles()
        updateMap()
    },{immediate:false})
    return { }
}


function nodeColor(state)
{
    return config.color[state]
}

function sceneNetwork(_ini){
    var ini={}
    for(let k in _ini)
    {
        ini[k]=_ini[k].value
    }
    var t=dt2t(ini.currentDay,ini.currentTick)
    var {nodes,links}=ini.scene.touchDataByTick(t)
    var svg=d3.select('#map-svg')
    svg.html('')
    var conf={
        height:svg.node().clientHeight,
        width:svg.node().clientWidth
    }
    var _max={},_min={}
    for(let i=0;i<links.length;i++)
    {
        var sc=links[i].scene
        var dist=links[i].distance
        if(sc==undefined) continue
        if(_max[sc]==undefined)
        {
            _max[sc]=dist
            _min[sc]=dist
        }
        else
        {
            _max[sc]=d3.max([_max[sc],dist])
            _min[sc]=d3.min([_min[sc],dist])
        }
    }
    console.log('_MAX',_max,_min)
    var T={}
    for(let k in _max)
    {
        T[k]=d3.scaleLinear()
                .domain([_min[k],_max[k]])
                .range([0,150])
    }
    function distance(link)
    {
        if(link.scene!=undefined)
        {
            return T[link.scene](link.distance)
        }
        return link.distance
    }
    var g={
        g:svg.append('g').attr('id','nw-g'),
        nodes:svg,
        links:svg,
        simulation:d3.forceSimulation(nodes)
    }
    g.links=g.g.append('g').attr('id','links-g')
    g.nodes=g.g.append('g').attr('id','nodes-g')
    g.simulation
        .force("link",d3.forceLink(links).id((d) => d.id).distance(d=>distance(d)))
        .force("many-body", d3.forceManyBody().strength(-1))
        .force("center", d3.forceCenter(conf.width / 2, conf.height / 2).strength(1.5))
        // .force('collision',d3.forceCollide(ini.collision))
    g.links=g.links.selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke','#ccc')
        .attr('stroke-width',d=>d.display?1:0)
    g.nodes=g.nodes.selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r',3)
        .attr('stroke','#fff')
        .attr('stroke-width',1)
        .attr('fill',d=>d.type=='scene'?'rgba(0,0,0,0)':nodeColor(d.state[t].state))
        // .attr('fill','#333')
    g.simulation
        .on("end", () => {
            g.links
                .attr('id',d=>`link-${d.source.id}-${d.target.id}`)
                .attr("x1", (d) => {
                    return d.source.x
                })
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
            g.nodes
                .attr("cx", d =>d.x)
                .attr('cy',d=>d.y)
        });
}
