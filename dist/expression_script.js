const imageUpload = document.getElementById("upload");
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.faceLandmark68Net.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.faceRecognitionNet.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.faceExpressionNet.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.ssdMobilenetv1.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
]).then(start);

async function start() {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.className = "d-flex justify-content-center pb-5";
  document.body.append(container);
  //   const labeledFaceDescriptors = await loadLabeledImages();
  //   const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  let image;
  let canvas;
  imageUpload.addEventListener("change", async () => {
    if (image) image.remove();
    if (canvas) canvas.remove();
    image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);
    canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    // const results = resizedDetections.map((d) =>
    //   faceMatcher.findBestMatch(d.descriptor)
    // );
    // results.forEach((result, i) => {
    //   const box = resizedDetections[i].detection.box;
    //   const drawBox = new faceapi.draw.DrawBox(box, {
    //     label: result.toString(),
    //   });
    //   drawBox.draw(canvas);
    // });
  });
}
