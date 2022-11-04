<template>
  <div id='page-container'>
    <!-- 屏幕上半部分：控制面板、散点 -->
    <card :title="'Panel'" id='Panel'>
      <template v-slot:figure>
        <Panel></Panel>
      </template>
    </card>

    <card :title="'Map'" id='Map'>
      <template v-slot:figure>
        <Map/>
      </template>
    </card>

    <card :title="'SEIR'" id='SEIR'>
      <template v-slot:figure>
        <SEIR></SEIR>
      </template>
    </card>

    <card :title="'Contact'" id='Contact'>
      <template v-slot:figure>
        Contact
      </template>
    </card>

    <card :title="'Network'" id='Network'>
      <template v-slot:figure>
        <Network/>
      </template>
    </card>

    <card :title="'Risk'" id='Risk'>
      <template v-slot:figure>
        risk
      </template>
    </card>

  </div>
</template>

<script>
import options from "./script"
export default options
</script>

<style scoped>
@import "./style.2.css";
</style>