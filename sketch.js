let capture;
let faceMesh;
let faces = [];
let earringImg;

function preload() {
  // 初始化 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh();
  // 載入位於 pic/acc/ 目錄下的耳環圖片
  earringImg = loadImage('pic/acc/acc1_ring.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide(); // 隱藏預設的影片 DOM 元件

  // 開始持續偵測臉部
  faceMesh.detectStart(capture, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background('#e7c6ff');

  // 在擷取影像外（畫布上方）顯示文字
  fill(0); // 設定文字顏色為黑色
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text("414730654魏伯諺", width / 2, height * 0.07);
  text("作品為影像辨識_耳環臉譜", width / 2, height * 0.13);

  let w = width * 0.5;
  let h = height * 0.5;

  push();
  translate(width / 2, height / 2); // 移動到畫布中心
  scale(-1, 1); // 左右翻轉（鏡像）
  imageMode(CENTER);
  image(capture, 0, 0, w, h);

  // 繪製耳環效果
  for (let face of faces) {
    // 150 為左耳垂位置, 379 為右耳垂位置
    drawEarring(face.keypoints[150], w, h);
    drawEarring(face.keypoints[379], w, h);
  }
  pop();
}

function drawEarring(kp, displayW, displayH) {
  if (kp) {
    // 將攝影機座標映射到目前的顯示畫面上
    let x = map(kp.x, 0, capture.width, -displayW / 2, displayW / 2);
    let y = map(kp.y, 0, capture.height, -displayH / 2, displayH / 2);

    // 在耳垂位置顯示耳環圖片，稍微往下移一點點（+15）增加懸掛感
    image(earringImg, x, y + 15, 30, 30);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
