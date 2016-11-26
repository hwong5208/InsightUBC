import { Component } from '@angular/core';



@Component({
    selector: 'my-app',
    template: `<h1>Hello Angular</h1>
<p-tabView>
    <p-tabPanel header="Courses">
      <courses></courses>
    </p-tabPanel>
    <p-tabPanel header="Rooms">
        <rooms></rooms>
    </p-tabPanel>
    <p-tabPanel header="Schedule">
        Content 3    
    </p-tabPanel>
</p-tabView>
`,
})
export class AppComponent { }
