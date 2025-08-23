const bcrypt=require("bcrypt")
const pool=require("../database.js")
const jwt=require("jsonwebtoken")


const register=async(req,res)=>{
    const {name,email,password,role}=req.body

    try{
        if (!email.endsWith("@gmail.com")){
           return  res.status(401).json({message:"User email should end with @gmail.com"})
        }
        const exsistinguser=await pool.query( "SELECT * FROM employe WHERE email=$1",[email] )
        if (exsistinguser.rows.length>0){
            return res.status(401).json({message:"User already registered"})
        }

        const exsistingusername=await pool.query("SELECT * FROM employe WHERE name=$1",[name])
        if (exsistingusername.rows.length>0){
            return res.status(401).json({message:"Username already taken"})
        }

        const hashedpassword=await bcrypt.hash(password,10)
        const data=await pool.query("INSERT INTO employe (name,email,password,role) VALUES ($1,$2,$3,$4)",[name,email,hashedpassword,role])

        return res.status(200).json({message:"User registered successfully"})

    }catch(err){
        res.status(500).json({error:err.message})
    }
}


const login=async(req,res)=>{
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
        const token=jwt.sign({id:employe_member.id,email:employe_member.email,role:employe_member.role},"abc123",{expiresIn:"30m"})
        res.status(200).json({message:"Login Successfull",token})
    }catch(err){
        res.status(500).json({error:err.message})
        console.log(err)
    }
}

const getprofile=async(req,res)=>{
    try{
        const result = await pool.query("SELECT * FROM employe WHERE id=$1",[req.employe_member.id])
        res.status(200).json(result.rows[0])
    }catch(err){
        res.status(401).json({error:err.message})
    }
}

const selfdelete=async(req,res)=>{
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
}

const deleteByAdmin=async(req,res)=>{
    const {id}=req.params
    try{
        const result=await pool.query("DELETE FROM employe WHERE id=$1 RETURNING *",[id])

        if (result.rows.length===0){
            return res. status(400).json({message:"User not found"})
        }
        res.status(200).json({message:"User deleted Successfully",deleteduser:result.rows[0]})
    }catch(err){
        res.status(401).json({error:err.message})
    }
}

const updateall=async(req,res)=>{
    const{name,email,password,role}=req.body
    try{
        const result =await pool.query("SELECT * FROM employe WHERE id=$1",[req.employe_member.id])
        
         if (result.rows.length===0){
            return res.status(400).json({message:"USer not found"})
         }
        const hashedPassword = await bcrypt.hash(password, 10);
        const updated= await pool.query("UPDATE employe SET name=$1, email=$2, password=$3, role=$4 WHERE id=$5 RETURNING *",[name,email,hashedPassword,role,req.employe_member.id])
        return res.status(200).json({message:"User details updated successfully"})
         
    }catch(err){
        res.status(400).json({error:err.message})
    }
}

const forgetPassword= async (req, res) => {
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
}

const partialupdate=async(req,res)=>{
    const {name,email,password,role}=req.body
    try{
        const result=await pool.query("SELECT * FROM employe WHERE id=$1",[req.employe_member.id])

        if (result.rows.length===0){
            return res.status(400).json({message:"User not found"})
        }

        let updates=[]
        let values=[]
        let i=1

        if (name){
            updates.push(`name=$${i}`);
            values.push(name);
            i++
        }
        if (email){
            updates.push(`email=$${i}`);
            values.push(email);
            i++
        }
        if(password){
            const hashedPassword=await bcrypt.hash(password,10);
            updates.push(`password=$${i}`);
            values.push(hashedPassword)
            i++
        }
        if(role){
            updates.push(`role=$${i}`);
            values.push(role);
            i++
        }
        if (updates.length===0){
            return res.status(401).json({message:"Nothing is provided for update"})
        }
        values.push(req.employe_member.id)

        const queryUpdate=`UPDATE employe SET ${updates.join(", ")} WHERE id=$${i} RETURNING *`
        const updated=await pool.query(queryUpdate,values);
        res.status(200).json({message:"User details updated successfully"})

    }catch(err){
        res.status(400).json({error:err.message})
    }
}

module.exports = {register, login, getprofile, selfdelete, deleteByAdmin, updateall, forgetPassword, partialupdate}