<template>
  <div class="controlPanel">
    <div>{{ canvasManager.filterCanvas.mouse[0] }},
      {{ canvasManager.filterCanvas.mouse[1] }}</div><br>
    <div>{{ canvasManager.filterCanvas.colorOnMouse[0] }},
      {{ canvasManager.filterCanvas.colorOnMouse[1] }},
{{ canvasManager.filterCanvas.colorOnMouse[2] }}</div>

    <b-collapse class="card">
      <div slot="trigger" slot-scope="props" class="card-header">
                <p class="card-header-title">
                    Hue/Saturation
                </p>
                <a class="card-header-icon">
                    <b-icon
                        :icon="props.open ? 'menu-down' : 'menu-up'">
                    </b-icon>
                </a>
            </div>
            <div class="card-content">
              <div class="content">
                    Hue <input type="range" min="-1" max="1" step="0.01"
               v-model="canvasManager.filterCanvas.hueSaturation[0]"
               @input="input"> Saturation<input type="range" min="-1" max="1"
               step="0.01" v-model="canvasManager.filterCanvas.hueSaturation[1]"
               @input="input">
                </div>
            </div>
    </b-collapse>
    <b-collapse class="card">
      <div slot="trigger" slot-scope="props" class="card-header">
                <p class="card-header-title">
                    Sepia
                </p>
                <a class="card-header-icon">
                    <b-icon
                        :icon="props.open ? 'menu-down' : 'menu-up'">
                    </b-icon>
                </a>
            </div>
            <div class="card-content">
              <div class="content">
    <input type="range" min="0" max="1" step="0.01"
           v-model="canvasManager.filterCanvas.sepiaAmount"
           @input="input">
                </div>
            </div>
    </b-collapse>
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
    top: 0;
    bottom: 0;
    overflow: scroll;
}
</style>
