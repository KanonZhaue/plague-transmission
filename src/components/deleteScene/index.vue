
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
      <div id="tip_del">
        <h1>Delete Scene</h1>
        
    <div class="elem_del"> 
        <p>Type: </p>
        <select name="Scenes" id="Scene_del" @change="DeleteName($event)">
            <option v-for="(value1,index) in selectSceneData" :key="index" :value="value1.value">
                {{value1.value}}
            </option>
        </select>
    </div>
        <n-button size="tiny" @click="DialogYes">
        Delete
      </n-button>
       <n-button size="tiny" @click="DialogNO">
        Cancel
      </n-button>
      </div>
    </n-space>
  </template>
  
  <script>
  
  import setup from "./script";
  import { injects } from "../../js/injects"
  import bus from '../../utils/index.ts'
  export default {
    
    setup,
    data(){
        let ini = injects()
        
        var selectSceneData1=[]
        console.log(ini['scenes']['_rawValue'])
        for(let i=0;i<ini['scenes']['_rawValue'].length;i++){
            selectSceneData1.push({'index':i,"value":ini['scenes'].value[i]})
        }
        console.log("bta",selectSceneData1)
        return {
            selectSceneData:selectSceneData1
        }
        
    },
    mounted () {
     		// 给bug绑定一个log事件,等待兄弟组件出发
       	bus.on('log', content => {
          // 输出兄弟组件传递的内容
        	console.log("igotit",content)
          this.selectSceneData = content
        })}
    
    
  }
  </script>
  
  <style>
  
  .elem_del{
    flex-direction:row;
    display: flex;
  }
  
  #tip_del>h1 {
    margin: 3px;
    font-size: 15px
  }
  
  #tip_del>p,
  #tip_del>div>p{
    margin: 5px;
    font-size: 15px;
  }
  
  #tip_del>button {
    position: relative;
    /* left: 40vh; */
    margin: 5px;
  }
  </style>