import Foundation
import React

@objc(BuildConfigModule)
class BuildConfigModule: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    // Read BuildType from Info.plist (populated from xcconfig via $(BUILD_TYPE))
    guard let buildType = Bundle.main.object(forInfoDictionaryKey: "BuildType") as? String else {
      NSLog("BuildConfigModule: BuildType not found in Info.plist, using default 'qual'")
      return [
        "BUILD_TYPE": "qual",
        "API_ENDPOINT": "https://manylla.com/qual/api",
        "BUNDLE_ID": Bundle.main.bundleIdentifier ?? "com.manylla.qual"
      ]
    }

    // Read APIEndpoint from Info.plist (populated from xcconfig via $(API_ENDPOINT))
    guard let apiEndpoint = Bundle.main.object(forInfoDictionaryKey: "APIEndpoint") as? String else {
      NSLog("BuildConfigModule: APIEndpoint not found in Info.plist, using default")
      return [
        "BUILD_TYPE": buildType,
        "API_ENDPOINT": "https://manylla.com/qual/api",
        "BUNDLE_ID": Bundle.main.bundleIdentifier ?? "com.manylla.qual"
      ]
    }

    let bundleId = Bundle.main.bundleIdentifier ?? "com.manylla.qual"

    NSLog("BuildConfigModule: Exporting constants - BUILD_TYPE=\(buildType), API_ENDPOINT=\(apiEndpoint), BUNDLE_ID=\(bundleId)")

    return [
      "BUILD_TYPE": buildType,
      "API_ENDPOINT": apiEndpoint,
      "BUNDLE_ID": bundleId
    ]
  }
}
