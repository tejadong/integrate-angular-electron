import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  title = 'integrate-angular-electron';
  mensaje = '';
  ipcRenderer = this.electronService.ipcRenderer;
  showNotification = false;
  showRestartBtn = false;

  constructor(private electronService: ElectronService, private cd: ChangeDetectorRef) {
    this.ipcRenderer.on('update_available', () => {
      this.ipcRenderer.removeAllListeners('update_available');
      this.mensaje = 'Hay una nueva actualización disponible. Descargando...';
      this.showNotification = true;
      this.cd.detectChanges();
    });

    this.ipcRenderer.on('update_downloaded', () => {
      this.ipcRenderer.removeAllListeners('update_downloaded');
      this.mensaje = 'Actualización descargada. Será instalada en el próximo reinicio. ¿Desea reiniciar la apliación?';
      this.showRestartBtn = true;
      this.showNotification = true;
      this.cd.detectChanges();
    });
  }

  ngOnInit(): void {
  }

  getVersion(): void {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('app_version');
      this.electronService.ipcRenderer.on('app_version', (event, arg) => {
        this.electronService.ipcRenderer.removeAllListeners('app_version');
        alert(arg.version);
      });
    }
  }

  closeNotification(): void {
    this.showNotification = false;
    this.cd.detectChanges();
  }

  restartApp(): void  {
    this.ipcRenderer.send('restart_app');
  }
}
