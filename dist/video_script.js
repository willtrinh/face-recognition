const video = document.getElementById("video");
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(
    "github.com/willtrinh/face-recognition/tree/master/models"
  ),
  faceapi.nets.faceRecognitionNet.loadFromUri(
    "github.com/willtrinh/face-recognition/tree/master/models"
  ),
  faceapi.nets.faceLandmark68Net.loadFromUri(
    "github.com/willtrinh/face-recognition/tree/master/models"
  ),
  faceapi.nets.faceExpressionNet.loadFromUri(
    "github.com/willtrinh/face-recognition/tree/master/models"
  ),
]).then(startVideo);

function startVideo() {}

video.addEventListener("play", () => {
  //   console.log("video played");
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
  });
});
