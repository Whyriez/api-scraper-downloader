const express = require("express");
const cors = require("cors");
const MediaRoutes = require("./routes/MediaRoutes.js");

const app = express();

app.get("/", (req, res) => {
  res.send("Api Ready");
});

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://secret-chat.my.id"],
  })
);
app.use(express.json());
app.use(MediaRoutes);

app.listen(5000, () => {
  console.log("Server Running", 5000);
});
