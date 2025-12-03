const express = require("express");
const connection = require("./config/database")
const app = express();
const User = require("./models/user");
const cors = require("cors")



const cookieParser = require("cookie-parser");

app.use(cors({origin:"http://localhost:5173",credentials:true,methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json())
app.use(cookieParser())

const authRouter = require("./routers/authR")
const profileRouter = require("./routers/profileR")
const requestRouter = require("./routers/requestR")
const userRouter = require("./routers/userR")

app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",userRouter)

//feed
app.get("/feed",async (req,res) => {
  res.send(await User.find({}))
})

//delete 
app.delete("/delete",async (req,res) => 
  {
    const userId = req.body.userId;
    await User.findByIdAndDelete(userId)
    res.send("deleted successfully")
  })

connection()
.then(() => {console.log("DB connection established successfully")
app.listen(3000, () => {console.log("server running successfully")})}
)
.catch((err) => {console.error("database not connected")})


