var urlProtheus = 'https://fluig.grupodekalpar.com/api/pc/v1';
var loading = window.FLUIGC.loading(window);

// =================== Variables Globales ====================

window.onload = function () {
    init();
    inicializarModalAprobacion();
    inicializarModalEnvioNotificacionRechazo();
    inicializarPanelDetallesCliente();
}

// =================== Inicializacion y Contexto ====================

function init() {
    // Loading 
    loading = FLUIGC.loading(window, { textmessage: 'Cargando...' });

    // Obtener Actividad - Usar estrategias múltiples
    var ACTIVIDAD = obtenerActividad();
    console.log('ACTIVIDAD obtenida:', ACTIVIDAD);

    // Validar actividad
    if (isNaN(ACTIVIDAD)) {
        console.warn('ACTIVIDAD es NaN, usando valor por defecto: 0');
        ACTIVIDAD = 0;
    }

    // Obtener Número de Proceso
    var solicitud = obtenerProceso();
    console.log('SOLICITUD:', solicitud);
    console.log('ACTIVIDAD FINAL:', ACTIVIDAD);

    // Asignar solicitud al campo numeroSolicitud
    if (solicitud && !isNaN(solicitud)) {
        $('#numeroSolicitud').val(solicitud);
        console.log('SOLICITUD asignada a campo #numeroSolicitud:', solicitud);
    }

    // Obtener y asignar Nombre de Solicitante solo en actividad INICIO
    if (ACTIVIDAD == INICIO || ACTIVIDAD == CREAR_SOLICITUD || ACTIVIDAD == 0 || ACTIVIDAD == 5) {
        console.log('Actividad de INICIO detectada, cargando nombre del solicitante');
        var nombreSolicitante = obtenerNombreSolicitante();
        if (nombreSolicitante && nombreSolicitante !== '') {
            $('#nombreSolicitante').val(nombreSolicitante);
            console.log('NOMBRE SOLICITANTE asignado a campo #nombreSolicitante:', nombreSolicitante);
        }

        // Establecer fecha de solicitud
        $('#fechaSolicitud').val(moment().format('DD/MM/YYYY HH:mm'));
    }

    setTimeout(function () {
        enableFields(ACTIVIDAD);
    }, 500);
}

// =================== Obtener Número de Actividad ====================

function obtenerActividad() {
    try {
        if (typeof window._getActividadInjected === 'function') {
            var val = window._getActividadInjected();
            if (val !== null && val !== undefined && !isNaN(val)) {
                console.log('ACTIVIDAD desde función inyectada:', val);
                return parseInt(val);
            }
        }
    } catch (e) {
        console.warn('Error en función inyectada:', e);
    }

    // Opción 2 en caso de que no se pueda obtener desde la función inyectada, leer desde URL
    try {
        var urlParams = new URLSearchParams(window.location.search);
        var wkNumState = urlParams.get('WKNumState');
        if (wkNumState && !isNaN(wkNumState)) {
            console.log('ACTIVIDAD desde URL WKNumState:', wkNumState);
            return parseInt(wkNumState);
        }
    } catch (e) {
        console.warn('Error leyendo URL:', e);
    }

    console.warn('No se pudo obtener ACTIVIDAD, usando valor por defecto: 0');
    return 0;
}

// =================== Obtener Número de Proceso ====================

function obtenerProceso() {
    // Opción 1 en caso de que se pueda obtener desde la función inyectada
    try {
        if (typeof window._getProcesoInjected === 'function') {
            var val = window._getProcesoInjected();
            if (val !== null && val !== undefined && !isNaN(val)) {
                console.log('SOLICITUD desde función inyectada:', val);
                return parseInt(val);
            }
        }
    } catch (e) {
        console.warn('Error en función inyectada:', e);
    }

    // Opción 2 en caso de que no se pueda obtener desde la función inyectada, leer desde URL
    try {
        var urlParams = new URLSearchParams(window.location.search);
        var wkNumProces = urlParams.get('WKNumProces');
        if (wkNumProces && !isNaN(wkNumProces)) {
            console.log('SOLICITUD desde URL WKNumProces:', wkNumProces);
            return parseInt(wkNumProces);
        }
    } catch (e) {
        console.warn('Error leyendo URL:', e);
    }

    console.warn('No se pudo obtener SOLICITUD');
    return NaN;
}

