feather.replace();
var global_pause=false;
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

let variables={}

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
modelClose.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  const options = videoDevices.map((videoDevice) => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join("");
};


play.onclick = () => {
  afterStartVideo.style.display="block"
  video.classList.remove("d-none");

  replacingImage.style.display="none"
  imageText.style.display="none"


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
  global_pause=true;
  video.pause();
  play.classList.remove("d-none");
  pause.classList.add("d-none");
};

const doScreenshot = (e) => {
  while(!global_pause){
    canvas.width = video.videoWidth / 3;
    canvas.height = video.videoHeight / 3;
    canvas
      .getContext("2d")
      .drawImage(video, 0, 0, video.videoWidth / 3, video.videoHeight / 3);
    screenshotImage.src = canvas.toDataURL("image/jpg", 0.7);
  
    var binStr = atob(canvas.toDataURL("image/png", 0.2).split(",")[1]),
      len = binStr.length,
      arr = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
  
    let blob = new Blob([arr], { type: "image/png" });
  
    // console.log(screenshotImage);
    variables.blob=blob
    variables.arr=arr
    screenshotImage.classList.remove("d-none");
    submitAction(e)
    setTimeout(() => {
      checkGlobalStatus()
    }, 1000);
  }
};

const submitAction = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("name", "UserName");
  // JavaScript file-like object
  const content = '<q id="a"><span id="b">hey!</span></q>'; // the body of the new file…
  const blob = new Blob([variables.arr], { type: "text/xml" });
  console.log(blob)
  formData.append("file1", blob);

  const request = new XMLHttpRequest();
  request.open("POST", "/after");
  request.send(formData);

  let responseVal;
  request.onreadystatechange = function() {
    if (request.readyState == XMLHttpRequest.DONE) {
        responseVal=(request.responseText)
        responseToDom(responseVal)
    }
}


  // const src = screenshotImage;
  // const form = document.forms.namedItem("mainForm");
  // console.log(form);
  // let formData = new FormData(form);
  // formData.append("image", src[1]);
  // getData(formData);
  // console.log(formData);
  // console.log("invoked");
};

const responseToDom=async(val)=>{
  let responseObj={
    'Neutral':"😐",
    'Happy':"😊",
    'Sad':"🙁",
    'Anger':"😠",
    'Fear':"😨",
    'Disgust':"😖",
    'Suprise':"😯"
  }
  //open the model
  const data=val.split(',')[0]
  const image=val.split(',')[1]
  modal.style.display = "block";
  modelText.innerHTML=responseObj[data]

  responseImage.src=`../static/${image}`


}




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








// From https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob, needed for Safari:
// if (!HTMLCanvasElement.prototype.toBlob) {
//   Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
//     value: function (callback, type, quality) {
//       var binStr = atob(this.toDataURL(type, quality).split(",")[1]),
//         len = binStr.length,
//         arr = new Uint8Array(len);

//       for (var i = 0; i < len; i++) {
//         arr[i] = binStr.charCodeAt(i);
//       }

//       callback(new Blob([arr], { type: type || "image/png" }));
//     },
//   });
// }

// window.URL = window.URL || window.webkitURL;

// // Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// // -2 = not jpeg, -1 = no data, 1..8 = orientations
// function getExifOrientation(file, callback) {
//   // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
//   if (file.slice) {
//     file = file.slice(0, 131072);
//   } else if (file.webkitSlice) {
//     file = file.webkitSlice(0, 131072);
//   }

//   var reader = new FileReader();
//   reader.onload = function (e) {
//     var view = new DataView(e.target.result);
//     if (view.getUint16(0, false) != 0xffd8) {
//       callback(-2);
//       return;
//     }
//     var length = view.byteLength,
//       offset = 2;
//     while (offset < length) {
//       var marker = view.getUint16(offset, false);
//       offset += 2;
//       if (marker == 0xffe1) {
//         if (view.getUint32((offset += 2), false) != 0x45786966) {
//           callback(-1);
//           return;
//         }
//         var little = view.getUint16((offset += 6), false) == 0x4949;
//         offset += view.getUint32(offset + 4, little);
//         var tags = view.getUint16(offset, little);
//         offset += 2;
//         for (var i = 0; i < tags; i++)
//           if (view.getUint16(offset + i * 12, little) == 0x0112) {
//             callback(view.getUint16(offset + i * 12 + 8, little));
//             return;
//           }
//       } else if ((marker & 0xff00) != 0xff00) break;
//       else offset += view.getUint16(offset, false);
//     }
//     callback(-1);
//   };
//   reader.readAsArrayBuffer(file);
// }

// // Derived from https://stackoverflow.com/a/40867559, cc by-sa
// function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation) {
//   var canvas = document.createElement("canvas");
//   if (orientation > 4) {
//     canvas.width = rawHeight;
//     canvas.height = rawWidth;
//   } else {
//     canvas.width = rawWidth;
//     canvas.height = rawHeight;
//   }

//   if (orientation > 1) {
//     console.log("EXIF orientation = " + orientation + ", rotating picture");
//   }

//   var ctx = canvas.getContext("2d");
//   switch (orientation) {
//     case 2:
//       ctx.transform(-1, 0, 0, 1, rawWidth, 0);
//       break;
//     case 3:
//       ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight);
//       break;
//     case 4:
//       ctx.transform(1, 0, 0, -1, 0, rawHeight);
//       break;
//     case 5:
//       ctx.transform(0, 1, 1, 0, 0, 0);
//       break;
//     case 6:
//       ctx.transform(0, 1, -1, 0, rawHeight, 0);
//       break;
//     case 7:
//       ctx.transform(0, -1, -1, 0, rawHeight, rawWidth);
//       break;
//     case 8:
//       ctx.transform(0, -1, 1, 0, 0, rawWidth);
//       break;
//   }
//   ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
//   return canvas;
// }

// function reduceFileSize(
//   file,
//   acceptFileSize,
//   maxWidth,
//   maxHeight,
//   quality,
//   callback
// ) {
//   if (file.size <= acceptFileSize) {
//     callback(file);
//     return;
//   }
//   var img = new Image();
//   img.onerror = function () {
//     URL.revokeObjectURL(this.src);
//     callback(file);
//   };
//   img.onload = function () {
//     URL.revokeObjectURL(this.src);
//     getExifOrientation(file, function (orientation) {
//       var w = img.width,
//         h = img.height;
//       var scale =
//         orientation > 4
//           ? Math.min(maxHeight / w, maxWidth / h, 1)
//           : Math.min(maxWidth / w, maxHeight / h, 1);
//       h = Math.round(h * scale);
//       w = Math.round(w * scale);

//       var canvas = imgToCanvasWithOrientation(img, w, h, orientation);
//       canvas.toBlob(
//         function (blob) {
//           console.log(
//             "Resized image to " + w + "x" + h + ", " + (blob.size >> 10) + "kB"
//           );
//           callback(blob);
//         },
//         "image/jpeg",
//         quality
//       );
//     });
//   };
//   img.src = URL.createObjectURL(file);
// }

checkGlobalStatus=()=>{
  
}

pause.onclick = pauseStream;
screenshot.onclick = doScreenshot;
submitData.onclick = submitAction;
