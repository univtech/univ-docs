import {ErrorHandler, NgModule} from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';

import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import {trustedResourceUrl, unwrapResourceUrl} from 'safevalues';

import {environment} from '../environments/environment';

import {LogService} from './base/log.service';
import {GoogleService} from './base/google.service';
import {ErrorService} from './base/error.service';
import {DeployService} from './base/deploy.service';
import {IconService} from './base/icon.service';
import {svgIconProviders} from './base/icon.model';
import {storageProviders} from './base/storage.service';
import {windowProvider, windowToken} from './base/window.service';
import {currentDateProvider, currentDateToken} from './base/date.service';

import {ConfigService} from './config/config.service';
import {LocationService} from './navigation/location.service';
import {NavService} from './navigation/nav.service';
import {TopMenuComponent} from './navigation/top-menu.component';
import {SideMenuComponent} from './navigation/side-menu.component';
import {SideItemComponent} from './navigation/side-item.component';
import {FooterComponent} from './navigation/footer.component';

import {DocService} from './document/doc.service';
import {TocService} from './document/toc.service';
import {ScrollService} from './document/scroll.service';
import {ScrollSpyService} from './document/scroll-spy.service';
import {DocViewComponent} from './document/doc-view.component';

import {SearchService} from './search/search.service';
import {SearchBoxComponent} from './search/search-box.component';
import {SearchResultModule} from './search/search-result.module';

import {ElementModule} from './element/element.module';
import {NoticeComponent} from './notice/notice.component';
import {CookiePopupComponent} from './cookie/cookie-popup.component';
import {ThemeToggleComponent} from './theme/theme-toggle.component';
import {AppComponent} from './app.component';

/**
 * 应用程序模块
 */
@NgModule({
    imports: [
        ServiceWorkerModule.register(unwrapResourceUrl(trustedResourceUrl`/ngsw-worker.js`) as string, {enabled: environment.production}),
        BrowserAnimationsModule.withConfig({disableAnimations: AppComponent.preferReducedMotion}),
        BrowserModule,
        HttpClientModule,
        MatButtonModule,
        MatToolbarModule,
        MatSidenavModule,
        MatProgressBarModule,
        MatIconModule,
        MatMenuModule,
        ElementModule,
        SearchResultModule,
    ],
    declarations: [
        TopMenuComponent,
        SideMenuComponent,
        SideItemComponent,
        FooterComponent,
        DocViewComponent,
        SearchBoxComponent,
        NoticeComponent,
        CookiePopupComponent,
        ThemeToggleComponent,
        AppComponent,
    ],
    providers: [
        Location,
        LogService,
        GoogleService,
        DeployService,
        LocationService,
        ConfigService,
        NavService,
        DocService,
        TocService,
        ScrollService,
        ScrollSpyService,
        SearchService,
        storageProviders,
        svgIconProviders,
        {provide: MatIconRegistry, useClass: IconService},
        {provide: ErrorHandler, useClass: ErrorService},
        {provide: LocationStrategy, useClass: PathLocationStrategy},
        {provide: windowToken, useFactory: windowProvider},
        {provide: currentDateToken, useFactory: currentDateProvider},
    ],
    bootstrap: [
        AppComponent,
    ]
})
export class AppModule {

}
