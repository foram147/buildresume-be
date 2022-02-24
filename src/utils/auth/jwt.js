import jwt from "jsonwebtoken"
import UserModel from "../../services/user/schema.js"

// Generate JWT tokens when we are authenticating one of our users

// function generateJwt 

export function generateJwt(payload) {
    return new Promise(function (resolve, reject) {
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 day" }, (err, token) => {
            if (err) reject(err)
            else resolve(token)
        })
    })
}


// Verify JWT tokens when we are checking the validity of incoming requests

// function verifyJwt 

export function verifyJwt(token) {
    return new Promise(function (resolve, reject) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) reject(err)
            else resolve(decoded)
        })
    })
}

export async function JwtMiddleware(req, res, next) {
    try {
        if (!req.headers.authorization) {
            const error = new Error('No auth headers')
            error.status = 401
            next(error)
        } else {
            const token = req.headers.authorization.replace("Bearer ", '')

            console.log("token",token)

            const decoded = await verifyJwt(token)

            console.log("decoded",decoded)
            const user = await UserModel.findById(decoded.id)

            console.log("user",user)

            req.user = user

            next()

        }
    } catch (error) {
        next(error)
    }
}