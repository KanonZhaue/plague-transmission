<template>
  <Page />
</template>

<script>
import Page from "./components/Page";
import setup from "./app";

export default {
  name: "yeah__wo_cuo_la",
  components: {
    Page,
  },
  setup,
};
</script>

<style>
* {
  padding: 0;
  margin: 0;
  user-select: none;
}
text {
  pointer-events: none;
}
</style>
