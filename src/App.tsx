import { Button } from './components/ui/button';
import FeynmanPath from './components/experiment/FeynmanPath';

const App = () => {
  return (
    <div className="h-screen w-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900/50 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0ea5e9]">Quantize - 양자역학 시각화</h1>
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md">
              파인만 경로 적분
            </Button>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-73px)]">
        <FeynmanPath />
      </main>
    </div>
  );
};

export default App;
