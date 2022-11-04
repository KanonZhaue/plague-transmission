/* eslint-disable */
import card from "../Card";
import Panel from "../Panel";
import Map from "../Map"
// import SEIR from "../SEIR"
import Network from "../Network"
import Tips from "../Tips"
import Ana from "../Ana"
import River from "../River"
import Clock from "../Clock"
import Trace from "../Trace"
import SpreadTree from "../SpreadTree"
import Player from "../Player"
import SEIR from "../SEIR"
import AddScene from "../addScene/index.vue"
import Parallel from "../Parallel"

import Netbox from "../netbox"
import Sunburst from "../sunburst"
// import Storyline from "../Storyline"
// import NetworkMap from "../NetworkMap"
import { inject } from "vue";
import { injects } from "../../js/injects";

var ini;

export default {
  components: { card, Panel, Map, Network, Ana, Tips, River, Clock, Trace, SpreadTree, Player, SEIR, Netbox, Sunburst, Parallel, AddScene },
  setup() {
    ini = injects()
    var distanceLine = inject('distanceLine')
      , river_content = inject('river_content')
    return {
      distanceLine,
      river_content,
      header_style: "background:rgba(169,169,169,0.3);height:23px;", //rgba(174,222,252,0.3)
      header_style_small: "background:rgba(169,169,169,0.3);height:20px;",
      ...ini,
      n_ticks: (ini.ticks.value - 1) * ini.days.value,
      printDataInJSON
    }
  }
};

function printDataInJSON() {
  let rs = ini.scene.value.roles
  let n_ticks = rs[0].tick
  let state = rs.map(d => d.state)
  let origin_state = rs.map(d => d.origin_state)
  let origin = {
    s: [], e: [], i: [], r: []
  }
  let acted = {
    s: [], e: [], i: [], r: []
  }

  // ori
  for (let t = 0; t < n_ticks; ++t) {
    let s = 0,
      e = 0,
      i = 0,
      r = 0
    for (let rid = 0; rid < origin_state.length; ++rid) {
      let _state = origin_state[rid][t].state
      if (_state == 'susceptible') s++
      else if (_state == 'exposed') e++
      else if (_state == 'infectious') i++
      else r++
    }
    origin.s.push(s)
    origin.e.push(e)
    origin.i.push(i)
    origin.r.push(r)
  }

  // new
  for (let t = 0; t < n_ticks; ++t) {
    let s = 0,
      e = 0,
      i = 0,
      r = 0
    for (let rid = 0; rid < state.length; ++rid) {
      let _state = state[rid][t].state
      if (_state == 'susceptible') s++
      else if (_state == 'exposed') e++
      else if (_state == 'infectious') i++
      else r++
    }
    acted.s.push(s)
    acted.e.push(e)
    acted.i.push(i)
    acted.r.push(r)
  }
  console.log(JSON.stringify({ origin, acted }))
  // for(let i =0; i<)
}