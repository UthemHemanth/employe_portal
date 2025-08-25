const express = require("express");
const cors = require("cors");
require("dotenv").config();

const router = require('./routers/employeroutes')
const prorouter=require("./routers/productroutes");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())
app.use("/api", router);

app.use("/product",prorouter)

app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));