import express from "express";
import asyncHandler from "express-async-handler";
import Categories from "../Models/CategoryModel.js";
import { admin, owners, protect } from "./../Middleware/AuthMiddleware.js";

const categoriesRoute = express.Router();

// GET ALL CATEEGORIES
categoriesRoute.get(
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
    const count = await Categories.countDocuments({ ...keyword });
    const categories = await Categories.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json({ categories, count, page, pages: Math.ceil(count / pageSize) });
  })
);

// ADMIN GET ALL CATEGORIES WITHOUT SEARCH AND PEGINATION
categoriesRoute.get(
  "/all",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const categories = await Categories.find({}).sort({ _id: -1 });
    res.json(categories);
  })
);

// GET SINGLE CATEGRIES
categoriesRoute.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const categories = await Categories.findById(req.params.id);
    if (categories) {
      res.json(categories);
    } else {
      res.status(404);
      throw new Error("Categries not Found");
    }
  })
);

// DELETE CATEGRIES
categoriesRoute.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const categories = await Categories.findById(req.params.id);
    if (categories) {
      await categories.remove();
      res.json({ message: "Categories deleted" });
    } else {
      res.status(404);
      throw new Error("Categries not Found");
    }
  })
);

// CREATE CATEGRIES
categoriesRoute.post(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, image } = req.body.payload;
    const categoryExist = await Categories.findOne({ name });
    if (categoryExist) {
      res.status(400);
      throw new Error("Categries name already exist");
    } else {
      const category = new Categories({
        name,
        image,
        user: req.user._id,
      });
      if (category) {
        const createdcategory = await category.save();
        res.status(201).json(createdcategory);
      } else {
        res.status(400);
        throw new Error("Invalid category data");
      }
    }
  })
);

// UPDATE CATEGORY
categoriesRoute.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, image } = req.body.payload;
    const category = await Categories.findById(req.params.id);
    if (category) {
      category.name = name || category.name;
      category.image = image || product.image;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404);
      throw new Error("Category not found");
    }
  })
);

export default categoriesRoute;
