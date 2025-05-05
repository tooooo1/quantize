import { ReactNode } from 'react';

type ExperimentLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  controls?: ReactNode;
};

const ExperimentLayout = ({ title, description, children, controls }: ExperimentLayoutProps) => {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-800 bg-gray-900 p-4">
        <h1 className="text-2xl font-bold text-[#0ea5e9]">{title}</h1>
        {description && <p className="mt-1 text-gray-400">{description}</p>}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 overflow-hidden">{children}</div>

        {controls && (
          <div className="w-80 overflow-y-auto border-l border-gray-800 bg-gray-950 p-4">
            <h2 className="mb-4 text-lg font-medium">컨트롤</h2>
            {controls}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentLayout;
