const video = document.getElementById("video");
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.faceRecognitionNet.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.faceLandmark68Net.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.faceExpressionNet.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.ssdMobilenetv1.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
]).then(startVideo);

async function startVideo() {
  const labeledFaceDescriptors = await loadLabeledImages();

  video.addEventListener("play", () => {
    //   console.log("video played");
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
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
      const results = resizedDetections.map((d) =>
        faceMatcher.findBestMatch(d.descriptor)
      );
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result.toString(),
        });
        drawBox.draw(canvas);
      });
      faceapi.draw.drawDetections(canvas, resizedDetections);
    });
  });
}

/*  ==========================================
LOAD LABELED IMAGES
* ========================================== */
function loadLabeledImages() {
  const labels = ["Chandler", "Joey", "Monica", "Phoebe", "Rachel", "Ross"];
  return Promise.all(
    labels.map(async (label) => {
      const img = await faceapi.fetchImage(
        `https://raw.githubusercontent.com/willtrinh/face-recognition/master/public/img/${label}.jpg`
      );
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      const faceDescriptors = [detections.descriptor];
      return new faceapi.LabeledFaceDescriptors(label, faceDescriptors);
    })
  );
}
