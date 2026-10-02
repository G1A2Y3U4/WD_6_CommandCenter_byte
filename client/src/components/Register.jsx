import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Register() {

    const navigate = useNavigate();

    const [username, setUsername] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleRegister = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        // Frontend validation
        if (
            !username.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            setError(
                "Please fill in all fields."
            );
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        try {

            setLoading(true);

            // Send registration data to backend
            await api.post(
                "/auth/register",
                {
                    username: username.trim(),
                    email: email.trim(),
                    password
                }
            );

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );

            // IMPORTANT:
            // Registration does NOT login the user.
            // It only redirects to Login.
            setTimeout(() => {

                navigate(
                    "/login",
                    {
                        replace: true
                    }
                );

            }, 1200);

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Registration failed."
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
                    Create Account
                </h1>

                <p style={styles.subtitle}>
                    Create your Command Center account
                </p>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={styles.success}>
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleRegister}
                    style={styles.form}
                >

                    <div>

                        <label style={styles.label}>
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            placeholder="Enter username"
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            style={styles.input}
                        />

                    </div>

                    <div>

                        <label style={styles.label}>
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            placeholder="Enter email"
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
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
                            placeholder="Enter password"
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            style={styles.input}
                        />

                    </div>

                    <div>

                        <label style={styles.label}>
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            value={confirmPassword}
                            placeholder="Confirm password"
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            style={styles.input}
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.registerButton}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                {/* Existing users go to Login */}
                <div style={styles.existing}>
                    Already have an account?
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/login")
                    }
                    style={styles.loginButton}
                >
                    Sign In
                </button>

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
            "Inter, system-ui, sans-serif"
    },

    card: {
        width: "100%",
        maxWidth: "440px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "22px",
        padding: "38px",
        boxSizing: "border-box",
        textAlign: "center",
        boxShadow:
            "0 20px 60px rgba(15,23,42,0.10)"
    },

    logo: {
        width: "60px",
        height: "60px",
        margin: "0 auto 16px",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg,#4f46e5,#7c3aed)",
        color: "white",
        fontSize: "27px"
    },

    title: {
        margin: 0,
        fontSize: "28px",
        fontWeight: "800",
        color: "#0f172a"
    },

    subtitle: {
        margin: "8px 0 25px",
        color: "#64748b",
        fontSize: "14px"
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        textAlign: "left"
    },

    label: {
        display: "block",
        marginBottom: "6px",
        fontSize: "13px",
        fontWeight: "700",
        color: "#334155"
    },

    input: {
        width: "100%",
        padding: "12px",
        boxSizing: "border-box",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        fontSize: "14px",
        background: "#f8fafc"
    },

    registerButton: {
        width: "100%",
        padding: "13px",
        border: "none",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg,#4f46e5,#7c3aed)",
        color: "white",
        fontWeight: "700",
        cursor: "pointer"
    },

    existing: {
        marginTop: "22px",
        color: "#64748b",
        fontSize: "13px"
    },

    loginButton: {
        width: "100%",
        marginTop: "10px",
        padding: "12px",
        border: "1px solid #c7d2fe",
        borderRadius: "10px",
        background: "#eef2ff",
        color: "#4338ca",
        fontWeight: "700",
        cursor: "pointer"
    },

    error: {
        marginBottom: "15px",
        padding: "10px",
        borderRadius: "8px",
        background: "#fef2f2",
        color: "#dc2626",
        fontSize: "13px"
    },

    success: {
        marginBottom: "15px",
        padding: "10px",
        borderRadius: "8px",
        background: "#ecfdf5",
        color: "#059669",
        fontSize: "13px"
    }
};

export default Register;