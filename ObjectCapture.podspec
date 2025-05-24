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
    'SWIFT_VERSION' => '5.0',
    'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/Headers/Public/React-Core" "$(PODS_ROOT)/Headers/Public/ReactCommon" "$(PODS_ROOT)/Headers/Public/React-RCTFabric" "$(PODS_ROOT)/Headers/Public/React-Codegen"'
  }

  s.dependency "React-Core"
  s.dependency "React-Codegen"
  s.dependency "React-RCTFabric"

  # Add info.plist entries
  s.info_plist = {
    'NSCameraUsageDescription' => 'This app needs camera access to capture 3D models of objects',
    'NSPhotoLibraryUsageDescription' => 'This app needs photo library access to save captured 3D models'
  }

  s.frameworks = 'RealityKit'

  install_modules_dependencies(s)
end