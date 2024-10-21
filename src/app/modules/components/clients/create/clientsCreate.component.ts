import { Component, OnInit, computed, inject } from '@angular/core';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { switchMap } from 'rxjs';
// import { Dialog } from '@angular/cdk/dialog';
// import { Table } from 'primeng/table';
// import { Renderer2, ElementRef } from '@angular/core';
// import Swal from 'sweetalert2';

// import { CreateClient, User } from 'src/app/modules/interfaces';
// import { AuthService } from 'src/app/modules/service/auth.service';
// import { ClientsService } from 'src/app/modules/service/clients.service';
// import { NewPasswordComponent } from 'src/app/modules/components/auth/newpassword/newpassword.component';
// import { LocationService } from 'src/app/modules/service/location.service';

// @Component({
//     templateUrl: './clientsCreate.component.html',
//     styleUrls: ['./clientsCreate.component.scss']
// })
// export class ClientsCreateComponent implements OnInit {

//     isEdit: boolean = false;
//     isView: boolean = false;
//     showPassword = false;
//     loading = true;

//     deptos: any[] = [];
//     deptoId: string = '';
//     cities: any[] = [];
//     estados: any[] = [];
//     users: User[] = [];

//     public clientForm = new FormGroup({
//         id: new FormControl<string>(''),
//         businessName: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
//         nit: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
//         userName: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
//         email: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
//         cellPhone: new FormControl<string>("", [Validators.pattern('^3[0-9]{9}$'), Validators.minLength(10), Validators.maxLength(10)]),
//         cityId: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
//         address: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
//         users: new FormControl<User[]>([]),
//         status: new FormControl<string>(''),
//         conexusGuidCompany: new FormControl<string>('', { nonNullable: true }),
//         conexusGuidOrigin: new FormControl<string>('', { nonNullable: true }),
//         conexusSecurityHash: new FormControl<string>('', { nonNullable: true }),
//     });

//     private fieldNames = {
//         businessName: 'Razón social',
//         nit: 'Nit',
//         userName: 'Representante',
//         email: 'Email',
//         cellPhone: 'Teléfono',
//         cityId: 'Ciudad',
//         address: 'Dirección',
//         status: 'Estado',
//     };


//     private authService = inject(AuthService);

//     public loginUser = computed(() => this.authService.currentUser());

//     constructor(
//         private clientService: ClientsService,
//         private activatedRoute: ActivatedRoute,
//         private location: LocationService,
//         private router: Router,
//         private dialog: Dialog,
//         private renderer: Renderer2,
//         private el: ElementRef,
//     ) { }


//     ngOnInit() {
//         this.location.getDepartment("b6bb6dbf-7217-4757-a829-02568e8fde7f").subscribe(res => {
//             this.deptos = res;
//         })

//         this.estados = [
//             'Activo',
//             'Inactivo',
//         ];

//         if (this.router.url.includes('edit')) {

//             this.activatedRoute.params
//                 .pipe(
//                     switchMap(({ id }) => this.clientService.getClientById(id)),
//                 ).subscribe(client => {

//                     if (!client) {
//                         return this.router.navigateByUrl('/');
//                     }

//                     this.isEdit = true;
//                     this.clientForm.reset(client);
//                     this.loading = false;
//                     return;
//                 });

//         } else if (this.router.url.includes('view')) {
//             this.activatedRoute.params
//                 .pipe(
//                     switchMap(({ id }) => this.clientService.getClientById(id)),
//                 ).subscribe(client => {

//                     if (!client) {
//                         return this.router.navigateByUrl('/');
//                     }

//                     this.users = client.users || [];

//                     this.users.forEach(user => {
//                         user.items = [
//                             { label: 'Cambiar contraseña', icon: 'pi pi-unlock', command: (event) => this.onChangePassword(user) },
//                         ];
//                     });

//                     this.isView = true;
//                     this.clientForm.reset(client);
//                     this.clientForm.disable();
//                     this.loading = false;
//                     return;
//                 });
//         } else {
//             this.loading = false;
//             return;
//         }

//     }

