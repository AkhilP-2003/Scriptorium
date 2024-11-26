import React from "react";
import Link from "next/link";
import AuthInput from "../components/AuthInput";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PasswordInput from "@/components/AuthInput/password";


export default function Login() {
    // render the singup page using input components.
    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submit, setSubmit] = useState(false);
    const [s_error, setError] = useState<{ message: string } | null>(null);
    const router = useRouter();

    const handleUsernameChange = (value: string) => {
        setUsername(value);
    }

    const handlePasswordChange = (value: string) => {
        setPassword(value);
    }
    const handleSubmit = () => {
        setError(null);
        setSubmit(true);
    }

    const LogIn = async() => {
        // Prepare the data to send to the API
        const userData = {
            userName,
            password
        };
        try {
            const response = await fetch('/api/users/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
          
            });
            // Check if the request was successful
            if (response.ok) {
                const { accessToken, refreshToken } = await response.json();
                // Extract the Authorization header

                    // Store the access token securely
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                alert('Login up successful!');
                // redirect to login page
                router.push("/");

            } else {
                let error = await response.json();
                setError({ message: error.message}); 
            }

        } catch(error) {
            setError({ message: 'Network error, please try again later.' });
            console.error(error);
            
        }
    }

    useEffect(() => {
        // when these values are changed, run this method.
    }, [userName, password]);

    useEffect(()=>  {
        LogIn();
    }, [submit])
    
    return (
        <>
        <div className="flex h-screen">
            {/* Left Side */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-orange-50 shadow-2xl">
                <h1 className="font-bold lg:text-4xl md:text-3xl sm:text-md text-gray-800 p-3">
                    Welcome to  <span className="text-orange-600">Scriptorium!</span>
                </h1>
                <h2 className="font-bold lg:text-2xl md:text-xl sm:text-sm text-gray-600 p-3">
                    A new code sharing space
                </h2>
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/2">
                <div className="w-full max-w-md">
                    <h2 className="text-center lg:text-xl md:text-lg sm:text-md text-gray-800 p-3 mb-6">Log in</h2>
                    <AuthInput
                        title="Username"
                        value={userName}
                        onChange={handleUsernameChange}
                        className="border border-gray-300 rounded-lg p-3 w-full max-w-md mb-4"
                    />
                    <PasswordInput
                        title="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="border border-gray-300 rounded-lg p-3 w-full max-w-md mb-4"
                    />
                    {s_error && <div className="text-red-500">{s_error.message}</div>}
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-orange-500 mt-6 text-white font-bold py-2 px-4 w-full max-w-md rounded-lg hover:bg-orange-600 transition duration-200"
                >
                    Log in
                </button>
            </div>
        </div>
        </>
    )
}