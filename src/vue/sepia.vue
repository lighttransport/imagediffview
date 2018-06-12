<template>
  <div>
    <input type="range" min="0" max="1" step="0.01"
           v-model="canvasManager.filterCanvas.sepiaAmount"
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
