<template>
  <div class="controlPanel">
    <div>{{ canvasManager.filterCanvas.mouse[0] }},
      {{ canvasManager.filterCanvas.mouse[1] }}</div><br>
    <div>{{ canvasManager.filterCanvas.colorOnMouse[0] }},
      {{ canvasManager.filterCanvas.colorOnMouse[1] }},
{{ canvasManager.filterCanvas.colorOnMouse[2] }}</div>

  </div>
</template>

<script>
export default {
  props: ['canvasManager'],
}
</script>

<style>
  .controlPanel {
    border-style: ridge;
    border-color: gray;
    background-color: Gainsboro;
    flex-basis: 300px;
    width: 300px;
    display: flex;
    flex-direction: column;
}
</style>
