const express=require("express")
const {create,read,deleting,partialupdate}=require("../controllers/cartcontroller")
const{verifycart}=require("../middleware/cartmiddleware")


const cartrouter=express.Router()

cartrouter.post("/register",verifycart,create)
cartrouter.get("/fetchbyuserid/:user_id",verifycart,read)
cartrouter.delete("/deletebyid/:id",verifycart,deleting)
cartrouter.patch("/partialupdatebyid/:id",verifycart,partialupdate)


module.exports=cartrouter