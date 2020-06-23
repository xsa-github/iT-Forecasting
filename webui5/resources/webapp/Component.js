sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"calendar-app/webui5/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("calendar-app.webui5.Component", {

		metadata: {
			manifest: "json"
		},
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},
		destroy: function() {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});