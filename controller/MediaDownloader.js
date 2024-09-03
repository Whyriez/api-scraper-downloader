import axios from "axios";
// import qs from "qs";
// import cheerio from "cheerio";
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

export const getFbVideo = async (videoUrl, cookie, useragent)=>{
  return new Promise((resolve, reject)=>{
      const headers = {
          "sec-fetch-user": "?1",
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-site": "none",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "cache-control": "max-age=0",
          authority: "www.facebook.com",
          "upgrade-insecure-requests": "1",
          "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
          "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
          "user-agent": useragent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
          accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          cookie: cookie || process.env.COOKIES,
      }

      const parseString = (string) => JSON.parse(`{"text": "${string}"}`).text;

      if (!videoUrl || !videoUrl.trim()) return reject("Please specify the Facebook URL");
      if (["facebook.com", "fb.watch"].every((domain) => !videoUrl.includes(domain))) return reject("Please enter the valid Facebook URL");

      axios.get(videoUrl, { headers }).then(({ data }) => {
          data = data.replace(/&quot;/g, '"').replace(/&amp;/g, "&")
          const sdMatch = data.match(/"browser_native_sd_url":"(.*?)"/) || data.match(/"playable_url":"(.*?)"/) || data.match(/sd_src\s*:\s*"([^"]*)"/) || data.match(/(?<="src":")[^"]*(https:\/\/[^"]*)/)
          const hdMatch = data.match(/"browser_native_hd_url":"(.*?)"/) || data.match(/"playable_url_quality_hd":"(.*?)"/) || data.match(/hd_src\s*:\s*"([^"]*)"/)
          const titleMatch = data.match(/<meta\sname="description"\scontent="(.*?)"/)
          const thumbMatch = data.match(/"preferred_thumbnail":{"image":{"uri":"(.*?)"/)
          var duration = data.match(/"playable_duration_in_ms":[0-9]+/gm)

          if (sdMatch && sdMatch[1]) {
              const result = {
                  url: videoUrl,
                  duration_ms: Number(duration[0].split(":")[1]),
                  sd: parseString(sdMatch[1]),
                  hd: hdMatch && hdMatch[1] ? parseString(hdMatch[1]) : "",
                  title: titleMatch && titleMatch[1] ? parseString(titleMatch[1]) : data.match(/<title>(.*?)<\/title>/)?.[1] ?? "",
                  thumbnail: thumbMatch && thumbMatch[1] ? parseString(thumbMatch[1]) : ""
              }
              resolve({
                status: 200,
                result
              })
          } else {
              reject("Unable to fetch video information at this time. Please try again")
          }
      }).catch((err) => {
          console.log(err)
          reject("Unable to fetch video information at this time. Please try again")
      })
  })
}

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
