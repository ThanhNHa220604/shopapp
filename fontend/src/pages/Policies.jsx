import React, { useState } from "react";
import { ChevronDown, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

export default function Policies() {
  const [openId, setOpenId] = useState(null);

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const policyData = [
    {
      id: 1,
      title: "1. Chính sách bảo hành toàn diện sản phẩm điện tử",
      content: (
        <div className="space-y-4 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
          <p className="font-extrabold text-slate-900">
            A. Thời hạn và Hình thức bảo hành:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Tất cả các sản phẩm phần cứng (Điện thoại, Máy tính bảng, Laptop,
              Màn hình...) bán ra đều được áp dụng hình thức{" "}
              <strong className="text-slate-900">
                Bảo hành điện tử (Kích hoạt qua Số điện thoại / IMEI / Serial
                Number)
              </strong>
              . Thời gian bảo hành tiêu chuẩn từ 12 đến 24 tháng theo đúng quy
              chuẩn của nhà sản xuất.
            </li>
            <li>
              Phụ kiện đi kèm trong hộp (Củ sạc, cáp sạc, tai nghe kèm máy) được
              bảo hành đổi mới trong vòng 06 tháng.
            </li>
          </ul>

          <p className="font-extrabold text-slate-900 mt-3">
            B. Chính sách lỗi là đổi (Đặc quyền 30 ngày):
          </p>
          <p>
            Trong 30 ngày đầu tiên kể từ khi nhận máy, nếu sản phẩm phát sinh
            lỗi phần cứng thuộc phạm vi bảo hành của nhà sản xuất (Lỗi nguồn,
            lỗi màn hình sọc, chết cảm ứng, hỏng bo mạch...), khách hàng sẽ được{" "}
            <strong className="text-slate-900">
              đổi ngay một sản phẩm mới tinh 100% cùng model, cùng màu sắc
            </strong>{" "}
            mà không mất bất kỳ chi phí sửa chữa nào.
          </p>

          <p className="font-extrabold text-red-600 mt-3 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" /> C. Trường hợp từ chối
            tiếp nhận bảo hành:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 bg-red-50/50 p-4 rounded-xl border border-red-100 text-slate-600">
            <li>
              Sản phẩm có dấu hiệu hư hỏng do ngoại lực bên ngoài tác động: Rơi
              vỡ, móp méo vỏ, nứt vỡ mặt kính màn hình hoặc kính camera, cong
              vênh sườn máy.
            </li>
            <li>
              Thiết bị bị chất lỏng xâm nhập (vào nước) dẫn đến rỉ sét bo mạch,
              quỳ tím bên trong máy đã đổi màu - kể cả đối với các thiết bị được
              nhà sản xuất công bố chuẩn kháng nước IP67/IP68.
            </li>
            <li>
              Sản phẩm đã bị tự ý cạy mở vỏ, mất hoặc rách tem niêm phong dán
              trên ốc, hoặc đã qua can thiệp sửa chữa tại các cơ sở kỹ thuật
              không thuộc hệ thống ủy quyền của chúng tôi.
            </li>
            <li>
              Thiết bị bị khóa tài khoản bảo mật cá nhân (Apple ID / iCloud,
              Google Account, Samsung Knox, Passcode màn hình) mà khách hàng
              không thể cung cấp mật khẩu để nhân viên kiểm tra máy.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 2,
      title: "2. Chính sách đổi trả hàng và hoàn tiền minh bạch",
      content: (
        <div className="space-y-4 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
          <p>
            Chúng tôi hỗ trợ chính sách trả hàng hoàn tiền linh hoạt tối đa lên
            đến <strong className="text-slate-900">07 ngày</strong> kể từ thời
            điểm giao hàng thành công để đảm bảo khách hàng hoàn toàn hài lòng
            với quyết định mua sắm.
          </p>

          <p className="font-extrabold text-slate-900">
            A. Điều kiện áp dụng hoàn trả 100% giá trị tiền mặt:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Sản phẩm còn nguyên vẹn lớp seal nilon (seal máy, seal hộp của nhà
              sản xuất), chưa bóc hộp mở máy.
            </li>
            <li>
              Sản phẩm thuộc nhóm thiết bị thông minh chưa được kích hoạt hệ
              thống (Chưa Active bảo hành trên hệ thống
              Apple/Samsung/Microsoft...).
            </li>
            <li>
              Còn đầy đủ hóa đơn mua hàng kiêm phiếu xuất kho, đầy đủ các hộp
              phụ kiện và quà tặng khuyến mãi đi kèm (nếu có) trong tình trạng
              chưa bóc seal sử dụng.
            </li>
          </ul>

          <p className="font-extrabold text-slate-900 mt-3">
            B. Quy định chiết trừ phí khi không đủ điều kiện nguyên seal:
          </p>
          <p>
            Trường hợp máy đã bóc seal, đã kích hoạt sử dụng nhưng khách hàng
            muốn đổi sang dòng sản phẩm khác hoặc trả máy do thay đổi nhu cầu cá
            nhân (Không phải lỗi phần cứng):
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Khấu trừ 15%</strong> giá trị sản phẩm trên hóa đơn nếu
              máy đã bóc seal hộp và bật nguồn sử dụng dưới 48 tiếng.
            </li>
            <li>
              <strong>Khấu trừ 20% - 25%</strong> nếu sản phẩm đã bóc seal, kích
              hoạt và sử dụng từ ngày thứ 3 đến ngày thứ 7.
            </li>
            <li>
              Mất vỏ hộp, rách rách nát hộp đựng phụ kiện, thiếu quà tặng khuyến
              mãi: Thu thêm phí phụ thu cố định 500.000đ/vỏ hộp hoặc trừ tiền
              theo giá trị niêm yết của quà tặng.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 3,
      title:
        "3. Chính sách vận chuyển siêu tốc và quy trình đồng kiểm bắt buộc",
      content: (
        <div className="space-y-4 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
          <p className="font-extrabold text-slate-900">
            A. Thời gian xử lý điều phối đơn hàng:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Giao hàng Hỏa tốc (Nội thành):</strong> Áp dụng tại khu
              vực có chi nhánh store của hệ thống. Đơn hàng được đóng gói, bàn
              giao shipper chuyên biệt giao đến tận tay khách hàng trong vòng 1
              - 2 giờ kể từ khi xác nhận qua điện thoại.
            </li>
            <li>
              <strong>Giao hàng Tiêu chuẩn (Toàn quốc):</strong> Liên kết cùng
              các đơn vị vận chuyển uy tín cao (Viettel Post, GHN). Thời gian
              nhận hàng từ 2 - 4 ngày làm việc tùy thuộc vào địa giới hành chính
              vùng sâu vùng xa.
            </li>
          </ul>

          <p className="font-extrabold text-amber-600 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> B. Quy
            trình đồng kiểm bắt buộc bảo vệ quyền lợi tối đa:
          </p>
          <p>
            Đồ điện tử là mặt hàng giá trị cao và dễ tổn thương cơ học trong quá
            trình luân chuyển. Vì vậy, chúng tôi áp dụng{" "}
            <strong className="text-slate-900">
              quy chế Đồng kiểm 100% đơn hàng trước khi thanh toán / ký nhận
            </strong>
            :
          </p>
          <ol className="list-decimal pl-5 space-y-2 bg-amber-50/40 p-4 rounded-xl border border-amber-100/70">
            <li>
              Khi shipper giao hàng tới, khách hàng yêu cầu mở thùng hàng carton
              niêm phong bên ngoài để kiểm tra hộp máy bên trong.
            </li>
            <li>
              Khách hàng tiến hành kiểm tra ngoại quan bên ngoài hộp sản phẩm
              (Đảm bảo hộp máy còn nguyên lớp seal nilon bọc máy, không bị bóp
              méo, không có vết rách cắt thủng, đúng thông tin model và dung
              lượng đã đặt).
            </li>
            <li>
              <span className="font-black text-red-600">
                Lưu ý nghiêm ngặt:
              </span>{" "}
              Khách hàng được kiểm tra ngoại quan hộp máy nhưng{" "}
              <strong>
                không được tự ý bóc lớp seal nilon hộp máy, không bật nguồn máy,
                không cắm thẻ SIM test sóng
              </strong>{" "}
              trước khi thanh toán tiền cho shipper.
            </li>
            <li>
              Nếu phát hiện hộp hàng có vết móp méo nghiêm trọng hoặc mất băng
              keo niêm phong của store, khách hàng có quyền từ chối nhận hàng
              ngay lập tức và liên hệ hotline tổng đài xử lý đơn hàng khẩn cấp.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 4,
      title: "4. Chính sách an toàn bảo mật thông tin khách hàng",
      content: (
        <div className="space-y-4 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
          <p>
            Hệ thống ý thức sâu sắc rằng bảo mật dữ liệu số là tôn chỉ hàng đầu
            để giữ gìn mối quan hệ bền vững với khách hàng trong kỷ nguyên số.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Mục đích thu thập:</strong> Toàn bộ dữ liệu bao gồm Họ
              tên, Số điện thoại chính, Địa chỉ giao nhận và Lịch sử giao dịch
              chỉ được lưu trữ nhằm phục vụ mục đích duy nhất là xác thực đơn
              hàng, cấp mã thẻ thành viên VIP và thực hiện nghĩa vụ kích hoạt
              bảo hành thiết bị định kỳ.
            </li>
            <li>
              <strong>Chuẩn mã hóa công nghệ cao:</strong> Toàn bộ cổng thanh
              toán trực tuyến, thông tin thẻ tín dụng của khách hàng khi nhập
              trên website đều được chuyển thẳng qua hệ thống bảo mật SSL
              (Secure Sockets Layer) đạt chứng chỉ tiêu chuẩn quốc tế PCI DSS.
              Máy chủ lưu trữ tuyệt đối không ghi nhận lại mã bảo mật CVV của
              thẻ khách hàng.
            </li>
            <li>
              <strong>Cam kết bảo mật:</strong> Chúng tôi tuyệt đối không mua
              bán, trao đổi, chia sẻ thông tin cá nhân của bạn cho bất kỳ tổ
              chức hay bên thứ ba nào vì mục đích quảng cáo rác (Spam SMS, cuộc
              gọi rác), ngoại trừ trường hợp có yêu cầu bằng văn bản chính thức
              từ các cơ quan thực thi pháp luật theo quy định của Hiến pháp hiện
              hành.
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16 selection:bg-[#6338f6] selection:text-white">
      <div className="w-full px-2 sm:px-4 md:px-6 pt-4 space-y-4">
        {/* Banner tiêu đề chính */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-indigo-100/80 p-6 sm:p-8 text-center">
          <div className="w-12 h-12 bg-indigo-50 text-[#6338f6] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-indigo-100">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Trung Tâm Chính Sách & Quy Định Chung
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Mọi giao dịch trên hệ thống thương mại điện tử của chúng tôi đều
            được ràng buộc bảo vệ chặt chẽ bởi các điều khoản pháp lý công bằng
            dưới đây nhằm bảo toàn lợi ích cốt lõi của người mua hàng.
          </p>
        </div>

        {/* Khối danh sách Accordion */}
        <div className="space-y-3">
          {policyData.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white border border-indigo-100/80 rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
              >
                {/* Thanh tiêu đề */}
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full flex justify-between items-center p-4 sm:p-5 text-left font-black text-xs sm:text-sm text-slate-900 hover:bg-indigo-50/30 transition-colors focus:outline-none"
                >
                  <span className={isOpen ? "text-[#6338f6]" : ""}>
                    {item.title}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transform transition-transform duration-300 text-slate-400 shrink-0 ml-2 ${
                      isOpen ? "rotate-180 text-[#6338f6]" : ""
                    }`}
                  />
                </button>

                {/* Phần nội dung accordion */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen
                      ? "max-h-[1500px] border-t border-slate-100 p-4 sm:p-6 bg-slate-50/40"
                      : "max-h-0"
                  }`}
                >
                  {item.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chân trang hỗ trợ */}
        <div className="bg-white rounded-2xl border border-indigo-100/80 p-5 text-center shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            Bạn vẫn còn thắc mắc hay gặp trường hợp đặc biệt ngoài chính sách?{" "}
            <br />
            Vui lòng liên hệ{" "}
            <span className="text-[#6338f6] font-extrabold cursor-pointer hover:underline">
              Tổng đài Hỗ trợ Kỹ thuật & Khiếu nại (24/7)
            </span>{" "}
            để được giải quyết trực tiếp.
          </p>
        </div>
      </div>
    </div>
  );
}
