<template>
    <div id="root">
      <header class="header">
        <input type="file" id="file" name="file" @change="fileSelected">
      </header>
      <contents-panel :canvasManager="canvasManager" />
      <footer class="footer"> 
      </footer>
    </div>
</template>

<script>
import ContentsPanel from './contentsPanel.vue';
import ControlPanel from './controlPanel.vue';
import ImageData from '../imageData.js';

export default {
    props: ['canvasManager'],
    data: function() {
        return {
        }
    },
    methods: {
        fileSelected: function(event){
            this.files = {};
            for (let i = 0; i < event.target.files.length; i++) {
                const file = event.target.files[i];
                const relativePath = file.webkitRelativePath;
                const splitted = relativePath.split('/');

                const img = new ImageData(splitted[2], file,
                                          () => {
                                              this.canvasManager.filterCanvas.setImage(img);
                                              this.canvasManager.filterCanvas.render();
                                              const hist = this.canvasManager.filterCanvas.makeHistogram();
                                              this.canvasManager.histoCanvas.histogram = hist;
                                              this.canvasManager.histoCanvas.render();
                                          });
                
            }
        }
    },
    components: {
        ContentsPanel,
    }
 }
</script>

<style>

#root {
    font-family: "Times New Roman";
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}


.header {
    border-style: ridge;
    border-color: gray;
    
    overflow:hidden;
    font-size: 2rem;

    height: 50px;
    background-color: Azure;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default
}

.footer {
    border-style: ridge;
    border-color: gray;
    padding: 0;
    height: 50px;
    background-color: Azure;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 0.9rem;

    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}
</style>
