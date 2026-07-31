import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Photogrammetry reconstruction.
 *
 * Registered via `TurboModuleRegistry.get` rather than `getEnforcing` because
 * this module is iOS-only; on other platforms the lookup returns null instead
 * of throwing at import time.
 */

export type DirectoryEntry = {
  name: string;
  path: string;
  size: number;
  creationDate: number;
  isDirectory: boolean;
};

export type DirectoryContents = {
  path: string;
  exists: boolean;
  files: DirectoryEntry[];
};

export interface Spec extends TurboModule {
  /**
   * `detail` is `"reduced"` (the only level available on iOS) or an empty
   * string to use the framework default. Plain string rather than a union
   * because codegen does not support string unions in module signatures.
   */
  startReconstruction(
    imagesDirectory: string,
    checkpointDirectory: string,
    outputPath: string,
    detail: string
  ): Promise<boolean>;
  cancelReconstruction(): Promise<boolean>;
  listDirectoryContents(directory: string): Promise<DirectoryContents>;
}

export default TurboModuleRegistry.get<Spec>('RNPhotogrammetrySession');
