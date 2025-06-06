import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./config/MongoDb.js";
import ImportData from "./DataImport.js";
import { errorHandler, notFound } from "./Middleware/Errors.js";
import productRoute from "./Routes/ProductRouter.js";
import userRouter from "./Routes/UserRouter.js";
import restaurantRoute from "./Routes/RestaurantRouter.js";
import categoriesRoute from "./Routes/CategoriesRouter.js";
import cors from "cors";
import postRoute from "./Routes/PostRouter.js";
import serverless from "serverless-http";

const allowedOrigins = ["http://localhost:3000", "http://localhost:4000"];

dotenv.config();
connectDatabase();
const app = express();
app.use(express.json());


const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Cho phép gửi cookie qua CORS nếu cần
  methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
  allowedHeaders: [
    "X-Requested-With",
    "Content-Type",
    "Content-Length",
    "Authorization",
    "Accept",
    "yourHeaderField",
  ],
};

// Thêm middleware cors vào app
app.use(cors(corsOptions));

// API
app.use("/api/import", ImportData);
app.use("/api/product", productRoute);
app.use("/api/post", postRoute);
app.use("/api/users", userRouter);
app.use("/api/categories", categoriesRoute);
app.use("/api/restaurants", restaurantRoute);

// app.get("/api/config/paypal", (req, res) => {
//   res.send(
//     "AfEEBH8yO1b1MiaE-b6MhwdqQne68F5rzZdDWWH0GI-6bCx6sQlfB2Zg_tchgzusJh9yzHTaYJ49DVHN"
//   );
// });

// ERROR HANDLER
app.use(notFound);
app.use(errorHandler);

// const PORT = process.env.PORT || 8080;

// app.listen(PORT, console.log(`server run in port ${PORT}`));
export default serverless(app);