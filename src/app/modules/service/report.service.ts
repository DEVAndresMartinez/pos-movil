import { Injectable } from "@angular/core";
import * as ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';


@Injectable({
    providedIn: 'root'
})
export class ReportService {

    constructor() { }

    reportCashXlsx(data: any[], fileName: string): void {
        const book = new ExcelJS.Workbook();
        const sheet = book.addWorksheet('Cash Closing Report');

        const headers = [
            { header: 'Fecha Creación', key: 'createdAt' },
            { header: 'Fecha de Cierre', key: 'closingDate' },
            { header: 'Base Inicial', key: 'openingBalance' },
            { header: 'Monto final', key: 'closingBalance' },
            { header: 'Nombre Usuario / Apertura', key: 'userName' },
            { header: 'Nombre Usuario / Cierre', key: 'userName' }
        ];
        sheet.columns = headers.map(header =>
            ({ header: header.header, key: header.key })
        );

        data.forEach((row) => {
            const rowValues: any[] = headers.map(header => row[header.key]);
            const newRow = sheet.addRow(rowValues);
        });

        sheet.columns.forEach((column: any) => {
            let maxLenth = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellValue = cell.value ? cell.value.toString() : '';
                maxLenth = Math.max(maxLenth, cellValue.length);
            });
            column.width = maxLenth;
        });

        book.xlsx.writeBuffer().then((buffer: any) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, fileName + '.xlsx');
        });
    }

    reportCashPdf(data: any[], fileName: string): void {
        const doc = new jsPDF('landscape');

        const headers = ['Fecha Creación ', 'Fecha de Cierre ', 'Base Inicial ', 'Monto final ', 'Nombre Usuario / Apertura ', 'Nombre Usuario / Cierre '];

        const rows = data.map(row => [
            row.createdAt,
            row.closingDate,
            row.openingBalance,
            row.closingBalance,
            row.userName,
            row.userName
        ]);

        (doc as any).autoTable({
            head: [headers],
            body: rows,
            styles: { fontSize: 10, cellPadding: 3 },
            theme: 'grid',
            margin: { top: 20 }
        });
        doc.save(fileName + '.pdf');
    }

    reportSalesXlsx(data: any[], fileName: string): void {
        const book = new ExcelJS.Workbook();
        const sheet = book.addWorksheet('Sales Report');

        const headers = [
            { header: 'Factura', key: 'invoiceSequence' },
            { header: 'Estado DIAN', key: 'statusDian' },
            { header: 'Identificación', key: 'idClient' },
            { header: 'Nombre Cliente', key: 'nameClient' },
            { header: 'Estado', key: 'statusSale' },
            { header: 'Forma de Pago', key: 'paymentMethod' },
            { header: 'Fecha Venta', key: 'billingType' },
            { header: 'Valor Venta', key: 'updatedAt' },
            { header: 'Tipo Factura', key: 'totalSale' },
        ];
        sheet.columns = headers.map(header =>
            ({ header: header.header, key: header.key })
        );

        data.forEach((row) => {
            const rowValues: any[] = headers.map(header => row[header.key]);
            const newRow = sheet.addRow(rowValues);
        });

        sheet.columns.forEach((column: any) => {
            let maxLenth = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellValue = cell.value ? cell.value.toString() : '';
                maxLenth = Math.max(maxLenth, cellValue.length);
            });
            column.width = maxLenth;
        });

        book.xlsx.writeBuffer().then((buffer: any) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, fileName + '.xlsx');
        });
    }

    reportSalesPdf(data: any[], fileName: string): void {
        const doc = new jsPDF('landscape');

        const headers = [ 'Factura', 'Estado DIAN', 'Identificación', 'Nombre Cliente', 'Estado', 'Forma de Pago', 'Tipo Factura', 'Fecha Venta', 'Valor Venta' ];

        const rows = data.map(row => [
            row.invoiceSequence,
            row.statusDian,
            row.idClient,
            row.nameClient,
            row.statusSale,
            row.paymentMethod,
            row.totalSale,
            row.billingType,
            row.updatedAt
        ]);

        (doc as any).autoTable({
            head: [headers],
            body: rows,
            styles: { fontSize: 10, cellPadding: 3 },
            theme: 'grid',
            margin: { top: 20 }
        });
        doc.save(fileName + '.pdf');
    }

    reportStockXlsx(data: any[], fileName: string): void {
        const book = new ExcelJS.Workbook();
        const sheet = book.addWorksheet('Stock Report');

        const headers = [
            { header: 'Nombre Producto', key: 'nameStock' },
            { header: 'Sku Producto', key: 'skuStock' },
            { header: 'Unidad Producto', key: 'undStock' },
            { header: 'Cantidad Mínima', key: 'minQuantity' },
            { header: 'Cantidad Actual', key: 'actualQuantity' },
            { header: 'Precio Producto', key: 'price' }
        ];
        sheet.columns = headers.map(header =>
            ({ header: header.header, key: header.key })
        );

        data.forEach((row) => {
            const rowValues: any[] = headers.map(header => row[header.key]);
            const newRow = sheet.addRow(rowValues);
        });

        sheet.columns.forEach((column: any) => {
            let maxLenth = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellValue = cell.value ? cell.value.toString() : '';
                maxLenth = Math.max(maxLenth, cellValue.length);
            });
            column.width = maxLenth;
        });

        book.xlsx.writeBuffer().then((buffer: any) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, fileName + '.xlsx');
        });
    }

    reportStockPdf(data: any[], fileName: string): void {
        const doc = new jsPDF('landscape');

        const headers = ['Nombre Producto', 'Sku Producto', 'Unidad Producto', 'Cantidad Mínima', 'Cantidad Actual', 'Precio Producto'];

        const rows = data.map(row => [
            row.nameStock,
            row.skuStock,
            row.undStock,
            row.minQuantity,
            row.actualQuantity,
            row.price
        ]);

        (doc as any).autoTable({
            head: [headers],
            body: rows,
            styles: { fontSize: 10, cellPadding: 3 },
            theme: 'grid',
            margin: { top: 20 }
        });
        doc.save(fileName + '.pdf');
    }

}