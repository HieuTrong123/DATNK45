import multer from 'multer'
import path from 'path'

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.xlsx' && ext !== '.xls') {
        return cb(new Error("không phải file excel"));
    }
    cb(null, true);
}
const uploadExcel = multer({ storage, fileFilter });

export default uploadExcel;