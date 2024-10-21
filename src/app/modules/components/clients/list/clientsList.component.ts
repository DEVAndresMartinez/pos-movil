import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Client } from 'src/app/modules/interfaces';
import { AuthService } from 'src/app/modules/service/auth.service';
import { ClientsService } from 'src/app/modules/service/clients.service';

@Component({
    templateUrl: './clientsList.component.html',
    styleUrls: ['./clientsList.component.css']
})
export class ClientsListComponent implements OnInit {

    private authService = inject(AuthService);

    public loginUser = computed(() => this.authService.currentUser()); 

    clients: Client[] = [];

    isMenuOpen = false;
    loading = true;

    constructor(private clientsService: ClientsService, private router: Router) { }

    ngOnInit() {
        this.clientsService.getClients().subscribe(clients => {
            this.clients = clients;
            this.clients.forEach(client => {
                client.items = [
                    {label: 'Ver', icon: 'pi pi-eye', command: (event) => this.onEditClient(client)},
                    (client.status === 'Activo') ? {label: 'Inactivar', icon: 'pi pi-times-circle', command: (event) => this.onDeleteClient(client)} : {label: 'Activar', icon: 'pi pi-verified', command: (event) => this.onActiveClient(client)}
                ];
            });
        });
        this.loading = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }

    navigateToCreateClient(){
        this.router.navigate(['/home/clients/create'])
    }

    onEditClient(client: Client){
        this.router.navigate(['/home/clients/view', client.id])
    }

    onActiveClient(client: Client){
        const copyClient = {...client};
        copyClient.status = 'Activo';
        delete copyClient.items;
        this.clientsService.updateclient(copyClient)
        .subscribe( {
            next: () => this.ngOnInit(),
        });
    }
    
    onDeleteClient(client: Client){
        if (confirm('¿Estás seguro de que quieres inactivar este cliente?')) {
            this.clientsService.deleteClientById(client.id)
            .subscribe( client => {
                this.ngOnInit();
            });
        }
    }

}