// =================== Obtener Nombre de Solicitante ====================

function obtenerNombreSolicitante() {
    // Leer desde URL con múltiples parámetros
    try {
        var urlParams = new URLSearchParams(window.location.search);
        var userFromURL = urlParams.get('WKUserName') ||
            urlParams.get('user') ||
            urlParams.get('WKUser') ||
            urlParams.get('userCode') ||
            urlParams.get('login') ||
            urlParams.get('taskUserId');

        if (userFromURL) {
            console.log('Login obtenido desde URL:', userFromURL);
            // Llamar a la función asíncrona para obtener el nombre completo
            obtenerNombreCompletoDeColleague(userFromURL);
            // Retornar el login temporalmente
            return userFromURL;
        }
    } catch (e) {
        console.warn('Error leyendo URL:', e);
    }

    console.warn('No se pudo obtener NOMBRE SOLICITANTE');
    return '';
}

// Función asíncrona para obtener el nombre completo del dataset colleague
function obtenerNombreCompletoDeColleague(login) {
    try {
        console.log("Buscando colleagueName en colleague para login:", login);

        // Usar vcXMLRPC para obtener el dataset colleague (asíncrono)
        var constraints = new Array();
        var constraintColleague = DatasetFactory.createConstraint("colleaguePK.colleagueId", login, login, ConstraintType.MUST);
        constraints.push(constraintColleague);

        DatasetFactory.getDataset("colleague", null, constraints, null, {
            success: function (dataset) {
                try {
                    if (dataset && dataset.values && dataset.values.length > 0) {
                        console.log("Dataset colleague obtenido, filas:", dataset.values.length);

                        // Buscar el usuario
                        var usuarioEncontrado = dataset.values.find(function (row) {
                            return row["login"] === login;
                        });

                        if (usuarioEncontrado) {
                            // Obtener el colleagueName
                            var colleagueName = usuarioEncontrado["colleagueName"];
                            if (colleagueName) {
                                console.log("Usuario encontrado en colleague:");
                                console.log("  - Login:", usuarioEncontrado["login"]);
                                console.log("  - Email:", usuarioEncontrado["email"]);
                                console.log("  - colleagueName:", colleagueName);

                                // Actualizar el campo nombreSolicitante con el nombre completo
                                $('#nombreSolicitante').val(colleagueName);
                                console.log("Campo nombreSolicitante actualizado con:", colleagueName);
                            } else {
                                console.warn("Usuario encontrado pero sin colleagueName");
                                // Usar el login como fallback
                                $('#nombreSolicitante').val(login);
                            }
                        } else {
                            console.warn("No se encontró el usuario en colleague con login:", login);
                            // Usar el login como fallback
                            $('#nombreSolicitante').val(login);
                        }
                    } else {
                        console.warn("Dataset colleague vacío o no disponible");
                        // Usar el login como fallback
                        $('#nombreSolicitante').val(login);
                    }
                } catch (e) {
                    console.error("Error procesando dataset colleague:", e);
                    // Usar el login como fallback
                    $('#nombreSolicitante').val(login);
                }
            },
            error: function (error) {
                console.error("Error al obtener dataset colleague:", error);
                // Usar el login como fallback
                $('#nombreSolicitante').val(login);
            }
        });

    } catch (e) {
        console.error("Error buscando colleagueName en colleague:", e);
        // Usar el login como fallback
        $('#nombreSolicitante').val(login);
    }
}

/* 
============================================================================================
====================== ******* CORE PARA INTEGRACION A PROTHEUS ******* ====================
============================================================================================
*/


// =================== Funciones de tabla ====================

function addLINHA() {

    var newRowId = wdkAddChild("tablaItems");

    var descOrigen = $("#descDepositoOrigen").val();
    var descDestino = $("#descDepositoDestino").val();
    var descProducto = $("#descProducto").val();
    var lote = $("#lote").val();
    var cantidad = $("#cantidad").val();
    var fechaValidez = $("#fechaValidez").val();


    $("#itDepositoOrigen___" + newRowId).val(descOrigen);
    $("#itDepositoDestino___" + newRowId).val(descDestino);
    $("#itDescProducto___" + newRowId).val(descProducto);
    $("#itLote___" + newRowId).val(lote);
    $("#itCantidad___" + newRowId).val(cantidad);
    $("#itFechaValidez___" + newRowId).val(fechaValidez);

    if (window.reloadZoom) {
        window.reloadZoom('zoomProducto', '');
    } else {
        $("#zoomProducto").val("");
    }
    $("#descProducto").val("");
    $("#lote").val("");
    $("#cantidad").val("");
    $("#fechaValidez").val("");

}

