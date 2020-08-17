sap.ui.define([], function () {
	"use strict";
	return {
		startTimeCorrection: function (oDateTime) {
			var date = new Date(oDateTime);
			var hours = date.getHours();

			// Set anything in the AM to start at 01:00:00, anything PM to start at 12:30:00
			if (hours < 12 ) {
				date.setHours(1,0,0);
			} else if (hours >= 12) {
				date.setHours(12,30,0);
			}
			return date;
		},
		
		endTimeCorrection: function (oDateTime) {
			var date = new Date(oDateTime);
			var hours = date.getHours();
			
			// Set anything in the AM to end at 12:00:00, anything PM to end at 23:00:00 hours			
			if (hours <= 13 ) {
				date.setHours(12,0,0);
			} else if (hours > 13) {
				date.setHours(23,0,0);
			}
			return date;
		},
		
		nullStringCorrection: function (sName) {
			if ((!sName) || (sName === "")) {
				return "iT";
			} else {
				return sName;
			}
		},
		
		bookingTypeFix: function (sType, sStatus) {
			// Get the array of booking type values
			var bkTypes = this.getOwnerComponent().getModel("filterData").getProperty("/BookingType");
			
			if (bkTypes instanceof Array) {
				var defType = "Type03";
				var typeMatch = sType + "|" + sStatus;
				
				// Search the array for the booking type
				var foundRow = bkTypes.find(function(myRow) {
					return myRow.key === typeMatch;
				});
				
				// return either the corresponding appointment type or the default
				if (foundRow) {
					return foundRow.apptype;
				} else {
					return defType;
				}
			}
			else {
				return defType;
			}
		}
	};
});