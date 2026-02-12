import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PublicProfiles from "./pages/PublicProfiles";
import Register from "./pages/Register";
import FactoryDetails from "./pages/FactoryDetails";


export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<PublicProfiles />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/factory/:id" element={<FactoryDetails />} />


      </Routes>
    </BrowserRouter>
  );
}
