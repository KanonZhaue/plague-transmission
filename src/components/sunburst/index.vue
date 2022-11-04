<template>
<div>
  <svg id='sunburst-svg'></svg>
</div>
</template>

<script>
import {setup} from "./script"
export default {
    setup
}
</script>

<style scoped>
    div{
        width: 100%;
        height: 59vh;
        overflow: auto;
}
    svg{
        width:100%;
        height:100%;
    }   
</style>