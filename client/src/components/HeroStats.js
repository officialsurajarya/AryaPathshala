import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import "./HeroStats.css";

const HeroStats = () => {
    const [stats, setStats] = useState([
        { label: "पंजीकृत छात्र", value: 0 },
        { label: "वैदिक पाठ्यक्रम", value: 0 },
        { label: "डिजिटल ग्रन्थ", value: 0 },
    ]);

    useEffect(() => {
        api.get("/courses/public/stats")
            .then(res => {
                if (res?.data) {
                    setStats([
                        { label: "पंजीकृत छात्र", value: res.data.totalStudents || 0 },
                        { label: "वैदिक पाठ्यक्रम", value: res.data.totalCourses || 0 },
                        { label: "डिजिटल ग्रन्थ", value: res.data.totalBooks || 0 },
                    ]);
                }
            })
            .catch(() => {});
    }, []);

    return (
        <div className="h-hero-stats">
            {stats.map((stat, index) => (
                <div key={index} className="h-stat-item">
                    <span className="h-stat-number-wrapper">
                        <span className="h-stat-number">{stat.value}</span>
                        <span className="h-plus">+</span>
                    </span>
                    <br />
                    <span className="h-stat-label">{stat.label}</span>
                </div>
            ))}
        </div>
    );
};

export default HeroStats;
