const express = require("express");
const os = require("os");
const app = express();
const port = 3001;
const cors = require("cors");
app.use(cors());

const cpus = os.cpus().length;

app.get("/", (req, res) => res.send({ cpuLoad: os.loadavg()[0] / cpus }));

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
