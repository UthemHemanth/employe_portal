const pool =require("../database.js")

const create = async(req,res)=>{

    const datalist=req.body 

    try{
        for (const item of datalist){
            const {name,quantity,description,price,is_available}=item
            const insertquery=("INSERT INTO product (name,quantity,description, price,is_available) VALUES ($1,$2,$3,$4,$5)")
            await pool.query(insertquery,[name,quantity,description,price,is_available])
        }
        if (datalist.length===1){
            return res.status(200).json({message:"Product registered"})
        }else{
            return res.status(200).json({message:"Products registered"})
        }
                     


    }catch(err){
        res.status(400).json({error:err.message})

    }
}

const read= async(req,res)=>{
    const name=req.query.name
    try{
        const fecthquery=("SELECT * FROM product WHERE name=$1")
        const result=await pool.query(fecthquery,[name])

        if (result.rows.length===0){
            res.status(401).json({message:"Product not found"})
        }
        res.status(200).json({message:"Details fetched",product:result.rows[0]})
    }catch(err){
        res.status(400).json({error:err.message})
    }
}
const deleting=async(req,res)=>{
    const id= req.params.id
    try{
        const result=await pool.query("DELETE FROM product WHERE id=$1 RETURNING *",[id])
        if(result.rows.length===0){
           return res.status(401).json({message:"Product not found"})
        }
        res.status(200).json({message:"Product Deleted from the Database"})
    }catch(err){
        res.status(400).json({error:err.message})
    }
}

const updating= async(req,res)=>{
    const {id}=req.params
    const {name,quantity,description,price,is_available}=req.body
    try{
        const result=await pool.query("SELECT * FROM PRODUCT WHERE id=$1",[id])

        if (result.rows.length===0){
            return res.status(402).json({message:"Product not found"})
        }
    

    let updates=[]
    let values=[]
    let i =1

    if (name !==undefined){
        updates.push(`name=$${i}`)
        values.push(name)
        i++
    }
    if(quantity !==undefined){
        updates.push(`quantity=$${i}`)
        values.push(quantity)
        i++
    }
    if(description !==undefined){
        updates.push(`description=$${i}`)
        values.push(description)
        i++
    }
    if (price !==undefined){
        updates.push(`price=$${i}`)
        values.push(price)
        i++
    }
    if (is_available !==undefined){
        updates.push(`is_available=$${i}`)
        values.push(is_available)
        i++
    }
    if (updates.length===0){
        return res.status(400).json({message:"Nothing is updated"})
    }
    values.push(id)
    
    const updatequery= `UPDATE product SET ${updates.join(",")} WHERE id=$${i} RETURNING *`
    const updated=await pool.query(updatequery,values)
    res.status(200).json({message:"Product details updated"})
    
    }catch(err){
        res.status(400).json({error:err.message})

    }
}


module.exports={create,read,deleting,updating}