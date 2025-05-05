import { FeynmanPath } from './components/experiment/FeynmanPath';
import { Tutorial } from './components/ui/tutorial';
import { useTutorial } from './hooks/useTutorial';
import { Button } from './components/ui/button';

const App = () => {
  const { showTutorial, completeTutorial, resetTutorial } = useTutorial();

  return (
    <>
      <FeynmanPath />
      {showTutorial && <Tutorial onComplete={completeTutorial} />}
      {!showTutorial && (
        <Button
          onClick={resetTutorial}
          className="fixed right-4 bottom-4 z-10 bg-white text-black hover:bg-gray-200"
          size="sm"
        >
          ?
        </Button>
      )}
    </>
  );
};

export default App;