function removeLINHA(button) {
    // 'button' es el <button> que se presionó.
    // fnWdkRemoveChild se encarga de encontrar el <tr> padre y eliminarlo.
    fnWdkRemoveChild(button);
}

// =================== Funciones para Panel de Detalles del Cliente ====================

function inicializarPanelDetallesCliente() {
    // Listener para el cambio de selección en solicitudPedido
    $('#solicitudPedido').on('change', function() {
        var codPedido = $(this).val();
        
        // Validar que se haya seleccionado un pedido
        if (!codPedido || codPedido === '') {
            console.log('No se ha seleccionado un pedido');
            limpiarCamposDetallesCliente();
            return;
        }
        
        console.log('Consultando dataset para pedido:', codPedido);
        
        // Mostrar loading
        if (loading) {
            loading.show();
        }
        
        // Consultar dataset ds_valida_linea_credito filtrando por COD_PEDIDO
        try {
            // Verificar que DatasetFactory esté disponible
            if (typeof DatasetFactory === 'undefined') {
                console.error('DatasetFactory no está disponible');
                if (loading) {
                    loading.hide();
                }
                limpiarCamposDetallesCliente();
                if (window.FLUIGC && window.FLUIGC.message) {
                    FLUIGC.message.error('Error: DatasetFactory no está disponible. Por favor, contacte al administrador.');
                }
                return;
            }
            
            var constraints = new Array();
            var constraintPedido = DatasetFactory.createConstraint("COD_PEDIDO", codPedido, codPedido, ConstraintType.MUST);
            constraints.push(constraintPedido);
            
            DatasetFactory.getDataset("test2_datasetSimple", null, constraints, null, {
                success: function(dataset) {
                    try {
                        if (loading) {
                            loading.hide();
                        }
                        
                        if (dataset && dataset.values && dataset.values.length > 0) {
                            // Obtener el primer registro (debería ser único por pedido)
                            var registro = dataset.values[0];
                            
                            console.log('Datos obtenidos del dataset:', registro);
                            
                            // Mapear campos del dataset a los campos del formulario
                            // nombreCliente <- DESC_CLIENTE
                            var nombreCliente = registro["DESC_CLIENTE"] || '';
                            $('#nombreCliente').val(nombreCliente);
                            
                            // rucCliente <- RUC
                            var rucCliente = registro["RUC"] || '';
                            $('#rucCliente').val(rucCliente);
                            
                            // numeroPedido <- COD_PEDIDO
                            var numeroPedido = registro["COD_PEDIDO"] || '';
                            $('#numeroPedido').val(numeroPedido);
                            
                            // nombreComercial <- DESC_VENDEDOR
                            var nombreComercial = registro["DESC_VENDEDOR"] || '';
                            $('#nombreComercial').val(nombreComercial);
                            
                            // lineaActual <- LINEA_USD
                            var lineaActual = registro["LINEA_USD"] || '0.0';
                            $('#lineaActual').val(formatearNumero(lineaActual));
                            
                            // lineaDisponible <- DISPONIBLE_USD
                            var lineaDisponible = registro["DISPONIBLE_USD"] || '0.0';
                            $('#lineaDisponible').val(formatearNumero(lineaDisponible));
                            
                            // lineaProgramada <- TOTAL_PEDIDO
                            var lineaProgramada = registro["TOTAL_PEDIDO"] || '0.0';
                            $('#lineaProgramada').val(formatearNumero(lineaProgramada));
                            
                            // lineaSaldo <- SALDO_USD
                            var lineaSaldo = registro["SALDO_USD"] || '0.0';
                            $('#lineaSaldo').val(formatearNumero(lineaSaldo));
                            
                            console.log('Campos del formulario actualizados correctamente');
                        } else {
                            console.warn('No se encontraron datos en el dataset para el pedido:', codPedido);
                            limpiarCamposDetallesCliente();
                            if (window.FLUIGC && window.FLUIGC.message) {
                                FLUIGC.message.warning('No se encontraron datos para el pedido seleccionado');
                            }
                        }
                    } catch (e) {
                        console.error('Error procesando datos del dataset:', e);
                        if (loading) {
                            loading.hide();
                        }
                        limpiarCamposDetallesCliente();
                        if (window.FLUIGC && window.FLUIGC.message) {
                            FLUIGC.message.error('Error al procesar los datos del pedido');
                        }
                    }
                },
                error: function(error) {
                    console.error('Error al consultar dataset ds_valida_linea_credito:', error);
                    if (loading) {
                        loading.hide();
                    }
                    limpiarCamposDetallesCliente();
                    if (window.FLUIGC && window.FLUIGC.message) {
                        FLUIGC.message.error('Error al consultar los datos del pedido');
                    }
                }
            });
        } catch (e) {
            console.error('Error al crear constraints para consulta de dataset:', e);
            if (loading) {
                loading.hide();
            }
            limpiarCamposDetallesCliente();
            if (window.FLUIGC && window.FLUIGC.message) {
                FLUIGC.message.error('Error al consultar el pedido');
            }
        }
    });
}

