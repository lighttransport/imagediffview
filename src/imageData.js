export default class ImageData {
    constructor(name, file, loaded) {
        this.name = name;
        this.imgObj = new Image();
        this.isRendering = false;
        this.id = new Date().getTime();

        this.colorChart = new Array(24);

        this.histogram = [new Array(255),
                          new Array(255),
                          new Array(255),
                          new Array(255)]; // r, g, b, luminance

        for(let i = 0 ; i < 255; i++) {
            this.histogram[0][i] = 0;
            this.histogram[1][i] = 0;
            this.histogram[2][i] = 0;
            this.histogram[3][i] = 0;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('load', () => {
            this.imgObj.addEventListener('load', () => {
                loaded();
            });
            this.imgObj.src = reader.result;
        });
    }

    get(x, y) {
        const data = this.ctx.getImageData(x, y,
                                           1,
                                           1);
        //console.log(data.data);
        return data;
    }

    computeHistogram() {
        // this.imageData = this.ctx.getImageData(0, 0,
        //                                        this.imgObj.width,
        //                                        this.imgObj.height);
        for (let x = 0; x < this.imageWidth; x++) {
            for (let y = 0; y < this.imageHeight; y++) {
                const col = this.get(x, y);
                const l = ( 0.298912 * col[0] + 0.586611 * col[1] + 0.114478 * col[2] );
                this.histogram[0][col[0]]++;
                this.histogram[1][col[1]]++;
                this.histogram[2][col[2]]++;
                this.histogram[3][l]++;
            }
        }
        console.log(this.histogram);
    }
}
