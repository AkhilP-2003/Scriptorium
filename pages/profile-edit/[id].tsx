import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {jwtDecode} from "jwt-decode";

interface UserProfile {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  role: string;
}

type JwtPayload = {
  id: number;
  role: string;
  exp?: number;
};

const avatars = [
  "/guy.jpg",
  "/girl.png",
];

const EditProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get user ID from URL
  const [formData, setFormData] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phoneNumber: "",
    avatar: "",
    role: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          userName: data.userName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          avatar: data.avatar,
          role: data.role,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data.");
      }
    };
    fetchProfile();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarChange = (avatar:string) => {
    setFormData((prev) => ({ ...prev, avatar })); // Update avatar in formData
  };
  
  const handleSubmit = async () => {

    const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("User not logged in.");
        router.push('/login');
        return;
      }

      // Decode token and retrieve user ID
      const decodedToken: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  
      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < currentTime) {
          console.warn("Token expired. Redirecting to login.");
          router.push("/login");
          return;
      }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      router.push(`/profile`);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-gray-50 rounded shadow-xl">
      <h1 className="font-bold text-2xl mb-4">Edit Profile</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="firstName">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="lastName">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="userName">
          Username
        </label>
        <input
          type="text"
          id="userName"
          name="userName"
          value={formData.userName}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">
          Phone Number
        </label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Avatar</label>
        <div className="flex space-x-4">
        {avatars.map((avatar) => {
            const isSelected = formData.avatar === avatar; // Determine if the current avatar is selected
            return (
            <img
                key={avatar}
                src={avatar}
                alt="Avatar"
                className={`w-16 h-16 rounded-full cursor-pointer ${
                isSelected ? "border-4 border-blue-500" : ""
                }`}
                onClick={() => handleAvatarChange(avatar)}
            />
            );
        })}
        </div>
      </div>
      <button
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition"
          onClick={handleSubmit}
        >
          Save Changes
        </button>
    </div>
  );
};

export default EditProfile;