//     get currentClient(): CreateClient {
//         const users = this.clientForm.value as CreateClient;
//         return users;
//     }


//     onSubmit() {
//         if (this.clientForm.invalid) {
//             for (const field in this.clientForm.controls) {
//                 if (this.clientForm.controls[field as keyof typeof this.clientForm.controls].invalid) {
//                     const fieldName = this.fieldNames[field as keyof typeof this.fieldNames];
//                     Swal.fire('Error', `Por favor, completa el campo ${fieldName}`, 'error');
//                     return;
//                 }
//             }
//         }

//         if (this.currentClient.id) {
//             this.clientService.updateclient(this.currentClient)
//                 .subscribe({
//                     next: () => {
//                         Swal.fire('Guardado', 'Cliente Editado correctamente', 'success');
//                         this.router.navigate(['/home/clients/view', this.currentClient.id]);
//                     },
//                     error: (err) => Swal.fire('Error', err.name, 'error')
//                 });
//             return;
//         } else {
//             delete this.currentClient.id;
//             this.clientService.addClient(this.currentClient)
//                 .subscribe({
//                     next: () => {
//                         Swal.fire('Guardado', 'Cliente creado correctamente', 'success');
//                         this.router.navigate(['/home/clients/list'])
//                     },
//                     error: (err) => Swal.fire('Error', err.name, 'error')
//                 });
//         }
//     }

//     onGlobalFilter(table: Table, event: Event) {
//         table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
//     }

//     onEditUser(user: User) {
//         this.router.navigate(['/home/users/edit', user.id])
//     }

//     onBack() {
//         if (this.router.url.includes('view') || this.router.url.includes('create')) {
//             this.router.navigate(['/home/clients/list']);
//         } else if (this.router.url.includes('edit')) {
//             this.router.navigate(['/home/clients/view', this.currentClient.id]);
//         }

//     }

//     navigateToEditClient() {
//         this.router.navigate(['/home/clients/edit', this.currentClient.id])
//     }

//     onChangePassword(user: User) {

//         const globalFilterInput = this.el.nativeElement.querySelector('.globalFilter');
//         this.renderer.setProperty(globalFilterInput, 'disabled', true);

//         this.dialog.open(NewPasswordComponent, {
//             minWidth: '300px',
//             minHeight: '300px',
//             data: { id: user.id }
//         });
//     }

//     onDeptoChange(event: any): void {
//         this.deptoId = event.value;
//         this.location.getCity(this.deptoId).subscribe(data => {
//             this.cities = data;
//         })
//     }
// }   
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { Table } from 'primeng/table';
import { Renderer2, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';

import { CreateClient, User } from 'src/app/modules/interfaces';
import { AuthService } from 'src/app/modules/service/auth.service';
import { ClientsService } from 'src/app/modules/service/clients.service';
import { NewPasswordComponent } from 'src/app/modules/components/auth/newpassword/newpassword.component';
import { LocationService } from 'src/app/modules/service/location.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    templateUrl: './clientsCreate.component.html',
    styleUrls: ['./clientsCreate.component.scss']
})
export class ClientsCreateComponent implements OnInit {

    isEdit: boolean = false;
    isView: boolean = false;
    showPassword = false;
    loading = true;

    deptos: any[] = [];
    deptoId: string = '';
    cities: any[] = [];
    estados: any[] = [];
    users: User[] = [];
    digitoVerificacion!: number;
    personType: string = '';
    currentStep: number = 0;
    identificationType = [
        {
            label: 'Cédula de identidad',
            value: 1
        },
        {
            label: 'Registro civil',
            value: 2
        },
        {
            label: 'Tarjeta de identidad',
            value: 3
        },
        {
            label: 'Cédula extranjera',
            value: 4
        },
        {
            label: 'Pasaporte',
            value: 5
        }
    ];
    resolucion = [
        {
            label: 'Si',
            value: 1
        },
        {
            label: 'No',
            value: 2
        }
    ];
    facturationType = [
        {
            label: 'Factura electrónica de venta',
            value: 1
        },
        {
            label: 'Factura de talonario o de papel',
            value: 2
        },
        {
            label: 'Documento de soporte',
            value: 3
        },
        {
            label: 'DE / POS',
            value: 4
        }
    ]

