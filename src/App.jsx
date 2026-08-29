import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Main from "./components/Main";
import Records from "./components/Records";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new-case" element={<Main />} />
      <Route path="/vault" element={<Records />} />
      <Route path="/Records" element={<Records />} />
    </Routes>
  );
}

export default App;