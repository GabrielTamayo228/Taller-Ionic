import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SqliteService } from '../servicio/sqlite.service';

export interface Producto{

   presupuesto: string;
   unidad: string;
   producto: string;
   cantidad: number;
   valor_unitario: number;
   valor_total: number;
   fecha_adquisicion: Date;
   proveedor: string;

}

@Component({
  selector: 'app-ingresar',
  templateUrl: './ingresar.page.html',
  styleUrls: ['./ingresar.page.scss'],
})
export class IngresarPage implements OnInit {

  public presupuesto: string;
  public unidad: string;
  public producto: string;
  public cantidad: number;
  public valor_unitario: number;
  public valor_total: number;
  public fecha_adquisicion: Date;
  public proveedor: string;

  productos : Producto[] = []

  constructor(
    private router: Router,
    private sqlite: SqliteService
  ) { 
    this.presupuesto= '';
    this.unidad= '';
    this.producto= '';
    this.cantidad= null;
    this.valor_unitario= null;
    this.valor_total= null;
    this.fecha_adquisicion= null;
    this.proveedor= '';

  }

  ionViewWillEnter(){
    this.read();
  }

  

  read(){
    this.sqlite.read().then(( productos: Producto[]) =>{
      this.productos = productos;
      console.log("leido");
      console.log(this.productos);
    }).catch(err =>{
      console.error(err);
      console.error("error al leer");
    })
  }

  update(productos: Producto[]){


  }

  delete(productos: Producto[]){


  }


  ngOnInit() {
  }

  irInicio(){
    this.router.navigateByUrl('/inicio');

  }

}