/**
 * Limpia los campos de detalles del cliente
 */
function limpiarCamposDetallesCliente() {
    $('#nombreCliente').val('');
    $('#rucCliente').val('');
    $('#numeroPedido').val('');
    $('#nombreComercial').val('');
    $('#lineaActual').val('');
    $('#lineaDisponible').val('');
    $('#lineaProgramada').val('');
    $('#lineaSaldo').val('');
}

/**
 * Formatea un número para mostrarlo en los campos de línea
 * @param {string|number} valor - Valor a formatear
 * @returns {string} - Valor formateado
 */
function formatearNumero(valor) {
    if (!valor || valor === '' || valor === null || valor === undefined) {
        return '0.0';
    }
    
    // Convertir a número y formatear con 2 decimales
    var numero = parseFloat(valor);
    if (isNaN(numero)) {
        return '0.0';
    }
    
    // Formatear con separador de miles y 2 decimales
    return numero.toLocaleString('es-PY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// =================== Modal de Aprobación de Linea ====================

var radioAprobacionActual = null;

function inicializarModalAprobacion() {

    $('#aprobadoAnalista').on('click', function (e) {
        // Prevenir la selección inmediata
        e.preventDefault();
        radioAprobacionActual = this;
        mostrarModalAprobacion('Analista');
    });

    $('#aprobadoGerente').on('click', function (e) {
        // Prevenir la selección inmediata
        e.preventDefault();
        radioAprobacionActual = this;
        mostrarModalAprobacion('Gerente');
    });

    $('#aprobadoGerenteGeneral').on('click', function (e) {
        // Prevenir la selección inmediata
        e.preventDefault();
        radioAprobacionActual = this;
        mostrarModalAprobacion('Gerente General');
    });

    $('#aprobadoCDA').on('click', function (e) {
        // Prevenir la selección inmediata
        e.preventDefault();
        radioAprobacionActual = this;
        mostrarModalAprobacion('CDA');
    });

    // Event listener para el botón de confirmar
    $('#btnConfirmarAprobacion').on('click', function () {
        confirmarAprobacion();
    });

    // Event listener para el botón de cancelar
    $('#btnCancelarAprobacion').on('click', function () {
        cancelarAprobacion();
    });

    // Cerrar modal al hacer clic fuera de él
    $('#modalConfirmacionAprobacion').on('click', function (e) {
        if (e.target.id === 'modalConfirmacionAprobacion') {
            cancelarAprobacion();
        }
    });

    // Cerrar modal con tecla ESC
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#modalConfirmacionAprobacion').is(':visible')) {
            cancelarAprobacion();
        }
    });
}

function mostrarModalAprobacion(tipoAnalista) {
    var aprobarLineaSugerida = '';

    // Obtener la línea sugerida solo para analista
    aprobarLineaSugerida = $('#lineaSugeridaAnalista').val();

    // Actualizar el contenido del modal
    $('#modalLineaSugerida').text(aprobarLineaSugerida);

    // Mostrar el modal con efecto de fade
    $('#modalConfirmacionAprobacion').fadeIn(300);

}

