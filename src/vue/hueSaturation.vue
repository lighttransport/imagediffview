<template>
  <div>
    Hue <input type="range" min="-1" max="1"
               step="0.01"
               v-model="canvasManager.filterCanvas.hueSaturation[0]"
               @input="input">
    Saturation<input type="range" min="-1" max="1"
                     step="0.01"
                     v-model="canvasManager.filterCanvas.hueSaturation[1]"
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
