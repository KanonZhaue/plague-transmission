<!-- <template>
  <n-dropdown 
    :options="options"
    size = "small"
    @select="handleSelect">
    <n-button style="height:20px; margin-left:50px; margin-top: 2px">Add Scene</n-button>
  </n-dropdown>
</template> -->

<template>
  <n-space>
    <div id="tip">
      <h1>Add Scene</h1>
      <!-- <n-dropdown n-dropdown
    :options="options"
    size = "small"
    @select="handleSelect">
    <n-button>Add Scene</n-button>
  </n-dropdown> -->

  <!-- <div class="elem">
    <p>Type: </p>
    <n-select   :options="options" size="small" style="width:200px;margin: 4px;" />
  </div> -->

  <div class="elem"> 
      <p>Name: </p>
      <n-input  type="text" size="small" style="width:200px;margin: 4px;" @input="inputName"/>
  </div>
  <div class="elem"> 
      <p>Size: </p>
      <n-input-number  :show-button ="false" placeholder="" clearable size="small" style="width:100px;margin: 4px;" @update:value = "Size_x"/>
      <p>X</p>
      <n-input-number  :show-button ="false" placeholder="" clearable size="small" style="width:100px;margin: 4px;" @update:value = "Size_y"/>
  </div>
  <div class="elem">
      <p>AvgTime: </p>
      <n-slider    :step="1" :max="4" :min="1" style="width:200px;margin: 4px;"  @update:value = "Avgtime"/>
  </div>
  <div class="elem">    
      <p>Distance: </p>
      <n-slider  :step="2" :max="10" :min="0" style="width:200px;margin: 4px;" @update:value = "Dist"/>
  </div>
  <div class="elem">
      <p>Popularity: </p>
      <n-slider  :step="0.2" :max="5" :min="0" style="width:200px;margin: 4px;" @update:value = "Popularity"/>
  </div >
      <n-button size="tiny" @click="DialogYes">
      Create
    </n-button>
     <n-button size="tiny" @click="DialogNO">
      Cancel
    </n-button>
    </div>
  </n-space>
</template>

<script>

import setup from "./script";
export default {
  setup,
};
</script>

<style>

.elem{
  flex-direction:row;
  display: flex;
}

#tip>h1 {
  margin: 3px;
  font-size: 15px
}

#tip>p,
#tip>div>p{
  margin: 5px;
  font-size: 15px;
}

#tip>button {
  position: relative;
  /* left: 40vh; */
  margin: 5px;
}
</style>