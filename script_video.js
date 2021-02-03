const video = document.getElementById('video')
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  // faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  // faceapi.nets.ageGenderNet.loadFromUri('/models')
])

function startVideo() {
  // navigator.getUserMedia(
  //   { video: {} },
  //   stream => video.srcObject = stream,
  //   err => console.error(err)
  // )
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  })
    .then(
      (cameraStream) => {
        video.srcObject = cameraStream;
      }
    )
}
let isDetection;
video.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.getElementById("webcam-container").appendChild(canvas);
  const videosize = document.getElementById("video")
  const displaySize = { width: videosize.clientWidth, height: videosize.clientHeight }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()//.withAgeAndGender()
    if (detections.length > 0) {
      extractFaceFromBox(video, detections[0].detection.box)
      isDetection = true;
    }else{
      isDetection = false;
      // console.log('not detection')
    }
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    // Get age and gender
    // resizedDetections.forEach( detection => {
    //   const box = detection.detection.box
    //   const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
    //   drawBox.draw(canvas)
    // })
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})


async function uploadImage() {
  const imgFile = document.getElementById('myFileUpload').files[0]
  const img = await faceapi.bufferToImage(imgFile)
  document.getElementById('myImg').src = img.src
  const myimg = document.getElementById('myImg')

  const canvas = faceapi.createCanvasFromMedia(document.getElementById('myImg'))
  document.getElementById("webcam-container").appendChild(canvas);
  document.getElementById("webcam-container").appendChild(myimg);
  const displaySize = { width: img.width, height: img.height }
  faceapi.matchDimensions(canvas, displaySize)
  const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withAgeAndGender()
  // get extract face
  if (detections.length > 0) {
    extractFaceFromBox(img, detections[0].detection.box)
  }

  const resizedDetections = faceapi.resizeResults(detections, displaySize)
  // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  faceapi.draw.drawDetections(canvas, resizedDetections)
  faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
}

var outputImageData;
async function extractFaceFromBox(inputImage, box) {
  // let outputImage = document.getElementById('faceImg')
  const regionsToExtract = [
    new faceapi.Rect(box.x, box.y - 5, box.width, box.width)// box.x , box.y - 20 , box.width * 3 , box.width * 3)
  ]
  let faceImages = await faceapi.extractFaces(inputImage, regionsToExtract)
  if (faceImages.length == 0) {
    console.log('Face not found')
  }
  else {
    faceImages.forEach(cnv => {
      var cnvURI = cnv.toDataURL("image/jpeg");
      var tempImage = new Image();
      tempImage.src = cnvURI;
      tempImage.onload = function () {
        var canvas = document.createElement('canvas');
        var canvasContext = canvas.getContext("2d");
        var width = 400;
        var height = 400;
        canvas.width = width;
        canvas.height = height;
        canvasContext.drawImage(this, 0, 0, width, height);
        // var dataURI = canvas.toDataURL("image/jpeg");
        // outputImage.src = dataURI;
        outputImageData = canvas;
      }
    })
  }
}
