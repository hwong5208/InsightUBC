import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import {CoursesComponent} from "./courses.component";
import { HttpModule, JsonpModule } from '@angular/http';
import { FormsModule } from '@angular/forms'
import { Ng2SmartTableModule } from 'ng2-smart-table';



@NgModule({
  imports:      [ BrowserModule ,  HttpModule, JsonpModule, FormsModule,Ng2SmartTableModule],
  declarations: [ AppComponent,CoursesComponent],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
