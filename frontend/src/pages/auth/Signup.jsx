import React, { useEffect, useState } from "react";
import GoogleLogo from "../../assets/auth/google.svg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../../stylesheets/auth.css";
import { useDispatch, useSelector } from "react-redux";
import OtpInput from "../../components/OTPInput";
import { setAuthUser } from "../../store/slices/authSlice";

const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const { user } = useSelector((store) => store.auth);

    // send otp request
    const sendOTP = async (email) => {
        try {
            await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/auth/otp", {
                email: input.email,
            });
            toast.success("OTP sent to your email!");
            setOtpSent(true);
        } catch (error) {
            setShowOtpInput(false);
            toast.error(error.response?.data?.message || "Failed to send OTP");
        }
    };

    // otp change handler
    const handleOtpChange = (value) => {
        setOtp(value);
    };

    // after verifying otp
    const handleOtpComplete = async (otp) => {
        try {
            // if verify OTP
            // console.log(otp);
            await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/auth/verify",
                {
                    email: input.email,
                    otp,
                }
            );

            // then proceed with signup
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/auth/register",
                input,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            // console.log("RESponse", res);

            if (res.data.status) {
                toast.success(res.data.message);
                dispatch(setAuthUser(res.data.user))
                navigate("/");

                // clean up
                setInput({
                    fullname: "",
                    email: "",
                    password: "",
                });
            }
        } catch (error) {
            console.error("Error during verification:", error.response?.data);
            toast.error(error.response?.data?.message || "Verification failed");
        }
    };

    // signup handler
    

    const requestOtpHandler = async (e) => {
        e.preventDefault();
        const { fullname, email, password } = input;

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

        // verify data
        if (fullname && fullname.length < 3) {
            return toast.error("Fullname must be at least 3 characters long");
        }
        if (!emailRegex.test(email)) {
            return toast.error("Invalid email address");
        }
        if (!passwordRegex.test(password)) {
            return toast.error(
                "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
            );
        }

        try {
            setLoading(true);
            await sendOTP(email);
            setShowOtpInput(true);
        } catch (error) {
            console.error("Error sending OTP", error);
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpHandler = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            if (otp.length !== 6) {
                return toast.error("Please enter a valid 6-digit OTP");
            }
            await handleOtpComplete(otp);
        } catch (error) {
            console.error("Error verifying OTP", error);
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, []);

    return (
        <div className="w-full h-[100vh] flex items-center justify-center">
            <form className="w-115" onSubmit={showOtpInput ? verifyOtpHandler : requestOtpHandler}>
                {showOtpInput ? (
                    <OtpInput name="otp" onOtpChange={handleOtpChange} />
                ) : (
                    <>
                        {/* name */}
                        <div className="mb-4">
                            <label
                                // htmlFor="fullname"
                                className="mb-2.5 block font-medium text-black"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                name="fullname"
                                value={input.fullname}
                                onChange={changeEventHandler}
                                placeholder="Enter your full name"
                                className={`w-full rounded-lg border bg-transparent py-4 pl-6 pr-10 text-black ${
                                    false
                                        ? "border-red focus:border-red"
                                        : "border-stroke"
                                } outline-none focus:border-primary focus-visible:shadow-none`}
                            />
                            {false && (
                                <p className="text-red text-sm">
                                    {"errors.name.message"}
                                </p>
                            )}
                        </div>

                        {/* email */}
                        <div className="mb-4">
                            <label
                                // htmlFor=""
                                className="mb-2.5 block font-medium text-black"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={input.email}
                                onChange={changeEventHandler}
                                placeholder="Enter your email"
                                className={`w-full rounded-lg border bg-transparent py-4 pl-6 pr-10 text-black ${
                                    false
                                        ? "border-red focus:border-red"
                                        : "border-stroke"
                                } outline-none focus:border-primary focus-visible:shadow-none`}
                            />
                            {false && (
                                <p className="text-red text-sm">{"error"}</p>
                            )}
                        </div>

                        {/* password */}
                        <div className="mb-6">
                            <label
                                // htmlFor=""
                                className="mb-2.5 block font-medium text-black"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={input.password}
                                onChange={changeEventHandler}
                                placeholder="Enter your password"
                                className={`w-full rounded-lg border bg-transparent py-4 pl-6 pr-10 text-black ${
                                    false
                                        ? "border-red focus:border-red"
                                        : "border-stroke"
                                } outline-none focus:border-primary focus-visible:shadow-none`}
                            />
                            {false && (
                                <p className="text-red text-sm">
                                    {"errors.password.message"}
                                </p>
                            )}
                        </div>
                    </>
                )}
                {/* login button */}
                <div className="mb-5">
                    <button
                        type="submit"
                        // disabled={isSubmitting || isLoading}
                        className="w-full cursor-pointer border border-primary bg-primary p-4 rounded-lg text-white transition hover:bg-opacity-90 text-xl font-semibold"
                    >
                        {loading ? "Processing..." : showOtpInput ? "Verify OTP" : "Create Account"}
                    </button>
                </div>

                <div className="auth-divider flex items-center text-sm text-stroke before:bg-stroke after:bg-stroke">
                    <span>OR</span>
                </div>

                {/* login with google */}
                <button className="mt-5 flex w-full items-center justify-center gap-3.5 border border-stroke bg-gray p-4 rounded-lg hover:bg-opacity-50">
                    <span className="flex gap-4">
                        <img src={GoogleLogo} alt="google" />
                        Sign with Google
                    </span>
                </button>

                {/* redir to sign up */}
                <div className="mt-6 text-center">
                    <p>
                        Already have an account?{" "}
                        <Link to={"/auth/login"} className="text-primary">
                            Login
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Signup;
