<template>
  <svg id="parallel-svg"></svg>
  <svg id="parallel-svg-mini"></svg>
</template>

<script>
import {setup} from "./parallel"

export default {
setup,
}
</script>

<style>
#parallel-svg {
    width: 100%;
    height: 65%;
    position: absolute;
}
#parallel-svg-mini{
    width: 100%;
    height: 25%;
    top: 75%;
    position: absolute;
}
</style>