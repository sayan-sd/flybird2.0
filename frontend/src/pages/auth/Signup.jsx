import React, { useEffect, useState } from "react";
import GoogleLogo from "../../assets/auth/google.svg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import OtpInput from "../../components/OTPInput";
import { setAuthUser } from "../../store/slices/authSlice";
import  '../../stylesheets/auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((store) => store.auth);

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState("");

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

        if (!input.fullname || input.fullname.length < 3) {
            newErrors.fullname = "Fullname must be at least 3 characters";
        }
        if (!emailRegex.test(input.email)) {
            newErrors.email = "Invalid email address";
        }
        if (!passwordRegex.test(input.password)) {
            newErrors.password = "Password must be 6-20 chars with uppercase, lowercase and number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendOTP = async () => {
        try {
            setLoading(true);
            await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/auth/otp", {
                email: input.email,
            });
            toast.success("OTP sent to your email!");
            setShowOtpInput(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
            setShowOtpInput(false);
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        try {
            setLoading(true);
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/auth/verify",
                { email: input.email, otp }
            );
            
            if (res.data.verified) {
                const signupRes = await axios.post(
                    import.meta.env.VITE_SERVER_DOMAIN + "/auth/register",
                    input,
                    { withCredentials: true }
                );
                
                if (signupRes.data.status) {
                    dispatch(setAuthUser(signupRes.data.user));
                    toast.success("Account created successfully!");
                    navigate("/");
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        if (showOtpInput) {
            if (otp.length !== 6) {
                toast.error("Please enter a valid 6-digit OTP");
                return;
            }
            await verifyOTP();
        } else {
            await sendOTP();
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit}>
                {showOtpInput ? (
                    <div className="otp-section">
                        <OtpInput length={6} onComplete={setOtp} />
                    </div>
                ) : (
                    <>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                name="fullname"
                                value={input.fullname}
                                onChange={(e) => setInput({...input, fullname: e.target.value})}
                                className={errors.fullname ? "error" : ""}
                            />
                            {errors.fullname && <span className="error-message">{errors.fullname}</span>}
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={input.email}
                                onChange={(e) => setInput({...input, email: e.target.value})}
                                className={errors.email ? "error" : ""}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={input.password}
                                onChange={(e) => setInput({...input, password: e.target.value})}
                                className={errors.password ? "error" : ""}
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>
                    </>
                )}

                <button type="submit" disabled={loading}>
                    {loading 
                        ? "Processing..." 
                        : showOtpInput 
                            ? "Verify OTP" 
                            : "Create Account"}
                </button>

                <div className="divider">OR</div>

                <button type="button" className="google-btn">
                    <img src={GoogleLogo} alt="google" />
                    Sign up with Google
                </button>

                <div className="auth-redirect">
                    Already have an account? <Link to="/auth/login">Login</Link>
                </div>
            </form>
        </div>
    );
};

export default Signup;