// feather.replace();

const controls = document.querySelector(".controls");
const cameraOptions = document.querySelector(".video-options>select");
const video = document.querySelector("video");
const canvas = document.querySelector("canvas");
const screenshotImage = document.querySelector(".screenshot-image");
const buttons = [...controls.querySelectorAll("button")];

const submit=document.querySelector(".finalSubmit")
const submitButtons=[...submit.querySelectorAll("button")]
const [submitData] = submitButtons;

let streamStarted = false;

const [play, pause, screenshot] = buttons;

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

const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  const options = videoDevices.map((videoDevice) => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join("");
};

play.onclick = () => {
  if (streamStarted) {
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
  video.pause();
  play.classList.remove("d-none");
  pause.classList.add("d-none");
};

const doScreenshot = () => {
  canvas.width = video.videoWidth/3;
  canvas.height = video.videoHeight/3;
  console.log("screenshot");
  canvas.getContext("2d").drawImage(video, 0, 0,video.videoWidth/3, video.videoHeight/3);
  screenshotImage.src = canvas.toDataURL("image/jpg",0.7);


//   var binStr = atob(canvas.toDataURL("image/png", 0.2).split(',')[1]),
//   len = binStr.length,
//   arr = new Uint8Array(len);

  console.log(screenshotImage);
  screenshotImage.classList.remove("d-none");
  
};

const submitAction = async () => {

  const src=screenshotImage.src.split(',')
  const form = document.forms.namedItem('mainForm');
  // console.log(form)
  let formData = new FormData(form);
  formData.append("image", src[1]);
  getData(formData)

  console.log("invoked")

 
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




//   // From https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob, needed for Safari:
// if (!HTMLCanvasElement.prototype.toBlob) {
//   Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
//       value: function(callback, type, quality) {

//           var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
//               len = binStr.length,
//               arr = new Uint8Array(len);

//           for (var i = 0; i < len; i++) {
//               arr[i] = binStr.charCodeAt(i);
//           }

//           callback(new Blob([arr], {type: type || 'image/png'}));
//       }
//   });
// }
// window.URL = window.URL || window.webkitURL;

pause.onclick = pauseStream;
screenshot.onclick = pauseStream;
submitData.onclick = pauseStream;
