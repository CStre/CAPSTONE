/**
 * @fileoverview This is the componenet for the dashbaord page. 
 * @author Collin Streitman
 * @created 01.24.2024
 * @lastModified By Collin Streitman on 04.26.2024
 *
 * This is another dynamically displaying page and uses the preferences array to display this
 * information to the user through charts from Googles Charts implementation.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardPage.css';
import Header from '../../components/Header';
import { Chart } from "react-google-charts";
import Loader from '../../components/Loader';
import { useNavigate } from 'react-router-dom';


function DashboardPage() {
    const [preferences, setPreferences] = useState([]); // Empty array by default
    const [errorMessage, setErrorMessage] = useState('');
    const [userName, setUserName] = useState(''); // To store the user's name


    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const data1 = [
        ["Country", "Preferences"],
        ["Finland", preferences[0] || 0],
        ["Norway", preferences[1] || 0],
        ["Italy", preferences[2] || 0],
        ["Iceland", preferences[3] || 0],
        ["United States", preferences[4] || 0],
        ["Canada", preferences[5] || 0],
        ["Egypt", preferences[6] || 0],
        ["China", preferences[7] || 0],
        ["Malaysia", preferences[8] || 0],
        ["Brazil", preferences[9] || 0],
        ["Australia", preferences[10] || 0],
        ["New Zealand", preferences[11] || 0],
    ];

    const options1 = {
        colorAxis: { colors: ["#00ffff", "#03dfaf", "#06c56d"] },
        backgroundColor: "#f0f8ff",
        datalessRegionColor: "#ffffff",
        defaultColor: "#f0f8ff",
    };

    const data2 = [
        ["Country", "Preference", { role: "style" }],
        ["Finland", preferences[0] || 0, "#06c56d"],
        ["Norway", preferences[1] || 0, "#05ca7a"],
        ["Italy", preferences[2] || 0, "#04cf87"],
        ["Iceland", preferences[3] || 0, "#04d494"],
        ["United States", preferences[4] || 0, "#03daa2"],
        ["Canada", preferences[5] || 0, "#03dfaf"],
        ["Egypt", preferences[6] || 0, "#02e4bc"],
        ["China", preferences[7] || 0, "#02e9c9"],
        ["Singapore", preferences[8] || 0, "#01efd7"],
        ["Brazil", preferences[9] || 0, "#01f4e4"],
        ["Australia", preferences[10] || 0, "#00f9f1"],
        ["New Zealand", preferences[11] || 0, "#00ffff"],
    ];

    const options2 = {
        pieHole: 0.4,
        is3D: false,
        backgroundColor: "#f0f8ff"
    };

    const data3 = [
        ["Country", "Preference", { role: "style" }],
        ["Finland", preferences[0] || 0, "#06c56d"],
        ["Norway", preferences[1] || 0, "#05ca7a"],
        ["Italy", preferences[2] || 0, "#04cf87"],
        ["Iceland", preferences[3] || 0, "#04d494"],
        ["USA", preferences[4] || 0, "#03daa2"],
        ["Canada", preferences[5] || 0, "#03dfaf"],
        ["Egypt", preferences[6] || 0, "#02e4bc"],
        ["China", preferences[7] || 0, "#02e9c9"],
        ["Singapore", preferences[8] || 0, "#01efd7"],
        ["Brazil", preferences[9] || 0, "#01f4e4"],
        ["Australia", preferences[10] || 0, "#00f9f1"],
        ["New Zealand", preferences[11] || 0, "#00ffff"],
    ];

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 2000); // Loader will display for 2 seconds

        axios.get('/user-info/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(response => {
            if (response.data && response.data.preferences) {
                const prefs = response.data.preferences.split(',').map(Number);
                const name = response.data.name;
                setPreferences(prefs);
                setUserName(name);
            } else {
                setPreferences([]);
                setUserName('');
            }
        }).catch(error => {
            console.error('Failed to fetch user details:', error);
            setErrorMessage('Failed to fetch preferences. Please refresh the page.');
        });
    }, []);

    const handleSelectPreferences = () => {
        navigate('/preferences');
    };

    if (loading) {
        return <Loader />;
    }

    if (preferences !== null && preferences.length === 0) {
        return (
            <div>
                <Header />
                <div className="dashboard">
                    <div className="no-preferences">
                        <lord-icon
                            src="https://cdn.lordicon.com/usownftb.json"
                            trigger="in"
                            stroke="bold"
                            state="in-reveal"
                            colors="primary:#ffffff,secondary:#c71f16"
                            style={{ width: '150px', height: '150px' }}>
                        </lord-icon>
                        <div className='no-pref-mess'>
                            <p>You must select your preferences before viewing the dashboard.</p>
                        </div>
                        <button onClick={handleSelectPreferences} className="route-button">Select</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className='dashboard'>
                <div className='dashboard-message'>
                    <h2>{userName ? `${userName}'s Dashboard` : "Dashboard"}</h2>
                    <div className='dashboard-submessage'>
                        <h3>This is where you can see your preferences be modified in real time</h3>
                    </div>
                </div>
                <div className='dashboard-container'>
                    <div className="main-chart">
                        <Chart
                            chartEvents={[
                                {
                                    eventName: "select",
                                    callback: ({ chartWrapper }) => {
                                        const chart = chartWrapper.getChart();
                                        const selection = chart.getSelection();
                                        if (selection.length === 0) return;
                                        const region = data1[selection[0].row + 1];
                                        console.log("Selected : " + region);
                                    },
                                },
                            ]}
                            chartType="GeoChart"
                            width="100%"
                            height="400px"
                            data={data1}
                            options={options1}
                        />
                    </div>
                    <div className="sub-charts">
                        <div className="chart-box">
                            <Chart
                                chartType="PieChart"
                                width="100%"
                                height="400px"
                                data={data2}
                                options={options2}
                            />
                        </div>
                        <div className="chart-box">
                            <Chart
                                chartType="ColumnChart"
                                width="100%"
                                height="400px"
                                data={data3}
                            />
                        </div>
                    </div>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
}

export default DashboardPage;
