+ Implement InsightFacade by refactoring the code in RouteHandler

By Oct 14

+ Implement GROUP by using a helper function - helperFunctionGroup to add the GROUP function in query
+ Implement APPLY by using a helper function - helperFunctionApplyToken (which includes AVG, MAX, MIN, COUNT) to add the Apply function in query

By Oct 18

+ Implement isValid by adding new requirements for a valid query like: 
"All the keys in GROUP should be presented in GET", 
"All keys in GET should be in either GROUP or APPLY",
"All keys in GET that are not separated by an underscore should appear in APPLY"
"APPLY rules should be unique"

By Oct 20

+ Work on writing tests and fix bugs

By Oct 23
