import { useState, useRef, useCallback, useEffect } from "react";

// Trình duyệt hỗ trợ dưới 2 tên khác nhau tuỳ vendor (Chrome dùng webkit prefix)
const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * Hook dùng Web Speech API để chuyển giọng nói -> text.
 *
 * @param {Object} options
 * @param {string} options.lang - Ngôn ngữ nhận diện (mặc định tiếng Việt)
 * @param {(transcript: string, isFinal: boolean) => void} options.onResult
 *   Gọi mỗi khi có kết quả mới. `isFinal = true` nghĩa là người dùng đã nói xong
 *   (không phải kết quả tạm thời trong lúc đang nói).
 * @param {() => void} [options.onEnd] - Gọi khi phiên ghi âm kết thúc.
 *
 * @returns {{
 *   isSupported: boolean,
 *   listening: boolean,
 *   error: string,
 *   startListening: () => void,
 *   stopListening: () => void,
 * }}
 */
export default function useVoiceSearch({
  lang = "vi-VN",
  onResult,
  onEnd,
} = {}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);

  // Luôn giữ callback mới nhất mà không cần re-tạo recognition instance
  useEffect(() => {
    onResultRef.current = onResult;
    onEndRef.current = onEnd;
  }, [onResult, onEnd]);

  const isSupported = !!SpeechRecognitionAPI;

  useEffect(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = false; // tự dừng sau khi người dùng ngừng nói
    recognition.interimResults = true; // cho phép hiện text tạm thời trong lúc nói
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const lastResult = event.results[event.results.length - 1];
      onResultRef.current?.(transcript, lastResult.isFinal);
    };

    recognition.onerror = (event) => {
      // "no-speech" xảy ra khi im lặng quá lâu -> không coi là lỗi nghiêm trọng
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(event.error || "Lỗi nhận diện giọng nói");
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      onEndRef.current?.();
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    };
  }, [lang, isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Bỏ qua lỗi "recognition has already started" khi bấm liên tục
    }
  }, [listening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, listening, error, startListening, stopListening };
}
