import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Register from "./components/Register";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import KanbanBoard from "./components/KanbanBoard";

function App() {
    return (
        <Routes>

            {/* New users start here */}
            <Route
                path="/"
                element={
                    <Navigate
                        to="/register"
                        replace
                    />
                }
            />

            {/* Registration */}
            <Route
                path="/register"
                element={<Register />}
            />

            {/* Login */}
            <Route
                path="/login"
                element={<Login />}
            />

            {/* Protected Dashboard */}
            <Route
                element={<ProtectedRoute />}
            >
                <Route
                    path="/dashboard"
                    element={<KanbanBoard />}
                />
            </Route>

            {/* Invalid URL */}
            <Route
                path="*"
                element={
                    <Navigate
                        to="/register"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default App;