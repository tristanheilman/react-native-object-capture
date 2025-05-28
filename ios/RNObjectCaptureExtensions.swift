import RealityKit
import SwiftUI

// Make the extensions public so they're accessible across the module
public extension ObjectCaptureSession.CaptureState {
    var stringValue: String {
        switch self {
        case .initializing:
            return "initializing"
        case .ready:
            return "ready"
        case .capturing:
            return "capturing"
        case .completed:
            return "completed"
        case .failed:
            return "failed"
        case .detecting:
            return "detecting"
        case .finishing:
            return "finishing"
        @unknown default:
            return "unknown"
        }
    }
}

public extension ObjectCaptureSession.Tracking {
    var stringValue: String {
        switch self {
        case .normal:
            return "normal"
        case .notAvailable:
            return "notAvailable"
        case .limited:
            return "limited"
        @unknown default:
            return "unknown"
        }
    }   
}

public extension Set where Element == ObjectCaptureSession.Feedback {
    var stringValues: [String] {
        self.map { feedback in
            switch feedback {   
            case .objectTooClose:
                return "objectTooClose"
            case .objectTooFar:
                return "objectTooFar"
            case .environmentLowLight:
                return "environmentLowLight"
            case .environmentTooDark:
                return "environmentTooDark"
            case .movingTooFast:
                return "movingTooFast"
            case .outOfFieldOfView:
                return "outOfFieldOfView"
            case .objectNotFlippable:
                return "objectNotFlippable"
            case .overCapturing:
                return "overCapturing"
            case .objectNotDetected:
                return "objectNotDetected"
            @unknown default:
                return "unknown"
            }
        }
    }
}
