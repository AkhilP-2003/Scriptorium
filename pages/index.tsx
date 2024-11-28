import React from "react";
import { useRouter } from "next/router";

const HomePage: React.FC = () => {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Main Heading */}
        <h1 style={styles.mainHeading}>Scriptorium</h1>
        <h2 style={styles.subHeading}>
          Welcome to Scriptorium: a new way to share, learn, and execute code
        </h2>
        <p style={styles.description}>
          Find out what others are saying with our blogs
          <br />
          or discover the latest innovations with our code templates.
          <br />
          Get started coding and share your ideas today!
        </p>

        {/* Buttons Section */}
        <div style={styles.buttonSection}>
          <button
            style={styles.button}
            onClick={() => router.push("/blogs")}
          >
            Read or create a blog
          </button>
          <button
            style={styles.button}
            onClick={() => router.push("/templates")}
          >
            Get inspired with templates
          </button>
          <button
            style={styles.button}
            onClick={() => router.push("/editor")}
          >
            Start Coding
          </button>
        </div>

        {/* Login and Sign Up Section */}
        <div style={styles.authButtonSection}>
          <button
            style={styles.button}
            onClick={() => router.push("/login")}
          >
            Login
          </button>
          <button
            style={styles.button}
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Responsive Styles
const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    background: "linear-gradient(to bottom, #e6f2ff, #cce0ff)", // Subtle gradient background
    color: "#333",
    minHeight: "100vh",
    margin: 0,
    padding: "20px",
    display: "flex",
    justifyContent: "center", // Horizontally center the content
    alignItems: "center", // Vertically center the content
  },
  content: {
    textAlign: "center",
  },
  mainHeading: {
    fontSize: "6rem",
    fontWeight: "bold",
    margin: "20px 0 10px",
    color: "#003366",
    fontFamily: "Playfair Display", // Elegant font
  },
  subHeading: {
    fontSize: "1.6rem",
    color: "#0056b3",
    marginBottom: "20px",
    fontStyle: "italic", // Italicize for emphasis
  },
  description: {
    fontSize: "1.1rem",
    color: "#333",
    marginBottom: "40px",
    lineHeight: "1.6",
  },
  buttonSection: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap", // Allows buttons to wrap in smaller screens
  },
  authButtonSection: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px", // Adds some space between the sections
    flexWrap: "wrap",
  },
  button: {
    padding: "15px 30px",
    backgroundColor: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s ease, transform 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#003366", // Darken on hover
    transform: "scale(1.05)", // Slightly scale up on hover
  },
  // Media Queries for responsiveness
  "@media (max-width: 768px)": {
    mainHeading: {
      fontSize: "3rem", // Smaller heading on mobile
    },
    subHeading: {
      fontSize: "1.3rem", // Adjust font size for mobile
    },
    description: {
      fontSize: "0.9rem", // Adjust for mobile
    },
    buttonSection: {
      flexDirection: "column", // Stack buttons vertically on mobile
    },
    authButtonSection: {
      flexDirection: "column", // Stack the auth buttons vertically on mobile
    },
    button: {
      width: "100%", // Full width buttons on mobile
    },
  },
  "@media (max-width: 480px)": {
    mainHeading: {
      fontSize: "2.5rem",
    },
    subHeading: {
      fontSize: "1rem",
    },
    description: {
      fontSize: "0.8rem",
    },
    button: {
      fontSize: "14px", // Smaller button on small devices
      padding: "12px 25px",
    },
  },
};

export default HomePage;
