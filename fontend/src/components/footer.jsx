import React from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

// 🟢 SVG Icon chuẩn cho các mạng xã hội
const FacebookIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.36 1.48-1.43 2.48-.13 1.34.52 2.68 1.63 3.39 1.11.71 2.58.73 3.69.05.82-.5 1.37-1.38 1.49-2.33.08-2.8.04-5.61.05-8.41-.01-1.61-.01-3.21-.01-4.82z" />
  </svg>
);

const Footer = () => {
  const footerLinks = {
    "SẢN PHẨM": [
      { label: "Laptop & Máy tính", path: "/products?category=Laptops" },
      { label: "Điện thoại & Tablet", path: "/products?category=Smartphones" },
      { label: "Phụ kiện công nghệ", path: "/products?category=Accessories" },
      { label: "Thiết bị âm thanh", path: "/products?category=Audio" },
    ],
    "HỖ TRỢ KHÁCH HÀNG": [
      { label: "Trung tâm bảo hành", path: "/warranty" },
      { label: "Chính sách đổi trả", path: "/returns" },
      { label: "Hướng dẫn mua hàng", path: "/guide" },
      { label: "Liên hệ đóng góp", path: "/contact" },
    ],
    "VỀ CHÚNG TÔI": [
      { label: "Giới thiệu ThanHNha", path: "/about" },
      { label: "Chính sách bảo mật", path: "/privacy" },
      { label: "Điều khoản dịch vụ", path: "/terms" },
      { label: "Hệ thống cửa hàng", path: "/stores" },
    ],
  };

  return (
    <footer className="w-full bg-[#0f0c1b] text-gray-300 border-t border-purple-950/40 font-sans select-none">
      {/* 🚀 TOP FOOTER */}
      <div className="border-b border-purple-950/30 bg-[#141026] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 text-left">
          <div className="flex items-center gap-2.5 justify-start">
            <Truck className="w-4 h-4 text-[#805cf5] shrink-0" />
            <p className="text-[11px] text-gray-400 leading-snug">
              <strong className="text-white uppercase tracking-wider text-[10px] mr-1 block sm:inline">
                Giao hàng siêu tốc:
              </strong>
              Miễn phí toàn quốc từ đơn 499k
            </p>
          </div>

          <div className="flex items-center gap-2.5 justify-start md:border-x border-purple-950/30 md:px-6">
            <RotateCcw className="w-4 h-4 text-[#805cf5] shrink-0" />
            <p className="text-[11px] text-gray-400 leading-snug">
              <strong className="text-white uppercase tracking-wider text-[10px] mr-1 block sm:inline">
                Đổi trả dễ dàng:
              </strong>
              Cam kết dùng thử miễn phí 7 ngày
            </p>
          </div>

          <div className="flex items-center gap-2.5 justify-start">
            <ShieldCheck className="w-4 h-4 text-[#805cf5] shrink-0" />
            <p className="text-[11px] text-gray-400 leading-snug">
              <strong className="text-white uppercase tracking-wider text-[10px] mr-1 block sm:inline">
                Hàng chính hãng:
              </strong>
              Hoàn tiền 200% nếu phát hiện giả
            </p>
          </div>
        </div>
      </div>

      {/* 🚀 MID FOOTER */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Cột 1 & 2: Thương hiệu & Liên hệ */}
          <div className="sm:col-span-2 space-y-3">
            <span className="text-lg font-black text-white tracking-tight block">
              <span className="text-[#805cf5]">ThanHNha</span>
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed max-w-md">
              Hệ sinh thái bán lẻ sản phẩm công nghệ tối giản cao cấp. Tối ưu
              tinh gọn vượt trội.
            </p>

            <div className="space-y-2 pt-1 text-[11px] text-gray-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#805cf5] shrink-0 mt-0.5" />
                <span>Tòa nhà Tech Tower, Q. Cầu Giấy, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#805cf5] shrink-0" />
                <span>
                  Hotline: <strong className="text-white">0378960057</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#805cf5] shrink-0" />
                <span>Email: thk22042006@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Cột 3, 4, 5: Các nhóm liên kết */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-2.5">
              <h4 className="text-[11px] font-bold tracking-wider uppercase text-white border-l-2 border-[#5d34e8] pl-2">
                {section}
              </h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-[11px] text-gray-400 hover:text-white hover:translate-x-0.5 transition-all inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 BOTTOM FOOTER */}
      <div className="border-t border-purple-950/40 bg-[#0b0814] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] text-gray-500">
            © 2026 <span className="text-gray-400 font-semibold">ThanHNha</span>
            . All rights reserved.
          </p>

          {/* Icon Mạng Xã Hội Đã Được Cập Nhật Chính Xác */}
          <div className="flex items-center gap-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-7 h-7 rounded-full bg-[#1b172e] flex items-center justify-center text-gray-400 hover:bg-[#1877f2] hover:text-white transition-all duration-200"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-7 h-7 rounded-full bg-[#1b172e] flex items-center justify-center text-gray-400 hover:bg-[#e4405f] hover:text-white transition-all duration-200"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-7 h-7 rounded-full bg-[#1b172e] flex items-center justify-center text-gray-400 hover:bg-[#ff0000] hover:text-white transition-all duration-200"
            >
              <YoutubeIcon />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="w-7 h-7 rounded-full bg-[#1b172e] flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all duration-200"
            >
              <TikTokIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
