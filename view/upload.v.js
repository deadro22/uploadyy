const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fl-upload-j");
const browseClick = document.getElementById("br_f");
const form = document.getElementById("fr-ac");
const fileDisplayContainer = document.getElementById("file-list-container");
const uploadInfoContainer = document.getElementById("fl-upload-info");
const appStats = document.getElementById("appGlobalStats");

const makeErrorNotification = (err) => {
  appStats.style.visibility = "visible";
  appStats.style.backgroundColor = "red";
  appStats.innerText = err;
  setTimeout(() => {
    appStats.style.visibility = "hidden";
  }, 2000);
};

const makeSuccessNotification = (msg) => {
  appStats.style.visibility = "visible";
  appStats.style.backgroundColor = "rgb(71, 175, 76)";
  appStats.innerText = msg;
  setTimeout(() => {
    appStats.style.visibility = "hidden";
  }, 2000);
};

document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "br_f") {
    fileInput.click();
  } else if (e.target && e.target.id === "btn-clr-fl") {
    e.target.parentNode.remove();
    const prevHistory = JSON.parse(localStorage.getItem("history"));
    const attr = e.target.getAttribute("data-flname");
    prevHistory[attr] && delete prevHistory[attr];
    localStorage.setItem("history", JSON.stringify(prevHistory));
  } else if (e.target && e.target.id === "dw-fl-info") {
    window.open(e.target.getAttribute("data-url"), "_blank");
  } else if (e.target && e.target.id === "cpy-fl-info") {
    copyTextToClipboard(e.target.getAttribute("data-url"));
  }
});

const clearDisp = (ev) => {
  uploadInfoContainer.innerHTML = `
            Drop your files here<br />
            or
            <span id="br_f">Browse</span>
            <input
              type="file"
              name="file"
              style="display: none"
              id="fl-upload-j"
            />`;
};

const handleFileUpload = function (file) {
  document.getElementById("fl-upload-info").innerHTML =
    "<div><p>Uploading " +
    file.name +
    "</p></br><div class='loader'></div></div>";
  const formData = new FormData();
  formData.append("file", file);
  fetch("/api/file/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((success) => {
      if (success.error) {
        makeErrorNotification(success.error);
        uploadInfoContainer.innerHTML =
          "<h3>" +
          success.error +
          "</h3>" +
          '<button id="clr-btn" onclick="clear">Clear</button>';
        document.getElementById("clr-btn").addEventListener("click", clearDisp);
      } else {
        uploadInfoContainer.innerHTML = `<h3 id="fl-stat-gen">File Uploaded</h3>
           <a class="disp-info-c" target="_blank" href="${success.url}">${success.url}</a></br>
           <button id="clr-btn" onclick="clear">Clear</button>
           `;
        document.getElementById("clr-btn").addEventListener("click", clearDisp);
        const prevHistory = JSON.parse(localStorage.getItem("history"));

        localStorage.setItem(
          "history",
          JSON.stringify({
            ...prevHistory,
            [success.key]: { url: success.url, name: success.name },
          })
        );
        fileDisplayContainer.innerHTML += fileDisplayHistory({
          name: success.name,
          url: success.url,
          key: success.key,
        });
      }
    })
    .catch((e) => {
      makeErrorNotification(e.message);
      clearDisp();
    });
};

const copyTextToClipboard = (text) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      makeSuccessNotification("Download link copied to clipboard !");
    },
    function (err) {
      makeErrorNotification("Could not copy download link !");
    }
  );
};

const dropHandler = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (["dragenter", "dragover"].includes(e.type)) {
    dropArea.classList.add("drp-on");
  } else {
    dropArea.classList.remove("drp-on");
  }
  if (e.type === "drop") {
    if (e.dataTransfer.files.length > 1) {
      makeErrorNotification("Multiple file upload is not supported");
    } else {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }
};

dropArea.addEventListener("dragenter", dropHandler, false);
dropArea.addEventListener("dragleave", dropHandler, false);
dropArea.addEventListener("dragover", dropHandler, false);
dropArea.addEventListener("drop", dropHandler, false);

const fileDisplayHistory = (data) => `<div class="file-disp">
<img src="download.png" id="dw-fl-info" data-url="${data.url}"/>
<a class="disp-info-c" id="cpy-fl-info" data-url="${data.url}">${data.name}</a>
<button id="btn-clr-fl" data-flname="${data.key}">x</button>
</div>`;

document.querySelector("body").onload = function () {
  const history = JSON.parse(localStorage.getItem("history"));
  if (!history) return;
  const vals = Object.values(history);
  Object.keys(history).forEach((historyUpload, ind) => {
    fileDisplayContainer.innerHTML += fileDisplayHistory({
      url: vals[ind].url,
      name: vals[ind].name,
      key: historyUpload,
    });
  });
};

fileInput.addEventListener("change", (ev) =>
  handleFileUpload(ev.target.files[0])
);
