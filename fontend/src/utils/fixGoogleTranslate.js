// Sửa lỗi kinh điển giữa Google Translate và React:
//   "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
//
// Nguyên nhân: Google Translate lấy các text node ra khỏi DOM và bọc chúng vào
// thẻ <font>. React vẫn tưởng text node còn nằm ở chỗ cũ, nên khi cập nhật/xoá
// nó thì gọi removeChild/insertBefore trên một node đã bị "dời nhà" -> ném lỗi
// và sập cả trang.
//
// Cách xử lý (workaround được dùng rộng rãi, xem React issue #11538): nếu node
// không còn là con của cha mà React đang nhắc tới thì bỏ qua thay vì ném lỗi.
//
// CÁCH DÙNG: import 1 lần ở dòng ĐẦU TIÊN của src/index.js, trước khi render:
//   import "./utils/fixGoogleTranslate";

if (
  typeof Node === "function" &&
  Node.prototype &&
  !Node.prototype.__googleTranslatePatched // tránh vá lại nhiều lần khi hot-reload
) {
  Node.prototype.__googleTranslatePatched = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      console.warn(
        "[GoogleTranslate fix] Bỏ qua removeChild: node đã bị dời khỏi cha.",
        child,
      );
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn(
        "[GoogleTranslate fix] Bỏ qua insertBefore: node tham chiếu đã bị dời khỏi cha.",
        referenceNode,
      );
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}