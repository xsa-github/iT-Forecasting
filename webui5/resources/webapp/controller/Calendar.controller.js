sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("calendar-app.webui5.controller.Calendar", {
		onInit: function () {
			var oParams = {};
			oParams.json = true;
			oParams.useBatch = true;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/xsodata/Calendar.xsodata", oParams);
			//oModel.attachEvent("requestFailed", oDataFailed);
			
			var oTable = this.getView().byId("tblPOHeader");
			oTable.setModel(oModel);
			oTable.setEntitySet("Employee");
			oTable.setInitiallyVisibleFields("EMPID","EMPNAME","EMPMANGER");
			
			//oModel.attachMetadataFailed(oModel, function() {
			//	oDataFailed();
			//});
		}
	});
});