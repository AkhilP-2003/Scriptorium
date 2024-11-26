import React, {ChangeEvent} from "react";
import Link from "next/link";
import Image from "next/image";

interface InputProps {
    className?: string,
    links: { label: string; href: string }[]; // Array of navigation linkst
    title?: string; // Title for the navigation bar
}

const NavigationBar: React.FC<InputProps> = ({links, title, className}) => {

    return (
        <nav className={`flex items-center justify-between p-4 bg-nav-color text-white !shadow-2xl ${className}`}>
            {/* Logo */}
            <div className="flex items-center space-x-2">
                <Image 
                    src="/scriptorium_logo.jpeg" // Path to the logo in the public folder
                    alt="Logo"
                    width={40} // Adjust the width as needed
                    height={40} // Adjust the height as needed
                    className="object-contain rounded-3xl"
                /> {/* Close Image tag here */}
                {title && <h1 className="text-xl font-bold">{title}</h1>} 
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-4">
                {links.map((link, index) => (
                <Link key={index} href={link.href} className="hover:text-gray-300 font-semibold transition-colors duration-200">
                    {link.label}
                </Link>
                ))}
            </div>
        </nav>

    )

}

export default NavigationBar;