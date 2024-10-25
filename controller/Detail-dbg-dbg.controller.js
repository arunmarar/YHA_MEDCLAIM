sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/formatter", "sap/m/library", "sap/ui/core/Fragment", "sap/m/MessageBox", "sap/m/MessageToast"], 
function (e, t, a, i, s, r, o) {
    "use strict";
    var l = [];
    var d, n, g;
    var y = i.URLHelper;
    return e.extend("Gail.Medical_Claim.controller.Detail", {
        formatter: a,
        onInit: function () {
            var model = new sap.ui.model.json.JSONModel({
                
                data: [
                  { key: "No", text: "No" },
                  { key: "Yes", text: "Yes" }
                ]
              });
              this.setModel(model);
            var e = new t({
                busy: false,
                delay: 0
            });
            var a = this.getOwnerComponent().getModel("RouteModel");
            a.setProperty("/split", true);
            a.setProperty("/normal", false);
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(e, "detailView");
            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
            //changes by Usmana starts here
            var patientModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(patientModel,"patientModel");
            var gModel = this.getOwnerComponent().getModel();
            var that = this;
            //sap.ui.core.BusyIndicator.show();
            gModel.read("/f4_patientSet", {
                success: function (data) {
                    sap.ui.core.BusyIndicator.hide();
                    //var filteredData = data.results.filter(lineItem => {
                    //    var isChild = lineItem.Text.includes("Child");
                    //    let data = lineItem.Text.match(/\(( \d+ )\)/);
                    //    if(data) {
                    //        data = parseInt(data[1]);
                    //       if(isChild) return data <= 31;
                    //        else return data > 0;
                    //    }
                    //})
                    //that.getView().getModel("patientModel").setProperty("/patientData", filteredData);
                    that.getView().getModel("patientModel").setProperty("/patientData", data.results);
                },
                error: function (e) {
                    r.error("Error while loading patient data");
                    sap.ui.core.BusyIndicator.hide();
                }
            });
            //changes by Usmana ends here

        },
        onSendEmailPress: function () {
            var e = this.getModel("detailView");
            y.triggerEmail(null, e.getProperty("/shareSendEmailSubject"), e.getProperty("/shareSendEmailMessage"))
        },
        _onObjectMatched: function (e) {
            var t = e.getParameter("arguments").objectId;
            g = atob(t);
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            if (sap.ui.Device.system.phone) {
                this.getOwnerComponent().getModel("buttonsModel").setProperty("/navbackDetail", true)
            } else {
                this.getOwnerComponent().getModel("buttonsModel").setProperty("/navbackDetail", false)
            }
            var a = this.getOwnerComponent().getModel("RouteModel");
            a.setProperty("/split", true);
            a.setProperty("/normal", false);


            // changes started by Usmana          
            var oModel = this.getView().getModel('InitialModel');
            var a = 0;
            var that = this;
            oModel.read("/EMP_FAMILY_DETAILSSet",{
                success: function(oSuccess){
                    var empFamDetails = that.getOwnerComponent().getModel("empFamDetails");
                    empFamDetails.setData(oSuccess.results);
                },
                error: function(oError){
                    alert('Error');
                }
            })
            // changes ended by Usmana

            if (g == "0") {
                d = "Create";
                var i = this.getView().byId("detailPage");
                i.removeAllContent();
                this.getView().byId("itemName").setSelectedKey("");
                l = [];
                var s = this.getOwnerComponent().getModel("detailMasterModel");
                s.setData(l);
                var r = this.getOwnerComponent().getModel("buttonsModel");
                r.setProperty("/rSaveDraft", true);
                r.setProperty("/rSubmit", true);
                r.setProperty("/mAdd", false);
                r.setProperty("/mReview", false);
                r.setProperty("/dAdd", true);
                r.setProperty("/dSave", false);
                r.setProperty("/dClear", true);
                r.setProperty("/dEdit", false);
                r.setProperty("/dSelect", true);
                r.setProperty("/mDelete", false)
            } else if (g == "1") {
                d = "Create";
                var i = this.getView().byId("detailPage");
                i.removeAllContent();
                this.getView().byId("itemName").setSelectedKey("");
                var r = this.getOwnerComponent().getModel("buttonsModel");
                r.setProperty("/dAdd", true);
                r.setProperty("/dSave", false);
                r.setProperty("/dClear", true);
                r.setProperty("/dEdit", false);
                r.setProperty("/dSelect", true);
                r.setProperty("/mDelete", false)
            } else {
                this.ItemDisplay()
            }
        },
        ItemDisplay: function () {
            var e = this.getOwnerComponent().getModel("buttonsModel");
            e.setProperty("/dEdit", true);
            e.setProperty("/dAdd", false);
            e.setProperty("/dSave", false);
            e.setProperty("/dClear", false);
            e.setProperty("/dSelect", false);
            var t = e.getProperty("/showEdit");
            if (!t) {
                e.setProperty("/dEdit", false);
                e.setProperty("/mDelete", false)
            } else {
                e.setProperty("/mAdd", true);
                e.setProperty("/dEdit", true);
                e.setProperty("/mDelete", true)
            }
            d = "Display";
            l = this.getOwnerComponent().getModel("detailMasterModel").getData();
            var a = this.getOwnerComponent().getModel("detailMasterModel").getObject(g).C04t3;
            switch (a) {
                case "CON":
                    a = "Consultation";
                    break;
                case "MED":
                    a = "Medicines";
                    break;
                case "TST":
                    a = "Tests";
                    break;
                case "HOS":
                    a = "Hospitalization";
                    break;
                case "TRV":
                    a = "Travel";
                    break;
                case "OTH":
                    a = "Others";
                    break
            }
            n = a;
            var i = n + d;
            this._showFormFragment(i);
            var s = this.getView().byId("form" + i);
            s.bindElement("detailMasterModel>" + g)
        },
        _onMetadataLoaded: function () {
            var e = this.getView().getBusyIndicatorDelay(),
                t = this.getModel("detailView");
            t.setProperty("/delay", 0);
            t.setProperty("/busy", true);
            t.setProperty("/delay", e)
        },
        onItemSelection: function (e) {
            var t = e.getParameter("selectedItem").getText();
            var a = e.getSource().getProperty("selectedKey");
            if (t == "Travel Expenses") {
                t = "Travel"
            } else if (t == "") {
                return
            }
            t = t + d;
            this._showFormFragment(t);
            this.formatdate(a)
        },
        _formFragments: {},
        _showFormFragment: function (e) {
            var t = this.getView().byId("detailPage");
            t.removeAllContent();
            t.insertContent(this._getFormFragment(e))
        },
        _getFormFragment: function (e) {
            var t = this._formFragments[e];
            if (t) {
                return t
            }
            var t = sap.ui.xmlfragment(this.getView().getId(), "Gail.Medical_Claim.view." + e, this);
            this._formFragments[e] = t;
            return this._formFragments[e]
        },
        formatdate: function (e) {
            switch (e) {
                case "CON":
                    this.getView().byId("cClaimDate").setMaxDate(new Date);
                    break;
                case "MED":
                    this.getView().byId("mClaimDate").setMaxDate(new Date);
                    break;
                case "TST":
                    this.getView().byId("tClaimDate").setMaxDate(new Date);
                    break;
                case "HOS":
                    this.getView().byId("hDateFrom").setMaxDate(new Date);
                    this.getView().byId("hDateTo").setMaxDate(new Date);
                    break;
                case "TRV":
                    this.getView().byId("teDepDate").setMaxDate(new Date);
                    this.getView().byId("teArvlDate").setMaxDate(new Date);
                    break;
                case "OTH":
                    this.getView().byId("oClaimDate").setMaxDate(new Date);
                    break
            }
        },
        onchangeNextDate: function (e) {
            var t = this;
            var a = e.getSource();
            t._validateInput(a);
            var i = e.getSource().getProperty("dateValue");
            var s = e.getSource().getId().slice(53);
            switch (s) {
                case "hDateFrom":
                    this.getView().byId("hDateTo").setMinDate(i);
                    break;
                case "hDateFromE":
                    this.getView().byId("hDateToE").setMinDate(i);
                    break;
                case "teDepDate":
                    this.getView().byId("teArvlDate").setMinDate(i);
                    break;
                case "teDepDateE":
                    this.getView().byId("teArvlDateE").setMinDate(i);
                    break
            }
        },
        onConsultationTypeChange: function (e) {
            sap.ui.core.BusyIndicator.show(0);
            var t = e.getSource().getSelectedKey();
            var a = this.getOwnerComponent().getModel("InitialModel");
            if (t === "CD") {
                this.getView().byId("cReqAmt").setEditable(false);
                this.getView().byId("cReqAmt").setValue("0")
            } else {
                this.getView().byId("cReqAmt").setEditable(true);
                this.getView().byId("cReqAmt").setValue("")
            }
            var i = this;
            var s = [];
            var o = new sap.ui.model.Filter("Soval", sap.ui.model.FilterOperator.EQ, t);
            s.push(o);
            a.read("/F4_DOC_CATSet", {
                filters: s,
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    var t = i.getOwnerComponent().getModel("docModel");
                    t.setData(e.results);
                    i.getView().byId("cDocCatalog").setModel(t, "docModel")
                },
                error: function (e) {
                    r.error("Error while loading doc Catalog.");
                    sap.ui.core.BusyIndicator.hide()
                }
            });
            if (t) {
                e.getSource().setValueState("None")
            } else {
                e.getSource().setValueState("Error")
            }
        },
        onConsultationTypeEdit: function (e) {
            sap.ui.core.BusyIndicator.show(0);
            var t = e.getSource().getSelectedKey();
            var a = this.getOwnerComponent().getModel("InitialModel");
            if (t === "CD") {
                this.getView().byId("cReqAmtE").setEditable(false);
                this.getView().byId("cReqAmtE").setValue("0")
            } else {
                this.getView().byId("cReqAmtE").setEditable(true);
                this.getView().byId("cReqAmtE").setValue("")
            }
            var i = this;
            var s = [];
            var o = new sap.ui.model.Filter("Soval", sap.ui.model.FilterOperator.EQ, t);
            s.push(o);
            a.read("/F4_DOC_CATSet", {
                filters: s,
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    var t = i.getOwnerComponent().getModel("docModel");
                    t.setData(e.results);
                    i.getView().byId("cDocCatalogE").setModel(t, "docModel")
                },
                error: function (e) {
                    r.error("Error while loading doc Catalog.");
                    sap.ui.core.BusyIndicator.hide()
                }
            });
            if (t) {
                e.getSource().setValueState("None")
            } else {
                e.getSource().setValueState("Error")
            }
        },
        onOtherClaimTypeChange: function (e) {
            var t = e.getSource().getSelectedKey();
            if (t) {
                e.getSource().setValueState("None")
            } else {
                e.getSource().setValueState("Error")
            }
            if (t === "OT") {
                this.getView().byId("otherFreeText").setVisible(true);
                this.getView().byId("otherFreeText").setValue("")
            } else {
                this.getView().byId("otherFreeText").setVisible(false);
                this.getView().byId("otherFreeText").setValue("")
            }
        },
        onOtherClaimTypeChangeEdit: function (e) {
            var t = e.getSource().getSelectedKey();
            if (t) {
                e.getSource().setValueState("None")
            } else {
                e.getSource().setValueState("Error")
            }
            if (t === "OT") {
                this.getView().byId("otherFreeTextE").setVisible(true);
                this.getView().byId("otherFreeTextE").setValue("")
            } else {
                this.getView().byId("otherFreeTextE").setVisible(false);
                this.getView().byId("otherFreeTextE").setValue("")
            }
        },
        onSave: function () {
            let pattern = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
            var e = this.getOwnerComponent().getModel("detailMasterModel").getObject(g).C04t3;
            var t = false;
            var a = this;
            switch (e) {
                case "CON":
                    var cov = this.getView().byId("covidRequestCons_edit").getSelectedKey();
                    
                    
                    var y = this.getView().byId("cConsultNumberE").getValue();
                    
                   
                    var letter = y.charAt(0);
                    
                    if(pattern.test(letter)){
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if(pattern.test(y.charAt(y.length - 1))){
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    var i = this.getView().byId("cClaimDateE").getProperty("dateValue");
                    var s = [this.getView().byId("cPatientE"), this.getView().byId("cClaimDateE"), this.getView().byId("cPhysicianE"), this.getView().byId("cConsultationTypeE"), this.getView().byId("cDocCatalogE"), this.getView().byId("cConsultNumberE"), this.getView().byId("cOutStationE"), this.getView().byId("cCityTypeE"), this.getView().byId("cPlaceE"), this.getView().byId("cReqAmtE")];
                    jQuery.each(s, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }
                    var o = new Date(i);
                    o.setMinutes(30);
                    o.setHours(5);
                    i = o;
                    this.getView().byId("cClaimDateE").setProperty("dateValue", i);
                    break;
                case "MED":
                    var cov = this.getView().byId("covidRequestMed_edit").getSelectedKey();
                    
                    var y = this.getView().byId("mCashMemoE").getValue();
                    
                   
                    var letter = y.charAt(0);
                    
                    if(pattern.test(letter)){
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if(pattern.test(y.charAt(y.length - 1))){
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    var i = this.getView().byId("mClaimDateE").getProperty("dateValue");
                    var s = [this.getView().byId("mPatientE"), this.getView().byId("mClaimDateE"), this.getView().byId("mCashMemoE"), this.getView().byId("mReqAmtE")];
                    jQuery.each(s, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }
                    var o = new Date(i);
                    o.setMinutes(30);
                    o.setHours(5);
                    i = o;
                    this.getView().byId("mClaimDateE").setProperty("dateValue", i);
                    break;
                case "TST":

                    var y = this.getView().byId("tCashMemoE").getValue();

                   
                    var letter = y.charAt(0);
                    
                    if(pattern.test(letter)){
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if(pattern.test(y.charAt(y.length - 1))){
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    var i = this.getView().byId("tClaimDateE").getProperty("dateValue");
                    var l = this.getView().byId("tRecommendedE").getSelectedKey();
                    var s = [this.getView().byId("tPatientE"), this.getView().byId("tPatientE"), this.getView().byId("tCashMemoE"), this.getView().byId("tClinicNameE"), this.getView().byId("tParticularsE"), this.getView().byId("tEmpaneledE"), this.getView().byId("tRecommendedE"), this.getView().byId("tReqAmtE")];
                    jQuery.each(s, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }
                    var o = new Date(i);
                    o.setMinutes(30);
                    o.setHours(5);
                    i = o;
                    this.getView().byId("tClaimDateE").setProperty("dateValue", i);
                    if (l === "N") {
                        r.error("Claim cannot be submitted as it is not Recommended.", {
                            icon: r.Icon.ERROR,
                            title: "Alert"
                        });
                        return
                    }
                    break;
                case "HOS":

                    var cov = this.getView().byId("covidRequestHos_edit").getSelectedKey();
                    

                    var y = this.getView().byId("hCashMemoE").getValue();
                    
                   
                    var letter = y.charAt(0);
                    
                    if(pattern.test(letter)){
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if(pattern.test(y.charAt(y.length - 1))){
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    var d = this.getView().byId("hDateFromE").getProperty("dateValue");
                    var n = this.getView().byId("hDateToE").getProperty("dateValue");
                    var l = this.getView().byId("hRecommendedE").getSelectedKey();
                    var s = [this.getView().byId("hPatientE"), this.getView().byId("hDateFromE"), this.getView().byId("hDateToE"), this.getView().byId("hHospitalNameE"), this.getView().byId("hCashMemoE"), this.getView().byId("hTreatmentPlaceE"), this.getView().byId("hEmpaneledE"), this.getView().byId("hRecommendedE"), this.getView().byId("hReqAmtE")];
                    jQuery.each(s, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }
                    if (l === "N") {
                        r.error("Claim cannot be submitted as it is not Recommended.", {
                            icon: r.Icon.ERROR,
                            title: "Alert"
                        });
                        return
                    }
                    var o = new Date(d);
                    o.setMinutes(30);
                    o.setHours(5);
                    d = o;
                    this.getView().byId("hDateFromE").setProperty("dateValue", d);
                    var y = new Date(n);
                    y.setMinutes(30);
                    y.setHours(5);
                    n = y;
                    this.getView().byId("hDateToE").setProperty("dateValue", n);
                    break;
                case "TRV":
                    var h = this.getView().byId("teDepDateE").getProperty("dateValue");
                    var c = this.getView().byId("teArvlDateE").getProperty("dateValue");
                    var l = this.getView().byId("teRecommendedE").getSelectedKey();
                    var s = [this.getView().byId("tePatientE"), this.getView().byId("teDepDateE"), this.getView().byId("teDepPlaceE"), this.getView().byId("teArvlDateE"), this.getView().byId("teArvlPlaceE"), this.getView().byId("teTravelModeE"), this.getView().byId("teRecommendedE"), this.getView().byId("teReqAmtE")];
                    jQuery.each(s, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }
                    if (l === "N") {
                        r.error("Claim cannot be submitted as it is not Recommended.", {
                            icon: r.Icon.ERROR,
                            title: "Alert"
                        });
                        return
                    }
                    var o = new Date(h);
                    o.setMinutes(30);
                    o.setHours(5);
                    h = o;
                    this.getView().byId("teDepDateE").setProperty("dateValue", h);
                    var y = new Date(c);
                    y.setMinutes(30);
                    y.setHours(5);
                    c = y;
                    this.getView().byId("teArvlDateE").setProperty("dateValue", c);
                    break;
                case "OTH":
                    var y = this.getView().byId("oCashMemoE").getValue();
                   
                    var letter = y.charAt(0);
                    
                    if(pattern.test(letter)){
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if(pattern.test(y.charAt(y.length - 1))){
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    var i = this.getView().byId("oClaimDateE").getProperty("dateValue");
                    var l = this.getView().byId("oRecommendedE").getSelectedKey();
                    var s = [this.getView().byId("oPatientE"), this.getView().byId("oClaimDateE"), this.getView().byId("oPhysicianE"), this.getView().byId("oClaimTypeE"), this.getView().byId("oCashMemoE"), this.getView().byId("oParticularsE"), this.getView().byId("oOutStationE"), this.getView().byId("oCityTypeE"), this.getView().byId("oPlaceE"), this.getView().byId("oRecommendedE"), this.getView().byId("otherFreeTextE"), this.getView().byId("oReqAmtE")];
                    jQuery.each(s, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }
                    if (l === "N") {
                        r.error("Claim cannot be submitted as it is not Recommended.", {
                            icon: r.Icon.ERROR,
                            title: "Alert"
                        });
                        return
                    }
                    var o = new Date(i);
                    o.setMinutes(30);
                    o.setHours(5);
                    i = o;
                    this.getView().byId("oClaimDateE").setProperty("dateValue", i);
                    break
            }
            var u = this.getOwnerComponent().getModel("buttonsModel");
            u.setProperty("/dEdit", true);
            u.setProperty("/mAdd", true);
            u.setProperty("/mAttach", true);
            u.setProperty("/mDelete", true);
            if (sap.ui.Device.system.desktop) {
                this.ItemDisplay()
            } else {
                this.onCloseDetailPress();
                var u = this.getOwnerComponent().getModel("buttonsModel");
                u.setProperty("/dAdd", false);
                u.setProperty("/dSave", false);
                u.setProperty("/dClear", false);
                u.setProperty("/dSelect", false)
            }
        },
        onEdit: function (e) {

            
            var t = n + "Edit";
            var a = this.getView().byId("detailPage");
            a.removeAllContent();
            var i = this._formFragments[t];
            if (i) {
                a.insertContent(i)
            } else {
                var i = sap.ui.xmlfragment(this.getView().getId(), "Gail.Medical_Claim.view." + t, this);
                this._formFragments[t] = i;
                a.insertContent(this._formFragments[t])
            }
            var s = this.getView().byId("form" + t);
            s.bindElement("detailMasterModel>" + g);
            switch (n) {
                case "Consultation":
                    sap.ui.core.BusyIndicator.show(0);
                    this.getView().byId("cClaimDateE").setMaxDate(new Date);
                    var o = this.getView().byId("cConsultationTypeE").getSelectedKey();
                    var l = this;
                    var d = [];
                    var y = new sap.ui.model.Filter("Soval", sap.ui.model.FilterOperator.EQ, o);
                    d.push(y);
                    var h = this.getOwnerComponent().getModel("InitialModel");
                    h.read("/F4_DOC_CATSet", {
                        filters: d,
                        success: function (e) {
                            sap.ui.core.BusyIndicator.hide();
                            var a = l.getOwnerComponent().getModel("docModel");
                            a.setData(e.results);
                            var i = l.getView().byId("form" + t);
                            i.unbindElement("detailMasterModel");
                            i.bindElement("detailMasterModel>" + g)
                        },
                        error: function (e) {
                            r.error("Error while loading doc Catalog.");
                            sap.ui.core.BusyIndicator.hide()
                        }
                    });
                    break;
                case "Medicines":
                    this.getView().byId("mClaimDateE").setMaxDate(new Date);
                    break;
                case "Tests":
                    this.getView().byId("tClaimDateE").setMaxDate(new Date);
                    break;
                case "Hospitalization":
                    this.getView().byId("hDateFromE").setMaxDate(new Date);
                    this.getView().byId("hDateToE").setMaxDate(new Date);
                    break;
                case "Travel":
                    this.getView().byId("teDepDateE").setMaxDate(new Date);
                    this.getView().byId("teArvlDateE").setMaxDate(new Date);
                    break;
                case "Others":
                    this.getView().byId("oClaimDateE").setMaxDate(new Date);
                    break
            }
            var c = this.getOwnerComponent().getModel("buttonsModel");
            c.setProperty("/dAdd", false);
            c.setProperty("/dSave", true);
            c.setProperty("/dClear", false);
            c.setProperty("/dEdit", false);
            c.setProperty("/dSelect", false);
            c.setProperty("/mAdd", false);
            c.setProperty("/mAttach", false);
            c.setProperty("/mDelete", false)
        },
        clearData: function () {
            var e = this.getView().byId("itemName").getSelectedKey();
            switch (e) {
                case "CON":
                    this.getView().byId("cPatient").setSelectedKey("");
                    this.getView().byId("cClaimDate").setValue("");
                    this.getView().byId("cPhysician").setValue("");
                    this.getView().byId("cConsultationType").setSelectedKey("");
                    this.getView().byId("cDocCatalog").setSelectedKey("");
                    this.getView().byId("cConsultNumber").setValue("");
                    this.getView().byId("cOutStation").setSelectedKey("");
                    this.getView().byId("cCityType").setSelectedKey("");
                    this.getView().byId("cPlace").setValue("");
                    this.getView().byId("cReqAmt").setValue("");
                    break;
                case "MED":
                    this.getView().byId("mPatient").setSelectedKey("");
                    this.getView().byId("mClaimDate").setValue("");
                    this.getView().byId("mCashMemo").setValue("");
                    this.getView().byId("mParticulars").setValue("");
                    // this.getView().byId("ConsultDate").setValue("");
                    this.getView().byId("mReqAmt").setValue("");
                    break;
                case "TST":
                    this.getView().byId("tPatient").setSelectedKey("");
                    this.getView().byId("tClaimDate").setValue("");
                    this.getView().byId("tCashMemo").setValue("");
                    this.getView().byId("tClinicName").setValue("");
                    this.getView().byId("tParticulars").setValue("");
                    this.getView().byId("tEmpaneled").setSelectedKey("");
                    this.getView().byId("tRecommended").setSelectedKey("");
                    this.getView().byId("tReqAmt").setValue("");
                    break;
                case "HOS":
                    this.getView().byId("hPatient").setSelectedKey("");
                    this.getView().byId("hDateFrom").setValue("");
                    this.getView().byId("hDateTo").setValue("");
                    this.getView().byId("hHospitalName").setValue("");
                    this.getView().byId("hCashMemo").setValue("");
                    this.getView().byId("hTreatmentPlace").setValue("");
                    this.getView().byId("hEmpaneled").setSelectedKey("");
                    this.getView().byId("hRecommended").setSelectedKey("");
                    this.getView().byId("hReqAmt").setValue("");
                    break;
                case "TRV":
                    this.getView().byId("tePatient").setSelectedKey("");
                    this.getView().byId("teDepDate").setValue("");
                    this.getView().byId("teDepPlace").setValue("");
                    this.getView().byId("teArvlDate").setValue("");
                    this.getView().byId("teArvlPlace").setValue("");
                    this.getView().byId("teTravelMode").setValue("");
                    this.getView().byId("teReqAmt").setValue("");
                    break;
                case "OTH":
                    this.getView().byId("oPatient").setSelectedKey("");
                    this.getView().byId("oClaimDate").setValue("");
                    this.getView().byId("oCashMemo").setValue("");
                    this.getView().byId("oPhysician").setValue("");
                    this.getView().byId("oClaimType").setSelectedKey("");
                    this.getView().byId("oParticulars").setValue("");
                    this.getView().byId("oOutStation").setSelectedKey("");
                    this.getView().byId("oCityType").setSelectedKey("");
                    this.getView().byId("oPlace").setValue("");
                    this.getView().byId("oRecommended").setSelectedKey("Yes");
                    this.getView().byId("otherFreeText").setValue("");
                    this.getView().byId("oReqAmt").setValue("");
                    break
            }
        },
        _validateInput: function (e) {
            var t = "None";
            var a = false;
            var i = e.getMetadata().getName();
            if (!e.getVisible()) return;
            if (i === "sap.m.Select") {
                if (!e.getSelectedKey()) {
                    t = "Error";
                    a = true
                }
            } else if (i === "sap.m.Input") {
                if (!e.getValue()) {
                    t = "Error";
                    a = true
                }
            } else if (i === "sap.m.DatePicker") {
                if (!e.getValue()) {
                    t = "Error";
                    a = true
                }
            }
            e.setValueState(t);
            return a
        },
        ontextChange: function (e) {
            var t = this;
            var a = e.getSource();
            t._validateInput(a)
        },

        onOpenPrevReq: function(e) {
            var prevBillModel = this.getOwnerComponent().getModel("prevBills");
            prevBillModel.setData(e);
            sap.ui.getCore().setModel(prevBillModel,"PrevBills");
            
	if (e.length > 0){
            if (this._prevBill === null || typeof this._prevBill === 'undefined') {
                this._prevBill = sap.ui.xmlfragment("Gail.Medical_Claim.view.prevBill", this)
            }
            this._prevBill.open();
	}
	else{
		this.onAddItem();
	}
        },

        checkBoxEventHandler: function (e) {
            var t = sap.ui.getCore().byId("PrevCheckBox");
            var r = sap.ui.getCore().byId("btnAccept");
            if (t.getSelected()) r.setVisible(true);
            else r.setVisible(false)
        },
        onPrevBillCheck: function(){
            var e = this.getView().byId("itemName").getSelectedKey();
            let pattern = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
            var e = this.getView().byId("itemName").getSelectedKey();
            var t = false;
            var a = this;
            switch (e) {
                case "":
                    r.show("Please select an Item to Add!", {
                        title: "Dear User"
                    });
                    return;
                    break;

                case "CON":
                    var y = this.getView().byId("cConsultNumber").getValue();

                    var letter = y.charAt(0);

                    if (pattern.test(letter)) {
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if (pattern.test(y.charAt(y.length - 1))) {
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    var i = [this.getView().byId("cPatient"), this.getView().byId("cClaimDate"), this.getView().byId("cPhysician"), this.getView().byId("cConsultationType"), this.getView().byId("cDocCatalog"), this.getView().byId("cConsultNumber"), this.getView().byId("cOutStation"), this.getView().byId("cCityType"), this.getView().byId("cPlace"), this.getView().byId("cReqAmt"), this.getView().byId("covidRequestCons_create")];
                    jQuery.each(i, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }

                    var s = this.getView().byId("cPatient").getSelectedKey();
                    var o = this.getView().byId("cClaimDate").getProperty("dateValue");

                    break;

                case "MED":
                    var s = this.getView().byId("mPatient").getSelectedKey();
                    var o = this.getView().byId("mClaimDate").getProperty("dateValue");
                    var w = this.getView().byId("mCashMemo").getValue();

                    var letter = w.charAt(0);
                    
                    if(pattern.test(letter)){
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if(pattern.test(w.charAt(w.length - 1))){
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    var i = [this.getView().byId("mPatient"), this.getView().byId("mClaimDate"), this.getView().byId("mCashMemo"), this.getView().byId("mReqAmt"),  this.getView().byId("covidRequestMed_create")];
                    jQuery.each(i, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }

                    break;

                case "TST":
                    var s = this.getView().byId("tPatient").getSelectedKey();
                    var o = this.getView().byId("tClaimDate").getProperty("dateValue");
                    var w = this.getView().byId("tCashMemo").getValue();

                   
                   
                    var letter = w.charAt(0);
                    
                    if(pattern.test(letter)){
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if(pattern.test(w.charAt(w.length - 1))){
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    var i = [this.getView().byId("tPatient"), this.getView().byId("tClaimDate"), this.getView().byId("tCashMemo"), this.getView().byId("tClinicName"), this.getView().byId("tParticulars"), this.getView().byId("tEmpaneled"), this.getView().byId("tRecommended"), this.getView().byId("tReqAmt")];
                    jQuery.each(i, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }

                    break;

                case "HOS":    

                var s = this.getView().byId("hPatient").getSelectedKey();
                    var P = this.getView().byId("hDateFrom").getProperty("dateValue");
		    var o = this.getView().byId("hDateFrom").getProperty("dateValue");		
                    var D = this.getView().byId("hDateTo").getProperty("dateValue");
                    var M = this.getView().byId("hHospitalName").getValue();
                    var w = this.getView().byId("hCashMemo").getValue();
                    //
                    var c = this.getView().byId("covidRequestHos_create").getSelectedKey();
                    // if (c == "Yes"){
                    //     this.getOwnerComponent().getModel("buttonsModel").setProperty("/covidExp",true);
                    // }
                   
                    var letter = w.charAt(0);
                    
                    if(pattern.test(letter)){
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if(pattern.test(w.charAt(w.length - 1))){
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    
                    var f = this.getView().byId("hTreatmentPlace").getValue();
                    var v = this.getView().byId("hEmpaneled").getSelectedKey();
                    var C = this.getView().byId("hRecommended").getSelectedKey();
                    var m = this.getView().byId("hReqAmt").getValue();
                    var E = this.getView().byId("hTaxExmp").getSelectedKey();
                    var i = [this.getView().byId("hPatient"), this.getView().byId("hDateFrom"), this.getView().byId("hDateTo"), this.getView().byId("hHospitalName"), this.getView().byId("hCashMemo"), this.getView().byId("hTreatmentPlace"), this.getView().byId("hEmpaneled"), this.getView().byId("hRecommended"), this.getView().byId("hReqAmt"), this.getView().byId("hTaxExmp"),this.getView().byId("covidRequestHos_create")];
                    jQuery.each(i, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }

                    break;

                case "TRV":

                    var i = [this.getView().byId("tePatient"), this.getView().byId("teDepDate"), this.getView().byId("teDepPlace"), this.getView().byId("teArvlDate"), this.getView().byId("teArvlPlace"), this.getView().byId("teTravelMode"), this.getView().byId("teRecommended"), this.getView().byId("teReqAmt")];
                    jQuery.each(i, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }
                    break;

                case "OTH":

                    var s = this.getView().byId("oPatient").getSelectedKey();
                    var o = this.getView().byId("oClaimDate").getProperty("dateValue");
                    var d = this.getView().byId("oPhysician").getValue();
                    var O = this.getView().byId("oClaimType").getSelectedKey();
                    var w = this.getView().byId("oCashMemo").getValue();

                    var letter = w.charAt(0);
                    
                    if(pattern.test(letter)){
                        sap.m.MessageBox.error("Bill Number can not start with special characters.");
                        return
                    }

                    if(pattern.test(w.charAt(w.length - 1))){
                        sap.m.MessageBox.error("Bill Number can not end with special characters.");
                        return
                    }

                    var i = [this.getView().byId("oPatient"), this.getView().byId("oClaimDate"), this.getView().byId("oPhysician"), this.getView().byId("oClaimType"), this.getView().byId("oCashMemo"), this.getView().byId("oParticulars"), this.getView().byId("oOutStation"), this.getView().byId("oCityType"), this.getView().byId("oPlace"), this.getView().byId("oRecommended"), this.getView().byId("otherFreeText"), this.getView().byId("oReqAmt")];
                    jQuery.each(i, function (e, i) {
                        t = a._validateInput(i) || t
                    });
                    if (t) {
                        r.alert("Please Fill All Input Fields.");
                        return
                    }

                    break;
                
                }
		
		if(e == "TRV"){
			this.onAddItem();
		}

		else{

                var dateVal = "";
                var monthValStr = "";
                var monthVal = o.getMonth() + 1;
                if (monthVal <= 9) {
                    monthValStr =  "0" + monthVal.toString(); }
                else 
                {
                    monthValStr =   monthVal.toString();
                }
                if (o.getDate() <= 9){
                    dateVal = "0" +o.getDate().toString();}
                else{  dateVal = o.getDate().toString(); }

                var selDate = o.getFullYear() + monthValStr + dateVal;

                    var filters = [];
                 
                    var oFilter1 = [new sap.ui.model.Filter("Retyp", sap.ui.model.FilterOperator.EQ, e),
                                    new sap.ui.model.Filter("fcnam", sap.ui.model.FilterOperator.EQ, s),
                                    new sap.ui.model.Filter("CDT01", sap.ui.model.FilterOperator.EQ, selDate)];
                    var allFilters = new sap.ui.model.Filter(oFilter1, true); //here false will give OR and true will give AND

                    filters.push(allFilters);
                 
                    var that = this;
                    this.getOwnerComponent().getModel("InitialModel").read("/PREV_BILLSet", {
                        filters: filters,
                        success: function (e) {
                            that.onOpenPrevReq(e.results);
                        },
                        error: function (e) {
                            sap.ui.core.BusyIndicator.hide();
                            i.show("Error Connecting odata service to backend")
                        }
                    })
		}
                
        },

        

        onContinuePrevReq: function (e) {
            this._prevBill.close();
            this.onAddItem();
        },

        onPrevBillDialog: function (e) {
            sap.ui.core.BusyIndicator.hide();
            this._prevBill.close()
        },


        onAddItem: function () {
            let pattern = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
            var e = this.getView().byId("itemName").getSelectedKey();
            var t = false;
            var a = this;
            switch (e) {
                case "":
                    r.show("Please select an Item to Add!", {
                        title: "Dear User"
                    });
                    return;
                    break;
                case "CON":
                    // SOC by Aishwarya for Bill number validation
                    var y = this.getView().byId("cConsultNumber").getValue();
                    //y = y.replaceAll('.', '');
                   

                    //EOC by Aishwarya for BIll Num validation

                
                    // 
                    var cov = this.getView().byId("covidRequestCons_create").getSelectedKey();
                    // if (cov == "Yes"){
                    //     this.getOwnerComponent().getModel("buttonsModel").setProperty("/covidExp",true);
                    // }
                    var s = this.getView().byId("cPatient").getSelectedKey();
                    var o = this.getView().byId("cClaimDate").getProperty("dateValue");
                    var d = this.getView().byId("cPhysician").getValue();
                    var n = this.getView().byId("cConsultationType").getSelectedKey();
                    var g = this.getView().byId("cDocCatalog").getSelectedKey();
                    var y = this.getView().byId("cConsultNumber").getValue();
                    var h = this.getView().byId("cOutStation").getSelectedKey();
                    var c = this.getView().byId("cCityType").getSelectedKey();
                    var u = this.getView().byId("cPlace").getValue();
                    var m = this.getView().byId("cReqAmt").getValue();
                    var V = new Date(o);
                    V.setMinutes(30);
                    V.setHours(5);
                    o = V;
                    var b = {
                        C04t3: "CON",
                        Fcnam: s,
                        Famsa: "",
                        Fasex: "",
                        Favor: "",
                        Fanam: "",
                        Age: "",
                        Cdt01: o,
                        ConsultNo: y,
                        Physician: d,
                        Place: u,
                        CityType: c,
                        Outstation: h,
                        OutstationTxt: "",
                        Empaneled: "",
                        Recommended: "",
                        C04t4: n,
                        C04t5: g,
                        C04t4Txt: "",
                        C04t5Txt: "",
                        Rqamt: m,
                        Apamt: "0",
                        C10t3: cov
                    };
                    l.push(b);
                    break;
                case "MED":
                    var s = this.getView().byId("mPatient").getSelectedKey();
                    var o = this.getView().byId("mClaimDate").getProperty("dateValue");
                    var w = this.getView().byId("mCashMemo").getValue();
                     //
                     var c = this.getView().byId("covidRequestMed_create").getSelectedKey();
                    //  if (c == "Yes"){
                    //     this.getOwnerComponent().getModel("buttonsModel").setProperty("/covidExp",true);
                    // }
                   
                  

                    
                    var I = this.getView().byId("mParticulars").getValue();
                    // var I = this.getView().byId("ConsultDate").getValue()
                    // var I = this.getView().byId("ConsultDate").getProperty("dateValue");


                    var m = this.getView().byId("mReqAmt").getValue();
                    
                    var V = new Date(o);
                    V.setMinutes(30);
                    V.setHours(5);
                    o = V;
                    //I = V;
                    var b = {
                        C04t3: "MED",
                        Fcnam: s,
                        Famsa: "",
                        Fasex: "",
                        Favor: "",
                        Fanam: "",
                        Age: "",
                        Cdt01: o,
                        ConsultNo: w,
                        Particulars: I,
                        Rqamt: m,
                        Apamt: "0",
                        C10t3: c
                    };
                    l.push(b);
                     
                    // changes started by Usmana
                    
                     var oModel = this.getView().getModel('InitialModel');
                     var a = 0;
                     var that = this;
                     var oInvoiceDataModel = this.getOwnerComponent().getModel('invoiceDate');
                     var oInvoiceDate = this.getView().byId("mClaimDate").getProperty("dateValue");
                     var invoiceDate = {"invoiceDate": oInvoiceDate};
                     oInvoiceDataModel.setData(invoiceDate);
                     sap.ui.getCore().setModel(oInvoiceDataModel,"invoiceDate");

                     oModel.read("/EMP_FAMILY_DETAILSSet",{
                         success: function(oSuccess){
                           //Changes by Usmana starts here
                             var oEmpFamilyResult = oSuccess.results;
 
                             oEmpFamilyResult.forEach( function(){
 
                                 
                                 if(oEmpFamilyResult[a].TEXT === b.Fcnam){
                                     b.Fasex = oEmpFamilyResult[a].FASEX;
                                     b.Famsa = oEmpFamilyResult[a].FAMSA;
                                     b.Age = oEmpFamilyResult[a].AGE;
                                 }
 
                                 a = a + 1;
 
                             });
                             var empFamDetails = that.getOwnerComponent().getModel("empFamDetails");
                             empFamDetails.setData(oSuccess.results);
 
                            //Changes by Usmana ends here
                         },
                         error: function(oError){
                             alert('Error');
                         }
                     })
 
                     // changes ended by Usmana
 
                    break;
                case "TST":
                    var s = this.getView().byId("tPatient").getSelectedKey();
                    var o = this.getView().byId("tClaimDate").getProperty("dateValue");
                    var w = this.getView().byId("tCashMemo").getValue();

                    
                    var p = this.getView().byId("tClinicName").getValue();
                    var I = this.getView().byId("tParticulars").getValue();
                    var v = this.getView().byId("tEmpaneled").getSelectedKey();
                    var C = this.getView().byId("tRecommended").getSelectedKey();
                    var m = this.getView().byId("tReqAmt").getValue();
                    
                    var V = new Date(o);
                    V.setMinutes(30);
                    V.setHours(5);
                    o = V;
                    if (C === "N") {
                        r.error("Claim cannot be submitted as it is not Recommended.", {
                            icon: r.Icon.ERROR,
                            title: "Alert"
                        });
                        return
                    }
                    var b = {
                        C04t3: "TST",
                        Fcnam: s,
                        Famsa: "",
                        Fasex: "",
                        Favor: "",
                        Fanam: "",
                        Age: "",
                        Cdt01: o,
                        ConsultNo: w,
                        ClinicName: p,
                        Particulars: I,
                        Empaneled: v,
                        Recommended: C,
                        Rqamt: m,
                        Apamt: "0"
                    };
                    l.push(b);
                    break;
                case "HOS":
                    var s = this.getView().byId("hPatient").getSelectedKey();
                    var P = this.getView().byId("hDateFrom").getProperty("dateValue");
                    var D = this.getView().byId("hDateTo").getProperty("dateValue");
                    var M = this.getView().byId("hHospitalName").getValue();
                    var w = this.getView().byId("hCashMemo").getValue();
                    //
                    var c = this.getView().byId("covidRequestHos_create").getSelectedKey();
                    // if (c == "Yes"){
                    //     this.getOwnerComponent().getModel("buttonsModel").setProperty("/covidExp",true);
                    // }

                    
                    var f = this.getView().byId("hTreatmentPlace").getValue();
                    var v = this.getView().byId("hEmpaneled").getSelectedKey();
                    var C = this.getView().byId("hRecommended").getSelectedKey();
                    var m = this.getView().byId("hReqAmt").getValue();
                    var E = this.getView().byId("hTaxExmp").getSelectedKey();
                    
                    if (C === "N") {
                        r.error("Claim cannot be submitted as it is not Recommended.", {
                            icon: r.Icon.ERROR,
                            title: "Alert"
                        });
                        return
                    }
                    var V = new Date(P);
                    V.setMinutes(30);
                    V.setHours(5);
                    P = V;
                    var V = new Date(D);
                    V.setMinutes(30);
                    V.setHours(5);
                    D = V;
                    var b = {
                        C04t3: "HOS",
                        Fcnam: s,
                        Famsa: "",
                        Fasex: "",
                        Favor: "",
                        Fanam: "",
                        Age: "",
                        Cdt01: P,
                        Cdt02: D,
                        ConsultNo: w,
                        ClinicName: M,
                        Place: f,
                        Empaneled: v,
                        Recommended: C,
                        Rqamt: m,
                        Apamt: "0",
                        C10t1: E,
                        C10t3: c
                        
                    };
                    l.push(b);
                    break;
                case "TRV":
                    var s = this.getView().byId("tePatient").getSelectedKey();
                    var S = this.getView().byId("teDepDate").getProperty("dateValue");
                    var R = this.getView().byId("teDepPlace").getValue();
                    var A = this.getView().byId("teArvlDate").getProperty("dateValue");
                    var F = this.getView().byId("teArvlPlace").getValue();
                    var T = this.getView().byId("teTravelMode").getSelectedKey();
                    var C = this.getView().byId("teRecommended").getSelectedKey();
                    var m = this.getView().byId("teReqAmt").getValue();
                    
                    if (C === "N") {
                        r.error("Claim cannot be submitted as it is not Recommended.", {
                            icon: r.Icon.ERROR,
                            title: "Alert"
                        });
                        return
                    }
                    var V = new Date(S);
                    V.setMinutes(30);
                    V.setHours(5);
                    S = V;
                    var V = new Date(A);
                    V.setMinutes(30);
                    V.setHours(5);
                    A = V;
                    var b = {
                        C04t3: "TRV",
                        Fcnam: s,
                        Famsa: "",
                        Fasex: "",
                        Favor: "",
                        Fanam: "",
                        Age: "",
                        Cdt01: S,
                        Cdt02: A,
                        DepPlace: R,
                        ArrPlace: F,
                        TravelMode: T,
                        Recommended: C,
                        Rqamt: m,
                        Apamt: "0"
                    };
                    l.push(b);
                    if (C === "Y") {
                        r.information("Please attach requisities supporting documents permitted by HR.", {
                            icon: r.Icon.INFORMATION,
                            title: "Information"
                        })
                    }
                    break;
                case "OTH":

                    var s = this.getView().byId("oPatient").getSelectedKey();
                    var o = this.getView().byId("oClaimDate").getProperty("dateValue");
                    var d = this.getView().byId("oPhysician").getValue();
                    var O = this.getView().byId("oClaimType").getSelectedKey();
                    var w = this.getView().byId("oCashMemo").getValue();

                    var I = this.getView().byId("oParticulars").getValue();
                    var h = this.getView().byId("oOutStation").getSelectedKey();
                    var c = this.getView().byId("oCityType").getSelectedKey();
                    var u = this.getView().byId("oPlace").getValue();
                    var C = this.getView().byId("oRecommended").getSelectedKey();
                    var K = this.getView().byId("otherFreeText").getValue();
                    var m = this.getView().byId("oReqAmt").getValue();
                   
                    if (C === "N") {
                        r.error("Claim cannot be submitted as it is not Recommended.", {
                            icon: r.Icon.ERROR,
                            title: "Alert"
                        });
                        return
                    }
                    var V = new Date(o);
                    V.setMinutes(30);
                    V.setHours(5);
                    o = V;
                    var b = {
                        C04t3: "OTH",
                        Fcnam: s,
                        Famsa: "",
                        Fasex: "",
                        Favor: "",
                        Fanam: "",
                        Age: "",
                        Cdt01: o,
                        ConsultNo: w,
                        ClinicName: d,
                        Place: u,
                        CityType: c,
                        Outstation: h,
                        Particulars: I,
                        Empaneled: "",
                        Recommended: C,
                        C10t2: O,
                        C04t5: "",
                        Rqamt: m,
                        Apamt: "0",
                        C10t1: E,
                        C80t1: K
                    };
                    l.push(b);
                    break
            }
            var x = this.getOwnerComponent().getModel("detailMasterModel");
            x.setData(l);
            this.clearData();
            this.getView().byId("itemName").setSelectedKey("");
            if (sap.ui.Device.system.desktop) {
                var N = this.getView().byId("detailPage");
                N.removeAllContent();
                var k = this.getOwnerComponent().getModel("buttonsModel");
                k.setProperty("/mAdd", false);
                k.setProperty("/mAttach", true);
                k.setProperty("/showEdit", true)
            } else {
                var k = this.getOwnerComponent().getModel("buttonsModel");
                k.setProperty("/mAdd", true);
                k.setProperty("/mAttach", true);
                k.setProperty("/showEdit", true);
                this.onCloseDetailPress()
            }
        },
        onCloseDetailPress: function () {
            var e = this.getView().byId("detailPage");
            e.removeAllContent();
            this.getModel("appView").setProperty("/layout", "OneColumn");
            var t = "0";
            this.getOwnerComponent().getRouter().navTo("master", {
                claimId: t
            })
        },
        OnTaxSelection: function (e) {
            var t = e.getParameter("selectedItem").getText();
            var a = e.getSource().getProperty("selectedKey");
            if (a == "Yes") {
                var i = !!this.getView().$().closest(".sapUiSizeCompact").length;
                sap.m.MessageBox.information("Please attached requisite supporting document(s) for Tax exemption.", {
                    styleClass: i ? "sapUiSizeCompact" : ""
                })
            }
        },
        onDeleteM: function (e) {
            var t = this.getView().byId("form" + n + "Display").getElementBinding("detailMasterModel").getPath();
            t = t.toString();
            t = t.slice(1);
            var a = parseInt(t);
            var i = a - 1;
            i = i.toString();
            i = "/" + i;
            var s = this.getOwnerComponent().getModel("detailMasterModel").oData;
            var o = s.length;
            if (o == t || !t) {
                r.information("Please select a record to delete!", {
                    title: "Alert"
                });
                return
            }
            s.splice(t, 1);
            this.getOwnerComponent().getModel("detailMasterModel").setData(s);
            if (s.length === 0) {
                var l = this.getOwnerComponent().getModel("buttonsModel");
                l.setProperty("/mDelete", false);
                l.setProperty("/mAttach", false);
                l.setProperty("/dEdit", false)
            }
            this.onCloseDetailPress()
        },
        toggleFullScreen: function () {
            var e = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !e);
            if (!e) {
                this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
                this.getModel("appView").setProperty("/layout", "MidColumnFullScreen")
            } else {
                this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"))
            }
        },
        onLiveReqAmt: function (e) {
            var t = e.getParameter("value").length;
            var a = this.getView().byId("addBtn");
            var i = this.getView().byId("saveBtn");
            var s = e.getParameter("id");// changes by Usmana
            if (t > 10) {
                this.getView().byId(s).setValueState(sap.ui.core.ValueState.Error);
                a.setEnabled(false);
                i.setEnabled(false)
            } else {
                this.getView().byId(s).setValueState(sap.ui.core.ValueState.None);
                a.setEnabled(true);
                i.setEnabled(true)
            }
        }
    })
});