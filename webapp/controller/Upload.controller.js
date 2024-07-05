sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v2/ODataModel"
], function(Controller, MessageToast, ODataModel) {
    "use strict";

    return Controller.extend("edi.controller.Upload", {
        handleFileSelection: function(oEvent) {
            var oFileUploader = oEvent.getSource();
            var oInput = oFileUploader.getDomRef().querySelector("input[type=file]");
            var oFile = oInput.files[0];
            
            if (oFile) {
                var oFileReader = new FileReader();
                
                oFileReader.onload = function(event) {
                    var sFileContent = event.target.result;
                    // Store the file content in a property of the controller
                    this._fileContent = sFileContent;
                    // MessageToast.show("File content: " + sFileContent);
                }.bind(this);
                
                oFileReader.readAsText(oFile);
            } else {
                MessageToast.show("No file selected.");
            }
        },
        
        handleUploadPress: function() {
            var oFileUploader = this.byId("fileUploader");
            if (!oFileUploader.getValue()) {
                MessageToast.show("Choose a file first");
                return;
            }
            
            // Check if file content is available
            if (this._fileContent) {
                // File content is available, display it
                MessageToast.show("File content: " + this._fileContent);
                // console.log("this._fileContent-------", this._fileContent)
                // console.log("type-----", typeof(this._fileContent))
                
                const csvData = this._fileContent;
                
                // Convert CSV to JSON function
                function csvToJson(csvData) {
                    const [headers, ...rows] = csvData.trim().split('\n').map(row => row.split(','));
                
                    return rows.map(row => {
                        return headers.reduce((obj, header, index) => {
                            // Handle specific revisions based on the header name
                            switch (header.trim()) {
                                case 'DelivDateCategory':
                                case 'SchedLineStscDeliveryDate':
                                case 'ScheduleLineDeliveryDate':
                                    obj[header.trim()] = row[index].trim();
                                    break;
                                default:
                                    obj[header.trim()] = row[index].trim();
                            }
                            return obj;
                        }, {});
                    });
                }

                // Convert CSV data to JSON
                const jsonData = csvToJson(csvData);
                
                // console.log("jsonData-----", jsonData)
                // console.log("jsonData-----", typeof(jsonData))

            
                // console.log("len--", jsonData.length)
                if (jsonData.length) {
                  
                    // Call insertDataAtIndex with the starting index and the data array
                    this.insertDataAtIndex(0, jsonData);
                }
                
            } else {
                // File content is not available, prompt the user to select a file first
                MessageToast.show("Please select a file first");
            }
        },
        insertDataAtIndex: function(index, data) {
            var oModel = new ODataModel("/sap/opu/odata/sap/API_SCHED_AGRMT_PROCESS_SRV/");
            if (index < data.length) {
                oModel.create("/A_SchAgrmtSchLine", data[index], {
                    success: function(responseData) {
                        // Successfully created new entity
                        console.log("Data inserted successfully:", responseData);
                        // Call insertDataAtIndex recursively for the next item
                        this.insertDataAtIndex(index + 1, data);
                        
                    }.bind(this), // Bind the success callback to the current context
                    error: function(error) {
                        // Error while creating entity
                        console.error("Error inserting data:", error);
                        // Call insertDataAtIndex recursively for the next item
                        this.insertDataAtIndex(index + 1, data);
                    }.bind(this) // Bind the error callback to the current context
                });
            }
            var fileInput = this.byId("fileUploader");
            if (fileInput) {
                fileInput.setValue(""); // Clear the value of the file input
            }
        }
 
    });
});
