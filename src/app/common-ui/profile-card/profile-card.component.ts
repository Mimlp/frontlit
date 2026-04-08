import {Component, Input} from '@angular/core';
import {UserInterface} from '../../data/interfaces/user.interface';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-profile-card',
  imports: [
    RouterLink
  ],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent {
  @Input() user?: UserInterface;
}
