import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ElementComponentModule} from '../element/element-extension.service';
import {NoteComponent} from './note.component';

/**
 * 便签模块
 */
@NgModule({
    imports: [CommonModule],
    declarations: [NoteComponent],
    exports: [NoteComponent],
})
export class NoteModule implements ElementComponentModule {

    elementComponent: Type<any> = NoteComponent;

}
