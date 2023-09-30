require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const { IgApiClient } = require("instagram-private-api");
const { get } = require("request-promise");
const CronJob = require("cron").CronJob;

const postToInsta = async () => {
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME);
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

  const imageBuffer = await get({
    url: "https://instagram.fdel3-1.fna.fbcdn.net/v/t51.2885-19/338621067_5779535688822384_8563260324206482349_n.jpg?stp=dst-jpg_s320x320&_nc_ht=instagram.fdel3-1.fna.fbcdn.net&_nc_cat=100&_nc_ohc=sVC5OHpd73AAX8z677O&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfBKPKpQ7wPm1QnnUDLEPMPhjjH8AZyVYPhBRNU3IReBIw&oe=651094A1&_nc_sid=8b3546",
    encoding: null,
  });

  await ig.publish.photo({
    file: imageBuffer,
    caption: "Really nice photo from the internet!",
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

// const cronInsta = new CronJob("30 5 * * *", async () => {
//   postToInsta();
// });

// cronInsta.start();
