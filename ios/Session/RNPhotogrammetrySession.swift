import Foundation
import React
import RealityKit
import ARKit
import Metal
import MetalKit

@objc(RNPhotogrammetrySession)
class RNPhotogrammetrySession: RCTEventEmitter {
    private var session: PhotogrammetrySession?
    private var outputTask: Task<Void, Never>?
  
    override init() {
        super.init()
    }

    override func supportedEvents() -> [String]! {
        return [
            "onProgress",
            "onComplete",
            "onError",
            "onCancelled",
            "onRequestComplete",
            "onInputComplete",
            "onInvalidSample",
            "onSkippedSample",
            "onAutomaticDownsampling",
            "onProcessingCancelled",
            "onUnknownOutput"
        ]
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    func startReconstruction(_ inputDirectory: String, 
            checkpointDirectory: String,
            outputPath: String,
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                print("Starting reconstruction with input directory: \(inputDirectory)")

                // Get the documents directory
                guard let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
                    reject("ERROR", "Failed to get documents directory", nil)
                    return
                }

                // Parse the model name path
                let modelPathComponents = outputPath.components(separatedBy: "/")
                let outputDirectoryName = modelPathComponents[0] // "Outputs"
                let modelFileName = modelPathComponents[1] // "model.usdz"
                
                // Create output directory
                let outputDirectory = documentsPath.appendingPathComponent(outputDirectoryName)
                let outputURL = outputDirectory.appendingPathComponent(modelFileName)
                
                print("Output directory path: \(outputDirectory.path)")
                print("Output file path: \(outputURL.path)")
            

                // Remove existing output file if it exists
                if FileManager.default.fileExists(atPath: outputURL.path) {
                    try FileManager.default.removeItem(at: outputURL)
                }
                
                // Create output directory if it doesn't exist
                if !FileManager.default.fileExists(atPath: outputDirectory.path) {
                    try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
                }
                
                // Setup checkpoint directory
                let checkpointURL = documentsPath.appendingPathComponent(checkpointDirectory)
                print("Checkpoint directory path: \(checkpointURL.path)")
                
                // Create checkpoint directory if it doesn't exist
                if !FileManager.default.fileExists(atPath: checkpointURL.path) {
                    try FileManager.default.createDirectory(at: checkpointURL, withIntermediateDirectories: true)
                }
                
                // Get input directory
                let inputURL = documentsPath.appendingPathComponent(inputDirectory)
                print("Input directory path: \(inputURL.path)")
                
                // Verify input directory exists and contains images
                guard FileManager.default.fileExists(atPath: inputURL.path) else {
                    reject("INPUT_ERROR", "Input directory does not exist: \(inputURL.path)", nil)
                    return
                }

                // Check if input directory contains images
                let inputContents = try FileManager.default.contentsOfDirectory(atPath: inputURL.path)
                let imageFiles = inputContents.filter { 
                    $0.lowercased().hasSuffix(".jpg") || 
                    $0.lowercased().hasSuffix(".jpeg") || 
                    $0.lowercased().hasSuffix(".png") ||
                    $0.lowercased().hasSuffix(".heic")
                }

                guard !imageFiles.isEmpty else {
                    reject("INPUT_ERROR", "No valid image files found in input directory", nil)
                    return
                }

                // Create and configure the session
                let configuration = PhotogrammetrySession.Configuration()
                
                print("Creating session with output URL: \(outputURL.path)")
                let session = try PhotogrammetrySession(
                    input: inputURL,
                    configuration: configuration
                )
                
                // Store the session
                self.session = session

                self.setupOutputListener()
                
                // Start the session
                try session.process(requests: [
                    .modelFile(url: outputURL)
                ])
          
                resolve(true)
            } catch {
                let errorMessage = "Failed to initialize photogrammetry session: \(error.localizedDescription)"
                print("Caught error in startReconstruction: \(error)")
                //sendEvent(withName: "onError", body: ["error": error.localizedDescription])
                reject("ERROR", errorMessage, error)
            }
        }
    }
        
    @objc
    func cancelReconstruction(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task {
            session?.cancel()
            resolve(true)
        }
    }

    @objc
    func listDirectoryContents(_ directory: String,
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("Listing directory contents: \(directory)")
        Task {
            do {
                let fileManager = FileManager.default
                let documentsPath = getDocumentsDirectory()
                let targetPath = documentsPath.appendingPathComponent(directory)
                print("Target path: \(targetPath.path)")
                var result: [String: Any] = [
                    "path": targetPath.path,
                    "exists": fileManager.fileExists(atPath: targetPath.path),
                    "files": []
                ]
                
                do {
                    if fileManager.fileExists(atPath: targetPath.path) {
                        let contents = try fileManager.contentsOfDirectory(at: targetPath, includingPropertiesForKeys: [.fileSizeKey, .creationDateKey])
                        let fileDetails = try contents.map { url -> [String: Any] in
                            let attributes = try fileManager.attributesOfItem(atPath: url.path)
                            print("Attributes: \(attributes)")
                            return [
                                "name": url.lastPathComponent,
                                "path": url.path,
                                "size": attributes[.size] as? UInt64 ?? 0,
                                "creationDate": (attributes[.creationDate] as? Date)?.timeIntervalSince1970 ?? 0,
                                "isDirectory": (attributes[.type] as? FileAttributeType) == .typeDirectory
                            ]
                        }
                        result["files"] = fileDetails
                    }

                    resolve(result)
                } catch {
                    let errorMessage = "Failed to list directory contents: \(error.localizedDescription)"
                    print("Caught error in listDirectoryContents: \(error)")
                    reject("ERROR", errorMessage, error)
                }
            }
        }
    }

    private func setupOutputListener() {
        outputTask = Task {
            guard let session = self.session else { return }
            
            do {
                for try await output in session.outputs {
                    print("Received output: \(output)")
                    
                    switch output {
                        case .processingComplete:
                            print("Processing complete")
                            sendEvent(withName: "onComplete", body: [:])
                        case .requestError(let request, let error):
                            let errorMessage: String
                            let errorCode: String
                            
                            switch error {
                                case PhotogrammetrySession.Error.insufficientStorage:
                                    errorMessage = "Insufficient storage: Not enough disk space to complete the photogrammetry process"
                                    errorCode = "insufficientStorage"
                                case PhotogrammetrySession.Error.invalidImages:
                                    errorMessage = "Invalid images: The input images are not suitable for photogrammetry. Please ensure the images are clear, well-lit, and have sufficient overlap"
                                    errorCode = "invalidImages"
                                case PhotogrammetrySession.Error.invalidOutput:
                                    errorMessage = "Invalid output: Unable to create the output model file. Please check if the output directory is writable and has sufficient space"
                                    errorCode = "invalidOutput"
                                default:
                                    errorMessage = "Unknown error: \(error.localizedDescription)"
                                    errorCode = "unknown"
                            }
                            
                            print("Request error: \(errorMessage)")
                            print("Request: \(String(describing: request))")
                            print("Error: \(String(describing: error))")
                            sendEvent(withName: "onError", body: ["error": errorMessage, "code": errorCode, "request": String(describing: request)])
                        case .requestComplete(let request, let result):
                            print("Request complete")
                            sendEvent(withName: "onRequestComplete", body: [:])
                        case .requestProgress(let request, let fractionComplete):
                            print("Progress: \(fractionComplete)")
                            sendEvent(withName: "onProgress", body: ["progress": fractionComplete])
                        case .requestProgressInfo(let request, let progressInfo):
                            print("Progress info: \(progressInfo)")
                        case .inputComplete:
                            print("Input complete")
                            sendEvent(withName: "onInputComplete", body: [:])
                        case .invalidSample(let id, let reason):
                            print("Invalid sample: \(id), reason: \(reason)")
                            sendEvent(withName: "onInvalidSample", body: ["id": id, "reason": reason])
                        case .skippedSample(let id):
                            print("Skipped sample: \(id)")
                            sendEvent(withName: "onSkippedSample", body: ["id": id])
                        case .automaticDownsampling:
                            print("Automatic downsampling")
                            sendEvent(withName: "onAutomaticDownsampling", body: [:])
                        case .processingCancelled:
                            print("Processing cancelled")
                            sendEvent(withName: "onProcessingCancelled", body: [:])
                        case .stitchingIncomplete:
                            print("Stitching incomplete")
                        @unknown default:
                            print("Unknown output type")
                            sendEvent(withName: "onUnknownOutput", body: [:])
                    }
                }
            } catch {
                let errorMessage = "Error during processing: \(error.localizedDescription)"
                print("Error during processing: \(error)")
                sendEvent(withName: "onError", body: ["error": error.localizedDescription])
            }
        }
    }

    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
}
