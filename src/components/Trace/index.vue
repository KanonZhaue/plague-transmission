<template>
  <div id="trace-box">
    <svg id="trace-svg"></svg>
  </div>
</template>

<script>
import opt from "./script";
export default opt;
</script>

<style>
#trace-svg {
  height: 32vh;

  /* display: inline; */
}
#trace-box {
  /* 700px */
  width: 100%;
  overflow: auto;
  /* display: inline; */
}
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
#trace-svg-g-axis-y {
  position: fixed;
}
</style>