function confirmarAprobacion() {
    if (radioAprobacionActual) {
        // Marcar el radio button como seleccionado
        $(radioAprobacionActual).prop('checked', true);

        // Disparar el evento change para que otros listeners lo detecten
        $(radioAprobacionActual).trigger('change');

        // Limpiar la referencia
        radioAprobacionActual = null;
    }

    // Cerrar el modal
    cerrarModal();
}

function cancelarAprobacion() {
    if (radioAprobacionActual) {
        // Asegurarse de que el radio button NO esté seleccionado
        $(radioAprobacionActual).prop('checked', false);

        // Limpiar la referencia
        radioAprobacionActual = null;
    }

    // Cerrar el modal
    cerrarModal();
}

function cerrarModal() {
    // Cerrar el modal con efecto de fade
    $('#modalConfirmacionAprobacion').fadeOut(300);
}

/* =================== Modal de Envio de Notificación de Rechazo ==================== */

var radioDesaprobacionActual = null;

function inicializarModalEnvioNotificacionRechazo() {

    $('#desaprobadoAnalista').on('click', function (e) {
        // Prevenir la selección inmediata
        e.preventDefault();
        radioDesaprobacionActual = this;
        mostrarModalEnvioNotificacionRechazo('Analista');
    });

    $('#desaprobadoGerente').on('click', function (e) {
        // Prevenir la selección inmediata
        e.preventDefault();
        radioDesaprobacionActual = this;
        mostrarModalEnvioNotificacionRechazo('Gerente');
    });

    $('#desaprobadoGerenteGeneral').on('click', function (e) {
        // Prevenir la selección inmediata
        e.preventDefault();
        radioDesaprobacionActual = this;
        mostrarModalEnvioNotificacionRechazo('Gerente General');
    });

    $('#desaprobadoCDA').on('click', function (e) {
        // Prevenir la selección inmediata
        e.preventDefault();
        radioDesaprobacionActual = this;
        mostrarModalEnvioNotificacionRechazo('CDA');
    });

    // Event listener para el botón de confirmar envio de notificacion de rechazo
    $('#btnEnviarNotificacionRechazo').on('click', function () {
        confirmarEnvioNotificacionRechazo();
    });

    // cerrar modal al hacer clic fuera de él
    $('#modalEnvioNotificacionRechazo').on('click', function (e) {
        if (e.target.id === 'modalEnvioNotificacionRechazo') {
            cancelarEnvioNotificacionRechazo();
        }
    });

    // Cerrar Modal con tecla ESC
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#modalEnvioNotificacionRechazo').is(':visible')) {
            cancelarEnvioNotificacionRechazo();
        }
    });
}

function confirmarEnvioNotificacionRechazo() {
    if (radioDesaprobacionActual) {
        // Marcar el radio button como seleccionado
        $(radioDesaprobacionActual).prop('checked', true);
        
        // Disparar el evento change para que otros listeners lo detecten
        $(radioDesaprobacionActual).trigger('change');

        // Limpiar la referencia
        radioDesaprobacionActual = null;
    }

    // Cerrar el modal
    cerrarModalEnvioNotificacionRechazo();
}

function mostrarModalEnvioNotificacionRechazo(tipoAnalista) {
    // El parámetro tipoAnalista puede ser usado para personalizar el mensaje del modal
    // Por ejemplo: 'Analista', 'Gerente', 'Gerente General', 'CDA'
    // Por ahora solo mostramos el modal, pero se puede expandir la funcionalidad
    $('#modalEnvioNotificacionRechazo').fadeIn(300);
}

function cancelarEnvioNotificacionRechazo() {
    if (radioDesaprobacionActual) {
        // Asegurarse de que el radio button NO esté seleccionado
        $(radioDesaprobacionActual).prop('checked', false);

        // Limpiar la referencia
        radioDesaprobacionActual = null;
    }

    // Cerrar el modal
    cerrarModalEnvioNotificacionRechazo();
}

function cerrarModalEnvioNotificacionRechazo() {
    $('#modalEnvioNotificacionRechazo').fadeOut(300);
}