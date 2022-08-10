import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../components/privates';

import { PrivateLayoutsComponent } from './private-layouts.component';

const routes: Routes = [
  {
    path: '',
    component: PrivateLayoutsComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivateLayoutsRoutingModule {}
