import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type ExperimentLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  controls: ReactNode;
};

const ExperimentLayout = ({ title, description, children, controls }: ExperimentLayoutProps) => {
  return (
    <div className="flex h-screen w-screen flex-col">
      <motion.header
        className="border-b border-[#1a1a1a] p-4 md:p-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-lg font-bold text-[#0ea5e9] md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="mt-1 text-sm whitespace-pre-wrap text-[#cccccc] transition-all duration-500 md:text-base md:whitespace-normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {description}
        </motion.p>
      </motion.header>

      <motion.div
        className="relative flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        {children}
      </motion.div>

      <motion.div
        className="bg-[#0a0a0a] p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
      >
        {controls}
      </motion.div>
    </div>
  );
};

export default ExperimentLayout;
