'use client';

import AppButton from './AppButton';

interface DownloadSettingsProps {
  onStart: (config: {
    downloadPath: string;
    createSubfolders: boolean;
  }) => void;
  config: { downloadPath: string; createSubfolders: boolean };
  setConfig: React.Dispatch<
    React.SetStateAction<{ downloadPath: string; createSubfolders: boolean }>
  >;
  disabled?: boolean;
}

export default function DownloadSettings({
  onStart,
  config,
  setConfig,
  disabled,
}: DownloadSettingsProps) {
  const handleDownload = () => {
    onStart(config);
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="downloadPath"
          className="block text-sm font-medium text-gray-700"
        >
          Download Path
        </label>
        <input
          type="text"
          id="downloadPath"
          value={config.downloadPath}
          onChange={(e) =>
            setConfig((c) => ({ ...c, downloadPath: e.target.value }))
          }
          className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition"
          placeholder="/path/to/download"
          disabled={disabled}
        />
      </div>
      <div className="flex items-center">
        <input
          id="createSubfolders"
          type="checkbox"
          checked={config.createSubfolders}
          onChange={(e) =>
            setConfig((c) => ({ ...c, createSubfolders: e.target.checked }))
          }
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          disabled={disabled}
        />
        <label
          htmlFor="createSubfolders"
          className="ml-2 block text-sm text-gray-900"
        >
          Create subfolders for course/module
        </label>
      </div>
      <AppButton onClick={handleDownload} disabled={disabled}>
        Start Download
      </AppButton>
    </div>
  );
}
