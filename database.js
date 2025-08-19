const {Pool}= require("pg")
require("dotenv").config()
const pool=new Pool({
    user:"postgres",
    password:"@1234",
    port:5432,
    host:"localhost",
    database:"task"
})

module.exports=pool