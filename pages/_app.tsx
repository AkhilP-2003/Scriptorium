import NavigationBar from "@/components/NavigationBar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

  
type JwtPayload = {
  id: number;
  userName: string;
  email: string;
  role: string;
  exp?: number; // Optional expiration time
};
import DarkModeToggle from "@/components/DarkModeToggle";


export default function App({ Component, pageProps }: AppProps) {

  // this part is for setting the global navigation so it doens't re render everytim we load a diff page
  const router = useRouter();
  const currPath = router.pathname;

  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken) as JwtPayload;
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []); // Runs only on the client after the first render


  const isAuthPage = currPath === '/login' || currPath === '/signup';
  const links = isAuthPage
    ? [ // Links for login or sign-up pages
        { label: 'Home', href: '/' },
        { label: 'Editor', href: '/editor' },
        { label: 'Blogs', href: '/blogs' },
        { label: 'Templates', href: '/templates' },
        { label: currPath === '/login' ? 'Sign Up' : 'Login', href: currPath === '/login' ? '/signup' : '/login' },
      ]
    : [ // Links for all other pages
        { label: 'Home', href: '/' },
        { label: 'Editor', href: '/editor' },
        { label: 'Blogs', href: '/blogs' },
        { label: 'Templates', href: '/templates' },
        { label: 'Profile', href: '/profile' },
        { label: 'Logout', href: '/logout' },
        ...(userRole === "ADMIN"
        ? [{ label: 'View Abuse Reports', href: '/view-reports' }]
        : []),
      ];
      
  return (
    <>
    <div className="grid grid-rows-[auto_1fr] grid-cols-1 min-h-screen">
      {/* Navbar spans across full width */}
      <div className="col-span-full z-10">
        <NavigationBar
          title="Scriptorium"
          links={links}
          className="!shadow-2xl"
        />

        {/* Dark Mode Toggle */}
        <div className="flex justify-end p-4">
            <DarkModeToggle /> {/* Dark Mode Toggle */}
        </div>

      </div>

      {/* Main content section */}
      <div>
        <Component {...pageProps} />
      </div>
    </div>
    </>
  );
}
