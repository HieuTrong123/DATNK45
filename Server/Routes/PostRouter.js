import express from "express";
import asyncHandler from "express-async-handler";
import {
    admin,
    protect,
} from "../Middleware/AuthMiddleware.js";
import Posts from "../Models/PostModel.js";
import upload from "../Middleware/Upload.js";
import uploadExecl from "../Middleware/UploadExcel.js";
import xlsx from "xlsx"

const postRoute = express.Router();


postRoute.get("/export/excel",
    protect,
    admin,
    async (req, res) => {
        try {
            const data = await Posts.find({}).lean();
            const ws = xlsx.utils.json_to_sheet(data);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Posts')

            const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

            res.setHeader('Content-Disposition', 'attachment; filename=Posts.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        }
        catch (err) {
            res.status(500).json({ message: 'Export failed', error: err.message });
        }
    })

postRoute.post("/import/excel",
    protect,
    admin,
    uploadExecl.single('file'),
    async (req, res) => {
        try {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet);

            await Posts.insertMany(data);
            res.status(200).json({ message: 'Import Excel thành công' });
        } catch (err) {
            res.status(500).json({ message: 'Import Excel thất bại', error: err.message });
        }
    })

postRoute.get("/chart",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        try {
            const post = await Posts.find({}, "title views");
            res.json(post)
        } catch (err) {
            res.status(500).json({ message: err })
        }
    }))
//Get all Post
postRoute.get(
    "/search",
    asyncHandler(async (req, res) => {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword
            ? {
                title: { $regex: req.query.keyword, $options: "i" }, // tìm theo tên sản phẩm, không phân biệt hoa thường
            }
            : {};
        const count = await Posts.countDocuments({ ...keyword });
        const listPost = await Posts.find({ ...keyword })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ _id: 1 });
        res.json({ listPost, page, pages: Math.ceil(count / pageSize) });
    })
);
postRoute.get(
    "/",
    asyncHandler(async (req, res) => {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword
            ? {
                title: { $regex: req.query.keyword, $options: "i" }, // tìm theo tên sản phẩm, không phân biệt hoa thường
            }
            : {};
        const count = await Posts.countDocuments({ ...keyword });
        const listPost = await Posts.find({ ...keyword })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ _id: 1 });
        res.json({ listPost, page, pages: Math.ceil(count / pageSize) });
    })
);

// ADMIN GET ALL Post WITHOUT SEARCH AND PEGINATION
postRoute.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword
            ? {
                title: { $regex: req.query.keyword, $options: "i" }, // tìm theo tên sản phẩm, không phân biệt hoa thường
            }
            : {};
        const count = await Posts.countDocuments({ ...keyword });
        const posts = await Posts.find({ ...keyword })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ _id: 1 });
        res.json({ posts, count, page, pages: Math.ceil(count / pageSize) });
    })
);

postRoute.get(
    "/recomment",
    asyncHandler(async (req, res) => {
        try {
            const randomPost = await Posts.aggregate([
                { $sample: { size: 4 } }
            ]);
            res.json({ listPost: randomPost });
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: err.message });
        }
    })
);
// GET SINGLE Post
postRoute.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const Post = await Posts.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 0.5 } },
            { new: true });
        if (Post) {
            res.json(Post);
        } else {
            res.status(404);
            throw new Error("Post not Found");
        }
    })
);


// DELETE Post
postRoute.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const Post = await Posts.findById(req.params.id);
        if (Post) {
            await Post.remove();
            res.json({ message: "Post deleted" });
        } else {
            res.status(404);
            throw new Error("Post not Found");
        }
    })
);

// CREATE Post
postRoute.post(
    "/",
    protect,
    admin,
    upload.single("image"),
    asyncHandler(async (req, res) => {
        const { title, description, content } = req.body;
        const image = req.file?.path;
        const author = `${req.user.first_name} ${req.user.last_name}`;
        const Post = new Posts({
            title,
            image,
            description,
            content,
            author,
        });
        if (Post) {
            const createdPost = await Post.save();
            res.status(201).json(createdPost);
        } else {
            res.status(400);
            throw new Error("Invalid Post data");
        }
    })
);

// UPDATE POST
postRoute.put(
    "/:id",
    protect,
    admin,
    upload.single("image"),
    asyncHandler(async (req, res) => {
        console.log(req.body)
        const { title, description, content } =
            req.body;
        const image = req.file?.path;
        const Post = await Posts.findById(req.params.id);
        if (Post) {
            Post.title = title || Post.title;
            Post.image = image || Post.image;
            Post.description = description || Post.description;
            Post.content = content || Post.content;

            const updatedPost = await Post.save();
            res.json(updatedPost)
        } else {
            res.status(404);
            throw new Error("Post not found");
        }
    })
);


export default postRoute;
