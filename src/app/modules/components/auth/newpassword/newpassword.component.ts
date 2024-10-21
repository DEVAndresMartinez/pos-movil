import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, OnInit, computed, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangePassword, UpdatePassword } from 'src/app/modules/interfaces';
import { AuthService } from 'src/app/modules/service/auth.service';
import { AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

interface Data {
	id: string;
}


function passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  return newPassword && confirmPassword && newPassword.value === confirmPassword.value ? null : {'mismatch': true};
}

@Component({
	templateUrl: './newpassword.component.html',
	styleUrls: ['./newpassword.component.css']
})
export class NewPasswordComponent implements OnInit{

	isUpdatePassword:boolean = true;
	isLoginUser:boolean = false;
	id: string;

	private authServices = inject(AuthService);
    private loginUser = computed(() => this.authServices.currentUser()); 

	public passwordForm = new FormGroup({
		newPassword: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(8)], nonNullable: true }),
		confirmPassword: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(8)], nonNullable: true }),
		lastPassword: new FormControl<string>('')
      }, { validators: passwordMatchValidator });

	  private fieldNames = {
        newPassword: 'Nueva contraseña',
        confirmPassword: 'Confirmar contraseña',
    };


	constructor(
		private dialogRef: DialogRef<Data>,
		private authService: AuthService,
		private activatedRoute: ActivatedRoute,

		@Inject(DIALOG_DATA) data: Data

	) {
		this.id = data.id;
	}

	get currentChangePassword():ChangePassword {
        const newPassword = this.passwordForm.value as ChangePassword;
        return newPassword;
    }

	get currentUpdatePassword():UpdatePassword {
        const newPassword = this.passwordForm.value as UpdatePassword;
        return newPassword;
    }

	ngOnInit() {
		if(this.loginUser()?.id === this.id){
			this.isUpdatePassword = false;
		}
		return;
	}

	onSubmit(){
		if (!this.passwordForm.valid) {
			for (const field in this.passwordForm.controls) { 
                if (this.passwordForm.controls[field as keyof typeof this.passwordForm.controls].invalid) {
                    const fieldName = this.fieldNames[field as keyof typeof this.fieldNames];
                    Swal.fire('Error', `Por favor, completa el campo ${fieldName}`, 'error');
                    return;
				}
			} 
		}

		if (!this.passwordForm.valid) {
			Swal.fire('Error', 'Contraseñas no coinciden', 'error');
			return;
		}

		if(!this.isUpdatePassword){
			this.updatePassword();
		} else {
			this.changePassword();
		}
	
	}

	changePassword() {
		
		this.authService.changePassword(this.currentChangePassword.confirmPassword, this.id).subscribe({
			next: () => {
				Swal.fire('Guardado', 'contraseña actualizada correctamente', 'success');
				this.dialogRef.close();
			},
			error: (err) => {
				Swal.fire('Error', err.name, 'error')
			}
		});
	}

	updatePassword() {
		
		this.authService.updatePassword(this.currentUpdatePassword.confirmPassword, this.currentUpdatePassword.lastPassword ,this.id).subscribe({
			next: () => {
				Swal.fire('Guardado', 'contraseña cambiada correctamente', 'success');
				this.dialogRef.close();
			},
			error: (err) => {
				Swal.fire('Error', err.name, 'error')
			}
		});
	}

	onBack() {
		this.dialogRef.close();
	}

}
