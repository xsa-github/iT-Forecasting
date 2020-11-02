sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		"sap/ui/unified/library",
		"sap/m/library",
		"../model/formatter",
		"sap/m/SearchField" //Added
	], //Added
	function (Controller, MessageBox, JSONModel, unifiedLibrary, mLibrary, formatter, SearchField) {
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
				oCombo1.setModel(oCalModel);
				oCombo1.setSelectedKey(resGroup);

				var oCombo2 = this.getView().byId("cb_rp");
				oCombo2.setModel(oCalModel);

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
				if (this.sFilterID === sComboRp) {
					// when the resource parent changes, reset the resource group & Employee ID
					oComboGroup.clearSelection();
					oComboGroup.setValue();
					oInpEmpid.removeAllTokens();

					var oFilterRg = [];
					var oCbRp = this.getView().byId("cb_rp");
					var pKey = oCbRp.getSelectedKey();
					var oCbRg = this.getView().byId("cb_rg");
					var oBindingRg = oCbRg.getBinding("items");
					oFilterRg.push(new sap.ui.model.Filter("EMPRESOURCEGRP", "Contains", pKey));
					oBindingRg.filter(new sap.ui.model.Filter(oFilterRg, true));

				} else if (this.sFilterID === sComboRg) {
					// when the resource group changes, reset the employee ID
					//oInpEmpid.setValue();
					oInpEmpid.removeAllTokens();
				}
				// Reset the ID after each invocation
				this.sFilterID = "";
			},

			onValueHelpRequest: function () {
				// var oInput = this.getView().byId("inEmpid");
				// var oCbGrp = this.getView().byId("cb_rg");
				// var oCbPra = this.getView().byId("cb_rp");

				//Added
				this._oBasicSearchField = new SearchField({
					showSearchButton: false
				});

				if (!this._oValueHelpDialog) {

					// Calling Fragment
					this._oValueHelpDialog = sap.ui.xmlfragment("sap.ui.comp.sample.valuehelpdialog.singleSelect.fragment.Filterbar", this);
					this.getView().addDependent(this._oValueHelpDialog);

					//Define filter bar
					var oFilterBar = this._oValueHelpDialog.getFilterBar();
					oFilterBar.setFilterBarExpanded(false);
					oFilterBar.setBasicSearch(this._oBasicSearchField);

					// this._oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idValueHelp", {
					// 	key: "EMPID",
					// 	descriptionKey: "EMPNAME",
					// 	ok: function (oEvent) {
					// 		var aTokens = oEvent.getParameter("tokens");
					// 		oInput.setTokens(aTokens);
					// 		//Clear Pratcis and Teams values
					// 		if (aTokens.length !== 0) {
					// 			oCbGrp.clearSelection();
					// 			oCbGrp.setValue();
					// 			oCbPra.clearSelection();
					// 			oCbPra.setValue();
					// 		}
					// 		this.close();
					// 	},
					// 	cancel: function () {
					// 		oInput.removeAllTokens();
					// 		this.close();
					// 	}
					// });
				}
				//Bind the columns for table
				var oColMod = new sap.ui.model.json.JSONModel();
				oColMod.setData({
					cols: [{
						label: "Employee ID",
						template: "EMPID"
					}, {
						label: "Employee Name",
						template: "EMPNAME"
					}]
				});
				var oTable = this._oValueHelpDialog.getTable();
				oTable.setModel(oColMod, "columns");

				//Create row model and bind to row aggregation table
				var oRowModel = this.getOwnerComponent().getModel();
				oTable.setModel(oRowModel);
				oTable.bindRows("/Employee");

				this._oValueHelpDialog.open();
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
				//var sEmpidVal = oInpEmpid.getValue();
				var oTokens = oInpEmpid.getTokens();
				var oFilter = [];

				if (oTokens.length !== 0) {
					// var fArr = [];
					// for (var i = 0; i < oTokens.length; i++) {
					// 	fArr[i] = new sap.ui.model.Filter("EMPID", "EQ", oTokens[i].mProperties.key);
					// }
					oFilter.push(new sap.ui.model.Filter("EMPID", "EQ", oTokens[0].mProperties.key));
				} else if (sGroupKey !== "") {
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEGRP", "EQ", sGroupKey));
				} else if (sParentKey !== "") {
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "EQ", sParentKey));
				} else {
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "ALL"));
				}

				// if (sEmpidVal !== "") {
				// 	oFilter.push(new sap.ui.model.Filter("EMPID", sap.ui.model.FilterOperator.Contains, sEmpidVal));
				// }

				if (oFilter.length > 0) {
					oBinding.filter(new sap.ui.model.Filter(oFilter, true));
				}
			}
		});
	});