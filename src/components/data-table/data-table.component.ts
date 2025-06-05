import { TableHeader } from '@/src/models/data.models';
import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges, TemplateRef } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-data-table',
  imports: [CommonModule, RouterModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
 totalColumns: number = 0;
  @Input() tableHeaders: TableHeader[] = [];
  @Input() tableData: any[] = []
  @Input() loading!: boolean;
    // Input to receive custom templates from the parent
  @Input() customCellTemplates: { [key: string]: TemplateRef<any> } = {};
  @Input() routerlink: string = ''
  @Input() idType: string = ''
  constructor() { }

  ngOnInit(): void{

  }

  ngOnChanges(changes: SimpleChanges): void {
    // Recalculate totalColumns if headers change
    if (changes['tableHeaders']) {
      this.calculateTotalColumns();
    }
  }

  private calculateTotalColumns(): void {
    if (this.tableHeaders && this.tableHeaders.length > 0) {
      this.totalColumns = this.tableHeaders.reduce((sum, h) => sum + h.columns, 0);
    } else {
      this.totalColumns = 0;
    }
  }

}
