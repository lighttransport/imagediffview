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
import MImageData from '../imageData.js';

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
                console.log(file.name);
                if (file.name.includes('\.exr')) {
                    console.log('Load exr');
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');

                    const imgObj = new Image();

                    const reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.addEventListener('load', () => {
                        const data = new Uint8Array(reader.result);
                        let exrImg = new Module.EXRLoader(data);
                        canvas.width  = exrImg.width();
                        canvas.height = exrImg.height();

                        let imageArray = exrImg.getBytes().map(num => {
                            // Convert values to 0-255 range and apply gamma curve
                            return Math.pow(num, 0.44) * 256;
                        });

                        let image8Array = new Uint8ClampedArray(imageArray);
                        let imageData = new ImageData(image8Array, exrImg.width(), exrImg.height());
                        ctx.putImageData(imageData, 0, 0);

                        const image = new Image();
                        image.src = canvas.toDataURL();
                        console.log('done');
                        const mtmp = {};
                        mtmp.imgObj = image;
                        this.canvasManager.filterCanvas.setImage(mtmp);
                        this.canvasManager.filterCanvas.render();

                    });
                } else {
                    const img = new MImageData(splitted[2], file,
                                              () => {
                                                  this.canvasManager.filterCanvas.setImage(img);
                                                  this.canvasManager.filterCanvas.render();
                                                  const hist = this.canvasManager.filterCanvas.makeHistogram();
                                                  this.canvasManager.histoCanvas.histogram = hist;
                                                  this.canvasManager.histoCanvas.render();
                                              });
                }

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
    display: flex;
    flex-direction: column;
    height:100%;
}


.header {
    border-style: ridge;
    border-color: gray;

    overflow:hidden;
    font-size: 2rem;

    min-height: 50px;
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
    min-height: 50px;
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
