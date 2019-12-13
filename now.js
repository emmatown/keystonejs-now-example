const express = require("express");
const { keystone, apps } = require("./index.js");

let middlewarePromise = keystone
  .prepare({ apps })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    const app = express();
    return app.use(middlewares);
  });

module.exports = async (req, res) => {
  let middleware = await middlewarePromise;
  middleware(req, res);
};
