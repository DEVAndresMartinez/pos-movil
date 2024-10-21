import { NgModule} from '@angular/core';
import {LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './modules/components/auth/interceptors/auth.interceptor';
import { SpinnerInterceptor } from './core/interceptors/spinner.interceptor';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        HttpClientModule,
        AppLayoutModule,
        AppRoutingModule,
        CommonModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([])
    ],
    declarations: [
        AppComponent,
        SpinnerComponent
    ],
    providers: [
        provideHttpClient(withInterceptors([AuthInterceptor])),
        {provide: LocationStrategy, useClass: PathLocationStrategy},
        { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
