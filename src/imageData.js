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

    computeHistogram(gl, buffer, width, height) {
        gl.readPixels(0, 0, width, height,
                      gl.RGBA, gl.UNSIGNED_BYTE, buffer);
        console.log(buffer);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const col = [buffer[width * y + x + 1],
                             buffer[width * y + x + 2],
                             buffer[width * y + x + 3]];
                const l = ( 0.298912 * col[0] + 0.586611 * col[1] + 0.114478 * col[2] );
                this.histogram[0][col[0]]++;
                this.histogram[1][col[1]]++;
                this.histogram[2][col[2]]++;
                this.histogram[3][Math.round(l)]++;
            }
        }
        console.log(this.histogram);
    }
}
