sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("calendar-app.webui5.controller.Calendar", {
		onInit: function () {
			// Initiate the OData Model
			var oParams = {};
			oParams.json = true;
			oParams.useBatch = true;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/xsodata/Calendar.xsodata", oParams);
			
			// Load the table
			var oCalendar = this.getView().byId("myCal");
			oCalendar.setModel(oModel);
		}
	});
});