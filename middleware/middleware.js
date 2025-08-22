const jwt=require("jsonwebtoken")

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

function verifyAdmin(req,res,next){
    if (req.employe_member.role !== "Admin"){
        return res.status(400).json({message:"Admins can only access"})
    }
    next()
}
module.exports={verifytoken,verifyAdmin};