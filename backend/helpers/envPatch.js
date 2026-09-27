// envPatch.js
//
// Ép buộc @xenova/transformers detect ĐÚNG là đang chạy trong Node.js,
// bất kể trước đó có package nào (cors, socket.io, axios, ...) đã lỡ
// gán global.self / global.window hay chưa.
//
// File này PHẢI được import làm dòng import ĐẦU TIÊN trong vectorHelper.js
// (trước dòng import "@xenova/transformers"), vì trong ES Module, các câu
// lệnh import chạy tuần tự theo đúng thứ tự khai báo trong file — import
// đầu tiên sẽ được thực thi xong hoàn toàn trước khi import tiếp theo bắt đầu.

if (typeof globalThis.self !== "undefined") {
  console.log(
    "[envPatch] Phát hiện globalThis.self đã bị set (bởi package khác) — đang xoá để tránh @xenova/transformers detect nhầm môi trường browser.",
  );
  delete globalThis.self;
}

if (typeof globalThis.window !== "undefined") {
  console.log(
    "[envPatch] Phát hiện globalThis.window đã bị set — đang xoá.",
  );
  delete globalThis.window;
}