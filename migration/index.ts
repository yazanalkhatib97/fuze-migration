import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const data = [];
  try {
    for (let i = 1; i <= 4; i++) {
      let { data: d } = await axios.get(
        process.env.SPROUT_VIDEO_URL + `/videos?page=${i}&per_page=100`,
        {
          headers: {
            "SproutVideo-Api-Key": process.env.SPROUT_VIDEO_API_KEY,
            folder_id: "4a9fdfb4191de6c4",
          },
        }
      );

      data.push(...d.videos);
    }

    const result = [];
    data.forEach((video) => {
      const record = result.find((v) => v.title === video.title);

      if (!record) result.push({ title: video.title, count: 1 });
      else
        result.map((r) => {
          if (r.title === record.title)
            return { title: r.title, count: r.count++ };
        });
    });

    console.log({ result });
  } catch (error: any) {
    console.log(error.message);
  }
})();
