<template>
  <svg id='network-legend'></svg>
  <svg id='network-svg'></svg>
</template>

<script>
import {setup} from "./script"
export default {
    setup
}
</script>

<style scoped>
    svg{
        width:100%;
        height:59vh;
    }
    #network-legend{
        pointer-events: none;
        position: absolute;
        top:40px;
        left: 0;
    }
</style>