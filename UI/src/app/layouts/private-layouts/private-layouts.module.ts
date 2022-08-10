import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';

import { PrivateLayoutsRoutingModule } from './private-layouts-routing.module';
import { PrivateLayoutsComponent } from './private-layouts.component';

@NgModule({
  declarations: [PrivateLayoutsComponent],
  imports: [
    PrivateLayoutsRoutingModule,
    CommonModule,
    ComponentsModule,
    HttpClientModule,
  ],
})
export class PrivateLayoutsModule {}
