<template>
  <div id='tips-box' :style="{top:`${dy}px`,left:`${dx}px`}" v-show="tips_display" v-html="tips_content">
  </div>
</template>

<script>
import opt from "./script"
export default opt
</script>

<style>
#tips-box
{
    width:auto;
    height: auto;
    position: fixed;
    background-color: rgba(255, 255, 255, 0.959);
    border-radius: 4px;
    border:1px solid rgba(12,12,12,0.1);
    padding: 6px;
}
#tips-box table td
{
  padding: 2px 4px;
}
</style>