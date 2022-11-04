<template>
  <n-message-provider>
    <div id="page-container">
      <div id="first_row">
        <n-card
          title="Control Panel"
          size="small"
          id="Panel"
          content-style="padding:0"
          :header-style="header_style"
        >
          <!-- <Clock /> -->
          <Panel></Panel>
        </n-card>
      </div>

      <div id="second_row">
        <n-card
          :title="'Map'"
          id="Map"
          content-style="padding:0"
          size="small"
          :header-style="header_style"
        >
          <template #header-extra>
            <div style="display: flex; width: 250px">
              <Clock />
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

        <n-card
          :title="'Story Line'"
          id="storyline"
          content-style="padding:0"
          size="small"
          :header-style="header_style"
        >
          <Storyline />
        </n-card>
      </div>

      <div id="third_row">
        <n-card
          size="small"
          id="SEIR"
          title="SEIR Curve"
          content-style="padding:0"
          :header-style="header_style"
        >
          <!-- <Ana/> -->
          <template #header-extra>
            <!-- <n-button @click="printDataInJSON()">PRINT</n-button> -->
          </template>
          <SEIR />
        </n-card>

        <n-card
          title="River"
          id="river"
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
              <n-radio-group v-model:value="river_content" size="small">
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

        <n-card
          title="Contact Matrix"
          id="Trace"
          content-style="padding:0"
          size="small"
          :header-style="header_style"
        >
          <template #header-extra>
            <!-- <n-space align="center">
                        <div style="margin-right:12px"> -->
            <svg
              height="16px"
              width="150px"
              style="margin-top: 3px"
              id="trace-legend"
            >
              <!-- <g><rect x="30" y="3" width="12" height="12" fill="none" stroke="#111" stroke-wdth="1"></rect><text font-size="18" x="44" y="15">S</text><rect x="61" y="3" width="12" height="12" fill="none" stroke="#111" stroke-wdth="1"></rect><path d="M61,3L73,15M61,15L73,3" fill="none" stroke="#111" stroke-wdth="1"></path><text font-size="18" x="75" y="15">E</text><rect x="92" y="3" width="12" height="12" fill="none" stroke="#111" stroke-wdth="1"></rect><path d="M92,9L98,3M92,15L104,3M98,15L104,9M98,3L104,9M92,3L104,15M92,9L98,15" fill="none" stroke="#111" stroke-wdth="1"></path><text font-size="18" x="106" y="15">I</text><rect x="123" y="3" width="12" height="12" fill="none" stroke="#111" stroke-wdth="1"></rect><path d="M123,3L129,15M129,15L135,3" fill="none" stroke="#111" stroke-wdth="1"></path><text font-size="18" x="137" y="15">R</text></g> -->
            </svg>
            <!-- ID: {{ trace_id==null?'NULL':trace_id }} -->
            <!-- </div> -->
            <!-- Traceability Date
                        <n-input-number style="width:100px" v-model:value="trace_days" step="0" min="0" :max="days-1"/> -->
            <!-- <n-pagination v-model:page="trace_page" :page-count="n_trace_pages" :page-slot="5"/> -->
            <!-- </n-space> -->
          </template>
          <Trace />
        </n-card>
      </div>
    </div>

    <div id="other">
      <div id="net" style="width: 438px">
      <n-card
            :title="'Virus Spread'"
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
                size="small"
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
          </n-card></div>
    </div>
  </n-message-provider>
</template>

<script>
import options from "./script";
export default options;
</script>

<style scoped>
@import "./style3.css";
</style>