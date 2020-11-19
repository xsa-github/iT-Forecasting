sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		"sap/ui/unified/library",
		"sap/m/library",
		"../model/formatter",
		"sap/ui/export/Spreadsheet",
		"sap/m/MessageToast"
	],
	function (Controller, MessageBox, JSONModel, unifiedLibrary, mLibrary, formatter, Spreadsheet, MessageToast) {
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
				var oCombo1 = this.getView().byId("cb_rp");
				oCombo1.setModel(oCalModel);
				var oCombo2 = this.getView().byId("cb_rg");
				oCombo2.setModel(oCalModel);

				// Bind query Parameter
				var resTeam = jQuery.sap.getUriParameters().get("Team");
				if (resTeam) {
					oCombo2.setSelectedKey(resTeam);
				}
				var resPractice = jQuery.sap.getUriParameters().get("Practice");
				if (resPractice) {
					oCombo1.setSelectedKey(resPractice);
				}

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
				this.filterTeam();
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
				var oInpEmpid = this.getView().byId("inEmpid");

				var oCbRp = this.getView().byId("cb_rp");
				var pKey = oCbRp.getSelectedKey();

				var oCbRg = this.getView().byId("cb_rg");
				var oBindingRg = oCbRg.getBinding("items");

				var oFilterRg = [];

				if (this.sFilterID === oInpEmpid.sId) {
					oCbRp.clearSelection();
					oCbRp.setValue();
					oCbRg.clearSelection();
					oCbRg.setValue();

					oFilterRg.push(new sap.ui.model.Filter("EMPRESOURCEGRP", "ALL"));
					oBindingRg.filter(new sap.ui.model.Filter(oFilterRg, true));

				} else if (this.sFilterID === sComboRp) {
					oInpEmpid.setValue("");
					oCbRg.clearSelection();
					oCbRg.setValue();

					if (pKey !== "") {
						oFilterRg.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "EQ", pKey));
					} else {
						oFilterRg.push(new sap.ui.model.Filter("EMPRESOURCEGRP", "ALL"));
					}
					oBindingRg.filter(new sap.ui.model.Filter(oFilterRg, true));

				} else if (this.sFilterID === sComboRg) {
					oInpEmpid.setValue("");
				}

				// Reset the ID after each invocation
				this.sFilterID = "";

				// Trigger Calander display on select on filter change
				this.filterCalendar();
			},

			filterTeam: function () {
				var oCbRp = this.getView().byId("cb_rp");
				var oCbRg = this.getView().byId("cb_rg");
				if (oCbRp.getSelectedKey() !== "1" && oCbRg.getSelectedKey() === "") {
					var oFilterRg = [];
					var oBindingRg = oCbRg.getBinding("items");
					oFilterRg.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "EQ", oCbRp.getSelectedKey()));
					oBindingRg.filter(new sap.ui.model.Filter(oFilterRg, true));
				}
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
				} else if (sParentKey.length !== 1) {
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "EQ", sParentKey));
				} else { //Dont display anything
					oFilter.push(new sap.ui.model.Filter("EMPRESOURCEPARENT", "EQ", ""));
				}

				if (oFilter.length > 0) {
					oBinding.filter(new sap.ui.model.Filter(oFilter, true));
				}
			},

			createColumnConfig: function () {
				return [{
						label: "Employee ID",
						property: "EMPID"
					}, {
						label: "Employee Name",
						property: "EMPNAME"
					},
					{
						label: "Start Date Time",
						property: "Booking/BKSTARTDATETIME"
					}, {
						label: "End Date Time",
						property: "Booking/BKENDDATETIME"
					}, {
						label: "Type",
						property: "Booking/BKTYPE"
					}, {
						label: "Status",
						property: "Booking/BKSTATUS"
					}, {
						label: "Customer Number",
						property: "Booking/BKCUSTOMER"
					}, {
						label: "Customer Name",
						property: "Booking/BKCUSTOMERNAME"
					}, {
						label: "WBS",
						property: "Booking/BKWBS"
					}, {
						label: "WBS Description",
						property: "Booking/BKWBSDESCT"
					}
				];
			},

			onDataExport: function (oEvent) {
				var aCols = this.createColumnConfig();
				var oCalendar = this.getView().byId("myCal");
				var oRows = oCalendar.getBinding("rows");
				var rlen = oRows.getLength();
				if (rlen !== 0) {
					var downlaodUrl = oRows.getDownloadUrl();
					var bookingUrl = downlaodUrl.concat("&$expand=Booking");
					var oSettings = {
						workbook: {
							columns: aCols
						},
						context: {
							sheetName: 'Sheet1'
						},
						dataSource: {
							type: "OData",
							useBatch: true,
							serviceUrl: oRows.getModel().sServiceUrl,
							dataUrl: bookingUrl,
							count: rlen
						},
						fileName: oRows.getFilterInfo().right.value
					};
					var oSheet = new Spreadsheet(oSettings);
					oSheet.build();
				} else {
					MessageToast.show("No table entry found for download");
				}
			}
		});
	});