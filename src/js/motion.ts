export default class MotionDetector {
  alpha = 0.5;
  version = 0;
  greyScale = false;

  canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
  canvasFinal: HTMLCanvasElement = document.getElementById('canvasFinal') as HTMLCanvasElement;
  video: HTMLVideoElement = document.getElementById('camStream') as HTMLVideoElement;
  ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
  ctxFinal: CanvasRenderingContext2D = this.canvasFinal.getContext('2d');
  localStream = null;
  imgData = null;
  imgDataPrev = [];

  success = (stream) => {
    this.localStream = stream;
    // Create a new object URL to use as the video's source.
    this.video.srcObject = stream
    this.video.play();
  }

  handleError = (error) => {
    console.error(error);
  }

  snapshot = () => {
    if (this.localStream) {
      this.canvas.width = this.video.offsetWidth;
      this.canvas.height = this.video.offsetHeight;
      this.canvasFinal.width = this.video.offsetWidth;
      this.canvasFinal.height = this.video.offsetHeight;

      this.ctx.drawImage(this.video, 0, 0);

      // Must capture image data in new instance as it is a live reference.
      // Use alternative live referneces to prevent messed up data.
      this.imgDataPrev[this.version] = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.version = (this.version == 0) ? 1 : 0;

      this.imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

      const length = this.imgData.data.length;
      let x = 0;

      while (x < length) {
        if (!this.greyScale) {
          // Alpha blending formula: out = (alpha * new) + (1 - alpha) * old.
          this.imgData.data[x] = this.alpha * (255 - this.imgData?.data?.[x]) + ((1-this.alpha) * this.imgDataPrev?.[this.version]?.data?.[x]);
          this.imgData.data[x + 1] = this.alpha * (255 - this.imgData?.data?.[x+1]) + ((1-this.alpha) * this.imgDataPrev?.[this.version]?.data?.[x + 1]);
          this.imgData.data[x + 2] = this.alpha * (255 - this.imgData?.data?.[x+2]) + ((1-this.alpha) * this.imgDataPrev?.[this.version]?.data?.[x + 2]);
          this.imgData.data[x + 3] = 255;
        } else {
          // GreyScale.
          const av = (this.imgData?.data[x] + this.imgData?.data?.[x + 1] + this.imgData?.data?.[x + 2]) / 3;
          const av2 = (this.imgDataPrev?.[this.version]?.data?.[x] + this.imgDataPrev?.[this.version]?.data?.[x + 1] + this.imgDataPrev?.[this.version]?.data?.[x + 2]) / 3;
          const blended = this.alpha * (255 - av) + ((1-this.alpha) * av2);

          this.imgData.data[x] = blended;
          this.imgData.data[x + 1] = blended;
          this.imgData.data[x + 2] = blended;
          this.imgData.data[x + 3] = 255;
        }
        x += 4;
      }
      this.ctxFinal.putImageData(this.imgData, 0, 0);
    }
  }


  init = () => {
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video:true}, this.success, this.handleError);
    } else {
      console.error('Your browser does not support getUserMedia');
    }
    window.setInterval(this.snapshot, 32);
  }
}
