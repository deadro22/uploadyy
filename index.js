const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const upload = require("./routes/upload");

app.use(express.json());
app.use(express.static(__dirname + "/view"));
app.use(
  fileUpload({
    limits: { fileSize: 1e8 },
    abortOnLimit: true,
    limitHandler: function (req, res) {
      return res.status(400).json({ error: "File size is bigger than 100MB" });
    },
  })
);

app.get("/upload", (req, res) => {
  res.render(__dirname + "/view/upload.ejs");
});

app.use("/api/file", upload);

app.listen(4000, () => {
  console.log("Listening on port 4000");
});
