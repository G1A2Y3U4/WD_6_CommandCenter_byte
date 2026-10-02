import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleLogin = async (event) => {

    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
        setError(
            "Please enter your email and password."
        );
        return;
    }

    try {

        setLoading(true);

        const response = await api.post(
            "/auth/login",
            {
                email: email.trim(),
                password
            }
        );

        // Save authentication token
        localStorage.setItem(
            "token",
            response.data.token
        );

        // Save user information
        localStorage.setItem(
            "user",
            JSON.stringify(
                response.data.user
            )
        );

        // ONLY AFTER LOGIN SUCCESS
        navigate(
            "/dashboard",
            {
                replace: true
            }
        );

    } catch (error) {

        setError(
            error.response?.data?.message ||
            "Invalid email or password."
        );

    } finally {

        setLoading(false);
    }
};
    return (
        <div style={styles.page}>

            <div style={styles.card}>

                <div style={styles.logo}>
                    ⚡
                </div>

                <h1 style={styles.title}>
                    Command Center
                </h1>

                <p style={styles.subtitle}>
                    Sign in to your collaborative workspace
                </p>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleLogin}
                    style={styles.form}
                >

                    <div>

                        <label style={styles.label}>
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            style={styles.input}
                        />

                    </div>

                    <div>

                        <label style={styles.label}>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            placeholder="Enter your password"
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            style={styles.input}
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.loginButton}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>

                <div style={styles.divider}>
                    New to Command Center?
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/register")
                    }
                    style={styles.registerButton}
                >
                    Create New Account
                </button>

                <p style={styles.footer}>
                    Real-time collaborative task management
                </p>

            </div>

        </div>
    );
}

const styles = {

    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background:
            "linear-gradient(135deg, #f8fafc, #eef2ff, #f5f3ff)",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },

    card: {
        width: "100%",
        maxWidth: "430px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "22px",
        padding: "40px",
        boxSizing: "border-box",
        textAlign: "center",
        boxShadow:
            "0 20px 60px rgba(15, 23, 42, 0.10)"
    },

    logo: {
        width: "62px",
        height: "62px",
        margin: "0 auto 18px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "white",
        fontSize: "28px"
    },

    title: {
        margin: 0,
        fontSize: "28px",
        fontWeight: "800",
        color: "#0f172a"
    },

    subtitle: {
        margin: "9px 0 26px",
        color: "#64748b",
        fontSize: "14px"
    },

    error: {
        marginBottom: "18px",
        padding: "11px",
        borderRadius: "9px",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#dc2626",
        fontSize: "13px",
        textAlign: "left"
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        textAlign: "left"
    },

    label: {
        display: "block",
        marginBottom: "7px",
        fontSize: "13px",
        fontWeight: "700",
        color: "#334155"
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "13px 14px",
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        outline: "none",
        fontSize: "14px",
        backgroundColor: "#f8fafc"
    },

    loginButton: {
        width: "100%",
        padding: "13px",
        border: "none",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "white",
        fontWeight: "700",
        fontSize: "14px",
        cursor: "pointer"
    },

    divider: {
        margin: "25px 0 15px",
        color: "#94a3b8",
        fontSize: "12px"
    },

    registerButton: {
        width: "100%",
        padding: "12px",
        border: "1px solid #c7d2fe",
        borderRadius: "10px",
        backgroundColor: "#eef2ff",
        color: "#4338ca",
        fontWeight: "700",
        cursor: "pointer"
    },

    footer: {
        marginTop: "22px",
        paddingTop: "18px",
        borderTop: "1px solid #f1f5f9",
        color: "#94a3b8",
        fontSize: "12px"
    }
};

export default Login;