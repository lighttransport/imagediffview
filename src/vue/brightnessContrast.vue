<template>
  <div>
    Brightness<input type="range" min="-1" max="1"
               step="0.01"
               v-model="canvasManager.filterCanvas.brightnessContrast[0]"
               @input="input">
    Contrast<input type="range" min="-1" max="1"
                   step="0.01"
                   v-model="canvasManager.filterCanvas.brightnessContrast[1]"
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
