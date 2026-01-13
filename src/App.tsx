import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";

function App() {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-base-300 text-base-content">
      <Navbar />
      <div className="flex-1 overflow-hidden relative">
        <Main />
      </div>
    </div>
  );
}

export default App;
