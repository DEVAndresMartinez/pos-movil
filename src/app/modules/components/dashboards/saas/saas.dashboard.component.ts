import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from 'src/app/modules/service/auth.service';
import { SalesService } from 'src/app/modules/service/sales.service';
import { UsersService } from 'src/app/modules/service/users.service';

@Component({
    templateUrl: './saas.dashboard.component.html',
    styleUrl: './saas.dashboard.component.scss'
})
export class SaaSDashboardComponent implements OnInit, OnDestroy {

    loading = true;
    basicOptionsCant: any;
    basicDataCant: any;
    basicOptionsTotal: any;
    basicDataTotal: any;
    paymentMethodName: any
    quantitySales: any;
    totalSales: any;
    sales: any[] = [];
    permissions: string[] = []

    private authService = inject(AuthService);
    public user = computed(() => this.authService.currentUser());

    isClientActive = true;

    constructor(
        private usersService: UsersService,
        private saleService: SalesService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        if (this.user()?.clientStatus === "Inactivo" || this.user()?.status === 'Inactivo' || this.user()?.status === 'Eliminado') {
            this.isClientActive = false;
        }
        const userId = this.user()?.id;
        if (userId) {
            this.usersService.getUserById(userId).subscribe((user) => {
                if (user && Array.isArray(user.roles)) {
                    this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
                    this.saleService.validateStatus().subscribe(sales => {
                        this.sales = sales;
                        this.paymentMethodName = [...new Set(sales.map(sale => sale.paymentMethod?.name).filter(name => name !== undefined))];
                        this.quantitySales = this.paymentMethodName.map((name: any) => {
                            return sales.filter(sale => sale.paymentMethod?.name === name).length;
                        })
                        this.totalSales = this.paymentMethodName.map((name: any) => {
                            return sales.filter(sale => sale.paymentMethod?.name === name).reduce((sum, sale) => sum + sale.totalSale, 0);
                        });
                        this.graphCant();
                        this.graphTotal();
                    });
                };
            });
            this.loading = false;
        };
    }


    graphCant() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.basicDataCant = {
            labels: this.paymentMethodName,
            datasets: [
                {
                    label: 'Cantidad Ventas',
                    data: this.quantitySales,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)' ],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)']
                      
                }
            ]
        };

        this.basicOptionsCant = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }


    graphTotal() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.basicDataTotal = {
            labels: this.paymentMethodName,
            datasets: [
                {
                    label: 'Total Dinero',
                    data: this.totalSales,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)' ],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)']
                }
            ]
        };

        this.basicOptionsTotal = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    goPos() {
        this.router.navigate(['/home/pos']);
    }

    goCash() {
        this.router.navigate(['/home/cash']);
    }

    goSales() {
        this.router.navigate(['/home/sales/list']);
    }

    goInventory() {
        this.router.navigate(['/home/products/inventory']);
    }


    ngOnDestroy(): void {
    }
}
