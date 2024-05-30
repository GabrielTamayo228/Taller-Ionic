import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, capSQLiteChanges, capSQLiteValues } from  '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { JsonSQLite } from 'jeep-sqlite/dist/types/interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../productos/productos.page';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  public dbready: BehaviorSubject<boolean>;
  public isWeb: boolean;
  public isIOS: boolean;
  public dbName: string;

  constructor(private http: HttpClient) {  // Cambiado hhtp a http
    this.dbready = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIOS = false;
    this.dbName = '';
  }

  async init() {
    const info = await Device.getInfo();
    const sqlite = CapacitorSQLite as any;

    if (info.platform === 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        console.error("Esta app necesita permisos para funcionar");
      }
    } else if (info.platform === 'web') {
      this.isWeb = true;
      await sqlite.initWebStore();
    } else if (info.platform === "ios") {
      this.isIOS = true;
    }

    this.setupDatabase();
  }

  async setupDatabase() {
    const dbSetup = await Preferences.get({ key: 'firts_setup_key' });

    if (!dbSetup.value) {
      this.downloadDatabase();
    } else {
      this.dbName = await this.getDbName();

      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });
      this.dbready.next(true);
    }
  }

  downloadDatabase() {
    this.http.get('assets/db/db.json').subscribe(async (jsonExport: JsonSQLite) => {  // Cambiado asset a assets
      const jsonstring = JSON.stringify(jsonExport);
      const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

      if (isValid.result) {
        this.dbName = jsonExport.database;
        await CapacitorSQLite.importFromJson({ jsonstring });
        await CapacitorSQLite.createConnection({ database: this.dbName });
        await CapacitorSQLite.open({ database: this.dbName });

        await Preferences.set({ key: 'firts_setup_key', value: '1' });
        await Preferences.set({ key: 'dbname', value: this.dbName });

        this.dbready.next(true);
      }
    });
  }

  async getDbName() {
    if (!this.dbName) {
      const dbname = await Preferences.get({ key: 'dbname' });

      if (dbname.value) {
        this.dbName = dbname.value;
      }
    }
    return this.dbName;
  }

  public async create(producto: Producto): Promise<any> {
    if (!this.dbready.value) {
      console.error('Database is not ready.');
      return Promise.reject('Database is not ready.');
    }
  
    try {
      const sql = 'INSERT INTO productos (presupuesto, unidad, producto, cantidad, valor_unitario, valor_total, fecha_adquisicion, proveedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      const dbName = await this.getDbName();
      const changes = await CapacitorSQLite.executeSet({
        database: dbName,
        set: [
          {
            statement: sql,
            values: [
              producto.presupuesto,
              producto.unidad,
              producto.producto,
              producto.cantidad,
              producto.valor_unitario,
              producto.valor_total,
              producto.fecha_adquisicion,
              producto.proveedor
            ]
          }
        ]
      });
  
      console.log('Product created:', producto);
      return changes;
    } catch (error) {
      console.error('Error creating product:', error);
      return Promise.reject(error);
    }
  }

  async read() {
    let sql = 'SELECT * FROM productos';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: []
    }).then((response: capSQLiteValues) => {
      let productos: Producto[] = [];
      for (let i = 0; i < response.values.length; i++) {
        productos.push(response.values[i] as Producto);
      }
      return productos;
    });
  }

  async update(updatedProducto: Producto, originalProducto: Producto) {
    let sql = 'UPDATE productos SET presupuesto=?, unidad=?, producto=?, cantidad=?, valor_unitario=?, valor_total=?, fecha_adquisicion=?, proveedor=? WHERE producto=?';
    const dbName = await this.getDbName();
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            updatedProducto.presupuesto,
            updatedProducto.unidad,
            updatedProducto.producto,
            updatedProducto.cantidad,
            updatedProducto.valor_unitario,
            updatedProducto.valor_total,
            updatedProducto.fecha_adquisicion,
            updatedProducto.proveedor,
            originalProducto.producto
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err));
  }

  async delete(producto: Producto) {
    let sql = 'DELETE FROM productos WHERE producto=?';
    const dbName = await this.getDbName();
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [producto.producto]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err));
  }
}
