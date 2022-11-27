import { injects } from "../../js/injects"
import conf from "../../conf/cls8"
class newScene {
    constructor(type,index, size, dist, popul, avgtime) {
        this.type = type;
        this.index = index;
        this.size = { x: size.x, y: size.y };
        this.distance = dist;
        this.popularity = popul;
        this.avgTime = avgtime;
    }
}

let scenes = []

export default function setup() {
    var ini = injects();
    var Name = null,
        SceneType = "Rest Area",
        index = 0,
        size = { x: 0, y: 0 },
        dist = 0,
        popul = 0,
        avgtime = 0;

    return {
        DialogYes() {
            document.getElementById("Tooltip").style.display = "none";
            console.log(SceneType)
            console.log(ini)
            console.log(ini['SceneTypeNum'])
            console.log(ini['SceneType']['value']);
            console.log(SceneType)
            index = ini['SceneTypeNum'][ini['SceneType']['value'].indexOf(SceneType)]
            var scene = new newScene(SceneType,index, size, dist, popul, avgtime);
            // scenes.push(scene)
            ini["addScene"].value += 1
            ini["newScene"].value = scene
            ini['SceneTypeNum'][ini['SceneType']['value'].indexOf(SceneType)]+=1
            // ini['SceneTypeNum'].value[]
            console.log("adddd",ini)
            let node = conf.nodes
            console.log('node1',node)
            window.reDrawSceneRects()
        },
        DialogNO() {
            document.getElementById("Tooltip").style.display = "none";
        },
        options: [
            {
                label: "Office 1",
                value: "Office 1",

            },
            {
                label: "Office 2",
                value: "Office 2",

            },
            {
                label: "Dormitory",
                value: "Dormitory",
            },
            {
                label: "Entertainment",
                value: "Entertainment",

            },
            {
                label: "Administrative",
                value: "Administrative",

            },
            {
                label: "Canteen",
                value: "Canteen",
            }
        ],

        inputName(key) {
            Name = key
            // console.log(Name)
        },
        inputType(event){
            console.log(event)
            SceneType = event.target.value;
             //获取option对应的value值 select_class_id是后台约定的提交数据的名称
        },
        Size_x(key) {
            size.x = key;
        },
        Size_y(key) {
            size.y = key;
        },
        Dist(key) {
            dist = key;
        },
        Popularity(key) {
            popul = key;
        },
        Avgtime(key) {
            avgtime = key
        }
    }
}
// function getReDraw1(that){
//     that.reDrawSceneRects()
// }
// // import ini from '../../conf/ini'
// import conf, { link_realName2alias } from "../../conf/cls8"
// import { injects } from "../../js/injects"

// export default function setup() {
//     var ini = injects();

//     return {
        // options: [
        //     {
        //         label: "Office 1",
        //         key: "Office 1",

        //     },
        //     {
        //         label: "Office 2",
        //         key: "Office 2",

        //     },
        //     {
        //         label: "Dormitory",
        //         key: "Dormitory",
        //     },
        //     {
        //         label: "Entertainment",
        //         key: "Entertainment",

        //     },
        //     {
        //         label: "Administrative",
        //         key: "Administrative",

        //     },
        //     {
        //         label: "Canteen",
        //         key: "Canteen",
        //     }
        // ],
//         handleSelect(key) {
//             // console.log(conf)
//             var trans = {
//                 'Office 2': 'Section 1',
//                 'Dormitory': 'Section 2',
//                 'Entertainment': 'Section 3',
//                 '"Office 1': 'Section 4',
//                 '"Office 1': 'Section 4',
//                 'Entertainment': 'Section 3',
//                 'Administrative': 'Section 5',
//                 'Canteen': 'Section 6',
//             }

//             ini["newScene"].value = trans[key];
//             ini["addScene"].value += 1;
//         }
//     };
// }
