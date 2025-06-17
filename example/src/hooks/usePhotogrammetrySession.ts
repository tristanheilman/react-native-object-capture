import { useEffect, useState } from 'react';
import {
  PhotogrammetrySession,
  type PhotogrammetrySessionOptions,
} from 'react-native-object-capture';

const usePhotogrammetrySession = ({
  imagesDirectory,
  checkpointDirectory,
  outputPath,
}: PhotogrammetrySessionOptions) => {
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<string | null>(null);
  const [imageDirectoryContents, setImageDirectoryContents] =
    useState<any>(null);
  const [checkpointDirectoryContents, setCheckpointDirectoryContents] =
    useState<any>(null);
  const [outputDirectoryContents, setOutputDirectoryContents] =
    useState<any>(null);

  const startReconstruction = async () => {
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

  useEffect(() => {
    console.log('usePhotogrammetrySession', PhotogrammetrySession);
    PhotogrammetrySession.addProgressListener((currProgress) => {
      setProgress(currProgress);
    });
    PhotogrammetrySession.addErrorListener((err) => {
      console.log('error', err);
      setError(new Error(err));
    });
    PhotogrammetrySession.addCompleteListener(() => {
      setResult('completed');
    });
    PhotogrammetrySession.addCancelledListener(() => {
      setResult('cancelled');
    });

    PhotogrammetrySession.listDirectoryContents('Images/')
      .then((contents) => {
        setImageDirectoryContents(contents);
      })
      .catch((err) => {
        console.error('Failed to list images directory:', err);
      });
    PhotogrammetrySession.listDirectoryContents('Snapshots/')
      .then((contents) => {
        setCheckpointDirectoryContents(contents);
      })
      .catch((err) => {
        console.error('Failed to list checkpoints directory:', err);
      });
    PhotogrammetrySession.listDirectoryContents('Outputs/')
      .then((contents) => {
        setOutputDirectoryContents(contents);
      })
      .catch((err) => {
        console.error('Failed to list outputs directory:', err);
      });

    return () => {
      PhotogrammetrySession.cancelReconstruction();
      PhotogrammetrySession.removeAllListeners();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    error,
    progress,
    result,
    imageDirectoryContents,
    checkpointDirectoryContents,
    outputDirectoryContents,
    startReconstruction,
  };
};

export default usePhotogrammetrySession;
