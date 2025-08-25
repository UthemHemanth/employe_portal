const express=require("express")
const {create,read,deleting,updating}=require("../controllers/productcontroller")

const prorouter=express.Router()

prorouter.post("/register",create)
prorouter.get("/fetchbyname",read)
prorouter.patch("/partialupdate/:id",updating)
prorouter.delete("/delete/:id",deleting)

module.exports=prorouter