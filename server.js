const express = require("express");
const cors = require("cors");
require("dotenv").config();

const router = require('./routers/routes')

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));
