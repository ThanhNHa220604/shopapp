import React, { useState, useRef } from "react";
import { X } from "lucide-react";

const TagInput = ({ tags, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const val = raw.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) addTag(inputValue);
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div
      className="flex flex-wrap gap-2 items-center bg-white border border-gray-200 rounded-xl px-3 py-2 min-h-[44px] cursor-text focus-within:border-[#1B59F8] transition-colors"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 bg-blue-50 text-[#1B59F8] border border-blue-100 px-2.5 py-0.5 rounded-xl text-xs font-black select-none"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
            className="text-blue-300 hover:text-[#1B59F8] transition-colors ml-0.5"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : "Thêm giá trị..."}
        className="flex-1 min-w-[120px] outline-none text-sm font-semibold text-[#1B2559] bg-transparent placeholder:text-gray-300"
      />
    </div>
  );
};

export default TagInput;
