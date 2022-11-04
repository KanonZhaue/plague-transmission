/* eslint-disable */
import { onMounted, watch, inject } from "vue";
import { injects } from "../../js/injects";
import { dt2t } from "../../js/kit";
var d3=require('d3')

export function setup() {
    var ini=injects()
    onMounted(()=>{
        update(ini)
    })
    var ws=['currentTick','currentDay','stateupdated']
    for(let i=0;i<ws.length;i++)
        watch(inject(ws[i]),()=>{
            update(ini)
        },{immediate:false})
}

function update(_ini)
{
    var ini={}
    for(let k in _ini)
    {
        ini[k]=_ini[k].value
    }
    var svg=d3.select('#risk-svg')
    svg.html('')
    var conf={
        height:svg.node().clientHeight,
        width:svg.node().clientWidth,
        yUp:1,
        yDown:-0.5
    }
    var margin={
        top:10,
        bottom:100,
        left:5,
        right:5
    }
    var x=d3.scaleLinear()
            .domain([0,ini.scene.nodes.length])
            .range([0,conf.width-margin.left-margin.right]),
        y=d3.scaleLinear()
            .domain([conf.yDown,conf.yUp])
            .range([conf.height-margin.top-margin.bottom,0]),
        realY=d3.scaleLinear()
            .domain([conf.yDown,conf.yUp])
            .range([0,conf.height-margin.top-margin.bottom])
    var axis={
        x:d3.axisBottom(x),
        y:d3.axisLeft(y),
        fontSize:8,
        textSize:10
    }
    var parallel=svg.append('g').attr('id','y-axis')
                    .attr('transform',`translate(${margin.left},${margin.top})`)
    svg.append('g')
        .attr('transform',`translate(${margin.left},${margin.top})`)
        .attr('id','x-axis')
        .append('line')
        .attr('x1',x(0))
        .attr('x2',x(ini.scene.nodes.length))
        .attr('y1',y(conf.yDown))
        .attr('y2',y(conf.yDown))
        .attr('stroke','#222')
        .attr('stroke-width',1)
    for(let i=conf.yDown+0.1;i<=conf.yUp;i+=0.1)
    {
        parallel
            .append('line')
            .attr('x1',x(0))
            .attr('x2',x(ini.scene.nodes.length))
            .attr('y1',y(i))
            .attr('y2',y(i))
            .attr('stroke','#eee')
            .attr('stroke-width',0.5)
        parallel
            .append('text')
            .attr('x',x(ini.scene.nodes.length)-axis.fontSize*1.3)
            .attr('y',y(i)+axis.fontSize/2)
            .attr('font-size',axis.fontSize)
            .text(Math.round(i*10)/10)
    }
    var name2index={}, index2name={}
    for(let i=0;i<ini.scene.nodes.length;i++)
    {
        name2index[ini.scene.nodes[i].name]=i
    }
    var min_={},   max_={},
        tick=dt2t(ini.currentDay,ini.currentTick)
    var T=(ini.ticks-1)*ini.days
    for(let i=0;i<T;i++)
    {
        var data=ini.scene.riskDataByTick(i)
        for(let k in data)
        {
            if(min_[k]==undefined)
            {
                min_[k]=data[k]
                max_[k]=data[k]
            }
            else
            {
                min_[k]=d3.min([min_[k],data[k]])
                max_[k]=d3.max([max_[k],data[k]])
            }
        }
    }
    var radius={}, sum_d=0
    for(let k in min_)
    {
        radius[k]=(realY(max_[k])-realY(min_[k]))/2
        sum_d+=radius[k]
    }
    sum_d*=2
    var x_by_d=d3.scaleLinear()
                .domain([0,sum_d])
                .range([0,conf.width-margin.left-margin.right])
    var data=ini.scene.riskDataByTick(tick)
    var dataArr=[]
    for(let k in data)
    {
        dataArr.push({
            index:name2index[k],
            value:data[k],
            scene:k
        })
    }
    function cal_x_in_sceneName(d)
    {
        var offset=0
        for(let i=0;i<ini.scene.nodes.length;i++)
        {
            var sc=ini.scene.nodes[i].name
            if(sc==d) break
            offset+=radius[sc]*2
        }
        offset+=radius[d]
        return x_by_d(offset)
    }
    svg.append('g')
        .attr('id','risk-circles')
        .selectAll('circle')
        .data(dataArr)
        .join('circle')
        .attr('r',d=>radius[d.scene])
        // .attr('cx',d=>x(d.index))
        .attr('cx',d=>cal_x_in_sceneName(d.scene))
        .attr('cy',d=>y(d.value))
        .attr('fill','#ccc')
        .attr('stroke-width',1)
        // .attr('stroke','#555')

    svg.append('g')
        .attr('transform',`translate(${margin.left},${margin.top})`)
        .attr('id','x-ticks')
        .selectAll('text')
        .data(ini.scene.nodes)
        .join('text')
        // .attr('x',(d,i)=>x(i+0.5)-d.name.length*axis.textSize/2)
        .attr('x',d=>cal_x_in_sceneName(d.name)-d.name.length*axis.textSize/2+axis.textSize)
        .attr('y',y(conf.yDown)+axis.textSize)
        .attr('font-size',axis.textSize)
        .text(d=>d.name)
        .attr('style','writing-mode: tb;letter-spacing:-2px')

    if(tick>T) return
    var image=svg.append('g')
            .attr('id','imageCircle')
        ,next=ini.scene.riskDataByTick(tick+1)
    var nextArr=[]
    for(let k in next)
    {
        nextArr.push({
            index:name2index[k],
            value:next[k],
            scene:k
        })
    }
    image.selectAll('circle')
        .data(nextArr)
        .join('circle')
        .attr('r',d=>radius[d.scene])
        .attr('cx',d=>cal_x_in_sceneName(d.scene))
        .attr('cy',d=>y(d.value))
        .attr('fill','none')
        .attr('stroke-dasharray','3 2')
        .attr('stroke-width',1)
        .attr('stroke','#222')

    var arrows=[]
    for(let k in data)
    {
        arrows.push({
            source:data[k],
            target:next[k],
            scene:k
        })
    }

    function Genline(d)
    {
        console.log(d)
        var {source,target}=d
        var path=d3.path()
        var x_coo=cal_x_in_sceneName(d.scene)
            ,sy=y(source)
            ,ty=y(target)
        path.moveTo(x_coo,sy)
        path.lineTo(x_coo,ty)
        path.moveTo(x_coo,ty)
        if(ty>sy) // 箭头朝下
        {
            path.lineTo(x_coo-2,ty-2)
            path.moveTo(x_coo,ty)
            path.lineTo(x_coo+2,ty-2)
        }
        else
        {
            path.lineTo(x_coo-2,ty+2)
            path.moveTo(x_coo,ty)
            path.lineTo(x_coo+2,ty+2)
        }
        return path.toString()
    }
    svg.append('g')
        .attr('id','risk-arrow-g')
        .selectAll('path')
        .data(arrows)
        .join('path')
        .attr('d',Genline)
        .attr('stroke','#222')
        .attr('stroke-width',1)
    // svg.append('g')
    //     .attr('transform',`translate(${margin.left},${conf.height-margin.bottom})`)
    //     .call(axis.x)
    // svg.append('g')
    //     .attr('transform',`translate(${margin.left},${margin.top})`)
    //     .call(axis.y)
}