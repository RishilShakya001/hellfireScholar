import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true,"password is required"]
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    refreshToken:{
        type:String 
    }
  },
  { timestamps: true }
);

//don't use arrow function to encrypt password
UserSchema.pre("save", async function(){
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

//bcrypt
UserSchema.methods.isPasswordCorrect=async function(password){
   return await  bcrypt.compare(password,this.password)
}

//access token
UserSchema.methods.generateAccessToken=function(){
    //short lived access token
return jwt.sign({
    _id:this._id,
    email:this.email,
    name:this.name,
    
},
process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
);

}

//refresh token
UserSchema.methods.generateRefreshToken=function(){
    //short lived access token
return jwt.sign({
    _id:this._id,
   

},
process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
);

}


export const User= mongoose.model("User", UserSchema);
