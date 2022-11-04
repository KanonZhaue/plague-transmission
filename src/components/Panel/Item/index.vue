<template>
  <div class="Panel-item">
    <p>
      <n-ellipsis style="max-width: 74px">
        {{ name }}
      </n-ellipsis>
    </p>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ["name"],
  setup(props) {
    return props;
  },
};
</script>

<style>
@import "./style.css";
</style>