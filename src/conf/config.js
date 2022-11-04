var d3 = require('d3')


export default {
    radar: {
        baseline: {
            color: '#ccc'
        }
    },
    map: {
        id: '#map-svg',
        subtitle: {
            fontSize: 12,
        },
        nodes: {
            id: 'nodes-g',
            selector() {
                var _ = '#' + this.id
                return d3.select(_)
            }
        },
        subplotConf: {
            margin: {
                top: 15,
                bottom: 5,
                left: 5,
                right: 5
            },
            height: 0,
            width: 0,
        },
        svgConf: {
            width: 0,
            height: 0,
            padding: {
                top: 2,
                bottom: 2,
                left: 2,
                right: 2,
            }
        },
        boxes: {
            id: 'scene-box',
            padding: {
                left: 8,
                top: 5,
                bottom: 5,
                right: 8,
            },
            selector() {
                var _ = '#' + this._id
                return d3.select(_)
            }
        },
        links: {
            id: 'links-g',
        },
        node: {
            opacity: 0.7,
            r: 4,
            format: 'role-',
            id(_id) {
                return '#' + this.format + _id
            }
        }
    },
    color: {

        /* lixuemeng 5*/
        // recovered: '#59C348',
        // infectious: '#F25B5F',
        // susceptible: '#4C62F7',
        // exposed: '#F0CB49',

        /* lixuemeng 4*/
        // recovered: '#99ddcc',
        // infectious: '#f85f73',
        // susceptible: '#8785a2',
        // exposed: '#ffde7d',


        /* lixuemeng  3*/
        recovered: '#7FB800',
        infectious: '#F6511D',
        susceptible: '#00A6ED',
        exposed: '#FFB400',

        /* lixuemeng  2*/
        // recovered: '#95FF4D',
        // infectious: '#FF1900',
        // susceptible: '#C4F0FF',
        // exposed: '#FFA74A',

        /* lixuemeng  1*/
        // recovered: '#45B673',
        // infectious: '#DC143C',
        // susceptible: '#708090',
        // exposed: '#FFA74A',

        /* liushixia */
        // recovered:'#559C38',
        // infectious:'#D32D31',
        // susceptible:'#737373',
        // exposed:'#FB8212',
        // susceptible:'#2778B4',

        /* liushixia */
        // recovered:'#559C38',
        // infectious:'#D32D31',
        // susceptible:'#2778B4',
        // exposed:'#FB8212',

        /* light */
        // recovered: '#66c18c',
        // infectious: '#de1c31',
        // susceptible: '#2177b8',
        // exposed: '#fcd217',

        /* deep */
        // susceptible: 'rgb(30,41,61)',
        // exposed: 'rgb(159,125,80)',
        // infectious: 'rgb(161,47,47)',
        // recovered: 'rgb(64,116,52)'

        /* maybe normal */
        // susceptible: 'rgb(0,90,171)',
        // exposed: 'rgb(230,179,61)',
        // infectious: 'rgb(156,38,50)',
        // recovered: 'rgb(6,128,67)'
    },
}