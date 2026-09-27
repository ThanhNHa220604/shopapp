import { CreditCard, Wallet, Truck, QrCode, Lock } from "lucide-react";

const paymentMethods = [
  {
    id: "momo",
    icon: Wallet,
    label: "Ví MoMo",
    sub: "Thanh toán qua ứng dụng MoMo hoặc quét mã QR MoMo",
  },
  {
    id: "bank",
    icon: QrCode,
    label: "Chuyển khoản Ngân hàng (VietQR)",
    sub: "Quét mã QR bằng ứng dụng của 40+ Ngân hàng",
  },
  {
    id: "cod",
    icon: Truck,
    label: "Thanh toán khi nhận hàng (COD)",
    sub: "Thanh toán bằng tiền mặt khi nhận hàng",
  },
  {
    id: "card",
    icon: CreditCard,
    label: "Thẻ quốc tế (Visa / Mastercard)",
    sub: "Thanh toán qua thẻ tín dụng hoặc thẻ ghi nợ",
  },
];

const PaymentMethods = ({ payment, setPayment, form, onChange }) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
          2
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          Phương thức thanh toán
        </h2>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((m) => (
          <label
            key={m.id}
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              payment === m.id
                ? "border-blue-500 bg-blue-50/40"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  payment === m.id ? "bg-blue-600" : "bg-gray-100"
                }`}
              >
                <m.icon
                  className={`w-4 h-4 ${
                    payment === m.id ? "text-white" : "text-gray-500"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                <p className="text-xs text-gray-400">{m.sub}</p>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              value={m.id}
              checked={payment === m.id}
              onChange={() => setPayment(m.id)}
              className="w-4 h-4 accent-blue-600"
            />
          </label>
        ))}
      </div>

      {payment === "card" && (
        <div className="mt-5 space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Số thẻ
            </label>
            <input
              name="cardNumber"
              value={form.cardNumber}
              onChange={onChange}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngày hết hạn
              </label>
              <input
                name="cardExpiry"
                value={form.cardExpiry}
                onChange={onChange}
                placeholder="MM / YY"
                maxLength={7}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CVC
              </label>
              <input
                name="cardCvc"
                value={form.cardCvc}
                onChange={onChange}
                placeholder="123"
                maxLength={4}
                type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400 leading-relaxed">
          Dữ liệu của bạn được mã hóa hoàn toàn và xử lý trực tiếp qua cổng thanh toán chính thức.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethods;