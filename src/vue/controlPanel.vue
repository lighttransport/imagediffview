<template>
  <div class="controlPanel">
    <div>{{ canvasManager.filterCanvas.mouse[0] }},
      {{ canvasManager.filterCanvas.mouse[1] }}</div><br>
    <div>{{ canvasManager.filterCanvas.colorOnMouse[0] }},
      {{ canvasManager.filterCanvas.colorOnMouse[1] }},
{{ canvasManager.filterCanvas.colorOnMouse[2] }}</div>

    <div>
      <select size="1" v-model="selected" @change="changed">
        <option disabled value="">Select filter</option>
        <option v-for="option in options" v-bind:value="option.value">
          {{ option.text }}
        </option>
      </select>
    </div>
    
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
          Hue<br>
          <input type="range" min="-1" max="1" step="0.01"
                 v-model="canvasManager.filterCanvas.hueSaturation[0]"
                 @input="input"><br>
          Saturation<br>
          <input type="range" min="-1" max="1"
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
          Amount<br>
          <input type="range" min="0" max="1" step="0.01"
                 v-model="canvasManager.filterCanvas.sepiaAmount"
                 @input="input">
        </div>
      </div>
    </b-collapse>
    <b-collapse class="card">
      <div slot="trigger" slot-scope="props" class="card-header">
        <p class="card-header-title">
          Brightness/Contrast
        </p>
        <a class="card-header-icon">
          <b-icon
            :icon="props.open ? 'menu-down' : 'menu-up'">
          </b-icon>
        </a>
      </div>
      <div class="card-content">
        <div class="content">
          Brightness<br>
          <input type="range" min="-1" max="1" step="0.01"
                 v-model="canvasManager.filterCanvas.brightnessContrast[0]"
                 @input="input"><br>
          Contrast<br>
          <input type="range" min="-1" max="1"
                 step="0.01" v-model="canvasManager.filterCanvas.brightnessContrast[1]"
                 @input="input">
        </div>
      </div>
    </b-collapse>
    <b-collapse class="card">
      <div slot="trigger" slot-scope="props" class="card-header">
        <p class="card-header-title">
          Vibrance
        </p>
        <a class="card-header-icon">
          <b-icon
            :icon="props.open ? 'menu-down' : 'menu-up'">
          </b-icon>
        </a>
      </div>
      <div class="card-content">
        <div class="content">
          Amount<br>
          <input type="range" min="0" max="1" step="0.01"
                 v-model="canvasManager.filterCanvas.vibranceAmount"
                 @input="input">
        </div>
      </div>
    </b-collapse>
    <b-collapse class="card">
      <div slot="trigger" slot-scope="props" class="card-header">
        <p class="card-header-title">
          Temperature
        </p>
        <a class="card-header-icon">
          <b-icon
            :icon="props.open ? 'menu-down' : 'menu-up'">
          </b-icon>
        </a>
      </div>
      <div class="card-content">
        <div class="content">
          temperature<br>
          <input type="range" min="1000" max="40000" step="1"
                 v-model="canvasManager.filterCanvas.temperature"
                 @input="input"><br>
          strength<br>
          <input type="range" min="0" max="1" step="0.01"
                 v-model="canvasManager.filterCanvas.temperatureStrength"
                 @input="input">
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import Sepia from './sepia.vue';
import HueSaturation from './hueSaturation.vue';
import BrightnessContrast from './brightnessContrast.vue';
import Vibrance from './vibrance.vue';
import Temperature from './temperature.vue';

export default {
    props: ['canvasManager'],
    data: function() {
        return {
            selected: "",
            filters: ["", Sepia, HueSaturation, BrightnessContrast, Vibrance, Temperature],
            options: [
                { text: 'None', value: 0 },
                { text: 'Sepia', value: 1 },
                { text: 'HueSaturation', value: 2 },
                { text: 'BrightnessContrast', value: 3 },
                { text: 'vibrance', value: 4 },
                { text: 'temperature', value: 5}
            ]
        };
    },
    methods: {
        changed: function() {
            this.canvasManager.filterCanvas.filterMode = this.selected;
            this.canvasManager.filterCanvas.render();
        },
        input: function() {
            this.canvasManager.filterCanvas.render();
        }
    }
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
    overflow-y: scroll;
    overflow-xc: hidden;
}
</style>
