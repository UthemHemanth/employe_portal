const express=require("express")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const pool=require("./database.js")
const bodyparser=require("body-parser")
const cors=require("cors")
const { error } = require("console")

require("dotenv").config()

const app=express()
//app.use(express.json())

app.use(cors({
  origin: "http://localhost:3000",  // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(bodyparser.json())

app.post("/register",async(req,res)=>{
    const {name,email,password}=req.body

    try{
        if (!email.endsWith("@gmail.com")){
           return  res.status(401).json({message:"User email should end with @gmail.com"})
        }
        const exsistinguser=await pool.query( "SELECT * FROM employe WHERE email=$1",[email] )
        
        if (exsistinguser.rows.length>0){
            return res.status(401).json({message:"User already registered"})
        }

        const hashedpassword=await bcrypt.hash(password,10)
        const data=await pool.query("INSERT INTO employe (name,email,password) VALUES ($1,$2,$3)",[name,email,hashedpassword])

        return res.status(200).json({message:"User registered successfully"})

    }catch(err){
        res.status(500).json({error:err.message})
    }
})

app.post("/login",async(req,res)=>{
    const {email,password}=req.body
    try{
        const result=await pool.query( "SELECT * FROM employe WHERE email=$1",[email] )
        
        if (result.rows.length===0){
            return res.status(401).json({message:"Invalid Email address"})
        }
        const employe_member=result.rows[0]
        const verifypassword=await bcrypt.compare(password,employe_member.password)

        if(!verifypassword){
            return res.status(400).json({message:"Invalid Password or Username"})
        }
        const token=jwt.sign({id:employe_member.id,email:employe_member.email},"abc123",{expiresIn:"30m"})
        res.status(200).json({message:"Login Successfull",token})
    }catch(err){
        res.status(500).json({error:err.message})
        console.log(err)
    }

})

function verifytoken(req,res,next){
    const autheader= req.headers["authorization"]
    if(!autheader) return res.status(401).json({message:"missing Authorization header"})
    
        const parts= autheader.split(" ")
        const token= parts.length===2 && parts[0] ==="Bearer"? parts[1]:null
        if (!token) return res.status(401).json({message:"Invalid Authorization"})

        try{
            const decoded=jwt.verify(token,"abc123")
            req.employe_member=decoded
            next()

        }catch(err){
            res.status(401).json({error:err.message})

        }
}
app.get("/profile",verifytoken,async(req,res)=>{
    try{
        const result = await pool.query("SELECT * FROM employe WHERE id=$1",[req.employe_member.id])
        res.status(200).json(result.rows[0])
    }catch(err){
        res.status(401).json({error:err.message})
    }
})

app.delete("/delete",verifytoken,async(req,res)=>{
    try{
        const result=await pool.query("SELECT * FROM employe WHERE id=$1",[req.employe_member.id])

        if (result.rows.length===0){
            return res.status(400).json({message:"User does not exist"})
        } else if  (result.rows.length>0){
            await pool.query("DELETE  FROM employe WHERE id=$1",[req.employe_member.id])
            res.status(200).json({message:"User successfully deleted"})
        }
    }catch(err){
            res.status(401).json({error:err.message})
        }
})

// app.delete("/deleteByEmail", async (req, res) => {
//   const { email } = req.body;

//   try {
//     // Check if user exists
//     const result = await pool.query("SELECT * FROM employe WHERE email=$1", [email]);

//     if (result.rows.length === 0) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     // Delete user
//     await pool.query("DELETE FROM employe WHERE email=$1", [email]);

//     return res.status(200).json({ message: "User deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


app.put("/update",verifytoken,async(req,res)=>{
    const{name,email,password}=req.body
    try{
        const result =await pool.query("SELECT * FROM employe WHERE id=$1",[req.employe_member.id])
        
         if (result.rows.length===0){
            return res.status(400).json({message:"USer not found"})
         }
         const hashedPassword = await bcrypt.hash(password, 10);
        const updated= await pool.query("UPDATE employe SET name=$1, email=$2, hashedPassword=$3 WHERE id=$4 RETURNING *",[name,email,password,req.employe_member.id])
        return res.status(200).json({message:"User details updated successfully"})
         
    }catch(err){
        res.status(400).json({error:err.message})
    }
})


app.put("/forget-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {

    const result = await pool.query("SELECT * FROM employe WHERE email=$1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found with this email" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE employe SET password=$1 WHERE email=$2", [hashedPassword,email]);
    res.status(200).json({ message: "Password updated successfully. Please login with your new password." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  //console.log("Forget-password route hit!");

});



app.listen(process.env.PORT,()=>{
    console.log(`Server is running on ${process.env.PORT}`)
})