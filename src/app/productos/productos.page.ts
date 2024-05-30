import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SqliteService } from '../servicio/sqlite.service';

export interface Producto {
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
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  public presupuesto: string = '';
  public unidad: string = '';
  public producto: string = '';
  public cantidad: number | null = null;
  public valor_unitario: number | null = null;
  public valor_total: number | null = null;
  public fecha_adquisicion: Date | null = null;
  public proveedor: string = '';
  productos: Producto[] = [];
  selectedProduct: Producto | null = null;

  constructor(private router: Router, private sqlite: SqliteService) {}

  ionViewWillEnter() {
    this.read();
  }

  create() {
    console.log("creando...");
    const newProducto: Producto = {
      presupuesto: this.presupuesto,
      unidad: this.unidad,
      producto: this.producto,
      cantidad: this.cantidad,
      valor_unitario: this.valor_unitario,
      valor_total: this.valor_total,
      fecha_adquisicion: this.fecha_adquisicion,
      proveedor: this.proveedor
    };
    this.sqlite.create(newProducto).then(() => {
      this.clearForm();
      this.read();
    }).catch(err => {
      console.error(err);
    });
  }

  read() {
    this.sqlite.read().then((productos: Producto[]) => {
      this.productos = productos;
    }).catch(err => {
      console.error(err);
    });
  }

  update(producto: Producto) {
    const updatedProducto: Producto = {
      presupuesto: this.presupuesto,
      unidad: this.unidad,
      producto: this.producto,
      cantidad: this.cantidad,
      valor_unitario: this.valor_unitario,
      valor_total: this.valor_total,
      fecha_adquisicion: this.fecha_adquisicion,
      proveedor: this.proveedor
    };
    this.sqlite.update(updatedProducto, producto).then(() => {
      this.clearForm();
      this.read();
    }).catch(err => {
      console.error(err);
    });
  }

  delete(producto: Producto) {
    this.sqlite.delete(producto).then(() => {
      this.read();
    }).catch(err => {
      console.error(err);
    });
  }

  toggleDetails(producto: Producto) {
    this.selectedProduct = this.selectedProduct === producto ? null : producto;
  }

  clearForm() {
    this.presupuesto = '';
    this.unidad = '';
    this.producto = '';
    this.cantidad = null;
    this.valor_unitario = null;
    this.valor_total = null;
    this.fecha_adquisicion = null;
    this.proveedor = '';
  }

  ngOnInit() {}

  irInicio() {
    this.router.navigateByUrl('/inicio');
  }
}