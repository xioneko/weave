export function getPlatform() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
  // if (typeof navigator.userAgentData !== "undefined" && navigator.userAgentData != null) {
  //   return navigator.userAgentData.platform
  // }

  if (navigator.userAgent.toLowerCase().includes("android")) {
    // android device’s navigator.platform is often set as 'linux', so let’s use userAgent for them
    return "android"
  }
  return navigator.platform
}
