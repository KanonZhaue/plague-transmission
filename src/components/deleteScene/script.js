import { injects } from "../../js/injects"
import conf from "../../conf/cls8"
import { reactive, inject, watch } from 'vue'
import bus from '../../utils/index.ts'


export default function setup() {
    

    var ini = injects();
    console.log(ini)
    var SceneName = ini.scenes._rawValue[0]
    watch(inject('addScene'), () => {
        var selectSceneData1=[]
        console.log("watchDone",ini['scenes']['_rawValue'])
        for(let i=0;i<ini['scenes']['_rawValue'].length;i++){
            selectSceneData1.push({'index':i,"value":ini['scenes'].value[i]})
        }
        bus.emit('log', selectSceneData1)})
    
    return {
        DialogYes() {

            document.getElementById("TooltipDelScene").style.display = "none";
            // index = ini['SceneTypeNum']['value'][ini['SceneType']['value'].indexOf(SceneType)]


            ini["delScene"].value +=1
            let NameIndex = ini['scenes']['_rawValue'].indexOf(SceneName)
            ini['DelSceneIndex'] = NameIndex
            // ini['SceneTypeNum'][ini['SceneType']['value'].indexOf(ini['scene']['value']['conf'][NameIndex][])]+=1
            window.reDrawSceneRects()
        },
        DialogNO() {
            console.log("iniiiiiiiiiiiiii",ini)
            document.getElementById("TooltipDelScene").style.display = "none";
        },
        DeleteName(event){
            console.log(event)
            SceneName = event.target.value
            // SceneType = event.target.value;
        },
    }
}