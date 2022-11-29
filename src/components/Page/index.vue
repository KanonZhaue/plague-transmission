<template>
  <n-message-provider>
    <div id="page-container">
      <div class="flex-item" style="flex: 1">
        <div class="flex-col">
          <n-card
            title="Control Panel"
            size="small"
            id="Panel"
            content-style="padding:0"
            :header-style="header_style"
          >
            <Clock />
            <Panel></Panel>
          </n-card>

          <n-card
            size="small"
            id="SEIR"
            title="SEIR Curve"
            content-style="padding:0"
            :header-style="header_style_small"
          >
            <template #header-extra> </template>
            <SEIR />
          </n-card>
        </div>
      </div>

      <div class="flex-item" style="flex: 2">
        <div class="flex-col">
          <n-card
            :title="'Map'"
            id="Map"
            content-style="padding:0"
            size="small"
            :header-style="header_style"
          >
            <template #header-extra>
              <div style="display: flex; width: 250px">
                <!-- <Clock /> -->
              </div>
              <div
                style="
                  display: flex;
                  width: 120px;
                  margin-left: 200px;
                  margin-right: -30px;
                "
              >
                <Player />
              </div>
            </template>
            <Map />
          </n-card>

         

          <!-- <n-card
            title="Regions River"
            content-style="padding:0"
            size="small"
            :header-style="header_style"
          >
            <template #header-extra>
              <n-space align="center">
                Tick Slider
                <n-input-number
                  v-model:value="river_range"
                  min="1"
                  style="width: 100px"
                  :max="n_ticks"
                />
                <n-radio-group v-model:value="river_content">
                  <n-radio-button value="delta" key="delta">
                    DELTA
                  </n-radio-button>
                  <n-radio-button value="normal" key="normal">
                    NORMAL
                  </n-radio-button>
                </n-radio-group>
              </n-space>
            </template>
            <River />
          </n-card> -->
        </div>


      </div>

      <div class="flex-item" style="flex: 1.5">
        <div class="flex-col">
          <n-card
            :title="'Virus Spread Network'"
            id="Network"
            content-style="padding:0"
            size="small"
            :header-style="header_style"
          >
            <template #header-extra>
              Tree depth
              <n-input-number
                v-model:value="tree_depth_filter"
                min="1"
                size="tiny"
                style="width: 150px; margin-right: 12px"
                placeholder="input depth"
                :max="tree_max_depth"
              />
              <img
                src="icon/recovery.svg"
                class="player-icon"
                @click="recoveryNetwork++"
              />
            </template>
            <!-- <SpreadTree/>  -->
            <Network />
          </n-card>

          <!-- <n-card :title="'Network'" id='Network' content-style="padding:0" size="small" :header-style='header_style'>
                    <Network/>
            </n-card> -->
          <!-- <n-card
            title="Contact Matrix"
            content-style="padding:0"
            size="small"
            :header-style="header_style"
          >
            <template #header-extra>
             <svg
                height="16px"
                width="150px"
                style="margin-top: 3px"
                id="trace-legend"
              >
             </svg>
            
            </template>
            <Trace />
          </n-card> -->
        </div>
      </div>
    </div>


    <div style="flex-direction: row;  display: flex;">
    <div id="_river" style="width: 341px">
      <n-card
        title="River"
        content-style="padding:0"
        size="small"
        :header-style="header_style"
      >
        <template #header-extra>
          <n-space align="center">
            Tick
            <!-- Tick Slider -->
            <n-input-number
              v-model:value="river_range"
              min="1"
              style="width: 85px"
              size="tiny"
              :max="n_ticks"
            />
            <!-- style="width:100px" -->
            <n-radio-group v-model:value="river_content" size="tiny">
              <n-radio-button value="delta" key="delta" size="tiny">
                D
              </n-radio-button>
              <!-- DELTA   NORMAL-->
              <n-radio-button value="normal" key="normal" size="tiny">
                N
              </n-radio-button>
            </n-radio-group>
          </n-space>
        </template>
        <River />
      </n-card>
    </div>

    <div id="Parallel">
       <n-card
          :title="'Story Line'"
          id="storyline"
          content-style="padding:0"
          size="small"
          :header-style="header_style"
        >
        <template #header-extra>
          <n-space align="center">
            
            <n-radio-group v-model:value="storyline_pattern"  size="tiny">
              <n-radio-button value="contact" key="contact" size="tiny" >
                Contact
              </n-radio-button>
      
              <n-radio-button value="transmission" key="transmission" size="tiny" >
                Transmission
              </n-radio-button>
            </n-radio-group>
          </n-space>
        </template>
          <Parallel />
        </n-card>
    </div>
    </div>
    <!-- style="flex-direction: row;  display: flex;" -->
    <!-- <div style="flex-direction: row;  display: flex;">
<n-card
            title="Contact Matrix"
            content-style="padding:0"
            size="small"
            :header-style="header_style"
          >
            <template #header-extra>
             <svg
                height="16px"
                width="150px"
                style="margin-top: 3px"
                id="trace-legend"
              >
             </svg>
            
            </template>
            <Trace />
          </n-card>
<n-card
          :title="'Netbox'"
          id="Netbox"
          content-style="padding:0"
          size="small"
          :header-style="header_style"
        >
          <Netbox />
        </n-card>
<n-card
          :title="'Sunburst'"
          id="Sunburst"
          content-style="padding:0"
          size="small"
          :header-style="header_style"
        >
          <Sunburst />
        </n-card>
</div> -->
    <Tips />

    <!-- 提示框 tooltip -->
    <div id="TooltipAddScene">
     <AddScene></AddScene>
    </div>
    <div id="TooltipDelScene">
     <DelScene></DelScene>
    </div>
  </n-message-provider>
</template>

<script>
import options from "./script";


export default options;
</script>

<style scoped>
@import "./style.2.css";
</style>