import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Toast = {
  header: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }

  private toastSubject = new BehaviorSubject<Toast>({ header: '', message: '' });
  toast$ = this.toastSubject.asObservable();

  showToast(header: string, message: string): void {
    this.toastSubject.next({ header, message });
  }
}
