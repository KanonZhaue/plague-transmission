<template>
  <n-space>
    <n-space>{{ now_tick }}</n-space>
    <n-space
      ><img class="player-icon" src="icon/restart.svg" @click="restart"
    /></n-space>
    <n-space v-if="playing"
      ><img class="player-icon" src="icon/break.svg" @click="breakPlayer"
    /></n-space>
    <n-space v-else
      ><img class="player-icon" src="icon/play_2.svg" @click="run_from"
    /></n-space>
    <!-- <n-space><img class="player-icon" src="icon/run-from.svg" @click="run_from"></n-space> -->
  </n-space>
</template>

<script>
import opt from "./script";
export default opt;
</script>

<style>
.player-icon {
  padding-top:2px;
  height: 18px;
}
</style>