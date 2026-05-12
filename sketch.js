let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringImages = [];
let currentEarringIndex = 0;

function preload() {
  // 初始化 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh();
  // 初始化 ml5 handPose 模型
  handPose = ml5.handPose();

  // 載入 5 種耳環圖片
  earringImages[0] = loadImage('pic/acc/acc1_ring.png');
  earringImages[1] = loadImage('pic/acc/acc2_pearl.png');
  earringImages[2] = loadImage('pic/acc/acc3_tassel.png');
  earringImages[3] = loadImage('pic/acc/acc4_jade.png');
  earringImages[4] = loadImage('pic/acc/acc5_phoenix.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide(); // 隱藏預設的影片 DOM 元件

  // 開始持續偵測臉部
  faceMesh.detectStart(capture, gotFaces);
  // 開始持續偵測手勢
  handPose.detectStart(capture, gotHands);
}

function gotFaces(results) {
  faces = results;
}

function gotHands(results) {
  hands = results;
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

  // 偵測手勢並更新目前選中的耳環 (手指數量 1~5)
  if (hands.length > 0) {
    let numFingers = countFingers(hands[0]);
    if (numFingers >= 1 && numFingers <= 5) {
      currentEarringIndex = numFingers - 1;
    }
  }

  let w = width * 0.5;
  let h = height * 0.5;

  push();
  translate(width / 2, height / 2); // 移動到畫布中心
  scale(-1, 1); // 左右翻轉（鏡像）
  imageMode(CENTER);
  image(capture, 0, 0, w, h);

  // 繪製耳環效果
  for (let face of faces) {
    // 使用臉部邊界點 (234 與 454) 計算參考寬度，實現比率位移與縮放
    let faceWidth = dist(face.keypoints[234].x, face.keypoints[234].y, face.keypoints[454].x, face.keypoints[454].y);

    // 150 為左耳垂位置, 379 為右耳垂位置
    // 1 表示左耳方向 (畫面右側), -1 表示右耳方向 (畫面左側)
    drawEarring(face.keypoints[150], w, h, 1, faceWidth);
    drawEarring(face.keypoints[379], w, h, -1, faceWidth);
  }
  pop();
}

// 簡易手指數計算法
function countFingers(hand) {
  let count = 0;
  // 檢查食指、中指、無名指、小指尖端是否高於其關節 (Y 軸向上為減少)
  let tips = [8, 12, 16, 20];
  let joints = [6, 10, 14, 18];
  for (let i = 0; i < 4; i++) {
    if (hand.keypoints[tips[i]].y < hand.keypoints[joints[i]].y) count++;
  }
  // 大拇指檢測 (根據左右手標籤判斷水平伸展距離)
  let thumbTip = hand.keypoints[4];
  let thumbBase = hand.keypoints[2];
  if (hand.label === "Left" ? thumbTip.x < thumbBase.x - 15 : thumbTip.x > thumbBase.x + 15) count++;
  return count;
}

function drawEarring(kp, displayW, displayH, sideDir, faceWidth) {
  if (kp) {
    let scaleFactor = displayW / capture.width; // 計算攝影機與畫布顯示的比率

    // 將攝影機座標映射到目前的顯示畫面上
    let x = map(kp.x, 0, capture.width, -displayW / 2, displayW / 2);
    let y = map(kp.y, 0, capture.height, -displayH / 2, displayH / 2);

    // 比率位移：往外移動臉寬的 5%，往上移動臉寬的 2%
    let shiftX = (faceWidth * scaleFactor * 0.05) * sideDir;
    let shiftY = -(faceWidth * scaleFactor * 0.02);

    let img = earringImages[currentEarringIndex];
    // 耳環大小也按臉寬比例進行縮放 (臉寬的 18%)
    let s = faceWidth * scaleFactor * 0.18;
    image(img, x + shiftX, y + shiftY, s, s);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
