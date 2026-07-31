require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ObjectCapture"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "17.0" }
  s.source       = { :git => "https://github.com/tristanheilman/react-native-object-capture.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,cpp,swift}"
  s.private_header_files = "ios/**/*.h"
  
  s.swift_version = "5.0"

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_VERSION' => '5.0'
  }

  # React-Core, ReactCommon, React-RCTFabric and the generated codegen pod are
  # all wired up by install_modules_dependencies below. They must not be listed
  # explicitly: the codegen pod was renamed from "React-Codegen" to
  # "ReactCodegen" in React Native 0.75, so a hard dependency on the old name
  # fails to resolve on any current version.

  # Add info.plist entries
  s.info_plist = {
    'NSCameraUsageDescription' => 'This app needs camera access to capture 3D models of objects',
    'NSPhotoLibraryUsageDescription' => 'This app needs photo library access to save captured 3D models'
  }

  s.frameworks = 'RealityKit'

  install_modules_dependencies(s)
end