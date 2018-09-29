<template>
  <div>
    <input type="range" min="-1" max="1000" step="40000"
           v-model="canvasManager.filterCanvas.temperature"
           @input="input">
    <input type="range" min="0" max="1" step="0.01"
           v-model="canvasManager.filterCanvas.temperatureStrength"
           @input="input">
  </div>
</template>

<script>
  export default {
      props: ['canvasManager'],
      methods: {
          input: function() {
              this.canvasManager.filterCanvas.render();
          }
      }
  }
</script>

<style>
</style>
