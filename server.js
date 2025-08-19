const express=require("express")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const pool=require("./database.js")
const bodyparser=require("body-parser")
const { error } = require("console")

require("dotenv").config()

const app=express()
app.use(bodyparser.json())

app.post("/register",async(req,res)=>{
    const {name,email,password}=req.body

    try{
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

app.get("/", ( res) => {
    res.status(200).send("hi");
});


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on ${process.env.PORT}`)
})