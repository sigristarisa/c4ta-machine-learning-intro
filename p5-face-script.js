let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 5, refineLandmarks: false, flipHorizontal: false };
let segmentationOptions = {
  maskType: "parts",
};
let bodySegmentation;
let segmentation;

function preload() {
  faceMesh = ml5.faceMesh(options);
  bodySegmentation = ml5.bodySegmentation("BodyPix", segmentationOptions);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);

  video.hide();
  faceMesh.detectStart(video, gotFaces);
  bodySegmentation.detectStart(video, gotResults);
}

function draw() {
  image(video, 0, 0, width, height);

  if (segmentation) {
    image(segmentation.mask, 0, 0, width, height);
    // changeColor();
  }

  createEye("leftEye");
  createEye("rightEye");
  createMouth();
  createThought();
}

function gotFaces(results) {
  faces = results;
}

function gotResults(result) {
  segmentation = result;
}

function getAverage(keypoints, pos) {
  if (keypoints.length) {
    const total = keypoints.reduce((sum, keypoint) => {
      return sum + keypoint[pos];
    }, 0);

    return total / keypoints.length;
  }
  return 0;
}
function createEye(side) {
  const whiteEye = 400;
  const pupil = 160;

  for (let i = 0; i < faces.length; i++) {
    let eye = faces[i][side];
    const eyeX = getAverage(eye.keypoints, "x");
    const eyeY = getAverage(eye.keypoints, "y");
    const z = faces[i].box.width / windowWidth;

    push();
    circle(eyeX, eyeY, whiteEye * z);
    pop();

    push();
    fill("black");
    circle(eyeX, eyeY, pupil * z);

    pop();
  }
}

function createMouth() {
  for (let i = 0; i < faces.length; i++) {
    let mouth = faces[i].lips;

    push();
    fill("black");
    arc(
      mouth.centerX,
      mouth.centerY - 20,
      mouth.width + 60,
      mouth.height + 60,
      0,
      PI
    );
    pop();
  }
}

function createThought() {
  const bubbleSize = 900;
  const cookieSize = 360;
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i].faceOval;
    const z = faces[i].box.width / windowWidth;

    push();
    translate(200, -200);
    textSize(bubbleSize * z);
    text("💭", face.centerX, face.centerY);
    pop();

    push();
    translate(280, -260);
    textSize(cookieSize * z);
    textAlign(CENTER);
    text("🍪", face.centerX, face.centerY);
    pop();
  }
}

function changeColor() {
  let parts = bodySegmentation.getPartsId();
  let gridSize = 1;
  for (let x = 0; x < video.width; x += gridSize) {
    for (let y = 0; y < video.height; y += gridSize) {
      if (
        segmentation.data[y * video.width + x] == parts.LEFT_FACE ||
        segmentation.data[y * video.width + x] == parts.RIGHT_FACE
      ) {
        fill(255, 0, 0, 200);
        noStroke();
        square(x, y, gridSize);
      } else {
        noFill();
      }
    }
  }
}
