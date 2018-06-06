<template>
    <div id="root">
      <input id="file" type="file" name="files[]"
             v-on:change="directorySelected"  webkitdirectory directory />
      <a>Scenes</a>
        <select v-model="selectedScene" size="5" @change="sceneChangedListener">
            <option v-for="key in Object.keys(files)">
                {{ key }}
            </option>
        </select>
        <div>
          <input type="checkbox" v-model="canvas.enableBlend"
                 @change="reRender">enable blend<br>
          <input type="range" v-model="canvas.blendFactor"
                 @input="reRender" min="0" max="1" step="0.01">blendFactor
        </div>

        <div id="canvasParent">
          <canvas id="canvas"></canvas>
          <canvas id="overlay"></canvas>
        </div>
        <ul>
            <li v-for="photo in files[selectedScene]" class="photo-list" >
                <input type="checkbox" v-model="photo.checked"
                       @change="checkedListener" :id="photo.id">
                {{ photo.name }}
            </li>
        </ul>
        <div id="thumb">
          <figure v-for="photo in files[selectedScene]">
            <img :src="photo.imgObj.src" class="thumbImg">
            <figcaption>{{ photo.name }}</figcaption>
          </figure>
        </div>
    </div>
</template>

<script>
export default {
    props: ['canvas', 'overlay'],
    data: function() {
        return {
            'checkedPhoto': [],
            'selectedScene': undefined,
            files: {}
        }
    },
    methods: {
        directorySelected: function(event){
            this.files = {};
            for (let i = 0; i < event.target.files.length; i++) {
                const file = event.target.files[i];
                const relativePath = file.webkitRelativePath;
                const splitted = relativePath.split('/');
                if(this.files[splitted[1]] === undefined) {
                    this.$set(this.files, splitted[1], [])
                }
                const img = new Image();

                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.addEventListener('load', () => {
                    img.src = reader.result;
                });

                this.files[splitted[1]].push({'name': splitted[2],
                                              'imgObj': img,
                                              'checked': false,
                                              'id': i});
            }
        },
        checkedListener: function(event) {
            let numChecked = 0;
            for (const file of this.files[this.selectedScene]) {
                if(file.checked) {
                    numChecked++;
                }
            }

            if(numChecked >= 5) {
                for (const f of this.files[this.selectedScene]) {
                    if(f.checked && event.target.id != f.id) {
                        this.$set(f, 'checked', false);
                        break;
                    }
                }
            }

            numChecked = 0;
            for (const file of this.files[this.selectedScene]) {
                if(file.checked) {
                    this.canvas.setPhotoObj(file.name, file.imgObj, numChecked);
                    numChecked++;
                }
            }

            this.canvas.numPhotos = numChecked;
            this.canvas.render();
        },
        sceneChangedListener: function() {
            const photo = this.files[this.selectedScene][0];
            this.canvas.resizeCanvasFromPhoto(photo.imgObj.width, photo.imgObj.height);            this.canvas.render();
        },
        reRender: function() {

            this.canvas.render();
        }
    }
 }
</script>

<style>
#root {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#canvasParent {
    width: 600px;
    height: 600px;
    border-style: solid;
}

#thumb {
    flex: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: start;
}

figure {
    flex: 0.5;
    margin: 5px;
    width: 200px;
}

.thumbImg {
    height: 30%;
}

#canvas {
    position: absolute;
    z-index: 1;
}

#overlay {
    position: absolute;
    z-index: 2;
}

.photo-list {
    list-style-type: none;
}
</style>
