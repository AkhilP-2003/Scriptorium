import Image from "next/image";
import localFont from "next/font/local";
import NavigationBar from "../components/NavigationBar";

import React from "react";

const HomePage: React.FC = () => {
  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.navTitle}>Scriptorium</h1>
        <button style={styles.editorButton} onClick={() => window.location.href = "/editor"}>
          Open Online Editor
        </button>
      </nav>

      {/* Search Section */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search blogs, templates, or code..."
          style={styles.searchInput}
        />
        <button style={styles.searchButton}>Search</button>
      </div>

      {/* Top Blog Posts Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Top Blog Posts</h2>
        <div style={styles.cardContainer}>
          <div style={styles.card}>
            <h3>Understanding JavaScript Closures</h3>
            <p>A deep dive into closures with real-world examples.</p>
            <button style={styles.cardButton}>Read More</button>
          </div>
          <div style={styles.card}>
            <h3>Efficient Python Loops</h3>
            <p>Learn how to optimize your Python code for performance.</p>
            <button style={styles.cardButton}>Read More</button>
          </div>
          <div style={styles.card}>
            <h3>Mastering CSS Grid</h3>
            <p>Build complex layouts with ease using CSS Grid.</p>
            <button style={styles.cardButton}>Read More</button>
          </div>
        </div>
      </div>

      {/* Code Templates Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Top Code Templates</h2>
        <div style={styles.cardContainer}>
          <div style={styles.card}>
            <h3>React Todo App</h3>
            <p>A simple and effective todo app built with React.</p>
            <button style={styles.cardButton}>Fork Template</button>
          </div>
          <div style={styles.card}>
            <h3>Node.js REST API</h3>
            <p>A template for building RESTful APIs using Node.js.</p>
            <button style={styles.cardButton}>Fork Template</button>
          </div>
          <div style={styles.card}>
            <h3>Python Data Analysis</h3>
            <p>Perform data analysis with pandas and NumPy.</p>
            <button style={styles.cardButton}>Fork Template</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f5f5f5",
    color: "#333",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#003366",
    color: "#fff",
  },
  navTitle: {
    margin: 0,
    fontSize: "24px",
  },
  editorButton: {
    backgroundColor: "#0056b3",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  searchSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#e6f2ff",
    borderBottom: "1px solid #ccc",
  },
  searchInput: {
    width: "60%",
    padding: "10px",
    borderRadius: "5px 0 0 5px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  searchButton: {
    padding: "10px 20px",
    backgroundColor: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "0 5px 5px 0",
    cursor: "pointer",
    fontSize: "14px",
  },
  section: {
    padding: "20px",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "15px",
  },
  cardContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  card: {
    flex: "1 1 calc(33.33% - 20px)",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "15px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    minWidth: "250px",
  },
  cardButton: {
    marginTop: "10px",
    padding: "10px 15px",
    backgroundColor: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default HomePage;
