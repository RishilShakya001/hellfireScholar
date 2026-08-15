import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"
const connectDB=async()=>{
    try{

  let connectionUri = process.env.MONGODB_URI;
  if (connectionUri.includes("?")) {
    const [base, query] = connectionUri.split("?");
    const baseClean = base.endsWith("/") ? base.slice(0, -1) : base;
    if (!baseClean.endsWith(`/${DB_NAME}`)) {
      connectionUri = `${baseClean}/${DB_NAME}?${query}`;
    }
  } else {
    const baseClean = connectionUri.endsWith("/") ? connectionUri.slice(0, -1) : connectionUri;
    if (!baseClean.endsWith(`/${DB_NAME}`)) {
      connectionUri = `${baseClean}/${DB_NAME}`;
    }
  }

  console.log(`Connecting to MongoDB at: ${connectionUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`); // redact user/pass in logs
  const connectionInstance=await mongoose.connect(connectionUri)
  console.log(`\n MongoDB connected! DB host:${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("MongoDB connection error",error);
        process.exit(1)
    }
}
 export default connectDB
