import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./config/MongoDb.js";
import ImportData from "./DataImport.js";
import { errorHandler, notFound } from "./Middleware/Errors.js";
import productRoute from "./Routes/ProductRouter.js";
import userRouter from "./Routes/UserRouter.js";
import restaurantRoute from "./Routes/RestaurantRouter.js";
import categoriesRoute from "./Routes/CategoriesRouter.js";
import geocodeRoute from "./Routes/GeocodeRouter.js";
import cors from "cors";

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

// app.use(function (req, res, next) {
//   // Website you wish to allow to connect
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000","http://localhost:3000");

//   // Request methods you wish to allow
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );

//   // Request headers you wish to allow
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With, Content-Type, Content-Length, Authorization, Accept, yourHeaderField"
//   );

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader("Access-Control-Allow-Credentials", true);

//   // Pass to next layer of middleware
//   next();
// });

// API
app.use("/api/import", ImportData);
app.use("/api/product", productRoute);
app.use("/api/users", userRouter);
app.use("/api/categories", categoriesRoute);
app.use("/api/restaurants", restaurantRoute);
app.use("/api/config/geocode", geocodeRoute);

// app.get("/api/config/paypal", (req, res) => {
//   res.send(
//     "AfEEBH8yO1b1MiaE-b6MhwdqQne68F5rzZdDWWH0GI-6bCx6sQlfB2Zg_tchgzusJh9yzHTaYJ49DVHN"
//   );
// });

// ERROR HANDLER
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`server run in port ${PORT}`));
