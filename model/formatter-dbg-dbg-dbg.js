sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue : function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		
		formatTaxType:function(sValue){
			if (!sValue) {
				return "No";
			}
			if(sValue === "No"){
				return "No"; 
			}
			else return "Yes"; 
		},
		formatCityType:function(sValue){
			if (!sValue) {
				return "No";
			}
			if(sValue === "N")
				return "Not Applicable"; 
			else return sValue; 
		},
		formatOutStatioin:function(sValue){
			if(sValue === "1")
				return "Yes"; 
			else if(sValue === "2")
				return "No"; 
			else if(sValue === "3")
				return "Not Applicable"; 
		},
		formatClaimType:function(sValue){
			if(sValue === "DC")
				return "Dental"; 
			else if(sValue === "HA")
				return "Hearing Aids"; 
			else if(sValue === "OT")
				return "Others"; 
			else if(sValue === "PT")
				return "Phsiotheraphy"; 
			else if(sValue === "ST")
				return "Speech Theraphy";
		},
		
		formatConsultationType:function(sValue){
			if(sValue === "CD")
				return "Allop.- Comapny Doctor"; 
			else if(sValue === "CL")
				return "Allop.- Pvt. Clinic / Non Empanelled Hospital"; 
			else if(sValue === "ED")
				return "Allop.- Comapny Engaged Doctor"; 
			else if(sValue === "EH")
				return "Allop.- Empanelled OPD (Pvt./Gen)"; 
			else if(sValue === "ER")
				return "Allop.- Emp. Residence"; 
			else if(sValue === "OT")
				return "Other than Allopathy"; 
			else if(sValue === "ZA")
				return "Not Applicable";  
		},
		
		formatDocCataloge:function(sValue){
			if(sValue === "AS")
				return "Ayurveda  - First Consultation"; 
			else if(sValue === "AV")
				return "Ayurveda -  Subsequent Consultation"; 
			else if(sValue === "HM")
				return "Homeopath - First Consultation"; 
			else if(sValue === "HS")
				return "Homeopath - Subsequent Consultation"; 
			else if(sValue === "MB")
				return "Allopath (MBBS)"; 
			else if(sValue === "SP")
				return "Allopath (Specialist)"; 
			else if(sValue === "UF")
				return "Unani - First Consultation"; 
			else if(sValue === "US")
				return "Unani - Subsequent Consultation"; 
			else if(sValue === "ZA")
				return "Not Applicable";  
		},
		
		
		formatHRPermission:function(sValue){
			if(sValue === "Y")
				return "Yes"; 
			else if(sValue === "N")
				return "No"; 
		},
		
		formatYesNo:function(sValue){
			if(sValue === "Y")
				return "Yes"; 
			else if(sValue === "N")
				return "No"; 
		},
		
		
		statusText:function(value, flag){
			if ((value == "N")& (flag == "")){
			var text = "New";
			return text; 
			}
			else if ((value == "N")& (flag == "X")){
				var text = "Return";
				return text;
			}
			else if(value == "T"){
				var text = "To be Approved";
				return text; 
				
			}
			else if(value == "P"){
				var text = "Partially Approved";
				return text; 
				
			}
			else if(value == "A"){
				var text = "Approved";
				return text; 
				
			}
			else if(value == "R"){
				var text = "Rejected";
				return text; 
				
			}
			else if(value == "D"){
				var text = "Processing Complete";
				return text; 
				
			}
			else if(value == "X"){
				var text = "Deleted";
				return text; 
				
			}
			else if(value == "B"){
				var text = "To Be Processed";
				return text; 
				
			}
			else if(value == "C"){
				var text = "Closed";
				return text; 
				
			}
			else if(value == "K"){
				var text = "Cancelled";
				return text; 
				
			}
			else if(value == "S"){
				var text = "Settled";
				return text; 
				
			}
		
		},
		
		formatStatus:function(input, flag){
			
		if(input === "A"){
			var a = "Success";
			return a;
		}
		else if (input === "R"){
			a = "Error";
			return a;
		}
		else if (input === "T"){
			a = "Warning";
			return a;
		}
		else if ((input === "N")& (flag === "X")){
				var text = "Error";
				return text;
		}
		else{
			a = "None";
			return a;
		}
		
		},
		
		formatItemType:function(input){
			switch(input){
				
				case "CON":
					return "Consultation";
					break;
				
				case "MED":
					return "Medicines";
					break;
				
				case "TST":
					return "Tests";
					break;
				
				case "HOS":
					return "Hospitalization";
					break;
				
				case "TRV":
					return "Travel Expenses";
					break;
				
				case "OTH":
					return "Others";
					break;	
				
					
			}
		},
		
		formatReqDate:function(input){
			
			if (typeof input === 'undefined' || input === null){
				return;
			}else if(input !== ""){
					var a = input.toDateString().slice(4);
					return a;
			}
		
		}
// N : New
// T : To Be Approved
// P : Partially Approved
// A : Approved
// R : Rejected
// D : Processing Complete
// X : Deleted
// B : To Be Processed
// C : Closed
// K : Cancelled
// S : Settled
		
	};
});