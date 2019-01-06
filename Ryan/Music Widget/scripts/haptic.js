function haptic() {
  let haptic = $objc("UINotificationFeedbackGenerator").$new();
  haptic.$notificationOccurred(1);
}

module.exports = haptic
