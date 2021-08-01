const AWS = require("aws-sdk");
const crypto = require("crypto");
require("dotenv").config();

const { AWS_BUCKET_NAME, AWS_BUCKET_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } =
  process.env;

const s3 = new AWS.S3({
  region: AWS_BUCKET_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

module.exports.upload = function (req, res) {
  const Key = `${crypto.randomBytes(10).toString("hex")}.${
    req.files.file.name
  }`;
  const up_params = {
    Bucket: AWS_BUCKET_NAME,
    Body: req.files.file.data,
    Key,
  };

  s3.upload(up_params, (err, data) => {
    if (err) throw err;
    res.json({
      message: "File uploaded at: /download/" + data.key,
      url: `${req.connection.encrypted ? "https" : "http"}://${
        req.headers.host
      }/api/file/download/${data.key}`,
      key: Key,
      name: req.files.file.name,
    });
  });
};

module.exports.download = function (req, res) {
  const key = req.params.key;
  const downloadParams = {
    Bucket: AWS_BUCKET_NAME,
    Key: key,
  };
  const fOb = s3.getObject(downloadParams);
  fOb
    .on("httpHeaders", (status, headers) => {
      res.set("Content-Length", headers["content-length"]);
      res.set("Content-Type", headers["content-type"]);
    })
    .promise()
    .then((ob) => {
      s3.getObject(downloadParams).createReadStream().pipe(res);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ Error: "Invalid File" });
    });
};
