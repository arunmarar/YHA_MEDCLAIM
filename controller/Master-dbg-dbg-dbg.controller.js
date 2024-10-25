sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"../model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
	
], function (BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, formatter, MessageToast,MessageBox) {
	"use strict";
	var sObjectId;
	return BaseController.extend("Gail.Medical_Claim.controller.Master", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit : function () {
			// Control state model
			
			var routeModel = this.getOwnerComponent().getModel("RouteModel");
			routeModel.setProperty("/split", true);
			routeModel.setProperty("/normal", false);
			
			
			var oList = this.byId("list"),
				oViewModel = this._createViewModel(),
				// Put down master list's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the master list is
				// taken care of by the master list itself.
				iOriginalBusyDelay = oList.getBusyIndicatorDelay();


			this._oList = oList;
			// keeps the filter and search state
			this._oListFilterState = {
				aFilter : [],
				aSearch : []
			};

			this.setModel(oViewModel, "masterView");
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oList.attachEventOnce("updateFinished", function(){
				// Restore original busy indicator delay for the list
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			// this.getView().addEventDelegate({
			// 	onBeforeFirstShow: function () {
			// 		this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
			// 	}.bind(this)
			// });

			this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * After list data is available, this handler method updates the
		 * master list counter
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the master list object counter after new data is loaded
			this._updateListItemCount(oEvent.getParameter("total"));
		},

		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
				return;
			}

			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				this._oListFilterState.aSearch = [new Filter("Refnr", FilterOperator.Contains, sQuery)];
			} else {
				this._oListFilterState.aSearch = [];
			}
			this._applyFilterSearch();

		},

	onNavToInitial:function(){
			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
    		var process = btnModel.getProperty("/process");
    		var that = this;
			//clearing data in list
			if (process === "Create"){
			
				MessageBox.information("Changes will be lost..Do you still want to navigate?",{
					title:"Alert",
					actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if(oAction === "YES"){
							that.getOwnerComponent().getModel("detailMasterModel").setData(null);
							that.getOwnerComponent().getRouter().navTo("initial");
							
							//hiding buttons in master
							var btnModel = that.getOwnerComponent().getModel("buttonsModel");
							btnModel.setProperty("/mAdd", false);
							btnModel.setProperty("/mReview", false);
							
							that.getModel("appView").setProperty("/layout", "OneColumn");
							// history.go(-1);			
						} 
					}
				});
				
			} else if(process === "Edit"){
			
				MessageBox.information("New Changes (if any) will be lost..Do you still want to navigate?",{
					title:"Alert",
					actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if(oAction === "YES"){
							that.getOwnerComponent().getModel("detailMasterModel").setData(null);
							that.getOwnerComponent().getRouter().navTo("initial");
							
							//hiding buttons in master
							var btnModel = that.getOwnerComponent().getModel("buttonsModel");
							btnModel.setProperty("/mAdd", false);
							btnModel.setProperty("/mReview", false);
							
							that.getModel("appView").setProperty("/layout", "OneColumn");
							// history.go(-1);			
						} 
					}
				});
				
			} else{
				//nav back
				this.getOwnerComponent().getModel("detailMasterModel").setData(null);
				this.getOwnerComponent().getRouter().navTo("initial");
				var btnModel = this.getOwnerComponent().getModel("buttonsModel");
					btnModel.setProperty("/mAdd", false);
					btnModel.setProperty("/mReview", false);			
			}	
		
			
		
	},
		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh : function () {
			this._oList.getBinding("items").refresh();
		},

	
	onRemarks : function (oEvent) {
	              var btnModel = this.getOwnerComponent().getModel("buttonsModel");
    		      var RemarkText = btnModel.getProperty("/headerRemarks");
                //"The quantity you have reported exceeds the quantity planed.",
                   var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                    MessageBox.information( RemarkText,{
                              styleClass: bCompact ? "sapUiSizeCompact" : ""
                    		  });
     },
		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
		 * are applied to the master list, which can also mean that they
		 * are removed from the master list, in case they are
		 * removed in the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		onConfirmViewSettingsDialog : function (oEvent) {

			this._applySortGroup(oEvent);
		},

		/**
		 * Apply the chosen sorter and grouper to the master list
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @private
		 */
		_applySortGroup: function (oEvent) {
			var mParams = oEvent.getParameters(),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			this._oList.getBinding("items").sort(aSorters);
		},

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onSelectionChange : function (oEvent) {
			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
			var save =	btnModel.getProperty("/dSave");
			
			if(sap.ui.Device.system.desktop){
				if (save === true){
					MessageBox.information("You are in Edit Mode. Please Save the changes First");
				
					// this.getView().byId("list").removeSelections(true);   //clear selection
					
					return;
				}
			}
			var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");

			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			}
		},

		/**
		 * Event handler for the bypassed event, which is fired when no routing pattern matched.
		 * If there was an object selected in the master list, that selection is removed.
		 * @public
		 */
		onBypassed : function () {
			this._oList.removeSelections(true);
		},

		/**
		 * Used to create GroupHeaders with non-capitalized caption.
		 * These headers are inserted into the master list to
		 * group the master list's items.
		 * @param {Object} oGroup group whose text is to be displayed
		 * @public
		 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
		 */
		createGroupHeader : function (oGroup) {
			return new GroupHeaderListItem({
				title : oGroup.text,
				upperCase : false
			});
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
		onNavBack : function() {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */


		_createViewModel : function() {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getResourceBundle().getText("masterTitleCount", [0]),
				noDataText: this.getResourceBundle().getText("masterListNoDataText"),
				sortBy: "Pernr",
				groupBy: "None"
			});
		},
		
		onBeforeRendering:function(){
		},

		_onMasterMatched :  function(oEvent) {
			//Set the layout property of the FCL control to 'OneColumn'
			var routeModel = this.getOwnerComponent().getModel("RouteModel");
			routeModel.setProperty("/split", true);
			routeModel.setProperty("/normal", false);
			
				 sObjectId =  oEvent.getParameter("arguments").claimId;
				
			if (sObjectId == "0"){ //during create fnc nav from detail to master
					//do nothing but to enable Review and Add Item button in master
					// return;
					// this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
				if (sap.ui.Device.system.desktop){
					var item = this.getView().byId("list").getItems()[0];
					this.getView().byId("list").setSelectedItem(item);
					this._showDetail(item);
				}
			} else{
			
				sObjectId = atob(sObjectId);
	
	
				sap.ui.core.BusyIndicator.show(0);
				var oModel = this.getOwnerComponent().getModel("InitialModel");
				var self = this;
		// var aFilters = [];
		// var filter2 = new Filter ("Refnr", FilterOperator.Contains, sObjectId);
		// aFilters.push(filter2);
			oModel.read("/CLAIMS_DETAILSSet('"+ sObjectId +"')",{
				urlParameters: {
	        		"$expand": "TOItem"
	    		},
				success:function(data){
					self.bindList(data);
				},
				
				error:function(err){
						sap.ui.core.BusyIndicator.hide();
					MessageToast.show("Error Connecting odata service to backend");
				}
			});
			}	
		},
		
		bindList:function(data){
			var listModel = this.getOwnerComponent().getModel("detailMasterModel"); //using global model
			listModel.setData(data.TOItem.results);
				
			sap.ui.core.BusyIndicator.hide();
			
			if(data.Cstat == "N"){
				var btnModel = this.getOwnerComponent().getModel("buttonsModel");
				btnModel.setProperty("/mAdd",true);
				// btnModel.setProperty("/mReview",true);
				btnModel.setProperty("/mAttach",true);
				btnModel.setProperty("/mDelete",true);
				btnModel.setProperty("/mRevoke",false);
				btnModel.setProperty("/showEdit",true);
				btnModel.setProperty("/rSaveDraft",true);
				btnModel.setProperty("/rSubmit",true);
				btnModel.setProperty("/process","Edit");
				btnModel.setProperty("/claimId",sObjectId);
				
				
			} else if(data.Cstat == "T"){
				var btnModel = this.getOwnerComponent().getModel("buttonsModel");
				btnModel.setProperty("/mAdd",false);
				btnModel.setProperty("/mReview",true);
				btnModel.setProperty("/mRevoke",true);
				btnModel.setProperty("/mAttach",false);
				btnModel.setProperty("/mDelete",false);
				btnModel.setProperty("/showEdit",false);
				btnModel.setProperty("/rSaveDraft",false);
				btnModel.setProperty("/rSubmit",false);
				btnModel.setProperty("/process","Display");
				btnModel.setProperty("/claimId",sObjectId);
				
			}
			else{
				var btnModel = this.getOwnerComponent().getModel("buttonsModel");
				btnModel.setProperty("/mAdd",false);
				btnModel.setProperty("/mReview",true);
				btnModel.setProperty("/mRevoke",false);
				btnModel.setProperty("/mAttach",false);
				btnModel.setProperty("/mDelete",false);
				btnModel.setProperty("/showEdit",false);
				btnModel.setProperty("/rSaveDraft",false);
				btnModel.setProperty("/rSubmit",false);
				btnModel.setProperty("/process","Display");
				btnModel.setProperty("/claimId",sObjectId);
				
			}
			
			//to check if user is editing without having previous pdf
			if(data.FlagAttach === ""){
				btnModel.setProperty("/count", 1);          // not to ask for pdf replacement
				btnModel.setProperty("/prevPdf", false);	//to hide previous pdf initially
			}
			else if(data.FlagAttach === "X") {
				btnModel.setProperty("/count", 0);			// to ask for pdf replacement
				btnModel.setProperty("/prevPdf", true);	//not to hide previous pdf initially
			}
			 
			// to check previous approval pdf exist or not
			if(data.FlagAttachApp === ""){
					btnModel.setProperty("/prevAppPdf", false);			//to hide previous approval pdf initially
			}
			else{
				btnModel.setProperty("/prevAppPdf", true);		//not to hide previous approval pdf initially
			}
			
			  //Chekc if Remark is not null not empty if there is any remkar text enable the remkar button

        	if ( data.Remarks !== "" ){
        		this.getView().byId("remarksButton").setVisible(true);
        		 btnModel.setProperty("/headerRemarks",data.Remarks);
        	} else{
	            this.getView().byId("remarksButton").setVisible(false);
		          //Save the Remark text for later display
			}
 
			//setting filesize to property
			btnModel.setProperty("/filesize",data.Fsize);
			
			if (sap.ui.Device.system.desktop){ //to open detail screen in case of desktop
				this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
				var item = this.getView().byId("list").getItems()[0];
					this.getView().byId("list").setSelectedItem(item);
					
					this._showDetail(item);
			}
			else{
				this.getModel("appView").setProperty("/layout", "OneColumn");
			}
		},
		
		
	// end of testing purpose=========================================================================	---

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail : function (oItem) {
			var bReplace = !Device.system.phone;
			
			// var value = oItem.getBindingContext("detailMasterModel").getObject().Refnr;
			var path = oItem.getBindingContextPath();	

			// set the layout property of FCL control to show two columns
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getRouter().navTo("object", {
				objectId : btoa(path)
			}, bReplace);
		},

	onAddM:function(){
		var btnModel = this.getOwnerComponent().getModel("buttonsModel");
		var bReplace = !Device.system.phone;
		
			if (sap.ui.Device.system.desktop){
					btnModel.setProperty("/mAdd", false);
			}
			else{
					btnModel.setProperty("/mAdd", true);
				
			}
		var val1 = "1";
		this.getRouter().navTo("object",{
				objectId:btoa(val1)
			}, bReplace);
	},
	
	onDeleteM:function(){
		
		var path =	this.getView().byId("list").getSelectedContextPaths();
		path = path.toString();
		path = path.slice(1);
		var data = this.getOwnerComponent().getModel("detailMasterModel").oData;
		var d = data.length;
		
		if((d == path) || (!path)){
			MessageBox.information("Please select a record to delete!",{
				title:"Alert"
			});
			return;
		}
		
		data.splice(path,1);
		this.getOwnerComponent().getModel("detailMasterModel").setData(data);
		
		if(data.length === 0){
				var btnModel = this.getOwnerComponent().getModel("buttonsModel");
				btnModel.setProperty("/mDelete",false);
				btnModel.setProperty("/mAttach",false);
			this.onAddM();
		}
	},
		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount : function (iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oList.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
				this.getModel("masterView").setProperty("/title", sTitle);
			}
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applyFilterSearch : function () {
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
				oViewModel = this.getModel("masterView");
			this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			} else if (this._oListFilterState.aSearch.length > 0) {
				// only reset the no data text to default when no new search was triggered
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
			}
		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
		_updateFilterBar : function (sFilterBarText) {
			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
			oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
		},
		
		
		onReview:function(){
			
				this.getOwnerComponent().getRouter().navTo("review");

		},
		onAttachment:function(){
				this.getOwnerComponent().getRouter().navTo("attachment");
		},
		
		onRevoke:function(){
			sap.ui.core.BusyIndicator.show(0);
			var oModel = this.getOwnerComponent().getModel("InitialModel");
			var that= this;
			oModel.read("/Recall_ClaimSet('"+ sObjectId +"')",{
			
				success:function(data){
					sap.ui.core.BusyIndicator.hide();
					if (data.Type === "S"){
						MessageBox.success("Claim No. " + sObjectId + " has been Recalled Successfully.",{
						icon:MessageBox.Icon.SUCCESS,	
						title:"Success",
						action:[MessageBox.Action.OK],
						onClose:function(oAction){
							that.getOwnerComponent().getRouter().navTo("initial");
						}
						});
					} else{
						MessageBox.error("Claim No. " + sObjectId + " cannot be Recall.",{
						icon:MessageBox.Icon.ERROR,
						title:"Alert",
						action:[MessageBox.Action.OK],
						onClose:function(oAction){
							that.getOwnerComponent().getRouter().navTo("initial");
						}
						});
					}
				},
				
				error:function(err){
					sap.ui.core.BusyIndicator.hide();
					MessageToast.show("Error Connecting odata service to backend");
				}
			});
			
			
		
		}

	});

});