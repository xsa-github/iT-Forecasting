sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		"sap/ui/unified/library",
		"sap/m/library",
		"../model/formatter"
	],
	function (Controller, MessageBox, JSONModel, unifiedLibrary, mLibrary, formatter) {
		"use strict";

		return Controller.extend("calendar-app.webui5.controller.Calendar", {
			formatter: formatter,

			onInit: function () {
				// Set the content density
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

				// Grab the OData Model
				var oCalModel = this.getOwnerComponent().getModel();

				// Grab the JSON Model
				var oFilterModel = this.getOwnerComponent().getModel("filterData");

				// Get query Parameter and set as property of the JSON model
				var resGroup = jQuery.sap.getUriParameters().get("rg");
				if (!resGroup) {
					resGroup = "AMS ABAP";
				}

				// Bind the Filters
				var oCombo1 = this.getView().byId("cb1");
				oCombo1.setModel(oFilterModel);
				oCombo1.setSelectedKey(resGroup);

				var oCombo3 = this.getView().byId("cb2");
				oCombo3.setModel(oFilterModel);

				// Load the Calendar
				var oCalendar = this.getView().byId("myCal");
				oCalendar.setModel(oCalModel);
				oCalendar.setBuiltInViews([sap.m.PlanningCalendarBuiltInView.Week, sap.m.PlanningCalendarBuiltInView.OneMonth]);
				
				// Set Legend State Model
				var oStateModel = new JSONModel();
				oStateModel.setData({
					legendShown: false
				});
				this.getView().setModel(oStateModel, "stateModel");
				
				// Set Legend Binding
				var oLegend = this.getView().byId("PlanningCalendarLegend");
				oLegend.setModel(oFilterModel);
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
			}
		});
	});