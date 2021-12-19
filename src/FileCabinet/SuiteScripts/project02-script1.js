/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
 define(['N/record', 'N/search'],
 /**
* @param{record} record
* @param{search} search
*/
 (record, search) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = () => {
        
                var caseSearch = search.create({
         
                type: 'customrecord_sdr_main_product_table', 
                title: 'POS Table',
                
                filters: [
                         
                   search.createFilter({
                     name:     'custrecord_sdr_main_product_sycned', 
                     operator:  search.Operator.IS,
                     values:    false
                   }),
                   
                   search.createFilter({
                     name:     'created', 
                     operator:  search.Operator.WITHIN,
                     values:    'thisweek'       // Change the Time Critira 
                   })                
                   ],
                
                columns:[
                    search.createColumn({name:'custrecord_sdr_main_product_location'}),
                    search.createColumn({name:'custrecord_sdr_main_product'}),
                    search.createColumn({name:'custrecord_sdr_main_product_qty'}),
                    search.createColumn({name:'custrecord_sdr_main_product_amt'})
                   
                    ] 
                });
    
            return caseSearch;

        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */


         function Update_Custom_Table(idd)
         {
            var rec = record.load({
                type: 'customrecord_sdr_main_product_table',
                id: idd,
                isDynamic : true
         });
    
           rec.setValue({fieldId: 'custrecord_sdr_main_product_sycned', value: true});
           rec.save();
         }
    
        function Create_SO_Synced(itemsId, itemsQTY ,itemAMT ,locationId)
    
            {
                var set_Record = record.create({type: 'salesorder', isDynamic: true});
    
                set_Record.setValue({fieldId: 'entity', value: 3 });
                set_Record.setValue({fieldId: 'location', value: locationId });
                set_Record.setValue({fieldId: 'memo', value: 'Data is Synced from POS System' });
    
                set_Record.selectLine({ sublistId: 'item', line: 0 });
                set_Record.selectNewLine({ sublistId: 'item'});
    
                set_Record.setCurrentSublistValue({
                    sublistId:  'item', 
                    fieldId:    'item',
                    value:      itemsId
                  });
        
                  set_Record.setCurrentSublistValue({
                    sublistId:  'item', 
                    fieldId:    'quantity',
                    value:      itemsQTY
                  });
        
                  set_Record.setCurrentSublistValue({
                    sublistId:  'item', 
                    fieldId:    'amount',
                    value:      itemAMT
                  });       
        
                set_Record.commitLine({ sublistId: 'item', line: 0 }); 
        
            try {
                var callId = set_Record.save();
                    log.debug('Sales Order record created successfully', 'Id: ' + callId);  // Successful and get the SO #
        
                } catch (e) {
                    log.debug('sigh');
                    log.error(e.name);
                }
     
            }
        
        function Check_SO(locationId)
                
            {   
                var caseSearch = search.create({
                type: search.Type.SALES_ORDER, 
                title: 'Checking if there is any Sales Order?',
                
                filters: [
                                   
                   search.createFilter({
                     name:     'trandate', 
                     operator:  search.Operator.WITHIN,
                     values:    'today'
                   }),
       
                   search.createFilter({
                     name:     'location', 
                     operator:  search.Operator.IS,
                     values:    locationId
                   }),
       
                   search.createFilter({
                         name:     'mainline', 
                         operator:  search.Operator.IS,
                         values:    true 
                       }),                 
                   ],
                
                columns:[
                    search.createColumn({name:'memo'}),
                ] 
            });
                var searchResults = caseSearch.run().getRange({ start: 0, end: 1});
                
                if (searchResults.length == 0) 
                    return 0 
                
                if (searchResults.length == 1) 
                    {
                        var orderId = searchResults[0].id;
                        return(orderId);
    
                    }
    
            }
        
        function Update_SO_Synced(orderId, itemsId, itemsQTY ,itemAMT)
            {
                var set_Record = record.load({
                    type: 'salesorder',
                    id: orderId,
                    isDynamic: true,
                });
    
                set_Record.selectNewLine({ sublistId: 'item'});
    
                set_Record.setCurrentSublistValue({
                    sublistId:  'item', 
                    fieldId:    'item',
                    value:      itemsId
                  });
        
                  set_Record.setCurrentSublistValue({
                    sublistId:  'item', 
                    fieldId:    'quantity',
                    value:      itemsQTY
                  });
        
                  set_Record.setCurrentSublistValue({
                    sublistId:  'item', 
                    fieldId:    'amount',
                    value:      itemAMT
                  });       
        
                set_Record.commitLine({ sublistId: 'item'}); 
        
            try {
    
                var callId = set_Record.save();
                    log.debug('Sales Order record updated successfully', 'Id: ' + callId);  
                    // Successful and get the SO #
        
                } catch (e) {
                    log.debug('sigh');
                    log.error(e.name);
                }
            }
    
        const map = (context) => {

            var searchResult = JSON.parse(context.value);  
        
            var recordId =   searchResult.id;
            var locationId = searchResult.values.custrecord_sdr_main_product_location.value;
            var itemsId =    searchResult.values.custrecord_sdr_main_product.value;
            var itemsQTY =   searchResult.values.custrecord_sdr_main_product_qty;
            var itemAMT =    searchResult.values.custrecord_sdr_main_product_amt;
            var keyId =      locationId + '-' + itemsId;
      
            
            log.debug('In Shop ID '+ locationId + ' There are ' + itemsQTY + ' of ' + itemsId + ' with' + itemAMT); 
            Update_Custom_Table(recordId);
    
            context.write({
                    key:  keyId, 
                    value:  searchResult.values
            });

        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (context) => {

            var qty_total = 0;
            var amt_total = 0;
    
            var lll = context.values;
    
            log.debug({
                title: 'context.values',
                details: lll
            });
    
    
    
            for (var i in context.values) {
                // Remember to Parse Json to Json object
                var C_qty = JSON.parse(context.values[i]).custrecord_sdr_main_product_qty;
                qty_total += parseFloat(C_qty);
                
                var ll = context.values[i];
    
                log.debug({
                    title: 'context.values[i]',
                    details: ll
                });
                
            }
    
            for (var j in context.values) {
                // Remember to Parse Json to Json object
                var C_amt = JSON.parse(context.values[j]).custrecord_sdr_main_product_amt;
                amt_total += parseFloat(C_amt);
            }
    
            var temp1 = context.key;
            var temp2 = temp1.split('-');
            locationId  = temp2[0];
            itemsId = temp2[1]; 
            
            log.debug('In Shop ' +  locationId  + ', Product: ' + itemsId +' has QTY of ' + qty_total);
            
            var SOcheck = Check_SO(locationId); 
    
            if(SOcheck == 0)
                Create_SO_Synced(itemsId, qty_total, amt_total,locationId);
            else 
                Update_SO_Synced(SOcheck, itemsId, qty_total ,amt_total);

        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
            log.audit('Number of Quene', summaryContext.concurrency);
        }

        return {getInputData, map, reduce, summarize}

    });
