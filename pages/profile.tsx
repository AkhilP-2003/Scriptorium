import Image from "next/image";
import localFont from "next/font/local";
import { useState, useEffect, useReducer } from "react";
import {jwtDecode }from "jwt-decode";
import {useRouter} from "next/router";

type JwtPayload = {
  id: number;
  userName: string;
  email: string;
  role: string;
  exp?: number; // Optional expiration time
};

type UserProfile = {
  id: number;
  userName: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phoneNumber: string;
};

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null); // User's profile
  const [error, setError] = useState<string | null>(null); // Error handling
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("User not logged in.");
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        const decoded: JwtPayload = jwtDecode<JwtPayload>(accessToken)
        const userId = decoded.id;

        // Fetch the user's profile from the backend
        const response = await fetch("/api/users/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          router.push(`/login`);
        }

        const userProfile = await response.json();

        if (userProfile.id !== userId) {
          throw new Error("Unauthorized access to profile.");
        }

        setProfile(userProfile); // Set profile data
      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
        setError("Failed to fetch profile.");
      } finally {
        setIsLoading(false); // Loading complete
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleEdit = (userId: number) => {
    console.log(`Edit profile for user ID: ${userId}`);
    // Example: Use router to navigate to an edit page
    if (profile?.id === userId) {
      router.push(`profile-edit/${userId}`);
    } else {
      alert("You do not have permission to edit this user's profile");
    }
    
  };
  

  return (
    <>
    {profile && <div className="p-6 bg-gray-100 shadow-xl rounded-lg max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
        <button
              onClick={() => handleEdit(profile.id)}
              className="bg-blue-100 mr-3 mt-3 mb-3 font-semibold text-blue-700 p-3 rounded-lg hover:bg-blue-700 hover:text-blue-100"
            >
              Edit
            </button>
      </div>

      <div className="flex items-center mb-4">
        {/* Profile Picture */}
        <img
          src={profile.avatar ? `${profile.avatar}` : "/guy.jpg"}
          alt={`${profile.userName}'s profile picture`}
          className="w-20 h-20 rounded-full shadow-lg mr-6"
        />

        
        <div>
          {/* Username with Edit Button */}
          <div className="flex items-center">
            <p className="text-xl font-bold text-gray-800">{profile.userName}</p>
          </div>
          <p className="text-gray-600 text-sm p-2">Role: {profile.role}</p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-gray-800 font-semibold">First Name</p>
          <p className="text-gray-600 font-semibold">{profile.firstName}</p>
        </div>
        <div>
          <p className="text-gray-800 font-semibold">Last Name</p>
          <p className="text-gray-600 font-semibold">{profile.lastName}</p>
        </div>
        <div className="text-gray-800 font-semibold">
          <p className="text-gray-800 font-semibold">Email</p>
          <p className="text-gray-600 font-semibold">{profile.email}</p>
        </div>
        <div className="text-gray-800 font-semibold">
          <p className="text-gray-800 font-semibold">Password</p>
          <p className="text-gray-600">{"*".repeat(8)}</p>
        </div>
        <div className="text-gray-800 font-semibold col-span-2">
          <p className="text-gray-800 font-semibold">Phone Number</p>
          <p className="text-gray-600 font-semibold">{profile.phoneNumber}</p>
        </div>
      </div>
    </div>}
    </>

  );

}
