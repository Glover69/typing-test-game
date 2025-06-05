import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tab-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="tab-group flex gap-2 p-1 border bg-[#FAFAFA] border-slate-100 rounded-lg"
    >
      @for (tab of tabs; track $index) {
      <button class="w-fit rounded-lg px-4 py-2 text-sm transition-colors"
        (click)="selectTab(tab.value)"
        [ngClass]="{'bg-secondary-purple text-primary-purple': activeTab === tab.value,   ' text-black': activeTab !== tab.value, }"
      >
        <span class="G-Regular">{{ tab.label }}</span>
      </button>
      }
    </div>
  `,
  styles: `

  `,
})
export class TabGroupComponent {
  @Input() tabs: { label: string; value: string }[] = [];
  @Input() activeTab: string = '';
  @Output() activeTabChange = new EventEmitter<string>();

  selectTab(value: string) {
    this.activeTabChange.emit(value);
  }
}
