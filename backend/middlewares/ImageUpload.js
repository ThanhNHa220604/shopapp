const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, "../uploads");
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const newfileName = `${Date.now()}-${file.originalname}`;
    cb(null, newfileName);
  },
});

const fileFilter = function (req, file, cb) {
  console.log("mimetype:", file.mimetype); // xem mimetype thực tế

  const allowedMimetypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/jfif",
    
    "application/octet-stream",
  ];

  if (
    file.mimetype.startsWith("image/") ||
    allowedMimetypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ được phép tải lên file ảnh"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // limit 5mb
  },
});

module.exports = upload;
