<template>
    <n-tabs type="line"
            size='small'
            id='Ana-card'
    >
        <n-tab-pane name="SEIR" tab="SEIR">
            <SEIR/>
        </n-tab-pane>
        <n-tab-pane name="Risk" tab="Risk">
            <Risk/>
        </n-tab-pane>
    </n-tabs>
</template>

<script>
import opt from "./script"
export default opt
</script>

<style>
/* #Ana-card
{
    margin-top: -2px;
} */
</style>