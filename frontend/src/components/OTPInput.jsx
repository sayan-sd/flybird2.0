import React, { useEffect, useRef, useState } from "react";
import  '../stylesheets/OTPInput.css';
const OtpInput = ({ name = "otp", onOtpChange }) => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);

    const handleChange = (index, e) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // move to next input box
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }

        // update hidden input with complete otp
        const hiddenInput = document.querySelector(`input[name="${name}"]`);
        if (hiddenInput) {
            hiddenInput.value = newOtp.join("");
        }
    };

    const handleKeyDown = (index, e) => {
        // previous box if press backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
            // Clear current input
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").substring(0, 6);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length && i < 6; i++) {
            if (!isNaN(pastedData[i])) {
                newOtp[i] = pastedData[i];
                if (inputRefs.current[i]) {
                    inputRefs.current[i].value = pastedData[i];
                }
            }
        }

        setOtp(newOtp);
        
        // Update hidden input
        const hiddenInput = document.querySelector(`input[name="${name}"]`);
        if (hiddenInput) {
            hiddenInput.value = newOtp.join("");
        }
    };

    useEffect(() => {
        if (onOtpChange) {
            onOtpChange(otp.join(""));
        }
    }, [otp, onOtpChange]);

    return (
        <div className="otp-section">
            <div className="otp-input-container">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="otp-input"
                        maxLength={1}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="[0-9]*"
                    />
                ))}
            </div>
            {/* store complete otp in case of paste */}
            <input type="hidden" name={name} />
        </div>
    );
};

export default OtpInput;