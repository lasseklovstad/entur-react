import { Route, Routes } from "react-router-dom";
import { LocationList } from "./components/LocationList";
import { Location } from "./components/Location";

function App() {
  return (
    <div>
      <Routes>
        <Route path="location/:locationId" element={<Location />} />
        <Route path="" element={<LocationList />} />
      </Routes>
    </div>
  );
}

export default App;
