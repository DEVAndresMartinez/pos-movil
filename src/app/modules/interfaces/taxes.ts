export interface Taxes {
    id: string,
    name: string,
    percentage: string,
}

export interface TaxesType {
    id: string,
    name: string,
    codeConexus: string,
    isTaxWithholding: true,
    percentage: number,
    status: boolean,
    createdAt: string,
    updatedAt: string
}