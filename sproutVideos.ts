import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import https from "https";
import FormData from "form-data";
import { client } from "./datacmsClient";
import { exportToCSV, readCSV } from "./utils/exportCSV";

dotenv.config();

// Constants for API and environment variables
const CONSTANTS = {
  sproutVideoAPI: "8d194fd0fddba7488960a3a271562273",
  sproutVideoURL: "https://api.sproutvideo.com/v1/videos",
  sproutVideoFolderID: "4a9fdfb4191de6c4",
  datoCMSAPI: "67d5a313982042726364c7d2f1981d",
};

// Function to download a video from a URL
async function downloadVideo(url, index, length) {
  console.log(`[${index + 1}/${length}] Downloading video: ${url}`);
  const path = url.split("/").pop();
  const writer = fs.createWriteStream(path + ".mp4");

  const start = new Date();
  // return path;
  return new Promise((resolve, reject) => {
    https.get(url, function (response) {
      response.pipe(writer);
      writer.on("finish", () => {
        const end = new Date();
        console.log(
          `[${index + 1}/${length}] Download completed in ${
            // @ts-ignore
            (end - start) / 1000
          } seconds.`
        );
        resolve(path);
      });
      writer.on("error", reject);
    });
  });
}

// Function to upload video to SproutVideo
async function uploadToSproutVideo(filePath, index, length) {
  console.log(`[${index + 1}/${length}] Uploading video to SproutVideo`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const filename = filePath.split("/").pop(); // Extracts the filename from the URL

  const formData = new FormData();
  // @ts-ignore
  formData.append("file", fileStream, { filename: filename });
  formData.append("title", `${filename}`);
  formData.append("folder_id", "4a9fdfb4191de6c4");
  formData.append("tag_names", "GetItDoneFitness");

  // return filename;

  const start = new Date();
  try {
    const { data } = await axios.post(CONSTANTS.sproutVideoURL, formData, {
      headers: {
        ...formData.getHeaders(),
        "SproutVideo-Api-Key": CONSTANTS.sproutVideoAPI,
      },
    });

    const end = new Date();
    console.log(
      `[${index + 1}/${length}] Upload completed in ${
        // @ts-ignore

        (end - start) / 1000
      } seconds. Deleting local file.`
    );
    fs.unlinkSync(filePath); // Remove file after upload

    // Use a regular expression to extract the src value
    const regex = /src='(.*?)'/;
    const match = data.embed_code.match(regex);

    if (match) {
      const srcValue = match[1]; // The first captured group contains the src value
      console.log("Extracted src:", srcValue);
      return srcValue;
    } else {
      console.log("No src attribute found");
    }
  } catch (error) {
    console.error(
      `Failed to upload video due to: ${
        error.response ? error.response.data : error.message
      }`
    );
  }
}

// Function to update the video URL in DatoCMS
async function updateVideoUrl(itemId, newVideoUrl) {
  console.log(`Updating DatoCMS entry for item ID: ${itemId}`);

  try {
    const response = await client.items.update(itemId, {
      // Assuming 'en' as the locale, replace 'en' with appropriate locale codes if different
      videoUrl: {
        en: newVideoUrl,
      },
    });

    console.log({ response });
  } catch (error) {
    console.error(
      `Failed to update DatoCMS entry: ${
        error.response ? error.response.data : error
      }`
    );
  }
}

// Process all videos
async function processVideos() {
  const result = [];
  const videos = (await readCSV(
    "./data/Video Migration 2024 - SproutVideo and Maximus - get_it_done.csv"
  )) as any;

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    try {
      const filePath = await downloadVideo(video.video_url, i, videos?.length);
      const newVideoUrl = await uploadToSproutVideo(
        filePath + ".mp4",
        i,
        videos?.length
      );
      // await updateVideoUrl(video.id, newVideoUrl);

      result.push({ id: video.id, url: video.video_url, new_url: newVideoUrl });
    } catch (error) {
      console.error(`Error processing video ${video.id}:`, error);
    }
  }

  const columns = {
    id: "id",
    url: "url",
    new_url: "new_url",
  };

  exportToCSV("./data/sproutvideos.csv", columns, result);
}

// Run the processing function
processVideos();
