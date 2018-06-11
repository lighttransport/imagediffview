<template>
  <div class="contentsPanel">
    <div class="canvasPanel">
      <div class="canvasBackground">
        <div class="canvasParent">
          <canvas id="canvas" tabIndex="1000"></canvas>
        </div>
      </div>
      <div class="propertyPanel"></div>
    </div>
    <control-panel/>
  </div>
</template>

<script>
import ControlPanel from './controlPanel.vue';
export default {
    components: {
        ControlPanel
    }
}
</script>

<style>
.contentsPanel {
  flex: 1;
  display: flex;
}

.canvasParent {
    display: flex;
    justify-content: center;
    align-items: center;
}

.canvasBackground {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

canvas {
    width: 100%;
    height: 100%;
    cursor: crosshair;
}

.propertyPanel{
    height: 150px;

    border-style: ridge;
    background-color: white;
    border-top: ridge;
    border-color: gray;
    display: flex;
    align-items: center;
    padding-left: 5px;
}

.canvasPanel {
    border-style: ridge;
    border-color: gray;
    background-color: gray;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

</style>
