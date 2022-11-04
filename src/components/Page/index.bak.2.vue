<template>
  <div id='page-container'>

    <div class="flex-item" style="flex:1">
        <div class="flex-col">
            
            <card :title="'Panel'" id='Panel'>
                <template v-slot:figure>
                    <Panel></Panel>
                </template>
            </card>

            <card :title="'Ana'" id='Ana'>
                <template v-slot:figure>
                    <Ana/>
                    <!-- <SEIR></SEIR> -->
                </template>
            </card>

        </div>
    </div>
    
    <div class="flex-item" style="flex:2">

        <div class="flex-col">
            <card :title="'Map'" id='Map'>
                <template v-slot:figure>
                    <Map/>
                    <!-- <NetworkMap/> -->
                </template>
                <!-- <template v-slot:icon>
                    <n-switch v-model:value="distanceLine" size='small'>
                        <template #checked>display lines</template>
                        <template #unchecked>hide line</template>
                    </n-switch>
                </template> -->
            </card>
            <div id="River">
                <card title="River">
                    <template v-slot:figure>
                        <River/>
                    </template>
                </card>
            </div>
        </div>

    </div>
    
    <div class="flex-item" style="flex:1.7">
        
        <div class="flex-col">
            <card :title="'Network'" id='Network'>
                <template v-slot:figure>
                    <Network/>
                </template>
            </card>
            <card title="溯源">
                <div id='T3'>溯源</div>
            </card>
        </div>

    </div>

    <!-- <card :title="'Contact'" id='Contact'>
      <template v-slot:figure>
        Contact
      </template>
    </card>

    <card :title="'Risk'" id='Risk'>
      <template v-slot:figure>
        risk
      </template>
    </card> -->

  </div>

  <Tips/>
</template>

<script>
import options from "./script"
export default options
</script>

<style scoped>
@import "./style.2.css";
</style>