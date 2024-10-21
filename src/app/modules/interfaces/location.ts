export interface Country {
    id: string,
    name: string,
    isoCode: string,
    numericCode: string
}

export interface Department {
    id: string,
    name: string,
    countryId: string,
    country: {
        id: string,
        name: string,
        isoCode: string
    }
}

export interface City {
    id: string,
    name: string,
    departamentId: string,
    departament: {
        id: string,
        name: string,
        countryId: string
    }
}