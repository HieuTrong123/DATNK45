import express from "express";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import generateToken from "../utils/generateToken.js";
import User from "./../Models/UserModel.js";
import Product from './../Models/ProductModel.js'
import Restaurant from "../Models/RestaurantModel.js";
import upload from "../Middleware/Upload.js";
import { cloudinary } from "../utils/cloudinary.js";

const userRouter = express.Router();

// LOGIN
userRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (user && (await user.matchPassword(password))) {
        res.json({
          role: user.role,
          token: generateToken(user._id),
          status: user.status
        });
      } else {
        res.status(401);
        throw new Error("Invalid Username or Password");
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
  )
);

// REGISTER
userRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const {
        firstname: first_name,
        lastname: last_name,
        username,
        password,
      } = req.body.payload;
      const userExists = await User.findOne({ username });
      if (userExists) {
        res.status(400);
        throw new Error("User already exists");
      }

      const user = await User.create({
        first_name,
        last_name,
        username,
        password,
        status: true
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar,
          thumb: user.thumb,
          token: generateToken(user._id),
        });
      } else {
        res.status(400);
        throw new Error("Invalid User Data");
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

// PROFILE
userRouter.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (user) {
        res.json({
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          avatar: user.avatar,
          thumb: user.thumb,
          role: user.role,
          favoriteProducts: user.favoriteProducts,
          favoriteRestaurants: user.favoriteRestaurants,
          createdAt: user.createdAt,
        });
      } else {
        res.status(404);
        throw new Error("User not found");
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

// UPDATE PROFILE

userRouter.put(
  "/change-password",
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body.payload;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("Không tìm thấy người dùng.");
    }
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error("Mật khẩu hiện tại không đúng.");
    }
    user.password = newPassword;

    await user.save();

    res.json({ message: "Đổi mật khẩu thành công." });
  })
);


userRouter.put(
  "/profile",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "thumb", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    try {
      const imageUpload = req.files?.avatar?.[0]
        ? await cloudinary.uploader.upload(req.files.avatar[0].path)
        : null;

      const thumbUpload = req.files?.thumb?.[0]
        ? await cloudinary.uploader.upload(req.files.thumb[0].path)
        : null;
      // console.log(req.body)
      const user = await User.findById(req.user._id);
      if (user) {
        user.first_name = req.body.first_name || user.first_name;
        user.last_name = req.body.last_name || user.last_name;
        user.username = req.body.username || user.username;
        if (imageUpload) user.avatar = imageUpload.secure_url;
        if (thumbUpload) user.thumb = thumbUpload.secure_url;

        const updatedUser = await user.save();
        res.json({
          _id: updatedUser._id,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          username: updatedUser.username,
          avatar: updatedUser.avatar,
          thumb: updatedUser.thumb,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          token: generateToken(updatedUser._id),
        });
      } else {
        res.status(404);
        throw new Error("User not found");
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

// GET ALL USER ADMIN
userRouter.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const page = Number(req.query.pageNumber) || 1;
      const skip = (page - 1) * limit;
      const keyword = req.query.keyword
        ? {
          $or: [
            { first_name: { $regex: req.query.keyword, $options: "i" } },
            { last_name: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
        : {};
      const statusFilter =
        req.query.status === "active"
          ? { status: true }
          : req.query.status === "inactive"
            ? { status: false }
            : {};

      const filter = { ...keyword, ...statusFilter };
      const count = await User.countDocuments({ ...filter });
      const users = await User.find({ ...filter })
        .limit(limit)
        .skip(skip)
        .sort({ _id: -1 });
      res.json({ users, page, pages: Math.ceil(count / limit) });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

userRouter.post(
  "/creata",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    try {
      const { first_name, last_name, username, password, role } = req.body.payload;

      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ message: 'Username đã tồn tại' });
      }

      const newUser = new User({
        first_name,
        last_name,
        username,
        password,
        role,
        status: true
      });
      await newUser.save();

      res.status(201).json({ message: 'Tạo người dùng thành công', user: newUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server' });
    }
  })
);

userRouter.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa' });
      }
      res.status(200).json({
        message: 'Xóa người dùng thành công',
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

userRouter.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (user) {
        user.first_name = req.body.payload.first_name || user.first_name;
        user.last_name = req.body.payload.last_name || user.last_name;
        user.username = req.body.payload.username || user.username;
        if (req.body.payload.password) {
          user.password = req.body.payload.password;
        }
        user.avatar = req.body.payload.avatar || user.avatar;
        user.thumb = req.body.payload.thumb || user.thumb;
        user.role = req.body.payload.role || user.role;
        if (req.body.payload.status === false)
          user.status = req.body.payload.status;

        const updatedUser = await user.save();
        res.json({
          _id: updatedUser._id,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          username: updatedUser.username,
          password: updatedUser.password,
          avatar: updatedUser.avatar,
          thumb: updatedUser.thumb,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          token: generateToken(updatedUser._id),
        });
      } else {
        res.status(404);
        throw new Error("User not found");
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

userRouter.post(
  "/favoriteProduct",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.body;
      const productData = await Product.findById(id);

      if (!productData) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }
      const alreadyFavorite = req.user.favoriteProducts.some(
        (p) => p.product.toString() === id
      );

      if (alreadyFavorite) {
        return res.status(400).json({ message: "Sản phẩm đã được yêu thích" });
      }

      const favProduct = {
        name: productData.name,
        image: productData.image,
        price: productData.price,
        description: productData.description,
        product: productData._id,
      };
      req.user.favoriteProducts.push(favProduct);

      await req.user.save();

      res.status(201).json({ message: "Đã thêm vào danh sách món ăn yêu thích", favoriteProducts: req.user.favoriteProducts });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

userRouter.post(
  "/favoriteRetaurant",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.body;
      const restaurantData = await Restaurant.findById(id);
      if (!restaurantData) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }
      const alreadyFavorite = req.user.favoriteRestaurants.some(
        (p) => p.restaurant.toString() === id
      );

      if (alreadyFavorite) {
        return res.status(400).json({ message: "Sản phẩm đã được yêu thích" });
      }
      const favRestaurant = {
        name: restaurantData.name,
        thumb: restaurantData.thumb,
        image: restaurantData.image,
        restaurant: restaurantData._id,
      };

      req.user.favoriteRestaurants.push(favRestaurant);

      await req.user.save();
      res.status(201).json({ message: "Đã thêm vào danh sách nhà hàng yêu thích", favoriteRestaurants: req.user.favoriteRestaurants });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

userRouter.post(
  "/delete-favoriteProduct",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.body;

      const favoriteItem = req.user.favoriteProducts.find(
        (item) => item.product.toString() === id
      );
      if (!favoriteItem) {
        return res.status(404).json({ message: "Favorite product not found" });
      }
      req.user.favoriteProducts.remove({ _id: favoriteItem._id });
      await req.user.save();

      res.status(201).json({ message: "Đã xóa khỏi danh sách món ăn yêu thích", favoriteProducts: req.user.favoriteProducts });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

userRouter.post(
  "/delete-favoriteRestaurant",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.body;
      const favoriteItem = req.user.favoriteRestaurants.find(
        (item) => item.restaurant.toString() === id
      );
      if (!favoriteItem) {
        return res.status(404).json({ message: "Favorite product not found" });
      }
      req.user.favoriteRestaurants.remove({ _id: favoriteItem._id });

      await req.user.save();
      res.status(201).json({ message: "Đã xóa khỏi danh sách nhà hàng yêu thích", favoriteRestaurants: req.user.favoriteRestaurants });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  })
);

export default userRouter;
