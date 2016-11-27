import { Component } from '@angular/core';



@Component({
    selector: 'my-app',
    template: `<h1>UBC</h1>
<p-tabView>
    <p-tabPanel header="Courses">
      <courses></courses>
    </p-tabPanel>
    <p-tabPanel header="Rooms">
        <rooms></rooms>
    </p-tabPanel>
    <p-tabPanel header="Schedule">
        <schedule></schedule>    
    </p-tabPanel>
     <p-tabPanel header="MinDistance">
        <novel></novel>    
    </p-tabPanel>
</p-tabView>
`,
})
export class AppComponent { }
