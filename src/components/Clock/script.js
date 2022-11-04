/*eslint-disable */
import { onMounted, inject, watch } from "@vue/runtime-core"
import { dt2t } from "../../js/kit"
import { injects } from "../../js/injects"
export default {
    setup() {
        var ini = injects()
        var clock
        function update() {
            var t = ini.currentTick.value,
                d = ini.currentDay.value
            var _t = dt2t(d, t)
            clock.innerHTML = `${d} day ${t} tick (${_t})`
        }
        onMounted(() => {
            clock = document.getElementById('clock-content')
            update()
        })
        watch(inject('currentTick'), update)
        watch(inject('currentDay'), update)
    }
}