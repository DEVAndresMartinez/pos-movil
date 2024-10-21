import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/service/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

import Swal from 'sweetalert2'

@Component({
	templateUrl: './login.component.html'
})
export class LoginComponent {

	private fb = inject(FormBuilder);
	private authService = inject(AuthService);
	private router = inject(Router)

	public loginForm = this.fb.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]],
	})

	login() {

		const { email, password } = this.loginForm.value;

		this.authService.login(email as string, password as string)
			.subscribe( {
				next: () => this.router.navigate(['/home']),
				error: (message) => {
					Swal.fire('Error', message, 'error');
				},
			});
	}

	constructor(private layoutService: LayoutService) {}

	get filledInput(): boolean {
		return this.layoutService.config().inputStyle === 'filled';
	}

}
