import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import {CoursesComponent} from "./courses.component";
import { HttpModule, JsonpModule } from '@angular/http';
import { FormsModule } from '@angular/forms'


import {AccordionModule} from 'primeng/primeng';
import {DataTableModule,SharedModule} from 'primeng/primeng';
import {TabViewModule} from 'primeng/primeng';
import {RoomsComponent} from "./rooms.component";



@NgModule({
  imports:      [ BrowserModule ,  HttpModule, JsonpModule, FormsModule,AccordionModule,DataTableModule,SharedModule,TabViewModule],
  declarations: [ AppComponent,CoursesComponent, RoomsComponent],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
