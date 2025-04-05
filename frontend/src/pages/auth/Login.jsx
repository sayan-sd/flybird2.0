import React, { useEffect, useState } from "react";
import GoogleLogo from "../../assets/auth/google.svg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../../stylesheets/auth.css";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../../store/slices/authSlice";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [input, setInput] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const { user } = useSelector((store) => store.auth);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const signupHandler = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/auth/login",
                input,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            console.log("RESponse", res);

            if (res.data.status) {
                dispatch(setAuthUser(res.data.user));

                toast.success(res.data.message);
                navigate("/");

                // clean up
                setInput({
                    email: "",
                    password: "",
                });
            }
        } catch (error) {
            console.error("Error while sign up", error);
            toast.error(error.response.data.message);
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
            <form className="w-115" onSubmit={signupHandler}>
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
                    {false && <p className="text-red text-sm">{"error"}</p>}
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

                {/* login button */}
                <div className="mb-5">
                    <button
                        type="submit"
                        // disabled={isSubmitting || isLoading}
                        className="w-full cursor-pointer border border-primary bg-primary p-4 rounded-lg text-white transition hover:bg-opacity-90 text-xl font-semibold"
                    >
                        {loading ? "Verifying..." : "Verify"}
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
                        Don't have an Account?{" "}
                        <Link to={"/auth/signup"} className="text-primary">
                            Sign up
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;
