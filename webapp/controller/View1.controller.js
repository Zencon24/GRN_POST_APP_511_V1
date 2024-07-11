
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, JSONModel, MessageToast, Fragment, exportLibrary, Spreadsheet, ODataModel) {
    "use strict";

    return Controller.extend("edi.controller.View1", {
        onInit: function () {
            console.log("View1 controller initialized.");

            // Initialize model for filters
            var oFiltersModel = new JSONModel({
                Plant: "",
                EDI_Number: ""
            });
            this.getView().setModel(oFiltersModel, "filters");

            // Set up the OData model for the EDI service using BTP destination
            this.setupODataModel();
        },

        statusMessageFormatter: function (ediNumber, gateEntry1, gr) {
            if (gr) {
                return "GRN is Posted for respective EDI Number";
            } else if (gateEntry1 && ediNumber) {
                return "Gate Entry Found With respect to EDI Number Uploaded";
            } else if (ediNumber && !gateEntry1) {
                return "No Gate Entry Found for the EDI Number Uploaded";
            }
            return "";
        },

        setupODataModel: function () {
            console.log("Setting up OData model...");

            var sServiceUrl = "/sap/opu/odata/sap/YY1_EDI_INITIAL_CDS";

            var oModel = new ODataModel(sServiceUrl, {
                useBatch: false,
                defaultBindingMode: "TwoWay",
                defaultUpdateMethod: "PUT",
                headers: {
                    "x-csrf-token": "Fetch"
                }
            });

            // Set the OData model to the component with the name 'ediModel'
            this.getOwnerComponent().setModel(oModel, "ediModel");

            var sServiceUrlGateReg = "/sap/opu/odata/sap/YY1_GATE_REG_CDS"

            var oModelGateReg = new ODataModel(sServiceUrlGateReg, {
                useBatch: false,
                defaultBindingMode: "TwoWay",
                defaultUpdateMethod: "PUT",
                headers: {
                    "x-csrf-token": "Fetch"
                }
            });

            // Set the OData model to the component with the name 'oModelGateReg'
            this.getOwnerComponent().setModel(oModelGateReg, "oModelGateReg");


            var sServiceUrlS4 = "/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/";

            var oModelS4 = new ODataModel(sServiceUrlS4, {
                useBatch: false,
                defaultBindingMode: "TwoWay",
                defaultUpdateMethod: "PUT",
                headers: {
                    "x-csrf-token": "Fetch"
                }
            });

            // Set the OData model to the component with the name 'ediModel'
            this.getOwnerComponent().setModel(oModelS4, "oModelS4");


            // Fetch CSRF token and load initial data
            this.fetchCSRFTokenAndLoadData();
        },

        fetchCSRFTokenAndLoadData: function () {
            console.log("Fetching CSRF token...");

            var oModel = this.getOwnerComponent().getModel("ediModel");

            // Refresh the security token to fetch the CSRF token
            oModel.refreshSecurityToken(function (csrfToken, header) {
                console.log("CSRF token fetched successfully:", csrfToken);

                // Successfully fetched CSRF token, now proceed to fetch data
                this.loadDataFromODataService();
            }.bind(this), function (error) {
                console.error("Failed to fetch CSRF token:", error);
                MessageToast.show("Failed to fetch CSRF token");
            });

            var oModelGateReg = this.getOwnerComponent().getModel("oModelGateReg");

            // Refresh the security token to fetch the CSRF token
            oModelGateReg.refreshSecurityToken(function (csrfToken, header) {
                console.log("CSRF token fetched successfully:", csrfToken);

                // Successfully fetched CSRF token, now proceed to fetch data
                this.loadDataFromODataService();
            }.bind(this), function (error) {
                console.error("Failed to fetch CSRF token:", error);
                MessageToast.show("Failed to fetch CSRF token");
            });

            var oModelS4 = this.getOwnerComponent().getModel("oModelS4");

            // Refresh the security token to fetch the CSRF token
            oModelS4.refreshSecurityToken(function (csrfToken, header) {
                console.log("CSRF token fetched successfully:", csrfToken);

                // Successfully fetched CSRF token, now proceed to fetch data
                this.loadDataFromODataService();
            }.bind(this), function (error) {
                console.error("Failed to fetch CSRF token:", error);
                MessageToast.show("Failed to fetch CSRF token");
            });
            
        },

        loadDataFromODataService: function () {
            console.log("Loading data from OData service...");

            var oModel = this.getOwnerComponent().getModel("ediModel");
            var sEntitySet = "/YY1_EDI_INITIAL";

            oModel.read(sEntitySet, {
                success: function (oData, response) {
                    console.log("Data fetched successfully:", oData);

                    // Store the fetched data in a model for later use
                    var oODataModel = new JSONModel(oData.results);
                    this.getView().setModel(oODataModel, "odataFetchedData");
                }.bind(this),
                error: function (oError) {
                    console.error("Error fetching data:", oError);
                    MessageToast.show("Failed to fetch data from OData service");
                }
            });

            var oModelGateReg = this.getOwnerComponent().getModel("oModelGateReg");
            var sEntitySet = "/YY1_GATE_REG";

            oModelGateReg.read(sEntitySet, {
                success: function (oData, response) {
                    console.log("Data fetched successfully:", oData);

                    // Store the fetched data in a oODataModelGateReg for later use
                    var oODataModelGateReg = new JSONModel(oData.results);
                    this.getView().setModel(oODataModelGateReg, "odataFetchedDataGateReg");
                }.bind(this),
                error: function (oError) {
                    console.error("Error fetching data:", oError);
                    MessageToast.show("Failed to fetch data from OData service");
                }
            });

            var oModelS4 = this.getOwnerComponent().getModel("oModelS4");
            var sEntitySet = "/A_MaterialDocumentHeader";

            oModelS4.read(sEntitySet, {
                success: function (oData, response) {
                    console.log("Data fetched successfully:", oData);

                    // Store the fetched data in a oODataModelS4 for later use
                    var oODataModelS4 = new JSONModel(oData.results);
                    this.getView().setModel(oODataModelS4, "odataFetchedDataS4");
                }.bind(this),
                error: function (oError) {
                    console.error("Error fetching data:", oError);
                    MessageToast.show("Failed to fetch data from OData service");
                }
            });
        },

        onPressUploadFile: function () {
            console.log("Upload file button pressed.");

            if (!this._oUploadDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "edi.view.UploadPopup",
                    controller: this
                }).then(function (oFragment) {
                    console.log("Fragment loaded successfully:", oFragment);

                    this._oUploadDialog = oFragment;
                    this.getView().addDependent(this._oUploadDialog);
                    this._oUploadDialog.open();
                }.bind(this)).catch(function (oError) {
                    console.error("Error loading fragment: ", oError);
                });
            } else {
                this._oUploadDialog.open();
            }
        },

        handleFileSelection: function (oEvent) {
            console.log("File selected.");

            var oFileUploader = oEvent.getSource();
            var oFile = oFileUploader.oFileUpload.files[0];

            if (oFile) {
                var oFileReader = new FileReader();
                oFileReader.onload = function (event) {
                    console.log("File loaded successfully:", event);

                    this._fileContent = event.target.result;
                }.bind(this);
                oFileReader.readAsText(oFile);
            } else {
                MessageToast.show("No file selected.");
            }
        },

        handleUploadPress: function () {
            console.log("Upload button pressed.");
        
            var oFileUploader = this.byId("fileUploader");
            if (!oFileUploader.getValue()) {
                MessageToast.show("Choose a file first");
                return;
            }
        
            if (this._fileContent) {
                const csvData = this._fileContent;
                const expectedHeaders = ["UL_Counter", "Purchasing_Doc", "Item", "EDI_Number", "Fiscal_Year", "EDI_Date", "Plant", "Stor_Location", "Material", "Description", "Child_Vendor", "Child_Vendor_Name", "Parent_Vendor", "Parent_Vendor_Name", "Invoice_Number", "Invoice_Date", "EDI_Quantity", "UL_Qty_Receipt_Qty", "GR", "GR_Year", "Debit_Note", "Debit_Note_F_Year", "Total_Debit_Note_Value", "Created_by", "Created_on", "Part_2", "Part_2_Excise_FI_Doc", "GATE_ENTRY_1", "SAP_UUID"];
        
                const jsonData = this.convertCSVToJson(csvData, expectedHeaders);
                this.mergeCSVWithDataFromOData(jsonData);
            } else {
                MessageToast.show("Please select a file first");
            }
        },
        
        convertCSVToJson: function (csv, expectedHeaders) {
            console.log("Converting CSV to JSON...");
        
            const [headers, ...rows] = csv.trim().split('\n').map(row => row.split(',').map(cell => cell.trim()));
            return rows.map(row => {
                return expectedHeaders.reduce((obj, header, index) => {
                    let value = row[index] ? row[index].trim() : null;
                    obj[header] = value;
                    return obj;
                }, {});
            });
        },
        
        mergeCSVWithDataFromOData: function (csvData) {
            console.log("Merging CSV data with OData data...");
        
            var oDataFromOData = this.getView().getModel("odataFetchedData").getData();
            var sEntitySet = "/YY1_GATE_REG";
        
            var rowsToInsert = [];
        
            function formatItemNumber(itemNumber) {
                return itemNumber.toString().padStart(5, '0');
            }
        
            csvData = csvData.filter(csvRow => {
                let matchingRow = oDataFromOData.find(odataRow => odataRow.EDI_NUMBER_1 === csvRow.EDI_Number);
        
                if (matchingRow) {
                    csvRow.GATE_ENTRY_1 = matchingRow.GATE_ENTRY_1;
                    csvRow.PLANT = matchingRow.PLANT;
                }
        
                var newRow = {
                    "EDINumber": csvRow.EDI_Number ? csvRow.EDI_Number.trim() : "",
                    "GateRegistrationNumber": csvRow.GATE_ENTRY_1 ? csvRow.GATE_ENTRY_1.trim() : "",
                    "Plant": csvRow.PLANT ? csvRow.PLANT.trim() : "",
                    "PurchasingDocumentNumber": csvRow.Purchasing_Doc ? csvRow.Purchasing_Doc.trim() : "",
                    "ItemNumberofPurchasingDo": formatItemNumber(parseInt(csvRow.Item, 10)),
                    "MaterialDocumentYear": csvRow.Fiscal_Year ? csvRow.Fiscal_Year.trim() : "",
                    "DateonWhichRecordCreated": csvRow.EDI_Date ? csvRow.EDI_Date.trim() : "",
                    "StorageLocation": csvRow.Stor_Location ? csvRow.Stor_Location.trim() : "",
                    "MaterialNumber": csvRow.Material ? csvRow.Material.trim() : "",
                    "CompanyCode": csvRow.CompanyCode ? csvRow.CompanyCode.trim() : "",
                    "Quantity": csvRow.EDI_Quantity ? csvRow.EDI_Quantity : "",
                    "BaseUnitofMeasure": csvRow.BaseUnitofMeasure ? csvRow.BaseUnitofMeasure.trim() : "",
                    "QuantityinUnitofMeasure": csvRow.UL_Counter ? csvRow.UL_Counter : "",
                    "UnitofMeasureFromDeliver": csvRow.UnitofMeasureFromDeliver ? csvRow.UnitofMeasureFromDeliver.trim() : "",
                    "MaterialDirectionIndicator": "I",
                    "ReferenceDocumentNumber": csvRow.Invoice_Number ? csvRow.Invoice_Number.trim() : "",
                    "ChallanDate": csvRow.Invoice_Date ? csvRow.Invoice_Date : "",
                    "VehicleNumber": csvRow.VehicleNumber ? csvRow.VehicleNumber.trim() : "",
                    "BillingDocument": csvRow.BillingDocument ? csvRow.BillingDocument.trim() : "",
                    "SequenceNumberofaCheck": csvRow.SequenceNumberofaCheck ? csvRow.SequenceNumberofaCheck.trim() : "",
                    "PortalTokenNumber": csvRow.PortalTokenNumber ? csvRow.PortalTokenNumber.trim() : "",
                    "NumberofMaterialDocument": csvRow.GR ? csvRow.GR.trim() : "",
                    "Materialbelongingtothecu": csvRow.Material ? csvRow.Material.trim() : "",
                    "NameofRepresentative": csvRow.Child_Vendor ? csvRow.Child_Vendor.trim() : "",
                    "CustomerName": csvRow.CustomerName ? csvRow.CustomerName.trim() : "",
                    "MaterialGateEntryCollecti": csvRow.MaterialGateEntryCollecti ? csvRow.MaterialGateEntryCollecti.trim() : "",
                    "StatusIndicator": csvRow.StatusIndicator ? csvRow.StatusIndicator.trim() : "",
                    "ChangedBy": csvRow.ChangedBy ? csvRow.ChangedBy.trim() : "",
                    "ChangedDate": csvRow.ChangedDate ? csvRow.ChangedDate : "",
                    "UpdateTime": csvRow.UpdateTime ? csvRow.UpdateTime.trim() : "",
                    "ReasonCode": "RC01",
                    "IteminMaterialDocument": "1",
                    "SingleCharacterIndicator": "X",
                    "Name": csvRow.Name ? csvRow.Name.trim() : "",
                    "GateEntryCategory": "Category1",
                    "OrderNumber": csvRow.OrderNumber ? csvRow.OrderNumber.trim() : "",
                    "ConfirmationID": csvRow.ConfirmationID ? csvRow.ConfirmationID.trim() : "",
                    "SAP_CreatedDateTime": "2024-06-04T14:23:47.4551190Z",
                    "SAP_CreatedByUser": "CB9980000011",
                    "SAP_CreatedByUser_Text": "Trupti Sandbhor",
                    "SAP_LastChangedDateTime": "2024-06-04T14:23:47.4551190Z",
                    "SAP_LastChangedByUser": "CB9980000011",
                    "SAP_LastChangedByUser_Text": "Trupti Sandbhor"
                };
        
                rowsToInsert.push(newRow);
                return true; // Filter out the row from csvData
            });
            console.log("Updated rowsToInsert:", rowsToInsert);
        
            // Post the data to the endpoint automatically
            this.postDataToEndpoint(sEntitySet, rowsToInsert);
        
            // Update the model for the table with updated csvData
            let updatedCSVData = new sap.ui.model.json.JSONModel({ data: csvData });
            var oTable = this.getView().byId("purchasingDataTable");
            oTable.setModel(updatedCSVData);
        
            // Close the upload dialog
            this.byId("uploadDialog").close();
        },
        
        buttonVisibility: function(iEDI_Number, sGATE_ENTRY_1) {
            return iEDI_Number > 0 && !!sGATE_ENTRY_1; // Use !! for boolean conversion of sGATE_ENTRY_1
        },
        
        onSelectionChange: function(oEvent) {
            var oTable = oEvent.getSource();
            var aSelectedItems = oTable.getSelectedItems();
        
            // Iterate over selected items
            aSelectedItems.forEach(function(oSelectedItem) {
                var oSelectedData = oSelectedItem.getBindingContext().getObject();
                console.log("Selected item:", oSelectedData);
        
            });
        
            // Post the data to the endpoint
            this.postDataToEndpoint(sEntitySet, rowsToInsert);
        },
        
        postDataToEndpoint: function (sEntitySet, data) {
            console.log("Posting data to endpoint:", sEntitySet);
            var oModelGateReg = this.getOwnerComponent().getModel("oModelGateReg");
        
            data.forEach(function (rowData) {
                oModelGateReg.create(sEntitySet, rowData, {
                    success: function () {
                        MessageToast.show("Data uploaded successfully!");
                    },
                    error: function (err) {
                        MessageToast.show("Error while uploading data!");
                        console.error("Error while creating entry:", err);
                    }
                });
            });
        },
        

        onPressPost: function() {
            var oTable = this.getView().byId("purchasingDataTable");
            var aSelectedItems = oTable.getSelectedItems();
            
            if (aSelectedItems.length === 0) {
                console.warn("No items selected for posting");
                return;
            }
            
            this.postGRN(aSelectedItems);
        },
        
        postGRN: function() {
            var aSelectedItems = this.byId("purchasingDataTable").getSelectedItems();
            var oModelS4 = this.getOwnerComponent().getModel("oModelS4");
            var sEntitySet = "/A_MaterialDocumentHeader";
            var that = this; // Save the context

            var aPromises = aSelectedItems.map(function(oSelectedItem) {
                var oSelectedData = oSelectedItem.getBindingContext().getObject();
                var oButton = oSelectedItem.getCells()[0]; // Assuming the button is the first cell

                var oPayload = {
                    "DocumentDate": "/Date(1718624167000)/",
                    "PostingDate": "/Date(1718624167000)/",
                    "MaterialDocumentHeaderText": "TEST API",
                    "ReferenceDocument": "TEST API",
                    "GoodsMovementCode": "05",
                    "to_MaterialDocumentItem": {
                        "results": [
                            {
                                "Material": "7010000002",
                                "Plant": "1111",
                                "StorageLocation": "1001",
                                "Supplier": "0001000002",
                                "GoodsMovementType": "511",
                                "EntryUnit": "EA",
                                "QuantityInEntryUnit": "101",
                                "GoodsRecipientName": "YOGESH",
                                "MaterialDocumentItemText": "test 511"
                            }
                        ]
                    }
                };

                return new Promise(function(resolve, reject) {
                    oModelS4.create(sEntitySet, oPayload, {
                        success: function(oData, oResponse) {
                            console.log("Data posted successfully:", oData);

                            // Update button properties on success
                            oButton.setType("Accept");
                            oButton.setText("Green");

                            resolve();
                        },
                        error: function(oError) {
                            console.log("Error posting data:", oError);
                            reject();
                        }
                    });
                });
            });

            Promise.all(aPromises)
                .then(function() {
                    console.log("All data posted successfully");
                })
                .catch(function() {
                    console.log("Error in posting some data");
                });
        },
        
        
        
        
        
        

        handleCancelPress: function () {
            console.log("Cancel button pressed.");

            this.byId("uploadDialog").close();
        }
    });
});
