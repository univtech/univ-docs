import {Component, Input} from '@angular/core';
import {NoteType} from './note.model';

/**
 * 便签组件，使用方式：
 * ```
 * <univ-note type="none | tip | note | warn"></univ-note>
 * ```
 */
@Component({
    selector: 'univ-note',
    templateUrl: './note.component.html',
})
export class NoteComponent {

    // 便签类型：none、tip、note、warn，默认为none
    @Input() type = NoteType.None;

    /**
     * 获取便签标题
     *
     * @return 便签标题
     */
    get title(): string {
        if (this.type === NoteType.Tip) {
            return '提示';
        } else if (this.type === NoteType.Note) {
            return '注意';
        } else if (this.type === NoteType.Warn) {
            return '警告';
        } else {
            return '';
        }
    }

    /**
     * 获取便签样式
     *
     * @return 便签样式
     */
    get classes(): string {
        const classes = [];
        classes.push(this.type === NoteType.None ? 'alert' : 'callout');
        if (this.type === NoteType.Tip) {
            classes.push('is-helpful');
        } else if (this.type === NoteType.Note) {
            classes.push('is-important');
        } else if (this.type === NoteType.Warn) {
            classes.push('is-critical');
        }
        return classes.join(' ');
    }

}
