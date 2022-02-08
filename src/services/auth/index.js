import express from "express";
import UserModel from "../user/schema.js"
import {generateJwt} from "../../utils/auth/jwt.js"
import Profile from "../profile/schema.js"

const authRouter = express.Router();

authRouter.post('/login',async (req,res,next)=>{
    try{
        const {email,password}= req.body
        if(!email || !password){
            const error = new Error("Missing credetials.")
            error.status=400
             throw error
        }
        const user = await UserModel.findByCredentials(email,password)
        if(!user){
            const error = new Error("No email/password match")
            error.status = 400
             throw error
        }
        const id= user._id
        const token = await generateJwt({id})

        res.status(200).send({token,id})

    }catch(error){
        next(error)
    }
})

authRouter.post("/register", async (req,res,next)=>{
    try{

        const user = await new UserModel(req.body).save()
        delete user._doc.password

        const token = await generateJwt({id: user._id})
        res.send({user,token})

    }catch(error){
        console.log({error})
        res.sendStatus(500).send({message:error.message})
    }
})

export default authRouter