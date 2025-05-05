import { motion } from 'framer-motion';
import { FeynmanPath } from './components/experiment/FeynmanPath';

const App = () => (
  <div className="flex h-screen w-screen flex-col overflow-hidden">
    <motion.header
      className="border-b border-[#1a1a1a] p-4 md:p-5"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-xl font-bold text-[#0ea5e9] md:text-2xl"
        whileHover={{ scale: 1.02 }}
      >
        Quantize
      </motion.h1>
    </motion.header>

    <FeynmanPath />
  </div>
);

export default App;
