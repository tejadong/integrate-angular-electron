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
  files = [];
  drives = [];

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

    this.listDrives();
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

  listDrives(): void {
    this.ipcRenderer.send('list_drives');
    this.ipcRenderer.on('list_drives', (event, args) => {
      this.drives = args.drives.map((currentValue, index, array) => {
        let label = '';

        switch (currentValue.drive_type) {
          case 0:
            label += 'Unidad desconocida: ';
            break;
          case 1:
            label += 'Sin directorio raíz: ';
            break;
          case 2:
            label += 'Dispositivo extraíble: ';
            break;
          case 3:
            label += 'Disco local: ';
            break;
          case 4:
            label += 'Unidad de red: ';
            break;
          case 5:
            label += 'Unidad de CD/DVD: ';
            break;
          case 6:
            label += 'Disquete: ';
            break;
        }

        label += currentValue.caption +
          ' ' + currentValue.so.VolumeName + ' ' +
          ' (' + currentValue.file_system + ') ' +
          ((((parseFloat(currentValue.free_space) / 1024) / 1024) / 1024)).toFixed(0) + '/' +
          ((((parseFloat(currentValue.size) / 1024) / 1024) / 1024)).toFixed(0) + ' GB';



        return {value: currentValue.caption,  name: label};
      });
      console.log('drives: ', this.drives);
      this.cd.detectChanges();
    });
  }

  listFiles(e): void {
    let value = e.target.value;

    if (value === '') {
      this.files = [];
      return;
    }

    value = value.substr(0, 2) + '/';

    this.ipcRenderer.send('explorer_list_files', {driveSelected: value});
    this.ipcRenderer.on('explorer_list_files', (event, args) => {
      this.files = args.arrFiles;
      console.log('files: ', this.files);
      this.cd.detectChanges();
    });
  }

}
