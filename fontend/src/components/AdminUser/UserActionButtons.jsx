//(Cột nút hành động)



import { RotateCcw, Trash2, ShieldPlus, ShieldMinus, Lock } from "lucide-react";

export const UserActionButtons = ({
  user,
  adminUser,
  roleTab,
  isDisabled,
  onEnable,
  onHardDelete,
  onUpgrade,
  onDowngrade,
  onDisable,
}) => {
  const isSelf = user.id === adminUser?.id;
  const isAdmin = user.role === 3;

  if (isSelf || isAdmin) {
    return (
      <span className="text-xs text-slate-400 italic">
        {isSelf ? "Tài khoản của bạn" : "Admin"}
      </span>
    );
  }

  if (roleTab === "disabled") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEnable(user)}
          title="Bỏ vô hiệu hóa"
          className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => onHardDelete(user)}
          title="Xóa vĩnh viễn"
          className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (isDisabled) return <span className="text-xs text-slate-500 italic">—</span>;

  return (
    <div className="flex items-center gap-2">
      {user.role < 2 && (
        <button
          onClick={() => onUpgrade(user)}
          title="Nâng lên Manager"
          className="w-10 h-10 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 flex items-center justify-center text-green-400 transition-colors"
        >
          <ShieldPlus className="w-5 h-5" />
        </button>
      )}

      {user.role === 2 && (
        <button
          onClick={() => onDowngrade(user)}
          title="Hạ xuống User"
          className="w-10 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-400 transition-colors"
        >
          <ShieldMinus className="w-5 h-5" />
        </button>
      )}

      <button
        onClick={() => onDisable(user)}
        title="Vô hiệu hóa tài khoản"
        className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400 transition-colors"
      >
        <Lock className="w-5 h-5" />
      </button>
    </div>
  );
};