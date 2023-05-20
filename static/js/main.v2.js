feather.replace();
var global_pause = false;
const controls = document.querySelector(".controls");
const cameraOptions = document.querySelector(".video-options>select");
const video = document.querySelector("video");
const canvas = document.querySelector("canvas");
const screenshotImage = document.querySelector(".screenshot-image");
const buttons = [...controls.querySelectorAll("button")];

const submit = document.querySelector(".finalSubmit");
const submitButtons = [...submit.querySelectorAll("button")];
const [submitData] = submitButtons;

var replacingImage = document.getElementById("replacingImage");
var afterStartVideo = document.getElementById("afterStartVideo");
var imageText = document.getElementById("imageText");
var responseImage = document.getElementById("responseImage");

//For model
var modal = document.getElementById("myModal");
var modelClose = document.getElementById("myModelClose");
var modelText = document.getElementById("modelText");

let streamStarted = false;

const [play, pause, screenshot] = buttons;

let variables = {};

const constraints = {
  video: {
    width: {
      min: 700,
      ideal: 1280,
      max: 2560,
    },
    height: {
      min: 450,
      ideal: 720,
      max: 1440,
    },
    facingMode: "user",
  },
};

//Model funtions
modelClose.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  const options = videoDevices.map((videoDevice) => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join("");
};

play.onclick = () => {
  afterStartVideo.style.display = "block";
  video.classList.remove("d-none");

  replacingImage.style.display = "none";
  imageText.style.display = "none";

  if (streamStarted) {
    global_pause=false
    video.play();
    play.classList.add("d-none");
    pause.classList.remove("d-none");
    return;
  }
  if ("mediaDevices" in navigator && navigator.mediaDevices.getUserMedia) {
    const updatedConstraints = {
      ...constraints,
      deviceId: {
        exact: cameraOptions.value,
      },
    };
    startStream(updatedConstraints);
  }
};

const startStream = async (constraints) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  handleStream(stream);
};

const handleStream = (stream) => {
  video.srcObject = stream;
  play.classList.add("d-none");
  pause.classList.remove("d-none");
  screenshot.classList.remove("d-none");
  streamStarted = true;
};

getCameraSelection();

cameraOptions.onchange = () => {
  const updatedConstraints = {
    ...constraints,
    deviceId: {
      exact: cameraOptions.value,
    },
  };
  startStream(updatedConstraints);
};

const pauseStream = () => {
  global_pause = true;
  video.pause();
  play.classList.remove("d-none");
  pause.classList.add("d-none");
};

const doScreenshot = (e) => {
  canvas.width = video.videoWidth / 3;
  canvas.height = video.videoHeight / 3;
  canvas
    .getContext("2d")
    .drawImage(video, 0, 0, video.videoWidth / 3, video.videoHeight / 3);
  screenshotImage.src = canvas.toDataURL("image/jpg", 0.7);

  var binStr = atob(canvas.toDataURL("image/png", 0.2).split(",")[1]),
    len = binStr.length,
    arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }

  let blob = new Blob([arr], { type: "image/png" });

  // console.log(screenshotImage);
  variables.blob = blob;
  variables.arr = arr;
  screenshotImage.classList.remove("d-none");
  submitAction(e);
}

const submitAction = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("name", "UserName");
  // JavaScript file-like object
  const content = '<q id="a"><span id="b">hey!</span></q>'; // the body of the new file…
  const blob = new Blob([variables.arr], { type: "text/xml" });
  console.log(blob);
  formData.append("file1", blob);

  const request = new XMLHttpRequest();
  request.open("POST", "/after");
  request.send(formData);

  let responseVal;
  request.onreadystatechange = function () {
    if (request.readyState == XMLHttpRequest.DONE) {
      responseVal = request.responseText;
      responseToDom(e,responseVal);
    }
  };

  // const src = screenshotImage;
  // const form = document.forms.namedItem("mainForm");
  // console.log(form);
  // let formData = new FormData(form);
  // formData.append("image", src[1]);
  // getData(formData);
  // console.log(formData);
  // console.log("invoked");
};

const responseToDom = async (e,val) => {
  let responseObj = {
    Neutral: "😐",
    Happy: "😊",
    Sad: "🙁",
    Anger: "😠",
    Fear: "😨",
    Disgust: "😖",
    Suprise: "😯",
  };
  //open the model
  const data = val.split(",")[0];
  const image = val.split(",")[1];
  // modal.style.display = "block";
  modelText.innerHTML = responseObj[data];
  responseImage.src = `../static/${image}`;
  console.log("finished")
  if(!global_pause){
    doScreenshot(e)
  }
};

const getData = async (formData) => {
  await fetch("upload.php", {
    method: "POST",
    headers: {
      Authorization: "Bearer",
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
};



pause.onclick = pauseStream;
screenshot.onclick = doScreenshot;
submitData.onclick = submitAction;
