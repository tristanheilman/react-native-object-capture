import { useEffect, useState } from 'react';
import {
  PhotogrammetrySession,
  type PhotogrammetrySessionOptions,
} from 'react-native-object-capture';

const usePhotogrammetrySession = ({
  inputPath,
  checkpointPath,
  outputPath,
}: PhotogrammetrySessionOptions) => {
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    console.log('usePhotogrammetrySession', PhotogrammetrySession);
    PhotogrammetrySession.addProgressListener((currProgress) => {
      setProgress(currProgress);
    });
    PhotogrammetrySession.addErrorListener((err) => {
      setError(err);
    });
    PhotogrammetrySession.addCompleteListener(() => {
      setResult('completed');
    });
    PhotogrammetrySession.addCancelledListener(() => {
      setResult('cancelled');
    });

    const startReconstruction = async () => {
      try {
        await PhotogrammetrySession.startReconstruction({
          inputPath,
          checkpointPath,
          outputPath,
        });
      } catch (err) {
        console.error('Failed to start reconstruction:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    startReconstruction();

    return () => {
      PhotogrammetrySession.cancelReconstruction();
      PhotogrammetrySession.removeAllListeners();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { error, progress, result };
};

export default usePhotogrammetrySession;
