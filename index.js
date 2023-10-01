require("dotenv").config();
const fs = require("fs");
const express = require("express");
const { createCanvas, loadImage } = require("canvas");

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const { IgApiClient } = require("instagram-private-api");
const { get } = require("request-promise");
const CronJob = require("cron").CronJob;

const postToInsta = async () => {
  const newP = new Promise(async (res, rej) => {
    try {
      const wordResponse = await fetch("https://random-word-api.herokuapp.com/word?number=1");
      const wordData = await wordResponse.json();

      const meaningResponse = await fetch(
        `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${wordData[0]}?key=44793c76-dae0-4101-a109-1642ae60ecea`
      );
      const meaningData = await meaningResponse.json();
      const means = meaningData[0].shortdef;
      const canvas = createCanvas(600, 600);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.font = "30px Arial";

      // Function to wrap text
      function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const testWidth = context.measureText(testLine).width;

          if (testWidth > maxWidth) {
            context.fillText(line, x, y);
            line = words[i] + " ";
            y += lineHeight;
          } else {
            line = testLine;
          }
        }

        context.fillText(line, x, y);
      }
      loadImage("./template/bg.png").then((image) => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        wrapText(ctx, wordData[0], 100, 200, 480, 30);
        wrapText(ctx, means[0], 100, 300, 480, 30);
        const stream = canvas.createJPEGStream();
        const out = fs.createWriteStream("output.jpeg");
        stream.pipe(out);
        out.on("finish", () => console.log("Image saved as output"));
      });
      res();
    } catch (error) {
      rej(error);
    }
  });
  const result = await newP;

  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME);
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

  const imageBuffer = fs.readFileSync("./output.jpeg");

  await ig.publish.photo({
    file: imageBuffer,
    caption: "Some image?",
  });
};

app.get("/", async (req, res) => {
  try {
    await postToInsta();
    res.send("Post to Instagram function called successfully!");
  } catch (error) {
    console.error("Error posting to Instagram:", error);
    res.status(500).send("Error posting to Instagram");
  }
});
