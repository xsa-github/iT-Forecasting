sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		"sap/ui/unified/library",
		"sap/m/library",
		"../model/formatter",
		"sap/m/Token",
		"sap/m/SearchField",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	],
	function (Controller, MessageBox, JSONModel, unifiedLibrary, mLibrary, formatter, Token, SearchField, Filter, FilterOperator) {
		"use strict";

		return Controller.extend("calendar-app.webui5.controller.Calendar", {
			formatter: formatter,

			onInit: function () {

				// Set the content density
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

				// Grab the OData Model
				var oCalModel = this.getOwnerComponent().getModel().setSizeLimit(700);

				// Grab the JSON Model
				var oFilterModel = this.getOwnerComponent().getModel("filterData");

				// Instanciate the filter bar
				this.oFilterBar = this.getView().byId("filterBar");
				this.oFilterBar.fireInitialise();
				this.sFilterID = "";

				// Bind the Filters
				var oCombo1 = this.getView().byId("cb_rg");
				oCombo1.setModel(oCalModel);

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

					var oFilterRg = [];
					var oCbRp = this.getView().byId("cb_rp");
					var pKey = oCbRp.getSelectedKey();
					var oCbRg = this.getView().byId("cb_rg");
					var oBindingRg = oCbRg.getBinding("items");

					if (pKey !== "All" && pKey !== "") {
						oFilterRg.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "EQ", pKey));
					} else {
						oFilterRg.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "ALL"));
					}
					oBindingRg.filter(new sap.ui.model.Filter(oFilterRg, true));
					oInpEmpid.setValue("");

				} else if (this.sFilterID === sComboRg) {
					oInpEmpid.setValue("");
				}
				// Reset the ID after each invocation
				this.sFilterID = "";
			},

			onValueHelpRequest: function () {

				this._oBasicSearchFieldWithSuggestions = new SearchField({
					showSearchButton: true //false
				});

				this._oValueHelpDialogWithSuggestions = sap.ui.xmlfragment("calendar-app.webui5.fragment.Filterbar", this);
				this.getView().addDependent(this._oValueHelpDialogWithSuggestions);

				var oSearchBar = this._oValueHelpDialogWithSuggestions.getFilterBar();
				oSearchBar.setFilterBarExpanded(false);
				oSearchBar.setBasicSearch(this._oBasicSearchFieldWithSuggestions);

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
				var oTable = this._oValueHelpDialogWithSuggestions.getTable();
				oTable.setModel(oColMod, "columns");

				//Create row model and bind to row aggregation table
				var oRowModel = this.getOwnerComponent().getModel();
				oTable.setModel(oRowModel);
				oTable.bindRows("/Employee");

				var oToken = new Token();
				var oInput = this.getView().byId("inEmpid");
				oToken.setKey(oInput.getSelectedKey());
				oToken.setText(oInput.getValue());
				this._oValueHelpDialogWithSuggestions.setTokens([oToken]);

				this._oValueHelpDialogWithSuggestions.open();
			},

			onValueHelpOkPress: function (oEvent) {
				var aTokens = oEvent.getParameter("tokens");
				var oInput = this.getView().byId("inEmpid");
				oInput.setValue(aTokens[aTokens.length-1].mProperties.key);
				this._oValueHelpDialogWithSuggestions.close();
				var oCbGroup = this.getView().byId("cb_rg");
				oCbGroup.clearSelection();
				oCbGroup.setValue();
				var oCbPrant = this.getView().byId("cb_rp");
				oCbPrant.clearSelection();
				oCbPrant.setValue();
			},

			onValueHelpCancelPress: function () {
				this._oValueHelpDialogWithSuggestions.close();
			},

			onValueHelpAfterClose: function () {
				this._oValueHelpDialogWithSuggestions.destroy();
			},

			onFilterBarSearch: function (oEvent) {
				var sSearchQuery = this._oBasicSearchFieldWithSuggestions.getValue(),
					aSelectionSet = oEvent.getParameter("selectionSet");
				var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
					if (oControl.getValue()) {
						aResult.push(new Filter({
							path: oControl.getName(),
							operator: FilterOperator.Contains,
							value1: oControl.getValue()
						}));
					}

					return aResult;
				}, []);

				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "EMPID",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "EMPNAME",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						})
					],
					and: false
				}));

				this._filterTableWithSuggestions(new Filter({
					filters: aFilters,
					and: true
				}));
			},

			_filterTableWithSuggestions: function (oFilter) {
				var oValueHelpDialog = this._oValueHelpDialogWithSuggestions;

				oValueHelpDialog.getTableAsync().then(function (oTable) {
					if (oTable.bindRows) {
						oTable.getBinding("rows").filter(oFilter);
					}

					if (oTable.bindItems) {
						oTable.getBinding("items").filter(oFilter);
					}

					oValueHelpDialog.update();
				});
			},

			onSearch: function () {
				this.filterCalendar();
			},
			
			//Apply filters to the Calendar when the selection changes
			filterCalendar: function () {
				var oComboRp = this.getView().byId("cb_rp");
				var oComboRg = this.getView().byId("cb_rg");
				var oInpEmpid = this.getView().byId("inEmpid");
				var oCalendar = this.getView().byId("myCal");
				var oBinding = oCalendar.getBinding("rows");

				var sParentKey = oComboRp.getSelectedKey();
				var sGroupKey = oComboRg.getSelectedKey();

				var oFilter = [];

				if (oInpEmpid.mProperties.value !== "") {
					oFilter.push(new sap.ui.model.Filter("EMPNAME", "EQ", oInpEmpid.mProperties.value));
				} else if (sGroupKey !== "") {
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEGRP", "EQ", sGroupKey));
				} else if (sParentKey !== "All" && sParentKey.length !== 1) {
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "EQ", sParentKey));
				} else if (sParentKey.length === 1) {
					//Dont display anything
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "EQ", ""));
				} else {
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "ALL"));
				}

				if (oFilter.length > 0) {
					oBinding.filter(new sap.ui.model.Filter(oFilter, true));
				}
			}
		});
	});