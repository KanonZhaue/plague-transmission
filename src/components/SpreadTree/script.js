/* eslint-disable */
var d3=require('d3')
import { onMounted, inject, watch } from 'vue'
import config from '../../conf/config'
import { injects } from '../../js/injects'
import { getIni, last } from '../../js/kit'

export default
{
    setup,
}

function setup() {
    var ini=injects()
    onMounted(()=>{
        display(ini)
    })
    watch(ini.force_role,()=>{display(ini)},{immediate:false})
    watch(ini.stateUpdated,()=>{display(ini)},{immediate:false})
    watch(ini.currentDay,()=>{display(ini)},{immediate:false})
    watch(ini.currentTick,()=>{display(ini)},{immediate:false})
}

function display(ini)
{
    var _ini=ini
    ini=getIni(ini)
    var svg=d3.select("#spread-tree-svg").html('')
    var conf={
        height:svg.node().clientHeight,
        width:svg.node().clientWidth
    }
    let margin={
        left:10,
        right:10,
        top:10,
        bottom:10
    }
    let legend_conf = {
        width:50,
        height:50,
        size:10
    }
    var tree=d3.tree().size([conf.width-margin.left-margin.right,conf.height-margin.top-margin.bottom])
    var force_uid=ini.force_role
    force_uid= force_uid==null?0:force_uid
    var data=ini.scene.spreadTree(force_uid)
    if(!data) return
    data=d3.hierarchy(data)
    tree(data)
    let nodes=data.descendants()
    ,   links=data.links()
    var g={
        links:svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`),
        nodes:svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`),
        // legend:svg.append('g').attr('transform',`translate(${},${})`)
    }
    let lineGen=d3.linkVertical().x(d=>d.x).y(d=>d.y)
    // console.log(links)
    g.nodes
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('cx',d=>d.x)
        .attr('cy',d=>d.y)
        .attr('class','hover-stroke')
        .attr('r',config.map.node.r)
        .attr('opacity',config.map.node.opacity)
        // .attr('fill',d=>config.color[last(d.data.role.state).state])
        .attr('fill',d=>d.data.infected_in.color)
        .attr('stroke','#000')
        .attr('stroke-width',d=>d.data.role.id==force_uid?5:0)
        .on('click',(e)=>{
            let d=e.path[0].__data__
            _ini.force_role.value=d.data.role.id
        })
    g.links
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('d',lineGen)
        .attr('stroke','#ccc')
        .attr('stroke-width',1)
        .attr('fill','none')
}