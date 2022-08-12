const express = require("express");
const fs = require("fs");
const http = require("http");
const ufs = require("url-file-size");
const app = express();
const path =
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4";

app.use(express.static("./static"));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "static/index.html"));
});

app.get("/video", (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  ufs(path)
    .then((resSize) => {
      console.log("called");
      const CHUNK_SIZE = 5 * 10 ** 5;
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, resSize - 1);

      const options = {
        method: "GET",
        headers: {
          range: `bytes=${start}-${end}`,
        },
      };
      http.get(path, options, (resp) => {
        const contentLength = end - start + 1;
        const headers = {
          "Content-Range": `bytes ${start}-${end}/${resSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);
        resp.pipe(res);
      });
    })
    .catch((error) => console.log(error));

  // const file = fs.createWriteStream("first.mp4");
  // http.get(path, (resp) => {
  //   resp.pipe(file);
  //   file.on("finish", () => {
  //     ufs(path)
  //       .then((res) => {
  //         content(res);
  //       })
  //       .catch((error) => console.log(error));
  //   });
  // });
  // const content = (resSize) => {
  //   const videoPath = "first.mp4";
  //   const videoSize = resSize;
  //   console.log(videoSize);

  //   const CHUNK_SIZE = 5 * 10 ** 5;
  //   const start = Number(range.replace(/\D/g, ""));
  //   const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  //   const contentLength = end - start + 1;
  //   const headers = {
  //     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
  //     "Accept-Ranges": "bytes",
  //     "Content-Length": contentLength,
  //     "Content-Type": "video/mp4",
  //   };

  //   res.writeHead(206, headers);
  //   const videoStream = fs.createReadStream(videoPath, { start, end });
  //   videoStream.pipe(res);
  // };
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
