export interface IEnvios{
    idEnvios?: number,
    idCliente: number,
    idRuta: number,
    idConductor: number,
    idEstadoEnvio?: number | null,
    fechaSolicitud: string,
    fechaEntregaEsperada: string,
    estado: string,
    mercancia: string,
    pesoTotal: number,
    volumenTotal: number
    CostoEnvio: number
}