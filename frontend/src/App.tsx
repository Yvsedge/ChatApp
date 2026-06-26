import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Sign from "./pages/Sign";



export default function App() {
    return (
        <>
            <Routes>
              <Route element={<Layout></Layout>}>
                <Route path="/" element={<Dashboard></Dashboard>}>
                </Route>
              </Route>
              <Route path="/Login" element={<Login></Login>}></Route>
              <Route path="/Register" element={<Sign></Sign>}></Route>
            </Routes>
        </>
    );
}
