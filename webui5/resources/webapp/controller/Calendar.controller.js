sap.ui.define([
		"sap/ui/core/mvc/Controller",
		'sap/m/MessageBox'
	],
	function (Controller, MessageBox) {
		"use strict";

		return Controller.extend("calendar-app.webui5.controller.Calendar", {
			onInit: function () {
				// Get query Parameter
				var resGroup = jQuery.sap.getUriParameters().get("rg");
				if(!resGroup) {resGroup = "0000000001";}
				
				// Create filter
				var resGroupFilter = [ new sap.ui.model.Filter("EMPRESOURCEGRP","EQ", resGroup) ];
				
				// Grab the OData Model
				var oModel = this.getOwnerComponent().getModel();

				// Load the Calendar
				var oCalendar = this.getView().byId("myCal");
				oCalendar.setModel(oModel);
				
				// Apply the filter
				var oBinding = oCalendar.getBinding("rows");
    			oBinding.filter(resGroupFilter);
			},

			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment");
				if (oAppointment) {
					if(oAppointment.getSelected()) {
						var oContext = oAppointment.getBindingContext();
						if (oContext) {
							MessageBox.information("WBS Code: " + oContext.getProperty("BKWBS") + "\n"
								+ "WBS Desc: " + oContext.getProperty("BKWBSDESC") + "\n"
								+ "Customer: " + oContext.getProperty("BKCUSTOMER") + "\n"
								+ "Location: " + oContext.getProperty("BKCUSTOMERLOCATION"));
						}
					}
				}
			},

			handleSelectionFinish: function (oEvent) {
				var aSelectedKeys = oEvent.getSource().getSelectedKeys();
				this.byId("myCal").setBuiltInViews(aSelectedKeys);
			}
		});
	});