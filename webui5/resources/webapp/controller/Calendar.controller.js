sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox"
	],
	function (Controller, MessageBox) {
		"use strict";

		return Controller.extend("calendar-app.webui5.controller.Calendar", {
			onInit: function () {
				// Grab the OData Model
				var oModel = this.getOwnerComponent().getModel();
				
				// Grab the JSON Model
				var fModel = this.getOwnerComponent().getModel("filterData");
				
				// Get query Parameter and set as property of the JSON model
				var resGroup = jQuery.sap.getUriParameters().get("rg");
				if (!resGroup) {
					resGroup = "AMS ABAP";
				}
				
				// Bind the Filters
				var oCombo1 = this.getView().byId("cb1");
				oCombo1.setModel(fModel);
				oCombo1.setSelectedKey(resGroup);
				
				var oCombo2 = this.getView().byId("cb2");
				oCombo2.setModel(fModel);
				
				var oCombo3 = this.getView().byId("cb3");
				oCombo3.setModel(fModel);

				// Load the Calendar
				var oCalendar = this.getView().byId("myCal");
				oCalendar.setModel(oModel);
				oCalendar.setBuiltInViews([sap.m.PlanningCalendarBuiltInView.Day,sap.m.PlanningCalendarBuiltInView.Week,sap.m.PlanningCalendarBuiltInView.OneMonth]);
			},
			
			onBeforeRendering: function () {
				this.filterCalendar();
			},

			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment");
				if (oAppointment) {
					if (oAppointment.getSelected()) {
						var oContext = oAppointment.getBindingContext();
						if (oContext) {
							MessageBox.information("WBS Code: " + oContext.getProperty("BKWBS") + "\n" + "WBS Desc: " + oContext.getProperty("BKWBSDESC") +
								"\n" + "Customer: " + oContext.getProperty("BKCUSTOMERNAME") + "\n" + "Status: " + oContext.getProperty("BKSTATUS"));
						}
					}
				}
			},

			onSearch: function () {
				this.filterCalendar();
			},
			
			/*
			Apply filters to the Calendar when the selection changes.
			 */
			filterCalendar: function () {

				var oCombo1 = this.getView().byId("cb1");
				var resGroupKey = oCombo1.getSelectedKey();
				if (resGroupKey) {
					var resGroupFilter = [new sap.ui.model.Filter("EMPRESOURCEGRP", "EQ", resGroupKey)];
					var oCalendar = this.getView().byId("myCal");
					var oBinding = oCalendar.getBinding("rows");
					oBinding.filter(resGroupFilter);
				}
				
				/*var oCombo2 = this.getView().byId("cb2");
				var bkTypeKey = oCombo2.getSelectedKey();
				if (bkTypeKey) {
					var bkTypeFilter = [new sap.ui.model.Filter("BKTYPE", "EQ", bkTypeKey)];
					var oCalendarRow = this.getView().byId("myCalRow");
					var oBindingApp = oCalendarRow.getBinding("appointments");
					oBindingApp.filter(bkTypeFilter);
				}*/
			}
		});
	});