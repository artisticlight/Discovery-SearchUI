import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { Subject, of } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';

import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';

import { AsfApiService } from '@services';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: 'file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.css']
})
export class FileUploadDialogComponent implements OnInit {
  @ViewChild('file') file;

  public dropEvent: any;
  public files: Set<File> = new Set();
  public request: Subscription;
  public canBeClosed = true;
  public primaryButtonText = 'Upload';
  public showCancelButton = true;
  public uploading = false;
  public uploadSuccessful = false;

  public isFileInvalidType$ = new Subject<string>();
  public isFileError = false;

  constructor(
    private dialogRef: MatDialogRef<FileUploadDialogComponent>,
    private snackBar: MatSnackBar,
    private asfApiService: AsfApiService,
  ) {}

  public ngOnInit() {
    this.isFileInvalidType$.pipe(
      tap(_ => this.isFileError = true),
      tap(
        fileType => this.snackBar.open(
          `Invalid File Type (.${fileType})`, 'FILE ERROR', { duration: 3000 }
        )
      ),
      delay(820),
      tap(_ => this.isFileError = false),
    ).subscribe(
      _ => console.log('file is invalid')
    );
  }

  onFileDrop(ev) {
    if (ev.dataTransfer.items) {
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === 'file') {
          const file = ev.dataTransfer.items[i].getAsFile();
          this.addFile(file);
        }
      }
    } else {
      for (let i = 0; i < ev.dataTransfer.files.length; i++) {
        const file = ev.dataTransfer.files[i];
        this.addFile(file);
      }
    }

    ev.preventDefault();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;

    for (const key in files) {
      if (!isNaN(parseInt(key, 10))) {
        this.addFile(files[key]);
      }
    }
  }

  onRemoveFile(file) {
    this.files.delete(file);
  }

  onUpload() {
    this.uploading = true;

    this.request = this.asfApiService.upload(this.files).subscribe(
      resp => {
        console.log(resp);
        if (resp.error) {
          const { report, type } = resp.error;
          this.snackBar.open(report, type, { duration: 5000 });
          this.dialogRef.close();
        } else {
          this.dialogRef.close(resp.wkt);
        }
      },
      err => {
        this.snackBar.open('Error loading geospatial file',  'FILE ERROR', { duration: 3000 });
        this.dialogRef.close();
      }
    );

    this.canBeClosed = false;
    this.dialogRef.disableClose = true;

    this.showCancelButton = false;
  }

  private addFile(file): void {
    const fileName = file.name;

    if (this.isValidFileType(fileName)) {
      this.files.add(file);
    } else {
      this.isFileInvalidType$.next(
        this.getFileType(fileName)
      );
    }
  }

  private isValidFileType(fileName: string): boolean {
    const validFileTypes = ['zip', 'shp', 'geojson', 'kml'];

    const fileExtension = this.getFileType(fileName);

    return validFileTypes.some(
      ext => ext === fileExtension
    );
  }

  private getFileType(fileName: string): string {
    return fileName.split('.').pop();
  }
}
