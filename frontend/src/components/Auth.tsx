import { SignupInput } from "@adityasethi02/blogweb-common";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Spinner } from "./Spinner";
import { validatePassword } from "../utils/validatePass";

export const Auth = ({ type }: { type: "signup" | "signin" | "blogs"}) => {
    const navigate = useNavigate();
    const [passError, setPassError] = useState<{ password?: string }>({});
    const [loading, setLoading] = useState(false);
    const [postInputs, setPostInputs] = useState<SignupInput>({
        name: "",
        email: "",
        password: "",
    });

    async function sendRequest() {
        setPassError({password: ""});
        if (type === "signup" || type === "signin") {
            const passwordError = validatePassword(postInputs.password);
            if (passwordError) {
                setPassError({
                    password: passwordError
                });
                return;
            }
        }

        setPassError({password: ""});
        setLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`, postInputs);
            const jwt = response.data.jwt;
            const email = response.data.user.email;
            localStorage.setItem("token", jwt);
            localStorage.setItem("email", email);
            if (type === "signup" ) {
                localStorage.setItem("authorName", postInputs.name || response.data.user.name);
            }
            else if (type === "signin") {
                const authorName = response.data.user.name;
                localStorage.setItem("authorName", authorName);
            }
            navigate("/blogs");
        } catch (error: unknown) {
            setLoading(false);

            if (axios.isAxiosError(error) && error.response && error.response.data) {
                const errorMsg = error.response.data.error;

                if (errorMsg === "Email already exists") {
                    setPassError({
                        password: "Email already exists"
                    });
                } else if (errorMsg === "Incorrect password") {
                    setPassError({
                        password: "Incorrect password"
                    });
                } else if (errorMsg === "User not found") {
                    setPassError({
                        password: "Email not registered"
                    });
                    setTimeout(() => {
                        navigate("/signup");
                    }, 2 * 1000);
                } else {
                    console.log("Unkwon error: ", errorMsg);
                }
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen flex justify-center flex-col">
            <div className="flex justify-center">
                <div>
                    <div className="px-10 text-center">
                        <div className="text-3xl font-extrabold">
                            {type === "signup" ? "Create an account" : "Login to your account"}
                        </div>
                        <div className="text-slate-500 mt-2">
                            {type === "signup" ? "Already have an account?" : "Don't have an account?"}
                            <Link className="pl-2 underline" to={type === "signin" ? "/signup" : "/signin"}>
                                {type === "signin" ? "Sign up" : "Sign in"}
                            </Link>
                        </div>
                    </div>
                    <div className="pt-8">
                        { type === "signup" ? <LabelledInput label="Name" placeholder="John Doe" onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                name: e.target.value
                            })
                        }} /> : null }
                        <LabelledInput label="Email" placeholder="johndoe@gmail.com" onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                email: e.target.value
                            })
                        }} />
                        <LabelledInput label="Password" type={ "password" } placeholder="12345" onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                password: e.target.value
                            })
                        }} />

                        {passError.password && <span className="text-red-500 text-sm">{passError.password}</span>}

                        {loading ? (
                            <div className="flex justify-center mt-8">
                                <Spinner />
                            </div>
                        ) : (
                            <button onClick={sendRequest} type="button" disabled={loading} className="mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                                {type === "signup" ? "Sign up" : "Sign in"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

interface LabelledInputType {
    label: string,
    placeholder: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    type?: string
}

function LabelledInput({ label, placeholder, onChange, type }: LabelledInputType) {
    return (
        <div>
            <label className="block mb-2 text-sm text-black font-semibold pt-4">
                {label}
            </label>
            <input onChange={onChange} type={type || "text"} id="firstName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={placeholder} />
        </div>
    )
}