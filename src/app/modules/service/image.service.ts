import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor() { }

    readImageFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                resolve(e.target.result as string);
            };
            reader.onerror = (error: any) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }

    saveImageFile(imageData: string, fileName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const link = document.createElement('a');
            link.href = imageData;
            link.download = fileName;
            link.click();
            resolve();
        });
    }
    
}