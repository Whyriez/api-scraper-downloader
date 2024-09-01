import axios from "axios";
import qs from "qs";
import cheerio from "cheerio";
import ytdl from "ytdl-core";
import configDotenv from "dotenv";
import CryptoJS from "crypto-js";
configDotenv.config();

const domain = process.env.DOMAIN;

export const instagramDl = (url_media) => {
  return new Promise(async (resolve, reject) => {
    try {
      const BASE_URL = process.env.INSTAGRAMURL;
      const headers = {
        url: encryptUrl(url_media),
      };
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
        return reject({
          error: `Failed to fetch data from server. Status: ${response.status}`,
        });
      }

      // Periksa apakah ada konten yang diterima
      const text = await response.text();
      if (!text) {
        console.error("Empty response from server");
        return reject({ error: "Empty response from server" });
      }

      // Parsing JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        console.error("Received response:", text);
        return reject({ error: "Invalid JSON response from server" });
      }

      if (!data) {
        return reject({ results_number: 0, url_list: [], thumbnails: [] });
      }

      let url_list = [];
      let thumbnails = [];

      if (data.video) {
        data.video.forEach((infovideo) => {
          if (infovideo.video) {
            url_list.push(infovideo.video);
          }
          if (infovideo.thumbnail) {
            thumbnails.push(infovideo.thumbnail);
          }
        });
      }

      if (data.thumbnail) {
        data.thumbnail.forEach((image) => {
          url_list.push(image);
        });
      }

      resolve({
        status: 200,
        results_number: url_list.length,
        url_list,
        thumbnails,
      });
    } catch (err) {
      reject(err);
    }
  });
};

function encryptUrl(input) {
  const key = CryptoJS.enc.Utf8.parse("qwertyuioplkjhgf");
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(input, key, {
    iv: iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  return encryptedHex;
}

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
              authority: process.env.authorityFacebook,
              accept: "*/*",
              "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7,id;q=0.6",
              cookie: cookies.join("; "),
              origin: process.env.originFacebook,
              referer: process.env.refererFacebook,
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
