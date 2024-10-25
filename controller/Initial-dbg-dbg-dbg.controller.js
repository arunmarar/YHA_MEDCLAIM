sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter"
], function (Controller, MessageToast, MessageBox, Filter, FilterOperator, formatter) {
	"use strict";

	return Controller.extend("Gail.Medical_Claim.controller.Initial", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Gail.Medical_Claim.view.Initial
		 */
		onInit: function () {
			var that = this;
			
			var route = {
				split: false,
				normal:true
				
			};
			var routeModel = this.getOwnerComponent().getModel("RouteModel");
			routeModel.setData(route);
			
			this.getView().byId("inpClaim").attachBrowserEvent("keydown", function (e) {
				if (e.keyCode == 13) {
					that.onSearch();
				}
			});

			this.getOwnerComponent().getRouter().getRoute("initial").attachPatternMatched(this._onMasterMatched, this);

		},

		bindTable: function (data) {
			var modelL = new sap.ui.model.json.JSONModel();
			var claimModel = new sap.ui.model.json.JSONModel();
			var count = data.results.length;
			modelL.setData(data.results);
			this.getView().setModel(modelL,"Initial");

			// claimModel.setProperty("count", count);
			// this.getView().byId("tab1").setModel(claimModel,"ClaimCount");

		},

		_onMasterMatched: function () {
			
				var route = {
				split: false,
				normal:true
				
			};
			var routeModel = this.getOwnerComponent().getModel("RouteModel");
			routeModel.setData(route);
			
			//clearing all filters
			  this.getView().byId("inpClaim").setValue("");
              this.getView().byId("selStatus").setSelectedIndex(0);
              this.getView().byId("fbDP").setValue(null);
	          this.getView().byId("fbDP2").setValue(null);

 
			
			// this.getModel("appView").setProperty("/layout", "OneColumn");
				var buttonModel = {
				dSave: false,
				dClear: false,
				dAdd: false,
				dSelect: false,
				mAdd: false,
				mDelete:false,
				mAttach: false,
				mReview: false,
				mRevoke: false,
				rSaveDraft: true,
				rSubmit: true,
				showEdit: false,
				prevPdf:false,              //for previous pdf of bills
				prevAppPdf:false,				
				process: "",
				claimId: "",
				count : 0,
				showDelayed:false,
				uploadClear:true,
				navbackDetail:false,
				headerRemarks:"",
				filesize:""
			
			};

			this.getOwnerComponent().getModel("buttonsModel").setData(buttonModel);

			var fileData = {
				"FileReaderIds": [],
				"ApprovalFileReaderIds": [],
				"oPDF": "",
				"size": "",
				"dataString": "",
				"oPDFDelay": "",
				"sizeDelay": "",
				"dataStringDelay": ""
			};

			var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
			fileReaderModel.setData(fileData);
			
			//initialising original pdf model
			var pdfFileInfo = {
				"PDFFiles": []
			};
			var pdfFileModel = this.getOwnerComponent().getModel("OriginalPdfFiles");
			pdfFileModel.setData(pdfFileInfo);
			
			
			var oModel = this.getOwnerComponent().getModel("InitialModel");
			var self = this;
			oModel.read("/EMP_CLAIM_DETSet", {
				success: function (data) {
					self.bindTable(data);
				},

				error: function (err) {
					MessageToast.show("Error Connecting odata service to backend");
				}
			});

		},

		onNewClaimPress: function () {
			var val1 = "0";
			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
			btnModel.setProperty("/process","Create");
			btnModel.setProperty("/showDelayed",false);
			this.getOwnerComponent().getRouter().navTo("object", {
				objectId: btoa(val1)
			});
		},

		onSearch: function (event) {
			sap.ui.core.BusyIndicator.show(0);
			var claim = this.getView().byId("inpClaim").getValue();
			claim = parseInt(claim);
			var status = this.getView().byId("selStatus").getSelectedKey();

			var fromDate = this.getView().byId("fbDP").getProperty("dateValue");
			var toDate = this.getView().byId("fbDP2").getProperty("dateValue");
			
			var aFilters = [];

			if (!(!status)) {
				if(status === "S"){
					var filter1 = new Filter("Errfg", FilterOperator.EQ, "X");
					aFilters.push(filter1);	
					var filter12 = new Filter("Cstat", FilterOperator.EQ, "N");
					aFilters.push(filter12);
				}else if(status === "N"){
					var filter1 = new Filter("Errfg", FilterOperator.EQ, "");
					aFilters.push(filter1);	
					var filter12 = new Filter("Cstat", FilterOperator.EQ, status);
					aFilters.push(filter12);
				}
				else{
				var	filter1 = new Filter("Cstat", FilterOperator.EQ, status);
					aFilters.push(filter1);
				}
				
			}

			if (!(!claim)) {
				var filter2 = new Filter("Refnr", FilterOperator.Contains, claim);
				aFilters.push(filter2);
			}

			if (!(!fromDate)) {
				var d = fromDate.getDate();
				var m = fromDate.getMonth();
				var y = fromDate.getFullYear();
				var h = 5;
				var mi = 30;
				var s = 0;
				var fromDate2 = new Date(y, m, d, h, mi, s);
				
				 if (!(!toDate)){
					var d2 = toDate.getDate();
					var m2 = toDate.getMonth();
					var y2 = toDate.getFullYear();
					var h2 = 5;
					var mi2 = 30;
					var s2 = 0;
					var toDate2 = new Date(y2, m2, d2, h2, mi2, s2);
				 }
				 else{
				 	toDate = new Date();
				 	d2 = toDate.getDate();
					m2 = toDate.getMonth();
					y2 = toDate.getFullYear();
					h2 = 5;
					mi2 = 30;
					s2 = 0;
					toDate2 = new Date(y2, m2, d2, h2, mi2, s2);
				 }
				 
				var filter3 = new Filter("Rqcdt", FilterOperator.BT, fromDate2, toDate2);
				aFilters.push(filter3);
				
				var sorter = new sap.ui.model.Sorter("Rqcdt", false);
			}
			
			if(!(!toDate)  & (!fromDate)){
				MessageBox.alert("Please provide From Date as well!");
			}

			var items = this.getView().byId("tab1").getBinding("items");
		
				if(sorter){
					items.sort(sorter);
				}
				else{
					items.sort(new sap.ui.model.Sorter("Rqcdt", true));
				}
			items.filter(aFilters);
			sap.ui.core.BusyIndicator.hide();

			//var getItems = this.getView().byId(valueHelpRequest.getItems();
			//  for (var i = 0; i < getItems.length; i++) {
			//  	var cell1=getItems[i].mProperties.description;
			//      var cell2=getItems[i].mProperties.title;
			//    if (cell1.indexOf(s1) > -1||cell2.indexOf(s1) > -1 ) {
			//      getItems[i].setVisible(true);
			//    } else{
			//      getItems[i].setVisible(false);
			//    }
			//  }

		},
		onItemPress: function (evt) {

			var path = evt.getSource().getBindingContextPath();
			var claim = this.getView().getModel("Initial").getProperty(path).Refnr;
			this.getOwnerComponent().getRouter().navTo("master", {
				claimId: btoa(claim)
			});
		
		//	$("#__xmlview0--createbtn").fadeToggle(3000);
		},
		
		

		// onDpChange:function(evt){

		// 	var date = evt.getSource().getProperty("dateValue");
		// 	var d = date.getDate();
		// 	var m = date.getMonth();
		// 	var y = date.getFullYear();
		// 	var h = 5;
		// 	var mi = 30;
		// 	var s = 0;
		// 	var date2 = new Date(y,m,d,h,mi,s);
		// 	//var date2 =	sap.ui.model.odata.ODataUtils.formatValue(new Date(evt.getParameter("value")), "Edm.DateTime");
		// 	var aFilters = [];
		// 	var filter1 = new Filter ("Rqcdt", FilterOperator.EQ, date2);
		// 		aFilters.push(filter1);

		// 	var items = this.getView().byId("tab1").getBinding("items");
		// 	items.filter(aFilters);

		// }

	});

});