import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Sign from "./pages/Sign";
import ProtectedLayer from "./pages/ProtectedLayer";
import Profile from "./pages/Profile";

export default function App() {
    return (
        <>
            <Routes>
            <Route element={<ProtectedLayer />}>
                <Route element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Route>
              <Route path="/Login" element={<Login></Login>}></Route>
              <Route path="/Register" element={<Sign></Sign>}></Route>
            </Routes>
        </>
    );
}
