import React from "react";
import Link from "next/link";
import AuthInput from "../components/AuthInput";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PasswordInput from "@/components/AuthInput/password";
import NavigationBar from "@/components/NavigationBar";


export default function Signup() {
    // render the singup page using input components.
    const [userName, setUsername] = useState('');
    const [firstName, setFirstname] = useState('');
    const [lastName, setLastname] = useState('');
    const [avatar, setAvatar] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhonenumber] = useState('');
    const [role, setRole] = useState('USER');
    const [submit, setSubmit] = useState(false);
    const [s_error, setError] = useState<{ message: string } | null>(null);
    const router = useRouter();

    const handleUsernameChange = (value: string) => {
        setUsername(value);
    }
    const handleFirstnameChange = (value: string) => {
        setFirstname(value);
    }
    const handleLastnameChange = (value: string) => {
        setLastname(value);
    }
    const handleEmailChange = (value: string) => {
        setEmail(value);
    }
    const handleAvatarChange = (value: string) => {
        setAvatar(value);
    }
    const handlePasswordChange = (value: string) => {
        setPassword(value);
    }
    const handlePhoneChange = (value: string) => {
        setPhonenumber(value);
    }

    const handleSubmit = () => {
        setError(null);
        setSubmit(true);
    }

    const signUp = async () => {
        // Prepare the data to send to the API
        const userData = {
            userName,
            firstName,
            lastName,
            email,
            avatar,
            password,
            phoneNumber: phoneNumber || null,
            role
        };
        try {
            const response = await fetch('/api/users/signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
            });
            // Check if the request was successful
            if (response.ok) {
                const result = await response.json();
                alert('Sign up successful!');
                // redirect to login page
                router.push("/login");

            } else {
                let error = await response.json();
                // Handle error (e.g., show an error message)
                setError({ message: error.message}); 
            }

        } catch(error) {
            setError({ message: 'Network error, please try again later.' });
            console.error(error);
        }
    }

    useEffect(() => {
        // when these values are changed, run this method.
    }, [userName, firstName, lastName, email, password, phoneNumber]);

    useEffect(()=>  {
        signUp();
    }, [submit])
    
    return (
        <>
        <div className="flex h-screen">
            
            <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-orange-50 shadow-2xl">
                <h1 className="font-bold lg:text-4xl md:text-3xl sm:text-md text-gray-800 p-3">
                    Welcome to <span className="text-orange-600">Scriptorium!</span>
                </h1>
                <h2 className="font-bold lg:text-2xl md:text-xl sm:text-sm text-gray-600 p-3">
                    A new code sharing space
                </h2>
            </div>

            <div id="signup-container" className="flex flex-col items-center justify-center w-full md:w-1/2">
                <div id="signup-title" className="title w-full max-w-md">
                    <h2 className="text-center lg:text-xl md:text-lg sm:text-md text-gray-800 p-3 mb-6">Sign up</h2>

                <AuthInput 
                    title="Username"
                    value={userName}
                    onChange={handleUsernameChange}
                    className="border border-gray-300 rounded-lg p-3 w-full max-w-md mb-4"
                />
                <AuthInput 
                    title="First name"
                    value={firstName}
                    onChange={handleFirstnameChange}
                    className="border border-gray-300 rounded-lg p-3 w-full max-w-md mb-4"
                />
                <AuthInput 
                    title="Last name"
                    value={lastName}
                    onChange={handleLastnameChange}
                    className="border border-gray-300 rounded-lg p-3 w-full max-w-md mb-4"
                />
                <AuthInput 
                    title="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="border border-gray-300 rounded-lg p-3 w-full max-w-md mb-4"
                />
                <AuthInput 
                    title="Phone number (optional)"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="border border-gray-300 rounded-lg p-3 w-full max-w-md mb-4"
                />
                <PasswordInput
                        title="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="border border-gray-300 rounded-lg p-3 w-full max-w-md mb-4"
                    />
                {/* Display error message if it exists */}
                <div>{s_error && (
                    <text className="m-1 p-1 text-red-500">{s_error.message}</text> // You can style it as needed
                )}
                </div>
                </div>
                <button
                onClick={handleSubmit}
                className="bg-orange-500 mt-6 text-white font-bold py-2 px-4 w-full max-w-md rounded-lg hover:bg-orange-600 transition duration-200"
                 > Sign Up</button>
            </div>
        </div>
        </>
    )
}