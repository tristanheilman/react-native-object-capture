import { useEffect, useState } from 'react';
import {
  PhotogrammetrySession,
  type PhotogrammetryDimensions,
  type PhotogrammetrySessionOptions,
} from 'react-native-object-capture';

const usePhotogrammetrySession = () => {
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<PhotogrammetryDimensions | null>(
    null
  );

  const startReconstruction = async ({
    imagesDirectory,
    checkpointDirectory,
    outputPath,
  }: PhotogrammetrySessionOptions) => {
    // Clear the last attempt's outcome so a retry after a cancel or error
    // reads as in progress rather than finished.
    setError(null);
    setResult(null);
    setProgress(0);
    setDimensions(null);
    try {
      const startResult = await PhotogrammetrySession.startReconstruction({
        imagesDirectory,
        checkpointDirectory,
        outputPath,
      });
      console.log('result', startResult);
    } catch (err) {
      console.error('Failed to start reconstruction:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const cancelReconstruction = async () => {
    await PhotogrammetrySession.cancelReconstruction();
  };

  useEffect(() => {
    console.log('usePhotogrammetrySession', PhotogrammetrySession);
    PhotogrammetrySession.addProgressListener((currProgress) => {
      setProgress(currProgress);
    });
    PhotogrammetrySession.addErrorListener((err) => {
      console.log('error', err);
      setError(new Error(err));
    });
    PhotogrammetrySession.addDimensionsListener((dims) => {
      console.log('onDimensions', JSON.stringify(dims));
      setDimensions(dims);
    });
    PhotogrammetrySession.addCompleteListener(() => {
      setResult('completed');
    });
    PhotogrammetrySession.addCancelledListener(() => {
      setResult('cancelled');
    });

    return () => {
      PhotogrammetrySession.cancelReconstruction();
      PhotogrammetrySession.removeAllListeners();
    };
  }, []);

  return {
    error,
    progress,
    result,
    dimensions,
    startReconstruction,
    cancelReconstruction,
  };
};

export default usePhotogrammetrySession;