    showPreviewDialog: boolean = false;
    selectedFile: File | null = null;
    filePreviewUrl: SafeResourceUrl | null = null;
    currentStepMemory: number = 1;

    public clientForm = new FormGroup({
        //Comercio
        id: new FormControl<string>(''),
        personType: new FormControl<string>('Juridico | Natural', { validators: [Validators.required], nonNullable: true }),
        nit: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        identificationDv: new FormControl<number | null>(null),
        businessName: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        departmentId: new FormControl<string>(''),
        cityId: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        address: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        email: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        cellPhoneBusiness: new FormControl<string>(''),
        //Representante legal
        identificationType: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        identification: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        firstname: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        secondname: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        firstlastname: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        secondlastname: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        resolution: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        //Resolución
        prefix: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        facturationType: new FormControl<any>(1),
        datefrom: new FormControl<string>(''),
        datetodate: new FormControl<string>(''),
        rangefrom: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
        rangeupto: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
        authorizationdate: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        numberresolution: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
        //llaves
        conexusGuidCompany: new FormControl<string>('', { nonNullable: true }),
        conexusGuidOrigin: new FormControl<string>('', { nonNullable: true }),
        conexusSecurityHash: new FormControl<string>('', { nonNullable: true }),
        users: new FormControl<User[]>([]),
        status: new FormControl<string>(''),
    });

    private fieldNames = {
        businessName: 'Razón social',
        nit: 'Nit',
        userName: 'Representante',
        email: 'Email',
        cellPhone: 'Teléfono',
        cityId: 'Ciudad',
        address: 'Dirección',
        status: 'Estado',
    };


    private authService = inject(AuthService);

    public loginUser = computed(() => this.authService.currentUser());

    constructor(
        private clientService: ClientsService,
        private activatedRoute: ActivatedRoute,
        private location: LocationService,
        private router: Router,
        private dialog: Dialog,
        private renderer: Renderer2,
        private el: ElementRef,
        private sanitizier: DomSanitizer
    ) { }


    ngOnInit() {
        this.calcular();
        this.location.getDepartment("b6bb6dbf-7217-4757-a829-02568e8fde7f").subscribe(res => {
            this.deptos = res;
        })

        this.estados = [
            'Activo',
            'Inactivo',
        ];

        if (this.router.url.includes('edit')) {
            this.activatedRoute.params
                .pipe(
                    switchMap(({ id }) => this.clientService.getClientById(id)),
                ).subscribe(client => {

                    if (!client) {
                        return this.router.navigateByUrl('/');
                    }

                    this.isEdit = true;
                    this.clientForm.reset(client);
                    this.loading = false;
                    return;
                });

        } else if (this.router.url.includes('view')) {
            this.activatedRoute.params
                .pipe(
                    switchMap(({ id }) => this.clientService.getClientById(id)),
                ).subscribe(client => {

                    if (!client) {
                        return this.router.navigateByUrl('/');
                    }

                    this.users = client.users || [];

                    this.users.forEach(user => {
                        user.items = [
                            { label: 'Cambiar contraseña', icon: 'pi pi-unlock', command: (event) => this.onChangePassword(user) },
                        ];
                    });

                    this.isView = true;
                    this.clientForm.reset(client);
                    this.clientForm.disable();
                    this.loading = false;
                    return;
                });
        } else {
            this.loading = false;
            return;
        }

    }

    get currentClient(): CreateClient {
        const users = this.clientForm.value as CreateClient;
        return users;
    }


