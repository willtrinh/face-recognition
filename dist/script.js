const imageUpload = document.getElementById("upload");
// load all different models
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(start);

async function start() {
  const container = document.createElement("div");
  container.style.position = "relative";
  document.body.append(container);
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors, 0.6);
  imageUpload.addEventListener("change", async () => {
    const image = await faceapi.bufferToImage(imageUpload.files[0]);
    document.body.append(image);
    const canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
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
  });
}

// function readURL(input) {
//   if (input.files && input.files[0]) {
//     var reader = new FileReader();

//     reader.onload = function (e) {
//       $("#imageResult").attr("src", e.target.result);
//     };
//     reader.readAsDataURL(input.files[0]);
//   }
// }

// $(function () {
//   $("#upload").on("change", function () {
//     readURL(input);
//   });
// });

// /*  ==========================================
// SHOW UPLOADED IMAGE NAME
// * ========================================== */
// var input = document.getElementById("upload");
// var infoArea = document.getElementById("upload-label");

// input.addEventListener("change", showFileName);
// function showFileName(event) {
//   var input = event.srcElement;
//   var fileName = input.files[0].name;
//   infoArea.textContent = "File name: " + fileName;
// }

/*  ==========================================
LOAD LABELED IMAGES
* ========================================== */
function loadLabeledImages() {
  const descriptions = [];
  const labels = ["Chandler", "Joey", "Monica", "Phoebe", "Rachel", "Ross"];
  return Promise.all(
    labels.map(async (label) => {
      for (let i = 1; i <= 5; i++) {
        const img = await faceapi.fetchImage(
          `https://raw.githubusercontent.com/willtrinh/face-recognition/master/img/labeled_images/${label}/${i}.jpg`
        );
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
