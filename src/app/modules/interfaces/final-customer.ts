export interface FinalCutomerCreate {
    personType: number,
    identificationTypeId: string,
    identification: string,
    identificationDv: number,
    regimeType: number | null,
    taxResponsible: string | null,
    tax: string | null,
    businessName: string,
    firstName: string,
    secondName: string,
    lastName: string,
    phoneNumber: string,
    countryId: string,
    departmentId: string,
    cityId: string,
    address: string,
    email: string,
}