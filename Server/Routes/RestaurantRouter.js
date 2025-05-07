import express from "express";
import asyncHandler from "express-async-handler";
import Restaurant from "../Models/RestaurantModel.js";
import { admin, protect } from "./../Middleware/AuthMiddleware.js";
import upload from "../Middleware/Upload.js";
// import { cloudinary } from "../utils/cloudinary.js";
import uploadExecl from "../Middleware/UploadExcel.js";
import xlsx from "xlsx"

const restaurantRoute = express.Router();


restaurantRoute.get("/export/excel",
  protect,
  admin,
  async (req, res) => {
    try {
      const data = await Restaurant.find({}).lean();
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Restaurant')

      const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

      res.setHeader('Content-Disposition', 'attachment; filename=Restaurant.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    }
    catch (err) {
      res.status(500).json({ message: 'Export failed', error: err.message });
    }
  })

restaurantRoute.post("/import/excel",
  protect,
  admin,
  uploadExecl.single('file'),
  async (req, res) => {
    try {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      await Restaurant.insertMany(data);
      res.status(200).json({ message: 'Import Excel thành công' });
    } catch (err) {
      res.status(500).json({ message: 'Import Excel thất bại', error: err.message });
    }
  })

restaurantRoute.get("/chart",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    try {
      const restaurant = await Restaurant.find({}, "name views");
      res.json(restaurant)
    } catch (err) {
      res.status(500).json({ message: err })
    }
  }))

restaurantRoute.get('/search', asyncHandler(async (req, res) => {
  const keyword = req.query.q || "";
  const page = Number(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  const filter = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { province: { $regex: keyword, $options: "i" } },
      { district: { $regex: keyword, $options: "i" } },
      { ward: { $regex: keyword, $options: "i" } },
      { street: { $regex: keyword, $options: "i" } },
    ]
  };

  const restaurants = await Restaurant.find(filter).skip(skip).limit(limit);
  const total = await Restaurant.countDocuments(filter);

  res.json({
    restaurants,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
}));

restaurantRoute.get("/top", asyncHandler(async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .sort({ rating: -1 })
      .limit(10)

    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Lỗi khi lấy nhà hàng top rating:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
}))



// GET ALL RESTAURANT
restaurantRoute.get(
  "/",
  asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
      : {};
    const count = await Restaurant.countDocuments({ ...keyword });
    const restaurant = await Restaurant.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json({ restaurant, count, page, pages: Math.ceil(count / pageSize) });
  })
);

// ADMIN GET ALL RESTAURANT WITHOUT SEARCH AND PEGINATION

restaurantRoute.get("/name",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find();
    if (restaurants) {
      res.json(restaurants);
    } else {
      res.status(404);
      throw new Error("not Found");
    }
  }))

restaurantRoute.get(
  "/all",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const limit = 12;
    const page = Number(req.query.pageNumber) || 1;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword
      ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
      : {};
    const count = await Restaurant.countDocuments({ ...keyword });
    const restaurant = await Restaurant.find({ ...keyword })
      .limit(limit)
      .skip(skip)
      .sort({ _id: -1 });
    res.json({ restaurant, page, pages: Math.ceil(count / limit) });
  })
);

// GET SINGLE RESTAURANT
restaurantRoute.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 0.5 } },
      { new: true });;
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404);
      throw new Error("Restaurant not Found");
    }
  })
);


// RESTAURANT REVIEW
restaurantRoute.post(
  "/:id/review",
  protect,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body.payload;
    const restaurant = await Restaurant.findById(req.params.id);
    const user_name = req.user.last_name + " " + req.user.first_name;
    if (restaurant) {
      const alreadyReviewed = restaurant.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Restaurant already Reviewed");
      }
      const review = {
        name: user_name,
        image: req.user.avatar,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      restaurant.reviews.push(review);
      restaurant.numReviews = restaurant.reviews.length;
      restaurant.rating =
        restaurant.reviews.reduce((acc, item) => item.rating + acc, 0) /
        restaurant.reviews.length;

      await restaurant.save();
      res.status(201).json({ reviews: restaurant.reviews, rating: restaurant.rating });
    } else {
      res.status(404);
      throw new Error("Restaurant not Found");
    }
  })
);

// DELETE Restaurant
restaurantRoute.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      await restaurant.remove();
      res.json({ message: "Restaurant deleted" });
    } else {
      res.status(404);
      throw new Error("Restaurant not Found");
    }
  })
);

// CREATE RESTAURANT
restaurantRoute.post(
  "/",
  protect,
  admin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "thumb", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      province,
      district,
      ward,
      street,
      contact,
      location,
    } = req.body;

    const restaurantExist = await Restaurant.findOne({ name });
    if (restaurantExist) {
      res.status(400);
      throw new Error("Restaurant name already exist");
    } else {
      const imageUpload = req.files?.image?.[0].path
      // ? await cloudinary.uploader.upload(req.files.image[0].path)
      // : null;

      const thumbUpload = req.files?.thumb?.[0].path
      // ? await cloudinary.uploader.upload(req.files.thumb[0].path)
      // : null;

      const restaurant = new Restaurant({
        name,
        description,
        province,
        district,
        ward,
        street,
        contact,
        image: imageUpload ? imageUpload : "",
        thumb: thumbUpload ? imageUpload : "",
        location
      });
      if (restaurant) {
        const createdRestaurant = await restaurant.save();
        res.status(201).json(createdRestaurant);
      } else {
        res.status(400);
        throw new Error("Invalid restaurant data");
      }
    }
  })
);

// UPDATE RESTAURANT
restaurantRoute.put(
  "/:id",
  protect,
  admin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "thumb", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      province,
      district,
      ward,
      street,
      contact,
      location
    } = req.body;

    const imageUpload = req.files?.image?.[0].path
    // ? await cloudinary.uploader.upload(req.files.image[0].path)
    // : null;
    const thumbUpload = req.files?.thumb?.[0].path
    // ? await cloudinary.uploader.upload(req.files.thumb[0].path)
    // : null;
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      restaurant.name = name || restaurant.name;
      restaurant.description = description || restaurant.description;
      restaurant.province = province || restaurant.province;
      restaurant.district = district || restaurant.district;
      restaurant.ward = ward || restaurant.ward;
      restaurant.street = street || restaurant.street;
      restaurant.contact = contact || restaurant.contact;
      if (imageUpload) restaurant.image = imageUpload;
      if (thumbUpload) restaurant.thumb = thumbUpload;
      restaurant.location = location || restaurant.location;

      const updatedRestaurant = await restaurant.save();
      res.json(updatedRestaurant);
    } else {
      res.status(404);
      throw new Error("Restaurant not found");
    }
  })
);

export default restaurantRoute;
