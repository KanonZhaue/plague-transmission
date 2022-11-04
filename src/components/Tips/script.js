/* eslint-disable */
var d3=require('d3')
import { onMounted , ref} from 'vue'
import { injects } from '../../js/injects'

export default {setup}

function setup() {
    var ini = injects()
    let conf={
        width:document.body.clientWidth,
        height:document.body.clientHeight
    }
    let bias = {
        x:10,
        y:10
    }
    let min_size={
        width: 120,
        height:120,
    }
    let dx=ref(0),
        dy=ref(0)
    document.onmousemove=(e)=>{
        let {clientX, clientY} = e
        let x = clientX + bias.x
        ,   y = clientY + bias.y
        if(x+min_size.width>conf.width) x=conf.width-min_size.width
        if(y+min_size.height>conf.height) y=conf.height-min_size.height
        dx.value=x
        dy.value=y
    }
    return {
        ...ini,
        dx,dy
    }
}