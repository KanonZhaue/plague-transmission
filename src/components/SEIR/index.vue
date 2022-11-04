<template>
  <svg id="SEIR-svg"></svg>
</template>

<script>
import { setup } from "./script";
export default {
  setup,
};
</script>

<style>
#SEIR-svg {
  margin-top: -3px;
  width: 100%;
  height: 22.5vh;
}
.seir-tick-data {
  opacity: 0;
}
.seir-tick-data:hover {
  opacity: 1;
}
#dataline-window {
  opacity: 0.8;
}
</style>