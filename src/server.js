import express from "express";

import cors from "cors";

import listEndpoints from "express-list-endpoints";

import userRouter from "./user/index.js"

//import { errorHandlers } from "./errorHandlers.js";

import mongoose from "mongoose";

// ***************************** MIDDLEWARS**************************
const server = express();
server.use(cors())
const { PORT, MONGO_CONNECTION_STRING } = process.env;
server.use(express.json());


// ****************************** ROUTES *****************************

server.use("/user", userRouter)

//server.use(errorHandlers);

console.table(listEndpoints(server)); 

server.listen(PORT, async () => {
  try {
    await mongoose.connect(MONGO_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Server is running on ${PORT}  and connected to db`);
  } catch (error) {
    console.log("Db connection is failed ", error);
  }
});

server.on("error", (error) =>
  console.log(`❌ Server is not running due to : ${error}`)
);