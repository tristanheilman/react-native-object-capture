import Foundation
import React
import RealityKit
import ARKit
import Metal
import MetalKit

@objc(RNPhotogrammetrySession)
class RNPhotogrammetrySession: RCTEventEmitter {
    private var session: PhotogrammetrySession?
    
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
    func startReconstruction(_ inputPath: String, 
            checkpointPath: String,
            outputPath: String,
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                print("Starting reconstruction with input path: \(inputPath)")
                var configuration = PhotogrammetrySession.Configuration()
                configuration.checkpointDirectory = getDocumentsDirectory().appendingPathComponent(checkpointPath)
                
                let session = try PhotogrammetrySession(
                    input: getDocumentsDirectory().appendingPathComponent(inputPath),
                    configuration: configuration
                )
                
                self.session = session
                print("Session created successfully")
                
                try session.process(requests: [
                    .modelFile(url: getDocumentsDirectory().appendingPathComponent(outputPath))
                ])
                print("Processing started")
                
                do {
                    for try await output in session.outputs {
                        print("Received output: \(output)")
                        
                        switch output {
                            case .processingComplete:
                                print("Processing complete")
                                sendEvent(withName: "onComplete", body: [:])
                                resolve(true)
                                return
                            case .requestError(let request, let error):
                                print("Request error received: \(error)")
                                sendEvent(withName: "onError", body: ["error": error.localizedDescription])
                                reject("ERROR", error.localizedDescription, nil)
                                return
                            case .requestComplete(let request, let result):
                                print("Request complete")
                                sendEvent(withName: "onRequestComplete", body: [:])
                                return
                            case .requestProgress(let request, let fractionComplete):
                                print("Progress: \(fractionComplete)")
                                sendEvent(withName: "onProgress", body: ["progress": fractionComplete])
                                return
                            case .requestProgressInfo(let request, let progressInfo):
                                print("Progress info: \(progressInfo)")
                                return
                            case .inputComplete:
                                print("Input complete")
                                sendEvent(withName: "onInputComplete", body: [:])
                                return
                            case .invalidSample(let id, let reason):
                                print("Invalid sample: \(id), reason: \(reason)")
                                sendEvent(withName: "onInvalidSample", body: ["id": id, "reason": reason])
                                return
                            case .skippedSample(let id):
                                print("Skipped sample: \(id)")
                                sendEvent(withName: "onSkippedSample", body: ["id": id])
                                return
                            case .automaticDownsampling:
                                print("Automatic downsampling")
                                sendEvent(withName: "onAutomaticDownsampling", body: [:])
                                return
                            case .processingCancelled:
                                print("Processing cancelled")
                                sendEvent(withName: "onProcessingCancelled", body: [:])
                                resolve(true)
                                return
                            case .stitchingIncomplete:
                                print("Stitching incomplete")
                                return
                            @unknown default:
                                print("Unknown output type")
                                sendEvent(withName: "onUnknownOutput", body: [:])
                                return
                        }
                    }
                } catch {
                    print("Error during processing: \(error)")
                    sendEvent(withName: "onError", body: ["error": error.localizedDescription])
                    reject("ERROR", error.localizedDescription, nil)
                }
            } catch {
                print("Caught error in startReconstruction: \(error)")
                sendEvent(withName: "onError", body: ["error": error.localizedDescription])
                reject("ERROR", error.localizedDescription, nil)
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

    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
}
