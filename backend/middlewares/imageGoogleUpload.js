import multer from 'multer'
import path from 'path'
import config from "../config/firebaseConfig"
import { getStorage } from "firebase/storage";

const storage = getStorage()

const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true)
  } else {
    callback(new Error('Chỉ được phép tải lên file ảnh!'), false)
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})
module.exports = upload;

//upload.single('image');
//upload.array('images', 5);