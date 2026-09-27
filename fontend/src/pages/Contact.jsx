import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ShieldCheck,
  Loader2,
  XCircle,
  X,
} from "lucide-react";
import emailjs from "@emailjs/browser";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const SERVICE_ID = "service_esl6hmf";
    const TEMPLATE_ID = "template_z5jqzta";
    const PUBLIC_KEY = "wwEbio0oluHT-tckv";

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      subject: formData.subject || "Không có chủ đề",
      message: formData.message,
      to_email: "thk22042006@gmail.com",
    };

    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((response) => {
        setLoading(false);
        setModalStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      })
      .catch((err) => {
        console.error("Lỗi khi gửi mail:", err);
        setLoading(false);
        setModalStatus("error");
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeModal = () => {
    setModalStatus(null);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16 selection:bg-[#6338f6] selection:text-white relative">
      <div className="w-full px-2 sm:px-4 md:px-6 pt-4 space-y-4">
        {/* Banner tiêu đề */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-indigo-100/80 p-6 sm:p-8 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-[#6338f6] mb-2 block">
            Liên Hệ Với Chúng Tôi
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            ThanHNha Store Luôn Sẵn Sàng Hỗ Trợ Bạn
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
            Bạn có câu hỏi về sản phẩm, chính sách bảo hành hoặc cần tư vấn cấu
            hình máy? Hãy liên hệ ngay, đội ngũ chăm sóc khách hàng của chúng
            tôi sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>

        {/* Khối Grid 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-indigo-100/80">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-5">
                Thông Tin Trực Tiếp
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 bg-indigo-50 text-[#6338f6] rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Hotline Tư Vấn & Khiếu Nại
                    </p>
                    <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5 hover:text-[#6338f6] transition-colors">
                      <a href="tel:0378960057">0378960057</a>
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Miễn phí cước gọi từ mọi nhà mạng
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 bg-indigo-50 text-[#6338f6] rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Email Phản Hồi Hệ Thống
                    </p>
                    <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 hover:text-[#6338f6] transition-colors break-all">
                      <a href="mailto:thk22042006@gmail.com">
                        thk22042006@gmail.com
                      </a>
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Tiếp nhận thông báo bảo hành, hợp tác kinh doanh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 bg-indigo-50 text-[#6338f6] rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Trụ Sở Flagship Store
                    </p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 leading-relaxed">
                      Số nhà 17E3, Ngõ 332 Hoàng Công Chất, Phú Diễn, Bắc Từ
                      Liêm, Hà Nội
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 bg-indigo-50 text-[#6338f6] rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Thời Gian Làm Việc
                    </p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">
                      Thứ 2 - Chủ Nhật: 08:00 AM - 21:30 PM
                    </p>
                    <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                      Mở cửa xuyên suốt các ngày lễ Tết
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Khung bản đồ */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-100/80 overflow-hidden h-56">
              <iframe
                title="Store Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8290566373854!2d105.76562097597!3d21.04152528720743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454cb0481fb11%3A0x67db2b70b5550a62!2zMzMyIEhvw6BuZyBDw7RuZyBDaOG6pXQsIFBowwogRGnhu4VuLCBC4bqvYyBU4burIExpw6ptLCBIwYAgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
                className="w-full h-full rounded-xl border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* CỘT PHẢI: FORM GỬI LỜI NHẮN */}
          <div className="lg:col-span-7">
            <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-indigo-100/80">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Gửi Lời Nhắn Đến Hệ Thống
              </h3>
              <p className="text-xs font-medium text-slate-400 mb-5">
                Đừng ngần ngại chia sẻ ý kiến hoặc phản hồi của bạn về dịch vụ
                của chúng tôi.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-slate-50 text-xs font-semibold text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6338f6] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0912345678"
                      className="w-full bg-slate-50 text-xs font-semibold text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6338f6] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                    Địa chỉ Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-50 text-xs font-semibold text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6338f6] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                    Chủ đề cần hỗ trợ
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Bảo hành máy / Tư vấn mua hàng..."
                    className="w-full bg-slate-50 text-xs font-semibold text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6338f6] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                    Nội dung chi tiết *
                  </label>
                  <textarea
                    rows="4"
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung lời nhắn của bạn tại đây..."
                    className="w-full bg-slate-50 text-xs font-semibold text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6338f6] focus:bg-white transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#6338f6] text-white text-xs font-black rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Gửi Lời Nhắn Ngay
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận */}
      {modalStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {modalStatus === "success" && (
              <div className="space-y-3 py-2">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Gửi Lời Nhắn Thành Công!
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Cảm ơn bạn đã liên hệ với ThanHNha Store. Ý kiến của bạn đã
                  được gửi đến ban quản trị và chúng tôi sẽ phản hồi trong thời
                  gian sớm nhất!
                </p>
                <button
                  onClick={closeModal}
                  className="w-full py-2.5 bg-[#6338f6] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md uppercase tracking-wider mt-2"
                >
                  Hoàn Tất
                </button>
              </div>
            )}

            {modalStatus === "error" && (
              <div className="space-y-3 py-2">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl mx-auto flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Gửi Lời Nhắn Thất Bại
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Đã có lỗi xảy ra trong quá trình gửi mail. Vui lòng kiểm tra
                  lại kết nối mạng của bạn!
                </p>
                <button
                  onClick={closeModal}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-md uppercase tracking-wider mt-2"
                >
                  Thử Lại
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
