const _general = require("../general.js")

function showActionView() {
	$ui.action({
		title: $l10n("year_check_title"),
		message: $l10n("year_check_message"),
		actions: [{
			title: $l10n("year_check"),
			handler: () => {
				actionSaveConfiguration()
			}
		}]
	})
}

function actionSaveConfiguration() {
	$ui.loading(true)
	let url = "https://storage.ryannn.com/jsbox/assets/year.json"
	$http.get({
		url: url,
		handler: (resp) => {
			$ui.loading(false)
			
			let local = JSON.parse($file.read("configs/year.json").string)
			let online = resp.data
			if (local.timestamp === online.timestamp) {
				$ui.toast($l10n("year_toast_uptodate"))
				return
			}

			// Update configuration
			let success = $file.write({
				data: $data({
					string: JSON.stringify(resp.data)
				}),
				path: "configs/year.json"
			})
			if (success) {
				$ui.toast($l10n("year_toast_updated"))
        _general.haptic(1)
        
        $cache.remove("progress-year-data")
			}
		}
	})
}

module.exports = {
	update: showActionView
}