    onSubmit() {
        if (this.clientForm.invalid) {
            for (const field in this.clientForm.controls) {
                if (this.clientForm.controls[field as keyof typeof this.clientForm.controls].invalid) {
                    const fieldName = this.fieldNames[field as keyof typeof this.fieldNames];
                    Swal.fire('Error', `Por favor, completa el campo ${fieldName}`, 'error');
                    return;
                }
            }
        }

        if (this.currentClient.id) {
            this.clientService.updateclient(this.currentClient)
                .subscribe({
                    next: () => {
                        Swal.fire('Guardado', 'Cliente Editado correctamente', 'success');
                        this.router.navigate(['/home/clients/view', this.currentClient.id]);
                    },
                    error: (err) => Swal.fire('Error', err.name, 'error')
                });
            return;
        } else {
            delete this.currentClient.id;
            this.clientService.addClient(this.currentClient)
                .subscribe({
                    next: () => {
                        Swal.fire('Guardado', 'Cliente creado correctamente', 'success');
                        this.router.navigate(['/home/clients/list'])
                    },
                    error: (err) => Swal.fire('Error', err.name, 'error')
                });
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }

    onEditUser(user: User) {
        this.router.navigate(['/home/users/edit', user.id])
    }

    onBack() {
        if (this.router.url.includes('view') || this.router.url.includes('create')) {
            this.router.navigate(['/home/clients/list']);
        } else if (this.router.url.includes('edit')) {
            this.router.navigate(['/home/clients/view', this.currentClient.id]);
        }

    }

    navigateToEditClient() {
        this.router.navigate(['/home/clients/edit', this.currentClient.id])
    }

    onChangePassword(user: User) {

        const globalFilterInput = this.el.nativeElement.querySelector('.globalFilter');
        this.renderer.setProperty(globalFilterInput, 'disabled', true);

        this.dialog.open(NewPasswordComponent, {
            minWidth: '300px',
            minHeight: '300px',
            data: { id: user.id }
        });
    }

    onDeptoChange(event: any): void {
        this.deptoId = event.value;
        this.location.getCity(this.deptoId).subscribe(data => {
            this.cities = data;
        })
    }

    calcularDigitoVerificacion(myNit: string): number {
        let vpri: number[] = Array(16).fill(0);
        let x = 0;
        let y = 0;

        vpri[1] = 3;
        vpri[2] = 7;
        vpri[3] = 13;
        vpri[4] = 17;
        vpri[5] = 19;
        vpri[6] = 23;
        vpri[7] = 29;
        vpri[8] = 37;
        vpri[9] = 41;
        vpri[10] = 43;
        vpri[11] = 47;
        vpri[12] = 53;
        vpri[13] = 59;
        vpri[14] = 67;
        vpri[15] = 71;

        let z = myNit.length;

        for (let i = 0; i < z; i++) {
            y = parseInt(myNit.charAt(i), 10);
            x += y * vpri[z - i];
        }

        y = x % 11;

        return (y > 1) ? 11 - y : y;
    }

    calcular(): void {
        const identification = this.clientForm.get('nit')?.value || '';
        if (identification) {
            this.digitoVerificacion = this.calcularDigitoVerificacion(identification.toString());
            this.clientForm.get('identificationDv')?.setValue(this.digitoVerificacion);
        } else {
            this.clientForm.get('identificationDv')?.setValue(null);
        }
    }

    nextStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
        }
    }

    prevStep() {
        if (this.currentStep === 1) {
            this.personType = '';
            this.currentStep = 0;
        } else {
            if (this.currentStep > 0) {
                this.currentStep--;
            }
        }
    }

    selectPersonTpe(person: string) {
        this.personType = person;
        if (this.personType === 'natural') {
            this.currentStep = 1;
        }
        this.nextStep();
    }

    formToggle() {
        if (this.currentStep  === 1 || this.currentStep === 2 || this.currentStep === 3){
            this.currentStepMemory = this.currentStep;
            this.currentStep = 4;
        }else if (this.currentStep === 4) {
            this.currentStep = this.currentStepMemory;
        }
    }

    onFileSelect(event: any) {
        const file = event.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    previewFile() {
        this.showPreviewDialog = true;
        if (this.selectedFile) {
            const objectUrl = URL.createObjectURL(this.selectedFile);
            this.filePreviewUrl = this.sanitizier.bypassSecurityTrustResourceUrl(objectUrl);
        }
    }

    closePreviewDialog() {
        this.showPreviewDialog = false;
        this.filePreviewUrl = null;
    }

    onUpload(event: any) {
        this.selectedFile = null;
        this.filePreviewUrl = null;
    }
}   