const pool = require("../database.js");

const create = async (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.cart_user.id;

    try {
        const result = await pool.query(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
            [user_id, product_id, quantity]
        );
        

        res.status(200).json({
            message: "Items added Successfully",
            cart: result.rows[0]
        });
        res.status
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const read=async (req,res)=>{
    const user_id=req.params.user_id 

   try{
     const result= await pool.query("SELECT * FROM cart WHERE user_id=$1",[user_id])

    if (result.rows.length===0){
         return res.status(400).json({message:"data not found "})
    }
    res.status(200).json({message:"Data fetched",details:result.rows})

   }catch(err){
    res.status(500).json({error:err.message})
   }
}

const deleting= async (req,res)=>{
        const id= req.params.id
        try{
            const result =await pool.query("DELETE  FROM cart WHERE id=$1 RETURNING *",[id])

            if (result.rows.length===0){
                return res.status(400).json({message:"Did not found"})
            }
            res.status(200).json({message:"Data Deleted",item_deleted:result.rows[0]})
        }catch(err){
            res.status(500).json({error:err.message})
        }
}

const partialupdate=async (req,res)=>{
    const {product_id,quantity}=req.body 
    const id=req.params.id
    //const {id}=req.params
    try{
        const result =await pool.query("SELECT * FROM cart WHERE id=$1 ",[id])

        if (result.rows.length===0){
            return res.status(400).json({message:"not found"})
        }

        let updates=[]
        let values=[]
        let i=1 

        if(product_id  !== undefined){
            updates.push(`user_id=$${i}`)
            values.push(product_id)
            i++
        }
        if(quantity !== undefined){
            updates.push(`quantity=$${i}`)
            values.push(quantity)
            i++
        }

        if (updates.length===0){
            return res .status(401).json({message:"Nothing to Update"})
        }
        values.push(id)

        const updatequery=`UPDATE cart SET ${updates.join(",")} WHERE id=$${i} RETURNING *`
        const update=await pool.query(updatequery,values)
        res.status(200).json({message:"Updated Successfully",updated_details:update.rows[0]})

    }catch(err){
        res.status(500).json({error:err.message})
    }
}



module.exports = { create, read, deleting, partialupdate};
