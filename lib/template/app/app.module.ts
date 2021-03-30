import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// desech studio - start import block
// desech studio - end import block

@NgModule({
  declarations: [
    AppComponent,

    // desech studio - start module block
    // desech studio - end module block
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
