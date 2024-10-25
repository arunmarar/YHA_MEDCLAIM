sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessagePopover",
	"sap/m/MessageItem",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"../model/formatter",
	"sap/m/Dialog"
], function (Controller, MessagePopover, MessagePopoverItem, MessageBox, MessageToast, formatter, Dialog) {
	"use strict";
	var pdfFile;
	var amt;
	var _TCDialog = null;
	var RequestBody = null;

	var oMessageTemplate = new MessagePopoverItem({
		type: '{type}',
		title: '{Message}',
		description: '{Message}',
	});

	var oMessagePopover = new MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		},
		activeTitlePress: function () {
			MessageToast.show('Active title is pressed');
		}
	});

	return Controller.extend("Gail.Medical_Claim.controller.Review", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Gail.Medical_Claim.view.Review
		 */
		onInit: function () {

			//==============Reading Terms and Conditions Set============================

			// var oModel = this.getOwnerComponent().getModel("InitialModel");
			// var self = this;
			// oModel.read("/Terms_CondSet", {

			// 	success: function (data) {
			// 		self.bindTnCPDF(data);
			// 	},

			// 	error: function (err) {
			// 		sap.ui.core.BusyIndicator.hide();
			// 		MessageToast.show("Error Connecting odata service to backend");
			// 	}
			// });

			//----------------------------------------------------
			this._TCDialog = null;
			this.getOwnerComponent().getRouter().getRoute("review").attachPatternMatched(this._onReviewMatched, this);

		},

		bindTnCPDF: function (data) {
			var file = data.results[0].Fdata;
			var tncModel = this.getOwnerComponent().getModel("TnC");
			// var decodedPdfContent = atob(file);
			// var byteArray = new Uint8Array(decodedPdfContent.length)
			// for (var i = 0; i < decodedPdfContent.length; i++) {
			// 	byteArray[i] = decodedPdfContent.charCodeAt(i);
			// }

			// var blob = new Blob([byteArray.buffer], {
			// 	type: 'application/pdf'
			// });

			// var _pdfurl = URL.createObjectURL(blob);
			// jQuery.sap.addUrlWhitelist("blob");
			var tncData = {
				Source: file
			};
			tncModel.setData(tncData);
		},

		_onReviewMatched: function (oEvent) {
			this.getView().byId("errorBtn").setVisible(false);
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");

			var routeModel = this.getOwnerComponent().getModel("RouteModel");
			routeModel.setProperty("/split", false);
			routeModel.setProperty("/normal", true);

			//calculating total amount
			var items = this.getOwnerComponent().getModel("detailMasterModel");
			var len = items.getData().length;
			amt = 0;
			for (var i = 0; i < len; i++) {

				var a = items.getObject("/" + i).Rqamt;
				a = parseFloat(a);
				amt = amt + a;

			}

			this.getView().byId("panel2").setHeaderText("Claims Items (" + len + ")");
			this.getView().byId("rTotalAmt").setText("Rs." + amt);

			//hiding panels based on the process
			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
			var process = btnModel.getProperty("/process");
			var prevPdf = btnModel.getProperty("/prevPdf");
			var prevAppPdf = btnModel.getProperty("/prevAppPdf");
			// if (process == "Edit") {
			// 	if(prevPdf == false){
			// 		this.getView().byId("panelPdf").setVisible(true);
			// 		this.getView().byId("panelPdf2").setVisible(false);
			// 	}

			// 	else{
			// 		this.getView().byId("panelPdf").setVisible(true);
			// 		this.getView().byId("panelPdf2").setVisible(true);

			// 		this.getView().byId("pdfToolbar").setVisible(false);
			// 	}
			// }

			// else if (process == "Display") {
			// 		this.getView().byId("panelPdf").setVisible(false);
			// 		this.getView().byId("panelPdf2").setVisible(true);

			// 		if(prevPdf == false){
			// 		this.getView().byId("panelPdf2").setVisible(false);
			// 		}
			// }

			// else {
			// 	this.getView().byId("panelPdf").setVisible(true);
			// 	this.getView().byId("panelPdf2").setVisible(false);

			// 	this.getView().byId("pdfToolbar").setVisible(false);
			// }

			//====for display process only
			if (process == "Display") {
				if ((prevPdf == false) & (prevAppPdf == false)) {
					this.getView().byId("panelPdf2").setVisible(false);
				} else if ((prevPdf == false) & (prevAppPdf == true)) {
					this.getView().byId("panelPdf2").setVisible(true);
					this.getView().byId("pdfToolbar2").setVisible(false);
					this.getView().byId("pdfApprovalToolbar2").setVisible(true);

				} else if ((prevPdf == true) & (prevAppPdf == false)) {
					this.getView().byId("panelPdf2").setVisible(true);
					this.getView().byId("pdfToolbar2").setVisible(true);
					this.getView().byId("pdfApprovalToolbar2").setVisible(false);
				} else {
					this.getView().byId("panelPdf2").setVisible(true);
					this.getView().byId("pdfToolbar2").setVisible(true);
					this.getView().byId("pdfApprovalToolbar2").setVisible(true);
				}
			} else {
				this.getView().byId("panelPdf2").setVisible(false);
			}

			//-------------------------------------------------------------

			//========================			//setting file size parameter during create process
			var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
			var newFileSize = fileReaderModel.getProperty("/size"); //generated file size
			// var delayFileSize = fileReaderModel.getProperty("/sizeDelay");

			var prevFileSize = btnModel.getProperty("/filesize"); //previous file size
			var prevfileExist = btnModel.getProperty("/prevPdf");

			var orgFiles = this.getOwnerComponent().getModel("OriginalPdfFiles").getProperty("/PDFFiles");
			this.overallFileSize = 0;
			if(orgFiles){
				for (var i = 0; i < orgFiles.length; i++) {
					this.overallFileSize = this.overallFileSize + orgFiles[i].size;
				}
			}

			if (newFileSize > 0.01) {
				this.overallFileSize = this.overallFileSize + newFileSize;
			}

			if (prevfileExist === true) { //  false => deleted
				if (prevFileSize) {
					prevFileSize = parseFloat(prevFileSize);
					this.overallFileSize = this.overallFileSize + prevFileSize;
				}

			}

			this.overallFileSize = this.overallFileSize.toPrecision(3);
			this.getView().byId("rFilesize").setText(this.overallFileSize + " MB ");

			sap.ui.core.BusyIndicator.hide();

		},

		onDisplayPDF2: function () {
			sap.ui.core.BusyIndicator.show(0);
			//fetching PDF file from backend for Dipslay and Edit Process
			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
			var process = btnModel.getProperty("/process");
			var claimId = btnModel.getProperty("/claimId");

			if ((process == "Edit") || (process == "Display")) {
				var oModel = this.getOwnerComponent().getModel("InitialModel");
				var self = this;
				oModel.read("/CLAIMS_DETAILSSet('" + claimId + "')", {
					urlParameters: {
						"$expand": "TOAttach"
					},
					success: function (data) {
						self.bindPDF(data);
					},

					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
						MessageToast.show("Error Connecting odata service to backend");
					}
				});

			}
		},

		bindPDF: function (data) {
			var len = data.TOAttach.results.length;
			var self = this;
		
		for(var i=0; i<len; i++){
			if(data.TOAttach.results[i].Fname === "Medical Reimbursement.PDF"){
				var file = data.TOAttach.results[i].Fdata;
				var l = data.TOAttach.results[i].Fdata.length;
				var size = l / (1024 * 1024);
				size = size.toPrecision(3);
			}
		}
			self.loadPdfonDevice(file, size);
		},

		loadPdfonDevice: function (file, size) {
			sap.ui.core.BusyIndicator.hide();

			if (sap.ui.Device.system.phone) {

				var decodedPdfContent = atob(file);
				var byteArray = new Uint8Array(decodedPdfContent.length)
				for (var i = 0; i < decodedPdfContent.length; i++) {
					byteArray[i] = decodedPdfContent.charCodeAt(i);
				}

				var blob = new Blob([byteArray.buffer], {
					type: 'application/pdf'
				});

				var _pdfurl = URL.createObjectURL(blob);
				jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist

				if (sap.ui.Device.os.android) {
					parent.window.open(_pdfurl);
				} else {
					window.open(_pdfurl);
				}

				// if (!this._PDFViewer) {
				// 	this._PDFViewer = new sap.m.PDFViewer({
				// 		title: "Previous Attachment",
				// 		width: "auto",
				// 		source: _pdfurl // my blob url
				// 	});

				// } else { //if object already exist
				// 	this._PDFViewer.setSource(_pdfurl);
				// }

				// this._PDFViewer.downloadPDF = function () {
				// 	File.save(
				// 		byteArray.buffer,
				// 		"Expense Report",
				// 		"pdf",
				// 		"application/pdf"
				// 	);
				// };
				// sap.ui.core.BusyIndicator.hide();

				// this._PDFViewer.open();

			} else {

				if (size > 1.5) {
					var decodedPdfContent = atob(file);
					var byteArray = new Uint8Array(decodedPdfContent.length)
					for (var i = 0; i < decodedPdfContent.length; i++) {
						byteArray[i] = decodedPdfContent.charCodeAt(i);
					}

					var blob = new Blob([byteArray.buffer], {
						type: 'application/pdf'
					});

					var _pdfurl = URL.createObjectURL(blob);
					jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist

					window.open(_pdfurl);

				} else {

					var html = new sap.ui.core.HTML();
					html.setContent("<iframe src=" + "data:application/pdf;base64," + file + " width='900' height='800'></iframe>");

					var that = this;
					if (!this.draggableDialog) {
						this.draggableDialog = new sap.m.Dialog({
							title: "Preview",
							contentWidth: "900px",
							contentHeight: "800px",
							draggable: true,
							verticalScrolling: false,

							endButton: new sap.m.Button({
								text: "Close",
								type: "Emphasized",
								press: function () {
									this.draggableDialog.close();
									//sap.ui.core.BusyIndicator.hide();

								}.bind(this)
							})
						});

						//to get access to the global model
						this.getView().addDependent(this.draggableDialog);
					}

					//clearing content first
					var Contents = this.draggableDialog.getContent();
					for (var i = 0; i < Contents.length; i++) {
						this.draggableDialog.removeContent(i);
					}

					this.draggableDialog.addContent(html);
					this.draggableDialog.open();
				}
			}
		},

		onDisplayApprovalPDF: function () {
			sap.ui.core.BusyIndicator.show(0);
			//fetching PDF file from backend for Dipslay and Edit Process
			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
			var process = btnModel.getProperty("/process");
			var claimId = btnModel.getProperty("/claimId");

			if ((process == "Edit") || (process == "Display")) {
				var oModel = this.getOwnerComponent().getModel("InitialModel");
				var self = this;
				oModel.read("/CLAIMS_DETAILSSet('" + claimId + "')", {
					urlParameters: {
						"$expand": "TOAttach"
					},
					success: function (data) {
						self.bindApprovalPDF(data);
					},

					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
						MessageToast.show("Error Connecting odata service to backend");
					}
				});

			}
		},

		bindApprovalPDF: function (data) {
			var len = data.TOAttach.results.length;
			var self = this;
				
			for(var i=0; i<len; i++){
				if(data.TOAttach.results[i].Fname === "Approval.PDF"){
					var file = data.TOAttach.results[i].Fdata;
					var l = data.TOAttach.results[i].Fdata.length;
					var size = l / (1024 * 1024);
					size = size.toPrecision(3);
				}
			}

			self.loadPdfonDevice(file, size);

		},

		onNavBack: function () {

			// var pass = "0";
			// this.getOwnerComponent().getRouter().navTo("master", {
			// 	claimId: pass
			// });
			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
			btnModel.setProperty("/uploadClear", false);
			history.go(-1);

		},

		onDisplayPDF: function () {
			var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
			var pdfFile = fileReaderModel.getProperty("/oPDF");

			pdfFile.output('dataurlnewwindow');

		},

		onDownloadPDF: function () {
			var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
			var pdfFile = fileReaderModel.getProperty("/oPDF");
			pdfFile.save('ExpenseReport.pdf');

		},

		navtoInitial: function () {
			var model = this.getOwnerComponent().getModel("InitialModel");
			model.refresh();

			this.getOwnerComponent().getRouter().navTo("initial");

		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Gail.Medical_Claim.view.Review
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Gail.Medical_Claim.view.Review
		 */
		//	onExit: function() {
		//
		//	}
		onSaveDraft: function () {
			//Changes by Usmana starts here
			var empFamDetails = this.getOwnerComponent().getModel("empFamDetails").getData();
            sap.ui.core.BusyIndicator.show(0);
            var oErrorFlag1;
            var addedItems = this.getOwnerComponent().getModel("detailMasterModel").getData();
            for (var i = 0; i < addedItems.length; i++) {
                var lineData = empFamDetails.filter(item => item.TEXT.includes(addedItems[i].Fcnam));
                if(lineData.length > 0){
					var date1 = new Date((Number(lineData[0].FGBDT.substring(0,4)) + 30).toString()+"/"+lineData[0].FGBDT.substring(5,6)+"/"+lineData[0].FGBDT.substring(7,8));
					var date2 = addedItems[i].Cdt01;
                    if (lineData[0].FASEX == "1" && lineData[0].FAMSA == "2" && date2 > date1 && lineData[0].yy_child_handica != 'X') {
                        oErrorFlag1 = true;
                    }
                }
            };
			var pdfModel = this.getOwnerComponent().getModel("FileReaderModel");
			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
			var originalPdfModel = this.getOwnerComponent().getModel("OriginalPdfFiles");

			var string = pdfModel.getProperty("/dataString");
			var delayString = pdfModel.getProperty("/dataStringDelay");

			var attachedBills = [];
			var message = [];
			var oEmpData = [];
            var oValidateDate = this.getOwnerComponent().getModel("empItemData").getData();
            var oErrorFlag2;
            var oIncValue = 0;
            var oInvoiceDateModel = this.getView().getModel("invoiceDate");
            var oInvoiceDate = oInvoiceDateModel.getData().invoiceDate;
            
            // age comparision based on system date
            if(oValidateDate.length > 0){
            oValidateDate.forEach(function(){
            if (
            oValidateDate[oIncValue].Fasex == "1" &&
            oValidateDate[oIncValue].Famsa == "2" &&
            oValidateDate[oIncValue].Age > "30" &&
            oValidateDate[oIncValue].Age <= "30" 
            ) {
            oErrorFlag1 = true;
            }
            oIncValue = oIncValue + 1;
            });
            
            // age calculation based on invoice/bill date
            
            oIncValue = 0;
            oValidateDate.forEach(function () {
                var oFgbdt = oValidateDate[oIncValue].Fgbdt;
                var oYear = oFgbdt.slice(0, 4);
                var oMonth = oFgbdt.slice(4, 6);
                var oDate = oFgbdt.slice(6, 8);
                var oDOB = oMonth.concat("/",oDate,"/",oYear);
                var dob1 = new Date(oDOB);
                var oInvoice = new Date(oInvoiceDate);
                
                let date = dob1;
                
                let dob = new Date(data);
                let day =  dob.getDate();
                let month = dob.getMonth();
                let year =  dob.getfullYear();
                let now = oInvoice;
                //console.log(now);
                let yearDiff = now.getFullYear() - year;
                let monthDiff = now.getMonth() - month;
                let dateDiff = now.getDate() - day;
                
                if (yearDiff == 30 && monthDiff > 0 &&	dateDiff > 0){
                oErrorFlag2 = true;
                }else if(yearDiff > 30){
                oErrorFlag2 = true;
                }else{
                oErrorFlag2 = false;
                }
                
                onIncValue = onIncValue + 1;                
            });
            }

            if(oErrorFlag1 == true ||oErrorFlag2 == true){
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageBox.show("Child age is more than 30 years ,claim is not allowed",{
                    icon:sap.m.MessageBox.Icon.ERROR,
                    title: "Error",
                    actions: [sap.m.MessageBox.Action.OK]
                });
                return;
            }
			//validating if user saving without pdf
			if (string) {
				var fileSize = pdfModel.getProperty("/size");
				fileSize = fileSize * 1024;
				string = string.slice(28); // datauristring provides data in form of base64 already (no need to apply btoa method just remove few description lines
				// using slice(51) method 51 - no of words					
				var bills = {
					Linum: "001",
					Fsize: fileSize.toString(),
					Fdata: string,
					Fista: "M" //M for Medical bills pdf .....A for Approval mail pdf
				};
				attachedBills.push(bills);
			}

			// vlaidating delay appoval pdf file
			if (delayString) {
				var fileSize = pdfModel.getProperty("/sizeDelay");
				fileSize = fileSize * 1024;
				delayString = delayString.slice(28); // datauristring provides data in form of base64 already (no need to apply btoa method just remove few description lines
				// using slice(51) method 51 - no of words					
				var bills = {
					Linum: "001",
					Fsize: fileSize.toString(),
					Fdata: delayString,
					Fista: "A" //..A for Approval mail pdf
				};
				attachedBills.push(bills);
			}

			//adding original pdf files as it is
			var orgPdf = this.getView().getModel("OriginalPdfFiles").getProperty("/PDFFiles");
			var length = orgPdf.length;

			for (var i = 0; i < length; i++) {
				var oSize = orgPdf[i].size.toPrecision(3);
				var oType = orgPdf[i].Type; // to check approval pdf or medical bill pdf
				if (oType == "Approval") {
					var fista = "A";
				} else {
					fista = "M";
				}
				var bills = {
					Linum: "001",
					Fsize: oSize.toString(),
					Fdata: orgPdf[i].PDfData,
					Fista: fista
				};
				attachedBills.push(bills);
			}

			var msg = {
				Type: "E"
			};

			message.push(msg);

			var process = btnModel.getProperty("/process");
			var claimId = btnModel.getProperty("/claimId");
			var prevPdf = btnModel.getProperty("/prevPdf");
			var prevAppPdf = btnModel.getProperty("/prevAppPdf");

			// to check if previous pdf's deleted or not
			if (prevPdf == false) {
				var flagDelete = "X";
			} else {
				flagDelete = "";
			}

			if (prevAppPdf == false) {
				var flagDeleteApproval = "X";
			} else {
				flagDeleteApproval = "";
			}

			if (process === "Edit") {
				var payload = {
					Pernr: "",
					Refnr: claimId,
					FlagAttachDel: flagDelete,
					FlagAttDelApp: flagDeleteApproval,
					Rqamt: amt.toString(),
					Apamt: "0",
					FlagSd: "X",
					TOItem: addedItems,
					TOAttach: attachedBills,
					TOMessage_det: message
				};
			} else if (process === "Create") {
				var payload = {
					Pernr: "",
					Refnr: "",
					Rqamt: amt.toString(),
					Apamt: "0",
					FlagSd: "X",
					TOItem: addedItems,
					TOAttach: attachedBills,
					TOMessage_det: message
				};
			}

			this.finalCall(payload);

		},

		onSubmit: function () {
			//Changes by Usmana starts here
			var empFamDetails = this.getOwnerComponent().getModel("empFamDetails").getData();
            sap.ui.core.BusyIndicator.show(0);
            var oErrorFlag1;
            var addedItems = this.getOwnerComponent().getModel("detailMasterModel").getData();
            for (var i = 0; i < addedItems.length; i++) {
                var lineData = empFamDetails.filter(item => item.TEXT.includes(addedItems[i].Fcnam));
                if(lineData.length > 0){
					var date1 = new Date((Number(lineData[0].FGBDT.substring(0,4)) + 30).toString()+"/"+lineData[0].FGBDT.substring(5,6)+"/"+lineData[0].FGBDT.substring(7,8));
					var date2 = addedItems[i].Cdt01;
                    if (lineData[0].FASEX == "1" && lineData[0].FAMSA == "2" && date2 > date1 && lineData[0].yy_child_handica != 'X') {
                        oErrorFlag1 = true;
                    }
                }
            };
			if(oErrorFlag1){
				sap.ui.core.BusyIndicator.hide();
					sap.m.MessageBox.show("Child age is more than 30 years ,claim is not allowed",{
						icon:sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			else{
				var size = this.overallFileSize;
			if (size > 5) {
				MessageBox.error("Claim cannot be submitted as file size exceeds 5 MB");
				return;
			}

			sap.ui.core.BusyIndicator.show(0);
			var addedItems = this.getOwnerComponent().getModel("detailMasterModel").getData();
			var pdfModel = this.getOwnerComponent().getModel("FileReaderModel");
			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
			var originalPdfModel = this.getOwnerComponent().getModel("OriginalPdfFiles");

			var string = pdfModel.getProperty("/dataString");
			var delayString = pdfModel.getProperty("/dataStringDelay");

			var attachedBills = [];
			var message = [];

			var mCount = 0;
			var aCount = 0;

			//validating if user saving without pdf
			if (string) {
				var fileSize = pdfModel.getProperty("/size");
				fileSize = fileSize * 1024;
				string = string.slice(28); // datauristring provides data in form of base64 already (no need to apply btoa method just remove few description lines
				// using slice(51) method 51 - no of words					
				var bills = {
					Linum: "001",
					Fsize: fileSize.toString(),
					Fdata: string,
					Fista: "M"
				};
				attachedBills.push(bills);

				++mCount;
			}

			if (delayString) {
				var fileSize = pdfModel.getProperty("/sizeDelay");
				fileSize = fileSize * 1024;
				delayString = delayString.slice(28); // datauristring provides data in form of base64 already (no need to apply btoa method just remove few description lines
				// using slice(51) method 51 - no of words					
				var bills = {
					Linum: "001",
					Fsize: fileSize.toString(),
					Fdata: delayString,
					Fista: "A"
				};
				attachedBills.push(bills);

				++aCount;
			}

			//adding original pdf files as it is
			var orgPdf = this.getView().getModel("OriginalPdfFiles").getProperty("/PDFFiles");
			var length = orgPdf.length;

			for (var i = 0; i < length; i++) {
				var oSize = orgPdf[i].size.toPrecision(3);
				var oType = orgPdf[i].Type; // to check approval pdf or medical bill pdf
				if (oType == "Approval") {
					var fista = "A";
					++aCount;
				} else {
					fista = "M";
					++mCount;
				}

				var bills = {
					Linum: "001",
					Fsize: oSize.toString(),
					Fdata: orgPdf[i].PDfData,
					Fista: fista
				};
				attachedBills.push(bills);
			}

			var msg = {
				Type: "E"
			};

			message.push(msg);

			//validate create or edit process
			var process = btnModel.getProperty("/process");
			var claimId = btnModel.getProperty("/claimId");
			var prevPdf = btnModel.getProperty("/prevPdf");
			var prevAppPdf = btnModel.getProperty("/prevAppPdf");
			var showDelay = btnModel.getProperty("/showDelayed");

			// to check if previous pdf's deleted or not
			if (prevPdf == false) {
				var flagDelete = "X";
			} else {
				flagDelete = "";
			}

			if (prevAppPdf == false) {
				var flagDeleteApproval = "X";
			} else {
				flagDeleteApproval = "";
			}

			//validating if any bill is atached or not
			if ((prevPdf == false) & (mCount == 0)) {
				MessageBox.error("No Bills Attached!");
				sap.ui.core.BusyIndicator.hide();
				return;
			}

			//validating if any approval is atached or not
			if ((prevAppPdf == false) & (aCount == 0) & (showDelay == true)) {
				MessageBox.error("No Approval Attached!");
				sap.ui.core.BusyIndicator.hide();
				return;
			}

			if (process === "Edit") {
				var payload = {
					Pernr: "",
					FlagAttachDel: flagDelete,
					FlagAttDelApp: flagDeleteApproval,
					Refnr: claimId,
					Rqamt: amt.toString(),
					Apamt: "0",
					FlagSd: "",
					TOItem: addedItems,
					TOAttach: attachedBills,
					TOMessage_det: message
				};
			} else if (process === "Create") {
				var payload = {
					Pernr: "",
					Refnr: "",
					Rqamt: amt.toString(),
					Apamt: "0",
					FlagSd: "",
					TOItem: addedItems,
					TOAttach: attachedBills,
					TOMessage_det: message
				};
			}

			// calling TnC dialog box
			// var that = this;
			// if (!this.draggableDialog) {
			// 	this.draggableDialog = new Dialog({
			// 		title: "Terms and Conditions",
			// 		contentWidth: "900px",
			// 		contentHeight: "800px",
			// 		draggable: true,
			// 		content: new sap.m.PDFViewer({
			// 			source: "{TnC>/Source}",
			// 			height: "800px",
			// 			width: "900px"
			// 		}),
			// 		endButton: new sap.m.Button({
			// 			text: "I Agree",
			// 			type: "Emphasized",
			// 			press: function () {
			// 				this.draggableDialog.close();
			// 				//sap.ui.core.BusyIndicator.hide();
			// 				that.finalCall(payload);           // calling final odata call to submit the claim
			// 			}.bind(this)
			// 		})
			// 	});

			// 	//to get access to the global model
			// 	this.getView().addDependent(this.draggableDialog);
			// }

			// this.draggableDialog.open();

			/* SECOND METHOD: using html control and Iframe (if we don't want to pursue with SAP.M.PDFVIEWER	*/

			// 	var file =	this.getOwnerComponent().getModel("TnC").getProperty("/Source");
			// 			var html = new sap.ui.core.HTML();
			// 		 html.setContent("<iframe src=" + "data:application/pdf;base64,"+file + " width='900' height='800'></iframe>");

			// var that = this;
			// 		if (!this.draggableDialog) {
			// 			this.draggableDialog = new sap.m.Dialog({
			// 				title: "Terms and Conditions",
			// 				contentWidth: "900px",
			// 				contentHeight: "800px",
			// 				draggable: true,

			// 				buttons:[ new sap.m.Button({
			// 					text: "I Agree",
			// 					type: "Emphasized",
			// 					press: function () {
			// 						this.draggableDialog.close();
			// 						//sap.ui.core.BusyIndicator.hide();
			// 					      	that.finalCall(payload);
			// 					}.bind(this)
			// 				}),
			// 				new sap.m.Button({
			// 					text: "Close",
			// 					type: "Reject",
			// 					press: function () {
			// 						this.draggableDialog.close();
			// 						sap.ui.core.BusyIndicator.hide();

			// 					}.bind(this)
			// 				})
			// 				]
			// 			});

			// 			//to get access to the global model
			// 			this.getView().addDependent(this.draggableDialog);
			// 		}

			// 		//clearing content first
			// 		var Contents = this.draggableDialog.getContent();
			// 		for (var i=0; i<Contents.length; i++){
			// 		           this.draggableDialog.removeContent(i);
			// 			}

			// 	this.draggableDialog.addContent(html);
			// 	this.draggableDialog.open();

			/*3rd method Calling XML dialog fragment*/
			this.RequestBody = payload;

			if (this._TCDialog === null || typeof this._TCDialog === undefined) {
				this._TCDialog = sap.ui.xmlfragment("Gail.Medical_Claim.view.TermsAndCondition", this);
			}
			this._TCDialog.open();
			var FirstCheckBox = sap.ui.getCore().byId("FirstCheckBox");;
			// var SecondCheckBox = sap.ui.getCore().byId("SecondCheckBox");
			var btnContinue = sap.ui.getCore().byId("btnContinue");
			FirstCheckBox.setSelected(false);
			// SecondCheckBox.setSelected(false);
			btnContinue.setVisible(false);
			}
			
		},

		onTCDialog: function (e) {
			sap.ui.core.BusyIndicator.hide();
			this._TCDialog.close();
		},
		onContinue: function (e) {
			this._TCDialog.close();
			this.finalCall(this.RequestBody);
		},
		checkBoxEventHandler: function (e) {

			//Only if both are selected display Continue Button or else hide	
			var FirstCheckBox = sap.ui.getCore().byId("FirstCheckBox");;
			// var SecondCheckBox = sap.ui.getCore().byId("SecondCheckBox");
			var btnContinue = sap.ui.getCore().byId("btnContinue");

			if (FirstCheckBox.getSelected()) // & SecondCheckBox.getSelected())
				btnContinue.setVisible(true);
			else
				btnContinue.setVisible(false);

		},

		finalCall: function (payload) {

			var model = this.getOwnerComponent().getModel("InitialModel");
			var that = this;

			model.create("/CLAIMS_DETAILSSet", payload, {

				success: function (data) {
					sap.ui.core.BusyIndicator.hide();
					var count = data.TOMessage_det.results.length;

					//Check for error , Success , 
					var hasError = false;
					var MessageType = "";
					// ---------- Usmana Changes starts
					// var oMessageData = [];
					// var oMessageContent = {};
					// debugger;
					//----------- Usmana Changes end
					for (var i = 0; i < count; i++) {
						MessageType = data.TOMessage_det.results[i].Type;
						if ("E" === MessageType) {
							hasError = true;
							data.TOMessage_det.results[i].Type = 'Error';
						}
						if ("I" === MessageType)
							data.TOMessage_det.results[i].Type = 'Information';
						if ("W" === MessageType)
							data.TOMessage_det.results[i].Type = 'Warning';
						if ("S" === MessageType)
							data.TOMessage_det.results[i].Type = 'Success';
						// oMessageContent.type = data.TOMessage_det.results[i].Type;
						// oMessageContent.title = data.TOMessage_det.results[i].Message;
						// oMessageContent.description = data.TOMessage_det.results[i].Message;
						// oMessageData.push(oMessageContent);
					}

					if (hasError) {
						that.getView().byId("errorBtn").setVisible(true);
						that.getView().byId("errorBtn").setText(data.TOMessage_det.results.length);
						// Prepare the message format -------- Usmana
						
					// 	var count = data.TOMessage_det.results.length;
					// 	var oMessageData = [];
					// 	var oMessageContent = {};
					// 	debugger;
					// for (var i = 0; i < count; i++) {
					// 	debugger;
					// 	oMessageContent.type = data.TOMessage_det.results[i].Type;
					// 	oMessageContent.title = data.TOMessage_det.results[i].Message;
					// 	oMessageContent.description = data.TOMessage_det.results[i].Message;
					// 	oMessageData.push(oMessageContent);
					// }
					//--------------------------- Usmana
						var ErrorModel = that.getOwnerComponent().getModel("ErrorMessages");
						ErrorModel.setData(data.TOMessage_det.results); 
					//    ErrorModel.setData(oMessageData); // Added by Usmana
						oMessagePopover.setModel(ErrorModel);

						MessageBox.alert("Error Occured while submitting claim!", {
							title: "Error!"
						});
					} else {
						var displayMsg = data.TOMessage_det.results[0].Message;
						MessageBox.success(displayMsg, {
							title: "Success!",
							actions: [MessageBox.Action.OK],
							onClose: function (sAction) {
								that.navtoInitial();
							}
						});
					}
				},

				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					if (!err.TOMessage_det) {
						MessageBox.error(err.message + " :" + err.statusCode);
					} else {
						var displayMsg = err.TOMessage_det.results[0].Message;
						MessageBox.error(displayMsg);
					}
				}
			});

		},

		// onAttachment: function () {
		// 	var btnModel = this.getOwnerComponent().getModel("buttonsModel");
		// 	var process =btnModel.getProperty("/process");
		// 	var count =btnModel.getProperty("/count");
		// 	var that =this;
		// 	if(process === "Edit"){
		// 		if( count === 0){
		// 		MessageBox.show("Do you want to replace the existng PDF file?",{
		// 			icon:MessageBox.Icon.INFORMATION,
		// 			title:"Action Required",
		// 			actions:[MessageBox.Action.YES, MessageBox.Action.NO],
		// 			onClose:function(oAction){
		// 					if(oAction === "YES"){
		// 						count = count + 1;
		// 						btnModel.setProperty("/prevPdf",false);
		// 						that.getView().byId("panelPdf2").setVisible(false);
		// 						that.getOwnerComponent().getRouter().navTo("attachment");
		// 					}
		// 					else if(oAction === "NO"){
		// 						btnModel.setProperty("/prevPdf",true);
		// 						that.getOwnerComponent().getRouter().navTo("attachment");
		// 						count = count + 1;
		// 					}
		// 				}	
		// 			});
		// 		}
		// 		else{
		// 			this.getOwnerComponent().getRouter().navTo("attachment");
		// 		}
		// 	}
		// 	else{
		// 		this.getOwnerComponent().getRouter().navTo("attachment");
		// 	}

		// },

		handleMessagePopoverPress: function (oEvent) {
			oMessagePopover.toggle(oEvent.getSource());
		}

	});

});