import React from "react";
import { ShieldCheck, Award, Cpu, Wrench } from "lucide-react";

export default function AboutUs() {
  const coreValues = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#6338f6]" />,
      title: "100% Chính Hãng - Ủy Quyền",
      desc: "Mọi thiết bị từ Điện thoại, Laptop đến linh kiện bán ra đều có đầy đủ hóa đơn VAT, chứng nhận xuất xứ (CO) và chất lượng (CQ). Phát hiện hàng giả, hàng dựng, chúng tôi cam kết bồi thường 200% giá trị.",
    },
    {
      icon: <Wrench className="w-5 h-5 text-[#6338f6]" />,
      title: "Trung Tâm Bảo Hành Cấp Cao",
      desc: "Đội ngũ kỹ thuật viên đạt chứng chỉ kiểm định khắt khe từ các hãng lớn (Apple, Samsung, ASUS). Tiếp nhận, chẩn đoán lỗi bằng thiết bị chuyên dụng và xử lý bảo hành siêu tốc trong vòng 72 giờ.",
    },
    {
      icon: <Award className="w-5 h-5 text-[#6338f6]" />,
      title: "Tối Ưu Hóa Chi Phí",
      desc: "Nhờ mạng lưới hợp tác trực tiếp không qua trung gian với nhà sản xuất, chúng tôi luôn tự tin mang lại mức giá tốt nhất thị trường kèm theo các đặc quyền trả góp 0% lãi suất.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16 selection:bg-[#6338f6] selection:text-white">
      <div className="w-full px-2 sm:px-4 md:px-6 pt-4 space-y-6">
        {/* Banner tiêu đề tràn viền */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-indigo-100/80 p-6 sm:p-10 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-[#6338f6] mb-2 block">
            Chào mừng đến với ThanHNha Store
          </span>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto mb-3">
            Kiến Tạo Hệ Sinh Thái Công Nghệ Số Đích Thực
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
            Chúng tôi không chỉ bán thiết bị điện tử, chúng tôi cung cấp giải
            pháp công nghệ toàn diện giúp nâng tầm trải nghiệm sống và tối ưu
            hóa hiệu suất làm việc của bạn.
          </p>
        </div>

        {/* Khối Câu chuyện Thương hiệu */}
        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-indigo-100/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>

          <h2 className="text-lg sm:text-2xl font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#6338f6]" /> Câu Chuyện Thương Hiệu
          </h2>
          <div className="space-y-4 text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
            <p>
              Được thành lập trong giai đoạn bùng nổ của cuộc cách mạng công
              nghệ số, chúng tôi nhận thấy thị trường thiết bị điện tử tại Việt
              Nam vô cùng tiềm năng nhưng cũng đầy thách thức đối với người tiêu
              dùng. Việc lẫn lộn giữa hàng chính hãng, hàng xách tay không rõ
              nguồn gốc và hàng dựng kém chất lượng khiến khách hàng luôn rơi
              vào tâm lý hoang mang khi xuống tiền cho những thiết bị có giá trị
              lớn.
            </p>
            <p>
              Xuất phát từ một nhóm kỹ sư công nghệ dày dặn kinh nghiệm, chúng
              tôi đặt viên gạch đầu tiên với lời cam kết đanh thép:{" "}
              <span className="font-bold text-[#6338f6]">
                Tuyên chiến với hàng giả, định nghĩa lại khái niệm dịch vụ hậu
                mãi.
              </span>{" "}
              Đồ điện tử là tài sản công nghệ, nó cần sự đồng hành bền bỉ từ nhà
              bán hàng trong suốt vòng đời sử dụng sản phẩm chứ không chỉ dừng
              lại sau khi khách hàng quẹt thẻ thanh toán.
            </p>
          </div>
        </div>

        {/* Tầm nhìn & Sứ mệnh */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-[#6338f6] to-indigo-700 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
            <h3 className="text-base sm:text-xl font-black mb-2.5">
              Tầm Nhìn Chiến Lược
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
              Trở thành biểu tượng uy tín hàng đầu trong lĩnh vực bán lẻ và dịch
              vụ công nghệ điện tử tại Việt Nam. Xây dựng một mạng lưới điểm
              chạm mua sắm thông minh, nơi khách hàng có thể tìm kiếm bất kỳ
              giải pháp phần cứng hay phần mềm nào với sự an tâm tuyệt đối về
              chất lượng và sự hài lòng về dịch vụ.
            </p>
          </div>
          <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-indigo-100/80">
            <h3 className="text-base sm:text-xl font-black text-slate-900 mb-2.5">
              Sứ Mệnh Khách Hàng
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Phổ cập hóa công nghệ cao cấp chính hãng tới mọi người dân với chi
              phí tối ưu nhất. Chúng tôi không ngừng đổi mới quy trình quản lý,
              kiểm định chất lượng đầu vào nghiêm ngặt để đảm bảo mỗi chiếc máy
              đến tay người dùng đều là một phiên bản hoàn hảo nhất.
            </p>
          </div>
        </div>

        {/* Giá trị Cốt lõi */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-indigo-100/80">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-6 text-center">
            Giá Trị Cốt Lõi Tạo Nên Sự Khác Biệt
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 hover:border-[#6338f6] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3 shadow-sm border border-indigo-100">
                  {value.icon}
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  {value.title}
                </h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
