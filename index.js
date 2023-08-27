const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const urlProduct = "https://www.amazon.com/dp/";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/v1", (req, resp) => {
  try {
    axios(process.env.URL).then((res) => {
      const thumnail = [];
      const html = res.data;
      const $ = cheerio.load(html);
      $(".s-main-slot")
        .find(
          $("div[data-component-type=s-search-result][data-uuid][data-asin]")
        )
        .each(function () {
          const id = $(this).attr("data-asin");
          const name = $(this).find($("h2 > a > span")).text();
          const url = `http://localhost:8000/v1/${id}`;
          thumnail.push({ id, name });
        });
      resp.status(200).json(thumnail);
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/v1/:id", (req, resp) => {
  try {
    const url = `${urlProduct}${req.params.id}`;
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      const name = $("h1 > span").text().trim();
      const beforeDot = $("span.a-price-whole").first().text();
      const afterDot = $("span.a-price-fraction").first().text();
      const price_before_discount = Number(beforeDot+afterDot)
      const description = $("li.a-spacing-mini").first().text();
      const sale = Boolean(Math.round(Math.random()));
      let discount = 0;
      if (sale) {
        discount = Math.floor(Math.random() * (20 - 5 + 1) + 5);
      }
      const instock = Math.floor(Math.random() * (1000 - 0 + 1))
      const images = [];
      $(".a-button-text > img").each(function () {
        images.push($(this).attr("src"));
      })
      resp.status(200).json({name,sale, price_before_discount, description, sale, discount, instock, category: "clothes", urls: images})
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(8000, () => {
  console.log("Server is running...");
});
