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
                var configuration = PhotogrammetrySession.Configuration()
                configuration.checkpointDirectory = URL(fileURLWithPath: checkpointPath)
                
                let session = try PhotogrammetrySession(
                    input: URL(fileURLWithPath: inputPath),
                    configuration: configuration
                )
                
                self.session = session
                
                try session.process(requests: [
                    .modelFile(url: URL(fileURLWithPath: outputPath))
                ])
                
                for try await output in session.outputs {
                    switch output {
                        case .processingComplete:
                            // RealityKit has processed all requests.
                            sendEvent(withName: "onComplete", body: [:])
                            resolve(true)
                        case .requestError(let request, let error):
                            // Request encountered an error.
                            sendEvent(withName: "onError", body: ["error": error.localizedDescription])
                            reject("ERROR", error.localizedDescription, nil)
                        case .requestComplete(let request, let result):
                            // RealityKit has finished processing a request.
                            sendEvent(withName: "onRequestComplete", body: [:])
                            resolve(true)
                        case .requestProgress(let request, let fractionComplete):
                            // Periodic progress update. Update UI here.
                            sendEvent(withName: "onProgress", body: ["progress": fractionComplete])
                            resolve(true)
                         case .requestProgressInfo(let request, let progressInfo):
                             // Periodic progress info update.
                             //sendEvent(withName: "onProgress", body: ["progress": progressInfo.fractionComplete])
                             resolve(true)
                        case .inputComplete:
                            // Ingestion of images is complete and processing begins.
                            sendEvent(withName: "onInputComplete", body: [:])
                            resolve(true)
                        case .invalidSample(let id, let reason):
                            // RealityKit deemed a sample invalid and didn't use it.
                            sendEvent(withName: "onInvalidSample", body: ["id": id, "reason": reason])
                            resolve(true)
                        case .skippedSample(let id):
                            // RealityKit was unable to use a provided sample.
                            sendEvent(withName: "onSkippedSample", body: ["id": id])
                            resolve(true)
                        case .automaticDownsampling:
                            // RealityKit downsampled the input images because of
                            // resource constraints.
                            sendEvent(withName: "onAutomaticDownsampling", body: [:])
                            resolve(true)
                        case .processingCancelled:
                            // Processing was canceled.
                            sendEvent(withName: "onProcessingCancelled", body: [:])
                            resolve(true)
                        case .stitchingIncomplete:
                            // Stitching is incomplete.
                            //sendEvent(withName: "onStitchingIncomplete", body: [:])
                            resolve(true)
                        @unknown default:
                                // Unrecognized output.
                                sendEvent(withName: "onUnknownOutput", body: [:])
                                resolve(true)
                    }
                }
            } catch {
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
}
