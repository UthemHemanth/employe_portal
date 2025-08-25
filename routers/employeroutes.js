const express = require("express");
const { register, login, getprofile, selfdelete, deleteByAdmin, updateall, forgetPassword, partialupdate } = require("../controllers/employecontroller");
const { verifytoken,verifyAdmin } = require("../middleware/employemiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifytoken, getprofile);
router.delete("/selfdelete",verifytoken,selfdelete)
router.delete("/deleteByAdmin/:id",verifytoken,verifyAdmin,deleteByAdmin)
router.put("/updateall",verifytoken,updateall)
router.put("/forgetpassword",forgetPassword)
router.patch("/partialupdate",verifytoken,partialupdate)


module.exports = router;
