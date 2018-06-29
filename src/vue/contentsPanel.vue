<template>
  <div class="contentsPanel">
    <div class="canvasPanel">
      <div class="canvasBackground">
        <div class="canvasParent">
          <canvas id="canvas" tabIndex="1000"></canvas>
        </div>
      </div>
      <filterPanel :canvasManager="canvasManager" />
    </div>
    <control-panel :canvasManager="canvasManager"/>
  </div>
</template>

<script>
import ControlPanel from './controlPanel.vue';
import FilterPanel from './filterPanel.vue';
export default {
    props: ['canvasManager'],
    components: {
        ControlPanel,
        FilterPanel
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

#canvas {
    width: 100%;
    height: 100%;
    cursor: crosshair;
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
