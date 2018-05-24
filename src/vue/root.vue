<template>
    <div>
        <input id="file" type="file" name="files[]"  v-on:change="directorySelected"  webkitdirectory directory />
        <select v-model="selectedScene" size="5" @change="checkedListener">
            <option v-for="key in Object.keys(files)">
                {{ key }}
            </option>
        </select>
        <div id="canvasParent">
            <canvas id="canvas"></canvas>
        </div>
        <ul>
            <li v-for="photo in files[selectedScene]">
                <input type="checkbox" name="comparisonCheck" v-model="photo.checked"
                       @change="checkedListener">
                {{ photo.name }}
            </li>
        </ul>
        <div v-for="photo in files[selectedScene]" id="thumb">
        <img :src="photo.imgObj.src" width="20%">
        </div>
    </div>
</template>

<script>
 export default {
     props: ['canvas'],
     data: function() {
         return {
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
                     this.files[splitted[1]] = []
                 }
                 const img = new Image();

                 const reader = new FileReader();
                 reader.readAsDataURL(file);
                 reader.addEventListener('load', () => {
                     img.src = reader.result;
                 });

                 this.files[splitted[1]].push({'name': splitted[2],
                                               'imgObj': img,
                                               'checked': false});
             }
             console.log(this.files);
             console.log(Object.keys(this.files));
         },
         checkedListener: function() {
             let numChecked = 0;
             for (const file of this.files[this.selectedScene]) {

                 if(file.checked) {
                     this.canvas.setPhotoObj(file.imgObj, numChecked);
                     numChecked++;
                 }
             }
             this.canvas.numPhotos = numChecked;
         }
     }
 }
</script>

<style>
 #canvasParent {
     width: 500px;
     height: 500px;
 }
 #thumb {
	   display: inline;
 }
</style>