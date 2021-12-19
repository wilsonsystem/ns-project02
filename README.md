# NetSuite Project No.2 (Map Reduce Script to consolidate custom POS Record to Sales Order by Schedule) 


In many Food and Grocery retail Industry, there are a huge volume of Point of Sales Transactions in daily that required to integrate with Backend Financial and Logistic System. We always prefer to get the “Summary of Sales Data” in the main Sales Flow instead of covering all raw POS transaction(s).

---------------------------------------------------------------------------------------------------------

The Structure is based on SuiteCloud Development Framework, with following 3 major files: 

(1) customrecord_sdr_main_product_table.xml:  Custom Record to store POS Raw data such as invoice#, QTY, Amount.

(2) project02-script1.js:  Map/Reduce Script, To group and consolidate POS raw data to sales order by specific Time (i.e. Day), Sold Items and Location (i.e. Shop)

(3) customscript_project02_script1.xml:  Record for Script Deportment

---------------------------------------------------------------------------------------------------------

More information about the design: https://medium.com/@wilson.system1/map-reduce-scripts-in-retail-practices-6de5869bcc79

*** Design and Code by Wilson Cheng.

