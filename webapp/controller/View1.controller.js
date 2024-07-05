
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
                const expectedHeaders = ["UL_Counter", "Purchasing_Doc", "Item", "EDI_Number","Fiscal_Year", "EDI_Date", "Plant", "Stor_Location", "Material", "Description", "Child_Vendor", "Child_Vendor_Name", "Parent_Vendor", "Parent_Vendor_Name", "Invoice_Number", "Invoice_Date", "EDI_Quantity", "UL_Qty_Receipt_Qty", "GR", "GR_Year", "Debit_Note", "Debit_Note_F_Year", "Total_Debit_Note_Value", "Created_by", "Created_on", "Part_2", "Part_2_Excise_FI_Doc", "GATE_ENTRY_1", "SAP_UUID"];

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
                    // if (header === 'Invoice_Date' || header === 'Created_on') {
                    //     const [year, month, day] = value.split('-');
                    //     value = `${month}/${day}/${year}`;
                    // }
                    obj[header] = value;
                    return obj;
                }, {});
            });
        },

        mergeCSVWithDataFromOData: function (csvData) {
            console.log("Merging CSV data with OData data...");
        
            var oDataFromOData = this.getView().getModel("odataFetchedData").getData();
            // console.log("oDataFromOData---", oDataFromOData);
        
            var oModelGateReg = this.getOwnerComponent().getModel("oModelGateReg");
            var sEntitySet = "/YY1_GATE_REG";
        
            // Array to store rows that need to be inserted
            var rowsToInsert = [];

            // console.log("csvData---", csvData)

            // Function to format ItemNumberofPurchasingDo with leading zeros
            function formatItemNumber(itemNumber) {
                return itemNumber.toString().padStart(5, '0');
            }
            
            // Iterate over the csvData array and filter rows based on the condition
            csvData = csvData.filter(csvRow => {
                let matchingRow = oDataFromOData.find(odataRow => odataRow.EDI_NUMBER_1 === csvRow.EDI_Number);
                
                console.log("csvRow.EDI_Number-----", csvRow.EDI_Number)
                if (matchingRow) {
                    console.log("---inside matchingRow---")

                    console.log(csvRow.EDI_Number===matchingRow.EDI_NUMBER_1)
                    csvRow.GATE_ENTRY_1 = matchingRow.GATE_ENTRY_1;
                    csvRow.PLANT = matchingRow.PLANT;
                } else {
                    // Do nothing
                    // console.log("csvRow.Item---", csvRow.Item)
                }
                var newRow = {
                    EDINumber: csvRow.EDI_Number.trim(), // Ensure no whitespace
                    GateRegistrationNumber: csvRow.GATE_ENTRY_1 ? csvRow.GATE_ENTRY_1.trim() : "", // Ensure no whitespace
                    Plant: csvRow.PLANT ? csvRow.PLANT.trim() : "", // Ensure no whitespace
                    PurchasingDocumentNumber: csvRow.Purchasing_Doc ? csvRow.Purchasing_Doc.trim() : "", // Ensure no whitespace
                    ItemNumberofPurchasingDo: formatItemNumber(parseInt(csvRow.Item, 10)), // Ensure valid integer formatted correctly
                    MaterialDocumentYear: csvRow.Fiscal_Year, // Ensure valid integer
                    DateonWhichRecordCreated: csvRow.EDI_Date, // Ensure valid date
                    StorageLocation: csvRow.Stor_Location ? csvRow.Stor_Location.trim() : "", // Ensure no whitespace
                    MaterialNumber: csvRow.Material ? csvRow.Material.trim() : "", // Ensure no whitespace
                    // Description: csvRow.Description, // Ensure no whitespace
                    // ChildVendor: parseInt(csvRow.Child_Vendor), // Ensure no whitespace
                    // ChildVendorName: csvRow.Child_Vendor_Name ? csvRow.Child_Vendor_Name.trim() : "", // Ensure no whitespace
                    // ParentVendor: csvRow.Parent_Vendor ? csvRow.Parent_Vendor.trim() : "", // Ensure no whitespace
                    // ParentVendorName: csvRow.Parent_Vendor_Name ? csvRow.Parent_Vendor_Name.trim() : "", // Ensure no whitespace
                    // InvoiceNumber: csvRow.Invoice_Number ? csvRow.Invoice_Number.trim() : "", // Ensure no whitespace
                    // InvoiceDate: csvRow.Invoice_Date ? new Date(csvRow.Invoice_Date) : new Date(), // Ensure valid date
                    // EDIQuantity: parseFloat(csvRow.EDI_Quantity) || 0.0, // Ensure valid float
                    // ULQtyReceiptQty: parseFloat(csvRow.UL_Qty_Receipt_Qty) || 0.0 // Ensure valid float
                };
                    rowsToInsert.push(newRow);
                return true; // Filter out the row from csvData
            });

            console.log("rowsToInsert---", rowsToInsert)
        
            var oDataGateReg = this.getView().getModel("odataFetchedDataGateReg").getData();
            console.log("oDataGateReg---", oDataGateReg)
            // Remove rows from rowsToInsert if EDINumber exists in oDataFromREG
            rowsToInsert = rowsToInsert.filter(newRow => {
                // Check if EDINumber exists in oDataFromREG
                let exists = oDataGateReg.some(regRow => regRow.EDINumber === newRow.EDINumber);
                return !exists; // Keep the row if EDINumber doesn't exist in oDataFromREG
            });

            console.log("Updated rowsToInsert:", rowsToInsert);
            

            // Insert non-matching rows into OData service
            // rowsToInsert.forEach(newRow => {
            //     console.log("Inserting newRow JSON:", JSON.stringify(newRow, null, 2));
            //     oModelGateReg.create(sEntitySet, newRow, {
            //         success: function (oData) {
            //             console.log("Data inserted successfully:", oData);
            //         },
            //         error: function (oError) {
            //             console.error("Error inserting data:", oError);
            //             sap.m.MessageToast.show("Failed to insert data into OData service");
            //         }
            //     });
            // });
        
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
