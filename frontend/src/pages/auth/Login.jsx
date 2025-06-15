import React, { useState } from "react";
import GoogleLogo from "../../assets/auth/google.svg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../../store/slices/authSlice";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((store) => store.auth);

    const [input, setInput] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if (!emailRegex.test(input.email)) {
            newErrors.email = "Invalid email address";
        }
        if (!input.password || input.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/auth/login",
                input,
                { withCredentials: true }
            );

            if (res.data.status) {
                dispatch(setAuthUser(res.data.user));
                toast.success("Login successful!");
                navigate("/");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        navigate("/");
        return null;
    }

    return (
        <div className="auth-container">
            <form onSubmit={handleLogin}>
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

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <div className="divider">OR</div>

                <button type="button" className="google-btn">
                    <img src={GoogleLogo} alt="google" />
                    Login with Google
                </button>

                <div className="auth-redirect">
                    Don't have an account? <Link to="/auth/signup">Sign up</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;