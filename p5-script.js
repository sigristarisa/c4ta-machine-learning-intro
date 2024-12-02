let bodyPose;
let connections;
let poses = [];
const face = ["nose", "ear", "eye"];

function preload() {
  video = createVideo("./video.mp4");
  video.hide();
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(384, 848);

  video.volume(0);
  video.play();
  video.loop();

  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
}

function draw() {
  image(video, 0, 0, width, height);
  drawKeyPoints();
  drawFace();
  drawAura();
}

function gotPoses(results) {
  poses = results;
}

function isFace(keypoint) {
  return face.some((facePart) => keypoint.includes(facePart));
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

function drawKeyPoints() {
  for (let i = 0; i < poses.length; i++) {
    const keypoints = poses[i].keypoints;
    for (let j = 0; j < keypoints.length; j++) {
      getLines(poses[i]);
      if (!isFace(keypoints[j].name)) {
        fill("white");
        circle(keypoints[j].x, keypoints[j].y, 8);
      }
    }
  }
}

function drawLines(pointA, pointB) {
  stroke(255);
  strokeWeight(this.size / 5);
  line(pointA.x, pointA.y, pointB.x, pointB.y);
}

function getLines(pose) {
  for (let i = 0; i < connections.length; i++) {
    let pointAIndex = connections[i][0];
    let pointBIndex = connections[i][1];
    let pointA = pose.keypoints[pointAIndex];
    let pointB = pose.keypoints[pointBIndex];
    drawLines(pointA, pointB);
  }
}

function drawFace() {
  for (let i = 0; i < poses.length; i++) {
    const keypoints = poses[i].keypoints;
    const faceKeypoints = keypoints.filter((keypoint) => isFace(keypoint.name));
    const faceX = getAverage(faceKeypoints, "x");
    const faceY = getAverage(faceKeypoints, "y");
    fill("white");
    circle(faceX, faceY, 60);

    textAlign(CENTER, CENTER);
    textSize(16);
    fill("black");

    text("OM", faceX, faceY);
  }
}

function drawAura() {
  for (let i = 0; i < poses.length; i++) {
    const keypoints = poses[i].keypoints;

    const bodyX = getAverage(keypoints, "x");
    const bodyY = getAverage(keypoints, "y");

    noFill();
    circle(bodyX, bodyY, 400);
  }
}
