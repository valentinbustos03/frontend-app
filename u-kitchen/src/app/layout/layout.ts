import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterOutlet, MatIconModule, MatToolbarModule, MatButtonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

}
