import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/modules/interfaces';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit{

  isSuperUser = false;
  loading = true;
  
  private authService = inject(AuthService);
  public loginUser = computed(() => this.authService.currentUser()); 

  constructor(private router:Router) { }


  ngOnInit() {
    if(this.loginUser()?.clientId === null ) {
      this.isSuperUser = true;
      this.loading = false;
    }else {
      this.loading = false;
    }
  }
  navigateToEditUser() {
    this.router.navigate(['/home/users/edit', this.loginUser()?.id]);
  }
}
