<template>
  <div id="Panel-body">
    <div style="display: flex; width: 100%; padding-bottom: 10px">
      <p
        style="
          flex: 3;
          text-align: left;
          font-size: 15px;
          margin-top: 2px;
          margin-left: 8px;
        "
      >
        N-People
      </p>
      <n-input-number
        v-model:value="temp_N"
        placeholder="SIZE"
        size="tiny"
        style="flex: 5; margin: 3px 3px"
      />
      <n-button
        style="flex: 1; margin: 3px 2px"
        size="tiny"
        @click="N = temp_N"
        >Resize</n-button
      >
    </div>
    <!-- <div class=flex-col-item>
        <n-input-number
            v-model:value="temp_N"
            placeholder="SIZE"
        />
    </div>
    <div class=flex-col-item>
        <n-button class=btn @click="N=temp_N" size="small">Resize</n-button>
    </div> -->

    <Item name="Day" style="font-size: 12px;">
      <n-slider v-model:value="currentDay" :step="1" :min="0" :max="days - 1" />
    </Item>
    <Item name="Tick" style="font-size: 12px">
      <n-slider
        v-model:value="currentTick"
        :step="1"
        :min="0"
        :max="ticks - 1"
      />
    </Item>

    <!-- <div class=flex-col-item></div> -->
    <div style="display: flex; width: 100%; padding-top: 2px">
      <n-button
        class="half-btn"
        @click="
          action_now();
          iniChanged++;
        "
        size="tiny"
        >Take Action</n-button
      >
      <n-button
        class="half-btn"
        @click="
          start_isolation = true;
          iniChanged++;
        "
        size="tiny"
        >Start Isolation</n-button
      >
    </div>
    <!-- <n-space>
        <n-button class="btn" @click="start_isolation=true;iniChanged++" size="small">Take Action</n-button>
        <n-button class="btn" @click="start_isolation=true;iniChanged++" size="small">Start Isolation</n-button>
    </n-space> -->
    <!-- <Item name="r">
        <n-slider v-model:value="r" :step="1" :min="1" :max="15" />
    </Item> -->
    <!-- <Item name="Scene">
        <n-popselect trigger="click">
            <n-button>{{ value || '弹出选择' }}</n-button>
        </n-popselect>
    </Item> -->
    <div class="flex-col-item" style=" flex-direction: row; display:flex;">
      <div class="subtitle">Scene Config ({{ seleted_scene }})</div>
      <div>
        <n-button size="tiny" @click="AddDialog">
      AddScene
    </n-button>
    </div>
    </div>

    <!-- <div class=flex-col-item>
        <n-select v-model:value="seleted_scene" :options="nodes" />
    </div>
    <div class=flex-col-item>
        <n-button class="btn" @click="changeConfig++" size='small'>Storage</n-button>
    </div>
    <div class=flex-col-item>
        <n-button class=btn @click="iniChanged++" size="small">Update</n-button>
    </div>  -->
    <n-spcae>
      <n-button
        @click="chooseScene('default')"
        size="tiny"
        style="margin: 1px 2px; color: #222"
      >
        default
      </n-button>
      <n-button
        v-for="node in scene.nodes"
        :key="node.name"
        :color="node.color"
        @click="chooseScene(node.name)"
        size="tiny"
        style="margin: 2px 2px; color: #222"
      >
        {{ node.name }}
      </n-button>
    </n-spcae>
    <!-- <n-space justify="center"> -->
    <div style="display: flex; width: 60%; margin-top: 1px">
      <n-button class="btn" @click="changeConfig++" size="tiny"
        >Storage</n-button
      >
      <n-button
        class="btn"
        @click="iniChanged++"
        size="tiny"
        style="margin-left: 180px"
        >Update View</n-button
      >
    </div>
    <!-- <n-select v-model:value="seleted_scene" size="small" :options="nodes" /> -->
    <!-- </n-space> -->
    <!-- <Radar/> -->

    <!-- <Radar /> -->

    <Item name="传染概率:" style="margin-top: 5px; font-size: 13px">
      <n-slider v-model:value="beta" :step="0.01" :min="0" :max="1" />
      <p
        style="
          margin-left: -5px;
          letter-spacing: 115px;
          margin-right:-800px;
          margin-top: -8px;
        "
      >
        0 1
      </p>
    </Item>
    <Item name="医疗能力:" style="margin-top: -8px; font-size: 13px">
      <n-slider v-model:value="med" :step="0.01" :min="0" :max="1" />
        <p
        style="
          margin-left: -5px;
          letter-spacing: 115px;
          margin-right:-800px;
          margin-top: -8px;
        "
      >
        0 1
      </p>
    </Item>
    <Item name="管控力度:" style="margin-top: -8px; font-size: 13px">
      <n-slider v-model:value="delta" :step="0.001" :min="0" :max="1" />
        <p
        style="
          margin-left: -5px;
          letter-spacing: 115px;
          margin-right:-800px;
          margin-top: -8px;
        "
      >
        0 1
      </p>
    </Item>
    <Item name="传播距离:" style="margin-top: -8px; font-size: 13px">
      <n-slider v-model:value="dist" :step="0.01" :min="0" :max="5" />
       <p
        style="
          margin-left: -5px;
          letter-spacing: 115px;
          margin-right:-800px;
          margin-top: -8px;
        "
      >
        0 5
      </p>
    </Item>
  </div>
</template>

<script>
/*eslint-disable */
import setup from "./script";
import Item from "./Item";
import Radar from "../Radar";


export default {
  components: { Item, Radar },
  setup,
};
</script>

<style>
.flex-col-item {
  width: 98%;
  margin: 0px auto;
}
.btn {
  /* width: 50%; */
  margin: 1px 2px;
  flex: 1;
}
.half-btn {
  flex: 1;
  margin: -7px 2px 0 2px;
}
</style>