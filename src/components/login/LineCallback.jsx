import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const LineCallback = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const { t } = useTranslation();
    const url = window.location.origin;
    const apiLineLogin = apiUrl + '/line/callback';
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleLoginLine = (name, username, picture) => {

        fetch(`${apiUrl}/google-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullname: name,
                username: username,
                picture: picture
            })
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    // Lưu token và thông tin người dùng vào localStorage
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("username", data.username);
                    localStorage.setItem("current_username", data.fullname);
                    localStorage.setItem("id", data.id);
                    const redirectPath = localStorage.getItem("redirectPath");
                    if (redirectPath) {
                      localStorage.removeItem("redirectPath");
                      navigate(redirectPath);
                    } else {
                      navigate("/home");
                    }
                } else {
                    alert(t(data.message || "An error occurred during login."));
                    navigate("/login");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred during Google login. Please try again later.");
            });
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const storedState = localStorage.getItem('lineState');
        if (code && state === storedState) {
            fetch(`${apiLineLogin}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code : code, url: url }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success === false) {
                        if (data.message === "This account has been banned.") {
                            setError(t('loginForm.accountBanned'));
                        } else {
                            setError(data.message || t('loginForm.loginError'));
                        }
                    } else {
                        console.log("data:", data);
                        handleLoginLine(data.name, data.userId, data.picture);
                    }
                })
                .catch(error => {
                    console.error('Error fetching access token:', error);
                    setError(t('loginForm.loginError'));
                });
        }
    }, [navigate, t]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return <div>{t('loginForm.processingLogin')}</div>;
};

export default LineCallback;