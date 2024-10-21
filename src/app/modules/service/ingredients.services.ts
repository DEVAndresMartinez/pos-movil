import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Ingredients, IngredientsCreate, Unit,  } from '../interfaces';


@Injectable({ providedIn: 'root' })
export class IngredientsService {
        
    private baseUrl: string = environment.BASE_URL;
    
    constructor(private http: HttpClient) { }
    

getIngredients():Observable<Ingredients[]> {
    return this.http.get<Ingredients[]>(`${ this.baseUrl }/v1/ingredients`);
}

getIngredientById( id: string ): Observable<Ingredients|undefined> {
    return this.http.get<Ingredients>(`${ this.baseUrl }/v1/ingredients/${ id }`)
      .pipe(
        catchError( error => of(undefined) )
      );
}

  addIngredient( ingredientsCreate: IngredientsCreate, clientId:string|null ): Observable<Ingredients> {
    const ingredients = { ...ingredientsCreate, clientId};
    return this.http.post<Ingredients>(`${ this.baseUrl }/v1/ingredients`, ingredients);
  }

  updateIngredient( ingredient: IngredientsCreate ): Observable<Ingredients> {
    if ( !ingredient.id ) throw Error('Unit id is required');

    const ingredientsCopy = { ...ingredient, slug : '' };
    delete ingredientsCopy.id;

    return this.http.patch<Ingredients>(`${ this.baseUrl }/v1/ingredients/${ ingredient.id }`, ingredientsCopy);
  }

  deleteIngredientById( id: string ): Observable<boolean> {


    return this.http.delete(`${ this.baseUrl }//${ id }`)
      .pipe(
        map( resp => true ),
        catchError( err => of(false) ),
      );
  }  
}

