import Foundation
import React

/// Imperative control over the shared Object Capture session.
///
/// These methods used to live on `RNObjectCaptureView` (the view manager) and
/// each took a react tag that was never read - every call already operated on
/// `RNObjectCaptureSessionManager.shared`. Exposing them as a module instead
/// removes the need for `findNodeHandle` on the JS side and matches how the
/// session actually behaves: one session, not one per view.
///
/// The session manager's methods are all `@MainActor` and non-throwing, so each
/// bridge method hops onto the main actor and resolves.
@objc(RNObjectCaptureSession)
class RNObjectCaptureSessionModule: NSObject {

    private var sessionManager: RNObjectCaptureSessionManager {
        RNObjectCaptureSessionManager.shared
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    // MARK: - Session lifecycle

    @objc
    func resumeSession(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { await sessionManager.resumeSession(); resolve(nil) }
    }

    @objc
    func pauseSession(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { await sessionManager.pauseSession(); resolve(nil) }
    }

    @objc
    func startDetection(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { await sessionManager.startDetection(); resolve(nil) }
    }

    @objc
    func resetDetection(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { await sessionManager.resetDetection(); resolve(nil) }
    }

    @objc
    func startCapturing(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { await sessionManager.startCapturing(); resolve(nil) }
    }

    @objc
    func beginNewScanAfterFlip(_ resolve: @escaping RCTPromiseResolveBlock,
                               rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { await sessionManager.beginNewScanAfterFlip(); resolve(nil) }
    }

    @objc
    func beginNewScan(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { await sessionManager.beginNewScan(); resolve(nil) }
    }

    @objc
    func finishSession(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { await sessionManager.finishSession(); resolve(nil) }
    }

    @objc
    func cancelSession(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { await sessionManager.cancelSession(); resolve(nil) }
    }

    // MARK: - State

    @objc
    func isDeviceSupported(_ resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in resolve(sessionManager.isDeviceSupported()) }
    }

    @objc
    func getSessionState(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in resolve(sessionManager.getSessionState()) }
    }

    @objc
    func getTrackingState(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in resolve(sessionManager.getTrackingState()) }
    }

    @objc
    func getFeedbackState(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in resolve(sessionManager.getFeedbackState()) }
    }

    @objc
    func getNumberOfShotsTaken(_ resolve: @escaping RCTPromiseResolveBlock,
                               rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in resolve(sessionManager.getNumberOfShotsTaken()) }
    }

    @objc
    func getUserCompletedScanState(_ resolve: @escaping RCTPromiseResolveBlock,
                                   rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in resolve(sessionManager.getUserCompletedScanState()) }
    }

    @objc
    func getNumberOfScanPassUpdates(_ resolve: @escaping RCTPromiseResolveBlock,
                                    rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in resolve(sessionManager.getNumberOfScanPassUpdates()) }
    }
}
