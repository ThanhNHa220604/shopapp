/**
 * upload file to local server
 * upload images to google firebase()
 * cloudinary , AWS...
 */

const path = require("path");
const fs = require("fs");
const { getStorage, ref, uploadBytesResumable } = require("firebase/storage");

export async function uploadImages(req, res) {
  // Kiểm tra nếu không có file nào được tải lên
  if (req.files.length === 0) {
    throw new Error("Không có file nào được tải lên");
  }

  // Trả về đường dẫn của các file ảnh được tải lên
  const uploadedImagesPaths = req.files.map((file) => path.basename(file.path));

  res.status(201).json({
    message: "Tải ảnh lên thành công",
    files: uploadedImagesPaths,
  });
}

export async function uploadImageToGoogleStorage(req, res) {
  // Kiểm tra nếu không có file nào được tải lên
  if (req.files.length === 0) {
    throw new Error("Không có file nào được tải lên");
  }

  const newFileName = `${Date.now()}-${req.file.originalname}`;
  const storageRef = ref(storage, `images/${newFileName}`);
  // Upload the file in the bucket storage
  const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, {
    contentType: req.file.mimetype,
  });
  //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
  const downloadURL = await getDownloadURL(snapshot.ref);
  console.log("File successfully uploaded.");
  res.status(201).json({
    message: "Tải ảnh lên thành công",
    files: downloadURL,
  });
}

export async function viewImage(req, res) {
  const { filename } = req.params;
  const filePath = path.join(path.join(__dirname, "../uploads"), filename);
  fs.access(filePath, fs.constants.F_OK, (error) => {
    if (error) {
      return res.status(404).send("file not found");
    }
    res.sendFile(filePath);
  });
}

export async function deleteImage(req, res) {
  const { url: rawUrl } = req.body;

  if (!rawUrl) {
    return res.status(400).json({
      message: "Thiếu đường dẫn ảnh",
    });
  }

  const url = rawUrl.trim();

  // ✅ check ảnh có đang dùng trong DB không
  if (await checkImageInUse(url)) {
    return res.status(400).json({
      message: "Ảnh vẫn đang được sử dụng trong cơ sở dữ liệu",
    });
  }

  // ✅ lấy tên file (tránh trường hợp truyền full path)
  const fileName = path.basename(url);

  // ✅ đường dẫn tới thư mục uploads
  const filePath = path.join(__dirname, "../uploads", fileName);

  // ✅ check tồn tại
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: "File ảnh không tồn tại",
    });
  }

  // ✅ xoá file
  fs.unlinkSync(filePath);

  return res.status(200).json({
    message: "Ảnh đã được xoá thành công",
  });
}

async function checkImageInUse(imageUrl) {
  // Định nghĩa một đối tượng để quản lý các trường tìm kiếm cho từng model
  const modelFields = {
    users: "avatar", // Trường 'avatar' cho User
    categories: "image",
    brands: "image",
    products: "image",
    news: "image",
    banners: "image",
  };

  const models = [
    db.users,
    db.categories,
    db.brands,
    db.products,
    db.news,
    db.banners,
  ];

  // Duyệt qua từng model
  for (let model of models) {
    // Lấy tên trường tương ứng từ đối tượng modelFields
    const fieldName = modelFields[model.name];

    // Tạo đối tượng truy vấn dựa trên tên trường
    let query = {};
    query[fieldName] = imageUrl;

    // Tìm bản ghi với điều kiện truy vấn
    const result = await model.findOne({ where: query });

    if (result) {
      console.log(
        `found in model : ${model.name} , field: ${fieldName}, imageurl : ${imageUrl}`,
      );
      return true;
    } // Nếu tìm thấy bản ghi, trả về true
  }

  return false; // Nếu không tìm thấy bản ghi nào, trả về false
}
export async function getAllImages(req, res) {
  // đường dẫn thư mục uploads
  const uploadsPath = path.join(__dirname, "../uploads");

  // đọc tất cả file
  const files = fs.readdirSync(uploadsPath);

  const os = require("os");

  const API_PREFIX = `http://${os.hostname()}:${process.env.PORT || 3000}/api`;

  // convert sang url
  const imageUrls = files.map((file) => `${API_PREFIX}/images/${file}`);

  return res.status(200).json({
    message: "Lấy danh sách ảnh thành công",
    total: imageUrls.length,
    files: imageUrls,
  });
}