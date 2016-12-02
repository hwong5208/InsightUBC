Before running the UI, please go to tsconfig.json file and delete "src/rest/public/app" in exclude. 
After that run start, the UI will display on localport 3000.
Also, since we are using the localport, we need to add a plugin called Allow-Control-Allow-Orgin in Chrome browser.
It can be found in Chrome play store. 

We are using Angular framework and primeng's module to build this UI.
We used the tabview to divide the four components, courses, rooms, schedule, and novel. 
We also used p-table to handle the data display, and use its build-in function to handle multiple-sorting. 
And we also construct a class to handle the http request to our server. 
