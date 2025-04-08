import { BrowserMultiFormatReader } from "@zxing/browser";

const videoElement = document.getElementById("video");
const outputElement = document.getElementById("output");
const codeReader = new BrowserMultiFormatReader();

let videoDevices = [];
let currentDeviceIndex = 0;

localStorage.progress = 0;

async function startScanner(deviceId = null) {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter((device) => device.kind === "videoinput");

    if (videoDevices.length > 0) {
      if (!deviceId) {
        deviceId = videoDevices[currentDeviceIndex].deviceId;
      }

      codeReader.decodeFromVideoDevice(
        deviceId,
        videoElement,
        (result, err) => {
          if (result) {
            const scannedValue = result.text.trim();
            outputElement.textContent = scannedValue;
            console.log("QR Code Scanned:", scannedValue);
            showDraggableItem(scannedValue);
          }
        }
      );
    } else {
      console.error("No video input devices found.");
    }
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

function switchCamera() {
  if (videoDevices.length < 2) {
    console.warn("No alternative camera found.");
    return;
  }

  currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
  console.log(`Switching to camera: ${videoDevices[currentDeviceIndex].label}`);

  codeReader.reset(); // Stop previous scanner
  startScanner(videoDevices[currentDeviceIndex].deviceId);
}

document.getElementById("switchCamera").addEventListener("click", switchCamera);

function showDraggableItem(scannedValue) {
  const mapping = {
    1: ["#normal-draggable-1", "#audio-1"],
    2: ["#normal-draggable-2", "#audio-2"],
    3: ["#normal-draggable-3", "#audio-3"],
    4: ["#normal-draggable-4", "#audio-4"],
    5: ["#normal-draggable-5", "#audio-5"],
    6: ["#normal-draggable-6", "#audio-6"],
    7: ["#normal-draggable-7", "#audio-7"],
    8: ["#normal-draggable-8", "#audio-8"],
    9: ["#normal-draggable-9", "#audio-9"],
    10: ["#big-draggable-1", "#audio-10"],
    11: ["#big-draggable-2", "#audio-11"],
    12: ["#big-draggable-3", "#audio-12"],
  };

  const draggableSelector = mapping[scannedValue];
  console.log(draggableSelector);
  const audioItems = document.querySelectorAll(".audio-initial");

  audioItems.forEach((item) => {
    item.style.display = "none";
  });
  if (draggableSelector) {
    $(draggableSelector[0]).fadeIn(500);
    $(draggableSelector[1]).fadeIn(500);
  } else {
    console.warn("Scanned value does not match any draggable item.");
  }
}

startScanner();

$(function () {
  let unsolvedChapters = [1, 2, 3];

  function getExpectedMapping(chapter) {
    const mappings = {
      1: {
        "big-droppable-1": "big-draggable-1",
        "normal-droppable-1": "normal-draggable-1",
        "normal-droppable-2": "normal-draggable-2",
        "normal-droppable-3": "normal-draggable-3",
      },
      2: {
        "big-droppable-1": "big-draggable-2",
        "normal-droppable-1": "normal-draggable-4",
        "normal-droppable-2": "normal-draggable-5",
        "normal-droppable-3": "normal-draggable-6",
      },
      3: {
        "big-droppable-1": "big-draggable-3",
        "normal-droppable-1": "normal-draggable-7",
        "normal-droppable-2": "normal-draggable-8",
        "normal-droppable-3": "normal-draggable-9",
      },
    };
    return mappings[chapter] || {};
  }

  function resetDroppables() {
    $(".droppable").each(function () {
      $(this)
        .data("dropped", null)
        .removeClass("ui-state-highlight")
        .find("p")
        .html("Drop Here");
    });
  }

  $(".draggable").draggable().hide();

  $(".droppable").droppable({
    accept: ".draggable",
    drop: function (event, ui) {
      const droppedItem = ui.helper.attr("id");
      $(this)
        .data("dropped", droppedItem)
        .addClass("ui-state-highlight")
        .find("p")
        .html("Placed!");
    },
    out: function (event, ui) {
      $(this)
        .data("dropped", null)
        .removeClass("ui-state-highlight")
        .find("p")
        .html("Drop Here");
    },
  });

  $(".check-button").click(function () {
    let currentPlacement = {
      "big-droppable-1": $("#big-droppable-1").data("dropped"),
      "normal-droppable-1": $("#normal-droppable-1").data("dropped"),
      "normal-droppable-2": $("#normal-droppable-2").data("dropped"),
      "normal-droppable-3": $("#normal-droppable-3").data("dropped"),
    };

    let solvedChapter = null;
    unsolvedChapters.forEach((chapter) => {
      let mapping = getExpectedMapping(chapter);
      let match = Object.keys(mapping).every(
        (droppableId) => currentPlacement[droppableId] === mapping[droppableId]
      );
      if (match) {
        solvedChapter = chapter;
      }
    });

    if (solvedChapter !== null) {
      completeChapter(solvedChapter);
      localStorage.progress++;
      console.log(localStorage.progress);
      document.getElementById(`pb${localStorage.progress}`).style.display =
        "block";
    } else {
      // alert("Some items are not placed correctly, or the order is wrong!");
      const body = document.body;
      console.log(body.style.backgroundImage);
      const originalFilter = body.style.filter;
      const originalBackgroundColor = body.style.background;
      const bgimage = body.style.backgroundImage;
      console.log(bgimage);

      // Apply blur and red background
      body.style.filter = "blur(5px)";
      body.style.backgroundColor = "red"; // Semi-transparent red
      body.style.backgroundImage = "none"; 

      // Revert to normal after 1 second (1000 milliseconds)
      setTimeout(() => {
        body.style.filter = originalFilter;
        body.style.background = originalBackgroundColor;
        body.style.backgroundImage = bgimage; // Restore the original background image
      }, 500);
    }
  });

  function completeChapter(chapter) {
    $(".draggable[data-chapter='" + chapter + "']").each(function () {
      $(this).draggable("disable").css({
        opacity: "0",
        "pointer-events": "none",
      });
    });

    unsolvedChapters = unsolvedChapters.filter((ch) => ch !== chapter);
    resetDroppables();

    if (unsolvedChapters.length === 0) {
      // alert("Congratulations! All chapters completed!");
      $("#random-card-btn").prop("disabled", true);
      $(".check-button").prop("disabled", true);
    }
  }
});
