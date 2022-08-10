import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './layouts';
import { AuthGuard } from './services/auth.guard';
const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./layouts/private-layouts/private-layouts.module').then(
        (m) => m.PrivateLayoutsModule
      ),
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
