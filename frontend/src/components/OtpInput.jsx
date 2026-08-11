import { useRef, useEffect } from "react";

// value: "1234" gibi 0-length arası bir string (parent state'te tutulur)
// onChange: yeni string'i parent'a bildirir
function OtpInput({ length = 6, value, onChange, autoFocus = true }) {
    const inputsRef = useRef([]);
    const digits = Array.from({ length }, (_, i) => value[i] || "");

    useEffect(() => {
        if (autoFocus) inputsRef.current[0]?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setDigit = (index, char) => {
        const next = digits.slice();
        next[index] = char;
        onChange(next.join(""));
    };

    const handleChange = (e, index) => {
        const raw = e.target.value.replace(/\D/g, "");
        if (!raw) {
            setDigit(index, "");
            return;
        }
        const char = raw[raw.length - 1];
        setDigit(index, char);
        if (index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (digits[index]) {
                setDigit(index, "");
            } else if (index > 0) {
                setDigit(index - 1, "");
                inputsRef.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (!pasted) return;
        onChange(pasted);
        const focusIndex = Math.min(pasted.length, length - 1);
        inputsRef.current[focusIndex]?.focus();
    };

    return (
        <div className="otp-input-group">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    className="otp-box"
                    value={digit}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                />
            ))}
        </div>
    );
}

export default OtpInput;