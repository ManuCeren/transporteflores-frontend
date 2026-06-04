export interface IFacturacion {
  IdFacturacion: number,
  IdCliente: number,
  NombreCliente: string,
  FechaFactura: string,
  MontoTotal: number,
  EstadoPago: string,
  IdEnvio: number
}