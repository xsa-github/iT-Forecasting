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

				// Get query Parameter
				var resGroup = jQuery.sap.getUriParameters().get("rg");
				if (!resGroup) {
					resGroup = "AMS ABAP";
				}
				
				// Instanciate the filter bar
				this.oFilterBar = this.getView().byId("filterBar");
				this.oFilterBar.fireInitialise();
				this.sFilterID = "";

				// Bind the Filters
				var oCombo1 = this.getView().byId("cb_rg");
				oCombo1.setModel(oFilterModel);
				oCombo1.setSelectedKey(resGroup);

				var oCombo2 = this.getView().byId("cb_rp");
				oCombo2.setModel(oFilterModel);

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
			
			onChange: function (oEvent) {
				// Store the ID of the invoker and then fire event of the filterbar
				this.sFilterID = oEvent.getParameter("id");
				this.oFilterBar.fireFilterChange(oEvent);
			},
			
			onFilterChange: function (oEvent) {
				var sViewId = this.getView().getId();
				var sComboRp = sViewId + "--cb_rp";
				var sComboRg = sViewId + "--cb_rg";
				var oComboGroup = this.getView().byId("cb_rg");
				var oInpEmpid = this.getView().byId("inEmpid");
					
				// query which filter item invoked the event
				if (this.sFilterID === sComboRp){
					// when the resource parent changes, reset the resource group 
					oComboGroup.clearSelection();
					oComboGroup.setValue();
					oInpEmpid.setValue();
				}
				else if (this.sFilterID === sComboRg){
					// when the resource group changes, reset the employee ID
					oInpEmpid.setValue();
				}
				
				// Reset the ID after each invocation
				this.sFilterID = "";
			},

			onSearch: function () {
				this.filterCalendar();
			},

			/*
			Apply filters to the Calendar when the selection changes.
			 */
			filterCalendar: function () {
				var oComboRp = this.getView().byId("cb_rp");
				var oComboRg = this.getView().byId("cb_rg");
				var oInpEmpid = this.getView().byId("inEmpid");
				var oCalendar = this.getView().byId("myCal");
				var oBinding = oCalendar.getBinding("rows");
				
				var sParentKey = oComboRp.getSelectedKey();
				var sGroupKey = oComboRg.getSelectedKey();
				var sEmpidVal = oInpEmpid.getValue();
				
				var oFilter = [];
				
				
				if (sGroupKey !== "") {
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEGRP", "EQ", sGroupKey));
				}
				else if (sParentKey !== "") {
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "EQ", sParentKey));
				}
				
				if (sEmpidVal !== "") {
					oFilter.push(new sap.ui.model.Filter("EMPID", sap.ui.model.FilterOperator.Contains, sEmpidVal));
				}
				
				if (oFilter.length > 0) {
					oBinding.filter(new sap.ui.model.Filter(oFilter, true));
				}
			}
		});
	});