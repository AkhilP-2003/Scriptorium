import React from "react";
import Link from "next/link";
import AuthInput from "../components/AuthInput";
import { useState, useEffect } from "react";

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
    const handleRoleChange = (value: string) => {
        setRole(value);
    }
    const handleSubmit = () => {
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
            // Send POST request to the backend API route
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
                // Handle success (e.g., show success message or redirect the user)
                alert('Sign up successful!');
                // You could also redirect the user to the login page or dashboard
            } else {
                let error = await response.json();
                // Handle error (e.g., show an error message)
                setError({ message: error.message}); // Set error message here
            }

        } catch(error) {
            // Handle network errors
            setError({ message: 'Network error, please try again later.' }); // Handle network errors
            console.error(error);
        }
    }

    useEffect(() => {
        // when these values are changed, run this method.
    }, [userName, firstName, lastName, avatar, email, password, phoneNumber, role]);

    useEffect(()=>  {
        // fetch api code.
        signUp();

    }, [submit])
    
    return (
        <>
        <div className="flex flex-row justify-between items-center h-screen p-4">
            <div id="signup-header" className="flex flex-col items-center w-full md:w-1/2">
                <h1 className="font-bold lg:text-4xl md:text-3xl sm:text-md text-gray-800 p-3">
                    Welcome to Scriptorium!
                </h1>
                <h2 className="font-bold lg:text-2xl md:text-xl sm:text-sm text-gray-600 p-3">
                    A new code sharing space
                </h2>
        
            </div>
            <div id="signup-container" className="flex flex-col items-center w-full md:w-1/2 mx-auto">
                <div id="signup-title" className="title w-full max-w-md">
                    <h2 className="text-center lg:text-xl md:text-lg sm:text-md text-gray-800 p-3 mb-6">Sign up</h2>

                <AuthInput 
                    title="Username"
                    value={userName}
                    onChange={setUsername}
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
                <AuthInput 
                    title="avatar"
                    value={avatar}
                    onChange={handleAvatarChange}
                    className="border border-gray-300 rounded-lg p-3 w-full max-w-md mb-4"
                />
                <AuthInput 
                    title="Role (USER or ADMIN)"
                    value={role}
                    onChange={handleRoleChange}
                    className="border border-gray-300 text-gray-200 rounded-lg p-3 w-full max-w-md mb-4"
                />
                <AuthInput 
                    title="password"
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
                className="bg-blue-500 mt-6 text-white font-bold py-2 px-4 w-full max-w-md rounded-lg hover:bg-blue-600 transition duration-200"
                 > Sign Up</button>
            </div>
        </div>
        </>
    )
}