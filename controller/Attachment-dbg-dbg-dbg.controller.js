 sap.ui.define([
 	"sap/ui/core/mvc/Controller",
 	"sap/m/MessageBox",
 	"sap/m/MessageToast",
 	"sap/ui/core/BusyIndicator",
 	"sap/ui/model/json/JSONModel"
 ], function (Controller, MessageBox, MessageToast, BusyIndicator, JSONModel) {
 	"use strict";
 	var oCustomerHeaderToken;
 	var scenario = "";
 	var wasBillCreatedfromImage = false;
 	var wasApprovalCreatedFromImage = false;
 	var exif, transform = "none";
 	return Controller.extend("Gail.Medical_Claim.controller.Attachment", {

 		/**
 		 * Called when a controller is instantiated and its View controls (if available) are already created.
 		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
 		 * @memberOf Gail.Medical_Claim.view.Attachment
 		 */
 		onInit: function () {

 			//Model to hold Generated PDFS Info
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

 			this.getView().setModel(new JSONModel({
 				"items": ["jpg", "jpeg", "JPG", "JPEG", "pdf", "png"],
 				"selected": ["jpg", "jpeg", "JPG", "JPEG", "pdf", "png"]
 			}), "fileTypes");

 			var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
 			fileReaderModel.setData(fileData);
 			//this.getOwnerComponent().getRouter().getRoute("attachment").attachPatternMatched(this._onAttachmentMatched, this);

 			//Original PDF are those PDF files that are uploaded as PDF. These are differnt from the generated PDF that this application 
 			//generates from image files. Below model stores information about the Original PDFS 

 			this.getOwnerComponent().getRouter().getRoute("attachment").attachPatternMatched(this._onAttachmentMatched, this);
 		},

 		_onAttachmentMatched: function () {
 			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
 			var routeModel = this.getOwnerComponent().getModel("RouteModel");
 			routeModel.setProperty("/split", false);
 			routeModel.setProperty("/normal", true);

 			//hiding panels based on the process
 			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 			var process = btnModel.getProperty("/process");
 			var uploadClear = btnModel.getProperty("/uploadClear");

 			if (uploadClear == true) {
 				this.getView().byId("delayUploadColl").removeAllItems();
 				this.getView().byId("uploadColl").removeAllItems();

 			}

 			this.wasBillCreatedfromImage = false;
 			this.wasApprovalCreatedFromImage = false;


			//clean up of model FileReader
			var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
		        fileReaderModel.setProperty("/oPDFDelay", "");
                fileReaderModel.setProperty("/sizeDelay", 0);
                fileReaderModel.setProperty("/dataStringDelay", "");
                fileReaderModel.setProperty("/oPDF", "");
		        fileReaderModel.setProperty("/size", 0);
                fileReaderModel.setProperty("/dataString", "");
                                          
                                          
 			// var prevPdf = btnModel.getProperty("/prevPdf");
 			// var prevAppPdf = btnModel.getProperty("/prevAppPdf");
 			// if (process == "Edit") {

 			// 	//for previous bill pdf
 			// 	if(prevPdf == false){
 			// 		this.getView().byId("panelPdf2").setVisible(false);
 			// 	}
 			// 	else{
 			// 		this.getView().byId("panelPdf2").setVisible(true);
 			// 	}
 			// 	// for previous approval pdf
 			// 	if(prevAppPdf == false){
 			// 		this.getView().byId("panelPdf").setVisible(false);
 			// 	}
 			// 	else{
 			// 		this.getView().byId("panelPdf").setVisible(true);
 			// 	}
 			// }
 			// else {
 			// 	this.getView().byId("panelPdf2").setVisible(false);
 			// 	this.getView().byId("panelPdf").setVisible(false);
 			// }

 			//=========== hiding delay approval upload collection based on 6 months-============================
 			var itemModel = this.getOwnerComponent().getModel("detailMasterModel");
 			var itemsLength = this.getOwnerComponent().getModel("detailMasterModel").getData().length;

 			// initially hiding it
 			btnModel.setProperty("/showDelayed", false);

 			for (var i = 0; i < itemsLength; i++) {

 				var itemName = this.getOwnerComponent().getModel("detailMasterModel").getData()[i].C04t3; //to fetch type name

 				switch (itemName) {
 				case "CON":
 					var invoiceDate = this.getOwnerComponent().getModel("detailMasterModel").getData()[i].Cdt01;

 					var m1 = invoiceDate.getMonth();
 					var d1 = invoiceDate.getDate();
 					var y1 = invoiceDate.getFullYear();
 					var m = m1 + 6;

 					var m6Date = new Date(y1, m, d1);

 					var newDate = new Date();

 					if (newDate > m6Date) { //delayed
 						var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 						btnModel.setProperty("/showDelayed", true);
 					}

 					break;

 				case "MED":

 					var invoiceDate = this.getOwnerComponent().getModel("detailMasterModel").getData()[i].Cdt01;

 					var m1 = invoiceDate.getMonth();
 					var d1 = invoiceDate.getDate();
 					var y1 = invoiceDate.getFullYear();
 					var m = m1 + 6;
 					var m6Date = new Date(y1, m, d1);

 					var newDate = new Date();

 					if (newDate > m6Date) { //delayed
 						var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 						btnModel.setProperty("/showDelayed", true);
 					}

 					break;

 				case "TST":

 					var invoiceDate = this.getOwnerComponent().getModel("detailMasterModel").getData()[i].Cdt01;

 					var m1 = invoiceDate.getMonth();
 					var d1 = invoiceDate.getDate();
 					var y1 = invoiceDate.getFullYear();
 					var m = m1 + 6;
 					var m6Date = new Date(y1, m, d1);

 					var newDate = new Date();

 					if (newDate > m6Date) { //delayed
 						var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 						btnModel.setProperty("/showDelayed", true);
 					}

 					break;

 				case "HOS":
 					var fromDate = this.getOwnerComponent().getModel("detailMasterModel").getData()[i].Cdt01;
 					var m1 = fromDate.getMonth();
 					var d1 = fromDate.getDate();
 					var y1 = fromDate.getFullYear();
 					var m = m1 + 6;

 					var m6Date = new Date(y1, m, d1);
 					var newDate = new Date();

 					if (newDate > m6Date) { //delayed
 						var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 						btnModel.setProperty("/showDelayed", true);
 					}

 					break;

 				case "TRV":

 					var depDate = this.getOwnerComponent().getModel("detailMasterModel").getData()[i].Cdt01;
 					var m1 = depDate.getMonth();
 					var d1 = depDate.getDate();
 					var y1 = depDate.getFullYear();
 					var m = m1 + 6;

 					var m6Date = new Date(y1, m, d1);
 					var newDate = new Date();

 					if (newDate > m6Date) { //delayed
 						var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 						btnModel.setProperty("/showDelayed", true);
 					}

 					break;
 					
 			
 				case "OTH":

 					var invDate = this.getOwnerComponent().getModel("detailMasterModel").getData()[i].Cdt01;
 					var m1 = invDate.getMonth();
 					var d1 = invDate.getDate();
 					var y1 = invDate.getFullYear();
 					var m = m1 + 6;

 					var m6Date = new Date(y1, m, d1);
 					var newDate = new Date();

 					if (newDate > m6Date) { //delayed
 						var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 						btnModel.setProperty("/showDelayed", true);
 					}

 					break;		
 				};
 			}

 		},

 		// onDeletePDF:function(){

 		// },

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
				var j = data.TOAttach.results[i].Fname.indexOf("Reimbursement");
				if(j > -1){
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
 					var link = document.createElement('a');
 					link.href = _pdfurl;
 					link.download = 'file.pdf';
 					link.dispatchEvent(new MouseEvent('click'));
 				} else {
 					window.open(_pdfurl);
 				}

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

 					// if (!this._PDFViewer) {
 					// 	this._PDFViewer = new sap.m.PDFViewer({
 					// 		title: "Previous Bills",
 					// 		width: "auto",
 					// 		source: _pdfurl // my blob url
 					// 	});

 					// }
 					// else{  //if object already exist
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

 					var html = new sap.ui.core.HTML();
 					html.setContent("<iframe src=" + "data:application/pdf;base64," + file + " width='900' height='800'></iframe>");

 					var sizeBtn = new sap.m.Button({
 						text: "Size: " + size + "MB",
 						type: "Transparent",
 						enabled: false
 					});
 					var closeBtn = new sap.m.Button({
 						text: "Close",
 						type: "Emphasized",
 						press: function () {
 							this.draggableDialog.close();
 						}.bind(this)
 					});

 					var that = this;
 					if (!this.draggableDialog) {
 						this.draggableDialog = new sap.m.Dialog({
 							title: "Preview",
 							contentWidth: "900px",
 							contentHeight: "800px",
 							draggable: true,
 							verticalScrolling: false,
 							buttons: []
 						});

 						this.getView().addDependent(this.draggableDialog);
 					} else {
 						this.draggableDialog.removeAllButtons();
 					}

 					var Contents = this.draggableDialog.getContent();
 					for (var i = 0; i < Contents.length; i++) {
 						this.draggableDialog.removeContent(i);
 					}

 					this.draggableDialog.addContent(html);
 					this.draggableDialog.addButton(sizeBtn);
 					this.draggableDialog.addButton(closeBtn);

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
 			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 			var process = btnModel.getProperty("/process");

 			//not to clear upload collection
 			btnModel.setProperty("/uploadClear", false);

 			if (process === "Create") {
 				var pass = "0";
 				this.getOwnerComponent().getRouter().navTo("master", {
 					claimId: pass
 				});
 			} else {
 				history.go(-1);
 			}

 		},

 		onChange: function (oEvent) {
 			var files = oEvent.getParameter("files");
 			var CurrentFileReadersIDS = this.getOwnerComponent().getModel("FileReaderModel").getProperty("/FileReaderIds");
 			var FileCount = oEvent.getParameter("files").length;
 			for (var j = 0; j < FileCount; j++) {
 				//Changed by RaviTiwari. Handle Iphone Same Image replication issue
 				var fileInfoStatus = {
 					"File": [],
 					"isConsider": "false"
 				};
 				fileInfoStatus.File = files[j];
 				//CurrentFileReadersIDS.push(files[j]);
 				CurrentFileReadersIDS.push(fileInfoStatus);
 			}
 			this.getView().getModel("FileReaderModel").setProperty("/FileReaderIds", CurrentFileReadersIDS);

 			// this.getView().byId("uploadCollTitle").setText("Attach Bills (" + FileCount + ")");

 		},

 		onApprovalChange: function (oEvent) {
 			var files = oEvent.getParameter("files");
 			var ApprovalsFileReadersIDS = this.getOwnerComponent().getModel("FileReaderModel").getProperty("/ApprovalFileReaderIds");
 			var FileCount = oEvent.getParameter("files").length;
 			for (var j = 0; j < FileCount; j++) {
 				var fileInfoStatus = {
 					"File": [],
 					"isConsider": "false"
 				};
 				fileInfoStatus.File = files[j];
 				ApprovalsFileReadersIDS.push(fileInfoStatus);
 			}
 			this.getView().getModel("FileReaderModel").setProperty("/ApprovalFileReaderIds", ApprovalsFileReadersIDS);

 			// this.getView().byId("delayUploadCollTitle").setText("Attach Delay Approval (" + FileCount + ")");
 		},

 		GetOriginalPDFFileData: function (type, pdffiles, oPDF, fileIndex, totalcount, Ypos) {

 			//Model to hold Generated PDFS Info
 			var that = this;
 			var fileData = {
 				"Name": "",
 				"PDfData": "",
 				"size": "",
 				"Type": ""
 			};
 			fileData.Name = pdffiles.name;
 			fileData.size = pdffiles.size / (1024 * 1024); //converting size into MB
 			fileData.Type = type;

 			var reader = new FileReader();
 			reader.readAsDataURL(pdffiles);
 			reader.onload = function (e) {
 				fileData.PDfData = reader.result.slice(28);

 				var CurrentFiles = that.getOwnerComponent().getModel("OriginalPdfFiles").getProperty("/PDFFiles");
 				CurrentFiles.push(fileData);
 				that.getView().getModel("OriginalPdfFiles").setProperty("/PDFFiles", CurrentFiles);
 				if (type == "Bill")
 					that.createPDFFromImages(oPDF, fileIndex, totalcount, Ypos);
 				else
 					that.createApprovalPDFFromImages(oPDF, fileIndex, totalcount, Ypos);

 			};
 			reader.onerror = function (e) {
 				sap.m.MessageToast.show("error");
 			};
 		},

 		CheckAndCreateDelayApprovals: function () {
 			var oPDFDelay;
 			//	this.cleanupApprovalFileReaderIds();
 			this.CurrentFileReadersIDS = this.getView().getModel("FileReaderModel").getProperty("/ApprovalFileReaderIds");
 			this.totalcount = this.CurrentFileReadersIDS.length;
 			if (this.totalcount > 0) {
 				oPDFDelay = new jsPDF("p", "mm", "a4", true, true);
 				this.createApprovalPDFFromImages(oPDFDelay, 0, this.totalcount, 0);
 			} else {
 				// nav to Review PAge
 				this.getOwnerComponent().getRouter().navTo("review");
 			}
 		},

 		createApprovalPDFFromImages: function (oPDF, fileIndex, totalcount, Ypos) {

 			var that = this;
 			if (fileIndex >= totalcount) {

 				//If this variable is not true that means no PDF Page was created from the Image henc PDF is blank.
 				if (this.wasApprovalCreatedFromImage) {
 					//calculating size of PDF filr
 					var size = oPDF.output("datauristring").length / (1024 * 1024);
 					var s = size.toPrecision(3);
 					size = parseFloat(s);
 					oPDF.deletePage(1);
 					var string = oPDF.output('datauristring');

 					var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
 					fileReaderModel.setProperty("/oPDFDelay", oPDF);
 					fileReaderModel.setProperty("/sizeDelay", size);
 					fileReaderModel.setProperty("/dataStringDelay", string);
 				} else {
 					var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
 					fileReaderModel.setProperty("/oPDFDelay", "");
 					fileReaderModel.setProperty("/sizeDelay", 0);
 					fileReaderModel.setProperty("/dataStringDelay", "");

 				}
 				// nav to Review PAge
 				this.getOwnerComponent().getRouter().navTo("review");
 				return;
 			}

 			//Check for File Extension if not iamge, navigate to next
 			var file = this.CurrentFileReadersIDS[fileIndex].File;
 			var FileType = file.type.toString();
 			if (FileType.lastIndexOf("pdf") > 0) {
 				this.GetOriginalPDFFileData("Approval", file, oPDF, fileIndex + 1, totalcount, Ypos);
 			} else {

 				if (fileIndex < totalcount)
 					oPDF.addPage();

 				var reader = new FileReader();
 				var img = new Image();
 				var width;
 				var height;
 				reader.readAsDataURL(file);

 				img.onload = function () {
					
					EXIF.getData(this, function () {
						that.exif = EXIF.getAllTags(this);
						if (that.exif.Orientation === 8) {
							width = img.height;
							height = img.width;
							transform = "left";
						} else if (that.exif.Orientation === 6) {
							width = img.height;
							height = img.width;
							transform = "right";
						} else if (that.exif.Orientation === 1) {
							width = img.width;
							height = img.height;
						} else if (that.exif.Orientation === 3) {
							width = img.width;
							height = img.height;
							transform = "flip";
						} else {
							width = img.width;
							height = img.height;
						}
						
						var MAX_WIDTH = 600;//750;
						var MAX_HEIGHT = 650;//1000;
						if (width / MAX_WIDTH > height / MAX_HEIGHT) {
							if (width > MAX_WIDTH) {
								height *= MAX_WIDTH / width;
								width = MAX_WIDTH;
							}
						} else {
							if (height > MAX_HEIGHT) {
								width *= MAX_HEIGHT / height;
								height = MAX_HEIGHT;
							}
						}
						var canvas = document.createElement("canvas");
						canvas.width =  width;
						canvas.height = height;
						var ctx = canvas.getContext("2d");
						ctx.fillStyle = 'white';
						ctx.fillRect(0, 0, canvas.width, canvas.height);
                		if (transform === 'left') {
							ctx.setTransform(0, -1, 1, 0, 0, height);
					//		ctx.scale(0.15, 0.15);	
							ctx.drawImage(img, 0, 0, height, width);
						} else if (transform === 'right') {
							ctx.setTransform(0, 1, -1, 0, width, 0);
					//		ctx.scale(0.15, 0.15);	
							ctx.drawImage(img, 0, 0, height, width);
						} else if (transform === 'flip') {
							ctx.setTransform(1, 0, 0, 1, 0, 0);
						//	ctx.setTransform(1, 0, 0, -1, 0, height);
						//		ctx.scale(0.15, 0.15);	
							ctx.drawImage(img, 0, 0, width, height);
						} else
						{
							ctx.setTransform(1, 0, 0, 1, 0, 0);
					//		ctx.scale(0.15, 0.15);	
							ctx.drawImage(img, 0, 0, width, height);
						}
						
						//-----------Old Code
 						/*----------------
 						var canvas = document.createElement("canvas");
 						canvas.width = this.width * 0.20;
 						canvas.height = this.height * 0.20;
 						var context = canvas.getContext("2d");
 						//context.scale(200/this.width,  200/this.height);
 						context.scale(0.15, 0.15);
 						// context.scale(0.25, 0.25);
 						context.drawImage(this, 0, Ypos);
 						---------------------*/

 						var sImageData = canvas.toDataURL("image/png");
 						oPDF.addImage(sImageData, 'PNG', 10, 10, undefined, undefined, undefined, 'FAST',0);
 						Ypos = canvas.height + 10;
 						that.wasApprovalCreatedFromImage = true;
 						//document.body.removeChild(canvas);
 						that.createApprovalPDFFromImages(oPDF, fileIndex + 1, totalcount, Ypos);
 					});
 				};

 				reader.onload = function (e) {
 					img.src = reader.result;
 				};
 				reader.onerror = function (e) {
 					sap.m.MessageToast.show("error");
 				};
 			}
 		},

 		createPDFFromImages: function (oPDF, fileIndex, totalcount, Ypos) {
 			var that = this;
 			if (fileIndex >= totalcount) {

 				//If this variable is not true that means no PDF Page was created from the Image hence PDF is blank.
 				if (this.wasBillCreatedfromImage) {

 					//calculating size of PDF filr
 					var size = oPDF.output("datauristring").length / (1024 * 1024);
 					var s = size.toPrecision(3);
 					size = parseFloat(s);
 					oPDF.deletePage(1);
 					var string = oPDF.output('datauristring');

 					var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
 					fileReaderModel.setProperty("/oPDF", oPDF);
 					fileReaderModel.setProperty("/size", size);
 					fileReaderModel.setProperty("/dataString", string);
 				} else {
 					var fileReaderModel = this.getOwnerComponent().getModel("FileReaderModel");
 					fileReaderModel.setProperty("/oPDF", "");
 					fileReaderModel.setProperty("/size", 0);
 					fileReaderModel.setProperty("/dataString", "");
 				}
 				//Check for Delay Approvals
 				if (scenario === "Review") {
 					this.CheckAndCreateDelayApprovals();
 				} else { // if preview button is pressed

 					var pdfModel = this.getOwnerComponent().getModel("FileReaderModel");
 					var originalPdfModel = this.getOwnerComponent().getModel("OriginalPdfFiles");
 					var string = pdfModel.getProperty("/dataString");
 					var claimId = this.getOwnerComponent().getModel("buttonsModel").getProperty("/claimId");
 					var process = this.getOwnerComponent().getModel("buttonsModel").getProperty("/process");

 					var attachedBills = [];
 					if (string) {
 						string = string.slice(28); // datauristring provides data in form of base64 already (no need to apply btoa method just remove few description lines
 						// using slice(28) method 51 - no of words					
 						var bills = {
 							Linum: "001",
 							Fdata: string
 						};
 						attachedBills.push(bills);
 					}

 					var orgPdf = this.getView().getModel("OriginalPdfFiles").getProperty("/PDFFiles");
 					var orgPdfLength = orgPdf.length;

 					for (var i = 0; i < orgPdfLength; i++) {
 						var bills = {
 							Linum: "001",
 							Fname:"Medical Reimbursement",
 							Fdata: orgPdf[i].PDfData
 						};
 						attachedBills.push(bills);
 					}

 					//Add Flag to indicate if old-previous Attachement needs to consider for merge or not 
 					var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 					var prevPdf = btnModel.getProperty("/prevPdf");
 					var Flag = "";
 					var self = this;
 					if (!prevPdf) { //if prev pdf doesn't exist
 						if (orgPdfLength > 0) { //but new pdf is attached
 							Flag = "X"; // call backend to merge all files
 						} else { // if no new pdf is attached as well
 							self.loadPdfonDevice(string, size); // don't call backend and show generated pdf only
 							return;

 						}
 					}

 					if (process === "Edit") {
 						var payload = {
 							Refnr: claimId,
 							FlagAttachDel: Flag,
 							TOAttach: attachedBills
 						};
 					} else {
 						var payload = {
 							Refnr: "",
 							FlagAttachDel: Flag,
 							TOAttach: attachedBills
 						};
 					}

 					this.loadPreview(payload);
 					return;
 				}

 				return;
 				// nav to Review PAge
 				//	this.getOwnerComponent().getRouter().navTo("review");

 			}

 			//Check for File Extension if not iamge, navigate to next
 			var file = this.CurrentFileReadersIDS[fileIndex].File;
 			var FileType = file.type.toString();
 			if (FileType.lastIndexOf("pdf") > 0) {
 				this.GetOriginalPDFFileData("Bill", file, oPDF, fileIndex + 1, totalcount, Ypos);
 			} else {

 				// if (fileIndex > 0)
 				if (fileIndex < totalcount)
 					oPDF.addPage();

 				var reader = new FileReader();
 				var img = new Image();
 				var height;
 				var width;

 				reader.readAsDataURL(file);

 				img.onload = function () {
 				
					EXIF.getData(this, function () {
						that.exif = EXIF.getAllTags(this);
						if (that.exif.Orientation === 8) {
							width = img.height;
							height = img.width;
							transform = "left";
						} else if (that.exif.Orientation === 6) {
							width = img.height;
							height = img.width;
							transform = "right";
						} else if (that.exif.Orientation === 1) {
							width = img.width;
							height = img.height;
						} else if (that.exif.Orientation === 3) {
							width = img.width;
							height = img.height;
							transform = "flip";
						} else {
							width = img.width;
							height = img.height;
						}
						
						var MAX_WIDTH = 600;//750;
						var MAX_HEIGHT = 650;//1000;
						if (width / MAX_WIDTH > height / MAX_HEIGHT) {
							if (width > MAX_WIDTH) {
								height *= MAX_WIDTH / width;
								width = MAX_WIDTH;
							}
						} else {
							if (height > MAX_HEIGHT) {
								width *= MAX_HEIGHT / height;
								height = MAX_HEIGHT;
							}
						}
						var canvas = document.createElement("canvas");
						canvas.width =  width;
						canvas.height = height;
						var ctx = canvas.getContext("2d");
						ctx.fillStyle = 'white';
						ctx.fillRect(0, 0, canvas.width, canvas.height);
                		if (transform === 'left') {
							ctx.setTransform(0, -1, 1, 0, 0, height);
					//		ctx.scale(0.15, 0.15);	
							ctx.drawImage(img, 0, 0, height, width);
						} else if (transform === 'right') {
							ctx.setTransform(0, 1, -1, 0, width, 0);
					//		ctx.scale(0.15, 0.15);	
							ctx.drawImage(img, 0, 0, height, width);
						} else if (transform === 'flip') {
							ctx.setTransform(1, 0, 0, 1, 0, 0);
						//	ctx.setTransform(1, 0, 0, -1, 0, height);
						//		ctx.scale(0.15, 0.15);	
							ctx.drawImage(img, 0, 0, width, height);
						} else
						{
							ctx.setTransform(1, 0, 0, 1, 0, 0);
					//		ctx.scale(0.15, 0.15);	
							ctx.drawImage(img, 0, 0, width, height);
						}

 						//-----------Old Code
 						/*----------------
 						var canvas = document.createElement("canvas");
 						canvas.width = this.width * 0.20;
 						canvas.height = this.height * 0.20;
 						var context = canvas.getContext("2d");
 						//context.scale(200/this.width,  200/this.height);
 						context.scale(0.15, 0.15);
 						// context.scale(0.25, 0.25);
 						context.drawImage(this, 0, Ypos);
 						---------------------*/

 						var sImageData = canvas.toDataURL("image/png");
 						oPDF.addImage(sImageData, 'PNG', 10, 10, undefined, undefined, undefined, 'FAST',0);
 						Ypos = canvas.height + 10;
 						that.wasBillCreatedfromImage = true;
 						//document.body.removeChild(canvas);
 						that.createPDFFromImages(oPDF, fileIndex + 1, totalcount, Ypos);

 					});

 				};

 				reader.onload = function (e) {
 					img.src = reader.result;
 				};
 				reader.onerror = function (e) {
 					sap.m.MessageToast.show("error");
 				};

 			}

 		},

 		//===========================================================
 		//Callback function for the Deleteion from the File Collection does not work hence 
 		//Hence we are comparing and perform cleanup of the "FileReaderIds".
 		//https://github.com/SAP/openui5/issues/1152

 		cleanupFileReaderIds: function () {

 			var FileArrayIDS = this.getView().getModel("FileReaderModel").getProperty("/FileReaderIds");
 			var FileArrayTotalcount = FileArrayIDS.length;

 			var oUploadCollection = this.getView().byId("uploadColl");
 			var uploadCollectionCount = oUploadCollection.getItems().length;

 			// this.getView().byId("uploadCollTitle").setText("Attach Bills (" + uploadCollectionCount + ")");

 			var latestFileIDS = [];
 			//We are interested only in those items which are present in the UploadCollection 	

 			for (var outerLoop = 0; outerLoop < uploadCollectionCount; outerLoop++) {
 				var fileName_UC = oUploadCollection.getItems()[outerLoop].getFileName();
 				for (var innerLoop = 0; innerLoop < FileArrayTotalcount; innerLoop++) {
 					//Code Changed by RaviTiwari. Handle IPhone Same image replication issue
 					if (FileArrayIDS[innerLoop].File.name === fileName_UC) {
 						if (FileArrayIDS[innerLoop].isConsider === "false") {
 							latestFileIDS.push(FileArrayIDS[innerLoop]);
 							FileArrayIDS[innerLoop].isConsider = "true";
 							innerLoop = FileArrayTotalcount + 1; //Break the inner loop
 						}
 					}
 					//Original code
 					// if (FileArrayIDS[innerLoop].name === fileName_UC) {
 					// 	latestFileIDS.push(FileArrayIDS[innerLoop]);
 					// 	innerLoop = FileArrayTotalcount + 1; //Break the inner loop
 					// }
 				}
 			}

			 //Only in case of IOS Sequence is correct for all other we need to reverse it
              if (!sap.ui.Device.os.ios )
                 latestFileIDS.reverse();

 
 			//Code Changed by RaviTiwari. Handle IPhone Same image replication issue
 			//Reset the flags for use in subsequenet runs.
 			if (latestFileIDS.length > 0) {
 				for (var j = 0; j < latestFileIDS.length; j++) {
 					latestFileIDS[j].isConsider = "false";
 				}
 				this.getView().getModel("FileReaderModel").setProperty("/FileReaderIds", latestFileIDS);
 			}

 		},

 		//===========================================================
 		//Callback function for the Deleteion from the File Collection does not work hence 
 		//Hence we are comparing and perform cleanup of the "FileReaderIds".
 		//https://github.com/SAP/openui5/issues/1152

 		cleanupApprovalFileReaderIds: function () {

 			var FileArrayIDS = this.getView().getModel("FileReaderModel").getProperty("/ApprovalFileReaderIds");
 			var FileArrayTotalcount = FileArrayIDS.length;

 			var oUploadCollection = this.getView().byId("delayUploadColl");
 			var uploadCollectionCount = oUploadCollection.getItems().length;

 			// this.getView().byId("delayUploadCollTitle").setText("Attach Delay Approval (" + uploadCollectionCount + ")");

 			var latestFileIDS = [];
 			//We are interested only in those items which are present in the UploadCollection 	

 			for (var outerLoop = 0; outerLoop < uploadCollectionCount; outerLoop++) {
 				var fileNameUC = oUploadCollection.getItems()[outerLoop].getFileName();
 				for (var innerLoop = 0; innerLoop < FileArrayTotalcount; innerLoop++) {
 					if (FileArrayIDS[innerLoop].name === fileNameUC) {
 						//latestFileIDS.push(FileArrayIDS[innerLoop]);
 						//innerLoop = FileArrayTotalcount + 1; //Break the inner loop

 						//Code Changed by RaviTiwari. Handle IPhone Same image replication issue
 						if (FileArrayIDS[innerLoop].isConsider === "false") {
 							latestFileIDS.push(FileArrayIDS[innerLoop]);
 							FileArrayIDS[innerLoop].isConsider = "true";
 							innerLoop = FileArrayTotalcount + 1; //Break the inner loop
 						}
 					}
 				}
 			}
 			
	   //Only in case of IOS Sequence is correct for all other we need to reverse it
              if (!sap.ui.Device.os.ios )
                  latestFileIDS.reverse();

 
 			//Code Changed by RaviTiwari. Handle IPhone Same image replication issue
 			//Reset the flags for use in subsequenet runs.
 			if (latestFileIDS.length > 0) {
 				for (var j = 0; j < latestFileIDS.length; j++) {
 					latestFileIDS[j].isConsider = "false";
 				}
 				this.getView().getModel("FileReaderModel").setProperty("/ApprovalFileReaderIds", latestFileIDS);
 			}
 			// Original code
 			// if (latestFileIDS.length > 0)
 			// 	this.getView().getModel("FileReaderModel").setProperty("/ApprovalFileReaderIds", latestFileIDS);
 		},

 		onReview: function () {
 			// //validatiom of delay bills
 			// var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 			// var delay =	btnModel.getProperty("/showDelayed");
 			// var delayfiles = this.getView().byId("delayUploadColl").getItems().length;
 			// 	if((delay === true) &(delayfiles === 0)){
 			// 			MessageBox.error("Please Attach the Delay Approval file", {
 			// 			title: "Alert",
 			// 			icon: sap.m.MessageBox.Icon.ERROR,
 			// 		});
 			// 		return;
 			// 	}
 			// validation of normal bills
 			var pdfFileInfo = {
 				"PDFFiles": []
 			};
 			var pdfFileModel = this.getOwnerComponent().getModel("OriginalPdfFiles");
 			pdfFileModel.setData(pdfFileInfo);

 			scenario = "Review";
 			var attchedFiles = this.getView().byId("uploadColl").getItems().length;

 			// if (attchedFiles > 0) {

 				sap.ui.core.BusyIndicator.show(0);
 				this.cleanupFileReaderIds();
 				this.cleanupApprovalFileReaderIds();
 				this.CurrentFileReadersIDS = this.getView().getModel("FileReaderModel").getProperty("/FileReaderIds");
 				this.totalcount = this.CurrentFileReadersIDS.length;
 				if (this.totalcount > 0) {
 					var oPDF = new jsPDF("p", "mm", "a4", true, true);
 				}

 				this.createPDFFromImages(oPDF, 0, this.totalcount, 0);
 			// } else {
 			// 	this.getOwnerComponent().getRouter().navTo("review");
 			// }
 		},

 		onDeleteApprovalPDF: function () {
 			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 			var prevPdf = btnModel.setProperty("/prevAppPdf", false);
 		},

 		onDeletePDF2: function () {
 			var btnModel = this.getOwnerComponent().getModel("buttonsModel");
 			var prevPdf = btnModel.setProperty("/prevPdf", false);
 		},

 		onPreview: function () {
 			var pdfFileInfo = {
 				"PDFFiles": []
 			};
 			var pdfFileModel = this.getOwnerComponent().getModel("OriginalPdfFiles");
 			pdfFileModel.setData(pdfFileInfo);

 			scenario = "Preview";
 			var attchedFiles = this.getView().byId("uploadColl").getItems().length;

 			if (attchedFiles > 0) {

 				sap.ui.core.BusyIndicator.show(0);
 				this.cleanupFileReaderIds();
 				this.CurrentFileReadersIDS = this.getView().getModel("FileReaderModel").getProperty("/FileReaderIds");
 				this.totalcount = this.CurrentFileReadersIDS.length;
 				if (this.totalcount > 0) {
 					var oPDF = new jsPDF("p", "mm", "a4", true, true);
 				}
 				this.createPDFFromImages(oPDF, 0, this.totalcount, 0);

 			} else {
 				MessageBox.error("Please add a file to Preview");
 			}
 		},

 		loadPreview: function (payload) {
 			var model = this.getOwnerComponent().getModel("InitialModel");
 			var self = this;
 			model.create("/Attach_MergeSet", payload, {

 				success: function (data) {
 					sap.ui.core.BusyIndicator.hide();
 					self.bindPDF(data);
 				},
 				error: function (err) {
 					sap.ui.core.BusyIndicator.hide();
 					MessageBox.error("Error while calling oData Service");
 				}
 			});
 		},

 		onBeforeRendering: function () {
 			var aItems = this.byId("delayUploadColl").getItems();
 			var bItems = this.byId("uploadColl").getItems();
 			// this.getView().byId("delayUploadCollTitle").setText("Attach Delay Approval (" + aItems.length + ")");
 			// this.getView().byId("uploadCollTitle").setText("Attach Bills (" + aItems.length + ")");
 		},

 		onBeforeUploadStarts: function (oEvent) {
 			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
 				name: "slug",
 				value: oEvent.getParameter("fileName")
 			});
 			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
 			oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);
 		},

 		onUploadComplete: function (event) {
 			var that = this;
 		},

 		onFileSizeExceed: function (evt) {
 			MessageToast.show("File Size Exceeded");
 		},

 		onTypeMissmatch: function (evt) {
 			MessageBox.show("This File Type is not supported!!");
 		},

 		onTypeMissmatchD: function (evt) {
 			MessageBox.show("This File Type is not supported!!");
 		},
 		onFilenameLengthExceed: function (evt) {
 			MessageToast.show("Long File Path/Name not supported!!");
 		},

 		onFileDeleted: function (evt) {
 			var src = evt.getSource();
 			MessageToast.show("File Deleted");
 		},

 		deletePress: function (event) {
 			var src = event.getSource();
 		},

 		onFileDeletedD: function (event) {
 			var src = event.getSource();
 			MessageToast.show("File Deleted");
 		}

 	});

 });