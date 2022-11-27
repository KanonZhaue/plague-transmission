import _links from "./links"
import ini from './ini'

let links = {}

for (let k1 in _links) {
    let r1 = link_realName2alias(k1)
    links[r1] = {}
    for (let k2 in _links[k1]) {
        let r2 = link_realName2alias(k2)
        links[r1][r2] = _links[k1][k2]
    }
}

var _ = {
    "layout": {
        "column": 3
    },
    "tick": ini.ticks,
    // links,
    "nodes": [
        {
            name: "Rest Area",
            size: { x: 200, y: 190 },
            type: ini.SceneType[0],
            typeIndex :0,
        },
        {
            name: "Administrative Area",
            size: { x: 200, y: 300 },
            type: ini.SceneType[1],
            typeIndex :0,
        },
        {
            name: "Working Area",
            size: { x: 190, y: 410 },
            type: ini.SceneType[2],
            typeIndex :0,
        },
        {
            name: "Catering Area",
            size: { x: 200, y: 230 },
            type: ini.SceneType[3],
            typeIndex :0,
        },
        {
            name: "Entertainment Area",
            size: { x: 500, y: 250 },
            type: ini.SceneType[4],
            typeIndex :0,
        },
        // {
        //     name: "6",
        //     size: { x: 250, y: 250 },
        // }
    ]
    // [
    //     {"name":"宿舍"},
    //     {"name":"A"},
    //     {"name":"B"},
    //     {"name":"食堂"},
    //     {"name":"图书馆"},
    //     {"name":"行政楼"},
    //     {"name":"操场"},
    //     {"name":"游泳馆"}
    // ]
    ,
    "avgtime": [3, 3, 2, 3, 2],
    "popularity": [0.5, 0.3, 0.4, 0.86, 0.2],
    "default": {
        size: {
            x: 120, y: 200
        }
    }
    // "links":{
    //     "宿舍":{
    //         "A":[0,0.2,0.4],
    //         "B":[0,0.3,0.1],
    //         "食堂":[0,0.1,0.3],
    //         "图书馆":[0,0.4,0.2],
    //         "行政楼":[0.3,0.2,0.5],
    //         "操场":[0.8,0.3,0.1],
    //         "游泳馆":[0.1,0,0.1]
    //     },
    //     "A":{
    //         "宿舍":[1,0.8,0.3],
    //         "B":[0.2,0.3,0.2],
    //         "食堂":[0.3,0.1,0.5],
    //         "图书馆":[0.5,0.1,0.8],
    //         "行政楼":[0.2,0.1,0.2],
    //         "操场":[0.1,0.8,0.4],
    //         "游泳馆":[0.2,0.1,0.2]
    //     },
    //     "B":{
    //         "宿舍":[1,0.2,0.3],
    //         "A":[0.2,0.3,0.5],
    //         "食堂":[0,2,0.5,0.5],
    //         "图书馆":[0.2,0.1,0.4],
    //         "行政楼":[0,0.23,0.56],
    //         "操场":[0.2,0.4,0.6],
    //         "游泳馆":[0.3,0.5,0.2]
    //     },
    //     "食堂":{
    //         "宿舍":[0,2,0.4,0.7],
    //         "A":[],
    //         "B":[],
    //         "图书馆":[],
    //         "行政楼":[],
    //         "操场":[],
    //         "游泳馆":[]
    //     },
    //     "图书馆":{
    //         "宿舍":[],
    //         "A":[],
    //         "B":[],
    //         "食堂":[],
    //         "行政楼":[],
    //         "操场":[],
    //         "游泳馆":[]
    //     },
    //     "行政楼":{
    //         "宿舍":[],
    //         "A":[],
    //         "B":[],
    //         "食堂":[],
    //         "图书馆":[],
    //         "操场":[],
    //         "游泳馆":[]
    //     },
    //     "操场":{
    //         "宿舍":[],
    //         "A":[],
    //         "B":[],
    //         "食堂":[],
    //         "图书馆":[],
    //         "行政楼":[],
    //         "游泳馆":[]
    //     },
    //     "游泳馆":{
    //         "宿舍":[],
    //         "A":[],
    //         "B":[],
    //         "食堂":[],
    //         "图书馆":[],
    //         "行政楼":[],
    //         "操场":[]
    //     }
    // },
}

var size = {
    'Section 1': { x: 200, y: 190 },
    'Section 2': { x: 200, y: 300 },
    'Section 3': { x: 190, y: 410 },
    'Section 4': { x: 200, y: 230 },
    'Section 5': { x: 500, y: 250 },
    'Section 6': { x: 250, y: 250 },
    // 'Office3': { x: 150, y: 350 },
    // 'Entertainment 2': { x: 220, y: 150 },
}

export function link_realName2alias(p) {
    return {
        '图书馆': 'Section 1',
        // '宿舍': 'Section 2',
        // '操场': 'Section 3',
        // '教学楼A': 'Section 4',
        // '教学楼B': 'Section 4',
        // '游泳馆': 'Section 3',
        // '行政楼': 'Section 5',
        // '食堂': 'Section 6',
        // '隔离区': 'isolated area',
    }[p]
}
// var size={
//     '宿舍':{x:100,y:100},
//     '图书馆':{x:100,y:100},
//     '操场':{x:100,y:100},
//     '教学楼A':{x:100,y:100},
//     '教学楼B':{x:10,y:100},
//     '游泳馆':{x:100,y:100},
//     '行政楼':{x:100,y:100},
//     '食堂':{x:100,y:100},
// }

// var size={}

for (let k in _.links) {
    // console.log(_, _.links)
    var si = size[k] == undefined ? _.default.size : size[k]
    _.nodes.push({
        name: k,
        size: si
    })
}

export default _