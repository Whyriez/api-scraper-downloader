import axios from "axios";
import qs from "qs";
import cheerio from "cheerio";
import ytdl from "ytdl-core";
import configDotenv from "dotenv";
configDotenv.config();

const domain = process.env.DOMAIN;

export const instagramDl = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isUrl = (str) => /^https?:\/\//.test(str);
      if (!isUrl(url) || !/instagram\.com/i.test(url))
        throw new Error("Invalid URL: " + url);

      const apiUrl = process.env.INSTAGRAMURL;
      const params = {
        q: url,
        t: "media",
        lang: "en",
      };

      const headers = {
        Accept: "*/*",
        Origin: process.env.origin,
        Referer: process.env.referer,
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        "Sec-Ch-Ua":
          '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.183",
        "X-Requested-With": "XMLHttpRequest",
      };

      const config = {
        headers,
      };

      const response = await axios.post(apiUrl, qs.stringify(params), config);
      const responseData = response.data.data;
      const $ = cheerio.load(responseData);

      const downloadItems = $(".download-items");
      const result = [];

      downloadItems.each((index, element) => {
        const thumbnailLink = $(element)
          .find(".download-items__thumb > img")
          .attr("src");
        const downloadLink = $(element)
          .find(".download-items__btn > a")
          .attr("href");

        result.push({
          thumbnail_link: thumbnailLink,
          download_link: downloadLink,
        });
      });

      resolve({
        status: 200,
        ...result,
      });
    } catch (error) {
      resolve({
        status: 404,
        msg: error?.message || error,
      });
    }
  });
};

export const tikVideo = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isUrl = (str) => /^https?:\/\//.test(str);
      if (!isUrl(url) || !/tiktok\.com/i.test(url))
        throw new Error("Invalid URL: " + url);

      const res = await axios.post(
        domain + "/api/",
        {},
        {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua":
              '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
          },
          params: {
            url: url,
            count: 12,
            cursor: 0,
            web: 1,
            hd: 1,
          },
        }
      );

      if (res?.data?.code === -1) {
        resolve(res?.data);
      } else {
        resolve({
          status: 200,
          ...updateUrls(res.data?.data),
        });
      }
    } catch (error) {
      resolve({
        status: 404,
        msg: error?.message,
      });
    }
  });
};

function getCookies() {
  return new Promise((resolve, reject) => {
    axios
      .get(process.env.COOKIES)
      .then((response) => {
        const cookiesArray = response.headers["set-cookie"];
        resolve(cookiesArray);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}
export const facebookdl = (Url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isUrl = (str) => /^https?:\/\//.test(str);
      if (!isUrl(Url) || !/facebook\.com/i.test(Url))
        throw new Error("Invalid URL: " + Url);

      const cookies = await getCookies();

      await axios
        .post(
          process.env.FACEBOOKURL,
          new URLSearchParams({
            url: Url,
            token: btoa(Date.now()),
          }),
          {
            headers: {
              authority: process.env.authority,
              accept: "*/*",
              "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7,id;q=0.6",
              cookie: cookies.join("; "),
              origin: process.env.origin,
              referer: process.env.referer,
              "sec-ch-ua": '"Not)A;Brand";v="24", "Chromium";v="116"',
              "sec-ch-ua-mobile": "?1",
              "sec-ch-ua-platform": '"Android"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "user-agent":
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
            },
          }
        )
        .then(({ data }) => {
          resolve({
            status: 200,
            ...data,
          });
        })
        .catch((error) => {
          resolve({
            status: 404,
            msg: error?.message,
          });
        });
    } catch (error) {
      resolve({
        status: 404,
        msg: error?.message,
      });
    }
  });
};

export const youtubedl = async function (url) {
  try {
    const isUrl = (str) => /^https?:\/\//.test(str);

    if (!isUrl(url) || !/youtube\.com/i.test(url))
      throw new Error("Invalid URL: " + url);
    const info = await ytdl.getInfo(url);
    const videoUrl = ytdl.chooseFormat(info.formats, {
      quality: "highestvideo",
      filter: "audioandvideo",
    }).url;
    const audioUrl = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    }).url;
    return {
      status: 200,
      ...info.videoDetails,
      audioUrl,
      videoUrl,
    };
  } catch (error) {
    return {
      status: 404,
      msg: error?.message || error,
    };
  }
};

function updateUrls(obj) {
  const regex =
    /("avatar": "|music": "|play": "|wmplay": "|hdplay": "|cover": ")(\/[^"]+)/g;
  const updatedData = JSON.stringify(obj, null, 2).replace(
    regex,
    (match, p1, p2) => p1 + domain + p2
  );
  return JSON.parse(updatedData);
}
