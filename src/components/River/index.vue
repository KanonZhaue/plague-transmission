<template>
  <n-checkbox-group v-model:value="river_show" style="margin-left: 15px">
    <n-space item-style="display: flex;">
      <n-checkbox value="susceptible" label="S" />
      <n-checkbox value="exposed" label="E" />
      <n-checkbox value="infectious" label="I" />
      <n-checkbox value="recovered" label="R" />
    </n-space>
  </n-checkbox-group>
  <svg id="river-svg"></svg>
</template>

<script>
import { setup } from "./script";
export default {
  setup,
};
</script>

<style>
#river-svg {
  margin-top: 0px;
  width: 100%;
  height: 18.8vh;
}
</style>