import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MonacoEditorModule } from 'ngx-monaco-editor';

//layouts
import {
  FooterComponent,
  ToolbarComponent,
  NavigationsComponent,
  LoadingComponent,
} from './layouts';

//dialog
import {
  LoginDialogComponent,
  WarningDialogComponent,
  ErrorDialogComponent,
  AddOnsDialogComponent,
  PermissionsDialogComponent,
  ChmodDialogComponent,
  NewDialogComponent,
  PropertiesDialogComponent,
  EditDialogComponent,
  TransferDialogComponent,
  SettingDialogComponent,
  UploadDialogComponent,
  ArchiveDialogComponent,
} from './dialog';

//private
import {
  BreadcrumbComponent,
  HomeComponent,
  ContextMenuComponent,
} from './privates';

//Fortawesome
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    //Layouts
    FooterComponent,
    ToolbarComponent,
    NavigationsComponent,

    //Dialog
    LoginDialogComponent,
    WarningDialogComponent,
    ErrorDialogComponent,
    AddOnsDialogComponent,
    PermissionsDialogComponent,
    ChmodDialogComponent,
    NewDialogComponent,

    //Private
    BreadcrumbComponent,
    HomeComponent,
    ContextMenuComponent,
    PropertiesDialogComponent,
    EditDialogComponent,
    LoadingComponent,
    TransferDialogComponent,
    SettingDialogComponent,
    UploadDialogComponent,
    ArchiveDialogComponent,
  ],
  imports: [
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    CommonModule,
    FormsModule,
    NgbModule,
    FontAwesomeModule,
    RouterModule,
    HttpClientModule,
    MonacoEditorModule,
  ],
  exports: [
    ToolbarComponent,
    NavigationsComponent,
    FooterComponent,
    FormsModule,
    HomeComponent,
  ],
  providers: [],
})
export class ComponentsModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, fab, far);
  }
}
