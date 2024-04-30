import FongsiDev_Scraper from "@fongsidev/scraper";

export const downInstFB = async (req, res) => {
  try {
    const { link } = req.body;
    const response = await FongsiDev_Scraper.Instagram(link);
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};

// export const downTiktok = async (req, res) => {
//   try {
//     const { link } = req.body;
//     const response = await tikdown(link);
//     res.status(200).json(response);
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// export const downYoutube = async (req, res) => {
//   try {
//     const { link } = req.body;
//     const response = await ytdown(link);
//     res.status(200).json(response);
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// export const allDownload = async (req, res) => {
//   try {
//     const { link } = req.body;
//     const response = alldown(link).then((data) => {
//       res.status(200).json(data);
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };
