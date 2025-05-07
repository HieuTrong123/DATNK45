import express from "express";
import asyncHandler from "express-async-handler";
import Categories from "../Models/CategoryModel.js";
import { admin, protect } from "./../Middleware/AuthMiddleware.js";
import Product from "../Models/ProductModel.js";
import upload from "../Middleware/Upload.js";
import uploadExecl from "../Middleware/UploadExcel.js";
import xlsx from "xlsx"
const categoriesRoute = express.Router();

categoriesRoute.get("/export/excel",
  protect,
  admin,
  async (req, res) => {
    try {
      const data = await Categories.find({}).lean();
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Categories')

      const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

      res.setHeader('Content-Disposition', 'attachment; filename=categories.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    }
    catch (err) {
      res.status(500).json({ message: 'Export failed', error: err.message });
    }
  })

categoriesRoute.post("/import/excel",
  protect,
  admin,
  uploadExecl.single('file'),
  async (req, res) => {
    try {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      await Categories.insertMany(data);
      res.status(200).json({ message: 'Import Excel thành công' });
    } catch (err) {
      res.status(500).json({ message: 'Import Excel thất bại', error: err.message });
    }
  })

categoriesRoute.get("/chart",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    try {
      const categories = await Categories.find({}, "name views");
      res.json(categories)
    } catch (err) {
      res.status(500).json({ message: err })
    }
  }))
// GET ALL CATEEGORIES
categoriesRoute.get(
  "/getSlide",
  asyncHandler(async (req, res) => {
    const categories = await Categories.find({}).limit(10);
    res.json(categories);
  })
);
categoriesRoute.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.pageNumber) || 1;  // Lấy trang hiện tại từ query string, mặc định là trang 1
    const limit = 6;  // Số lượng category mỗi trang
    const skip = (page - 1) * limit;  // Tính toán số lượng document cần bỏ qua

    // Lấy các categories với phân trang
    const categories = await Categories.find({})
      .skip(skip)
      .limit(limit);

    // Lấy tổng số lượng categories để tính số trang
    const totalCategories = await Categories.countDocuments();

    res.json({
      categories,
      totalPages: Math.ceil(totalCategories / limit),  // Tính số trang
      currentPage: page,
    });
  })
);
// ADMIN GET ALL CATEGORIES WITHOUT SEARCH AND PEGINATION
categoriesRoute.get(
  "/all",
  protect,
  admin,
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
    res.json({ categories, page, pages: Math.ceil(count / pageSize) });
  })
);
categoriesRoute.get(
  "/name",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const categories = await Categories.find({})
    res.json(categories);
  })
);
// GET SINGLE CATEGRIES
categoriesRoute.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const category = await Categories.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 0.5 } },
      { new: true });;
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }
    const page = Number(req.query.pageNumber) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const products = await Product.find({ categories_id: category._id })
      .skip(skip)
      .limit(limit);
    const total = await Product.countDocuments({ categories_id: category._id });
    res.json({
      category,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
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
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const name = req.body.name;
    const image = req.file?.path;

    const categoryExist = await Categories.findOne({ name });
    if (categoryExist) {
      res.status(400);
      throw new Error("Categries name already exist");
    } else {
      const category = new Categories({
        name,
        image,
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
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const name = req.body.name;
    const image = req.file?.path;

    const category = await Categories.findById(req.params.id);
    if (category) {
      category.name = name || category.name;
      category.image = image || category.image;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404);
      throw new Error("Category not found");
    }
  })
);

export default categoriesRoute;
