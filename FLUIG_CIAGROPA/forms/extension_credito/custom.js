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
    // Obtener ACTIVIDAD para usar en las funciones internas
    var ACTIVIDAD = obtenerActividad();
    if (isNaN(ACTIVIDAD)) {
        ACTIVIDAD = 0;
    }

    function seleccionarPedido() {
        $('#solicitudPedido').on('change', function () {
            const selectedPedido = $(this).val();
            const option = $(this).find('option:selected');

            if (!selectedPedido || selectedPedido === "") {
                console.log("No se ha seleccionado ningún pedido");
                return;
            }

            const cliente = option.data('cliente');
            const ruc = option.data('ruc');
            const pedido = option.data('pedido');
            const comercial = option.data('comercial');

            limpiarCamposFormulario();

            $('#nombreCliente').val(cliente);
            $('#rucCliente').val(ruc);
            $('#numeroPedido').val(pedido);
            $('#nombreComercial').val(comercial);

            enableFields(ACTIVIDAD);

            consultarLineaCredito(ruc);

            cargarProductosPedido(selectedPedido);

        });
    }

    function cargarSelectPedidos() {

        const constraintsValidacion = [
            DatasetFactory.createConstraint(
                "ESTADO_VALIDACION",
                "RECHAZADO",
                "RECHAZADO",
                ConstraintType.MUST,
            ),
        ];

        const datasetVal = DatasetFactory.getDataset(
            "test2_datasetSimple",
            null,
            constraintsValidacion,
            null,
        );

        if (!datasetVal || !datasetVal.values) {
            console.warn("No se encontraron pedidos rechazados para validación");
            return;
        }

        const pedidosMap = new Map();

        datasetVal.values.forEach(function (itemval, index) {
            const estadoValidacion = itemval["ESTADO_VALIDACION"];
            if (estadoValidacion !== "RECHAZADO") {
                return;
            }

            const pedidoRechazado = itemval["COD_PEDIDO"];
            const cliente = itemval["DESC_CLIENTE"];
            const ruc = itemval["RUC"];
            const comercial = itemval["DESC_VENDEDOR"];

            if (!pedidosMap.has(pedidoRechazado)) {
                pedidosMap.set(pedidoRechazado, {
                    pedido: pedidoRechazado,
                    cliente: cliente,
                    ruc: ruc,
                    comercial: comercial,
                });
            } else {
                console.warn("Pedido rechazado ya existe en el mapa:", pedidoRechazado);
            }
        });

        const select = $('#solicitudPedido');
        if (!select.length) {
            console.warn("No se encontró el elemento #solicitudPedido");
            return;
        }

        select.find('option:not(:first)').remove();

        pedidosMap.forEach(function (info) {
            const label = `${info.pedido} - ${info.cliente}`;
            const option = $(`<option value="${info.pedido}">${label}</option>`);
            option.attr("data-cliente", info.cliente);
            option.attr("data-ruc", info.ruc);
            option.attr("data-pedido", info.pedido);
            option.attr("data-comercial", info.comercial);
            select.append(option);
        });
    }

    function consultarLineaCredito(ruc) {

        if (!ruc || ruc === "") {
            return;
        }

        const datasetCompleto = DatasetFactory.getDataset("test2_datasetSimple", null, null, null);

        if (!datasetCompleto || !datasetCompleto.values) {
            return;
        }

        // Normalizar el RUC recibido para comparación
        const rucNormalizado = ruc ? ruc.trim().replace(/[^0-9]/g, '') : '';

        let rowEncontrado = datasetCompleto.values.find(item => {
            const rucDataset = item["RUC"] ? item["RUC"].trim().replace(/[^0-9]/g, '') : '';
            const estadoValidacion = item["ESTADO_VALIDACION"];
            return rucDataset === rucNormalizado && estadoValidacion === "RECHAZADO";
        });

        if (rowEncontrado) {
            console.log("Linea de crédito encontrada con método fijo para RUC:", ruc);
        } else {
            // Método alternativo: buscar sin normalizar el RUC recibido
            rowEncontrado = datasetCompleto.values.find(item => {
                const rucDataset = item["RUC"] ? item["RUC"].trim().replace(/[^0-9]/g, '') : '';
                const estadoValidacion = item["ESTADO_VALIDACION"];
                return rucDataset === rucNormalizado && estadoValidacion === "RECHAZADO";
            });

            if (rowEncontrado) {
                console.log("Linea de crédito encontrada con método dinámico para RUC:", ruc);
            } else {
                console.warn("No se encontró la línea de crédito para el RUC:", ruc);
            }
        }

        if (rowEncontrado) {

            $("#lineaActual").val(rowEncontrado["LINEA_USD"] || "");
            $("#lineaDisponible").val(rowEncontrado["DISPONIBLE_USD"] || "");
            $("#lineaProgramada").val(rowEncontrado["TOTAL_PEDIDO"] || "");
            $("#lineaSaldo").val(rowEncontrado["SALDO_USD"] || "");

            const lineaUSD = parseFloat(rowEncontrado["LINEA_USD"]) || 0;
            const saldoUSD = parseFloat(rowEncontrado["SALDO_USD"]) || 0;
            const lineaSugerida = Math.abs(saldoUSD) + Math.abs(lineaUSD);
            $("#lineaSugerida").val(lineaSugerida.toFixed(2));
        } else {
            // limpiar campos si no hay datos
            $("#lineaActual").val("0");
            $("#lineaDisponible").val("0");
            $("#lineaProgramada").val("0");
            $("#lineaSaldo").val("0");
            $("#lineaSugerida").val("0");
        }
    }

    function cargarProductosPedido(pedidoCod) {
        if (!pedidoCod || pedidoCod === "") {
            return;
        }

        const constraints = [
            DatasetFactory.createConstraint(
                "COD_PEDIDO",
                pedidoCod,
                pedidoCod,
                ConstraintType.MUST,
            ),
        ];

        const dataset = DatasetFactory.getDataset(
            "test-linea",
            null,
            constraints,
            null,
        );

        if (!dataset || !dataset.values || dataset.values.length === 0) {
            console.warn("No se encontraron productos para el pedido:", pedidoCod);
            return;
        }

        const tabla = $("#tablaItems");
        if (!tabla.length) {
            return;
        }

        tabla.empty();

        let productosAgregados = 0;
        let totalProgramadaUSD = 0;

        dataset.values.forEach(function (item, index) {

            const cantidadProgramada = parseFloat(item["CANTIDAD_PROGRAMADA"]) || 0;
            const precioUnitario = parseFloat(item["PRECIO_UNITARIO"]) || 0;

            if (cantidadProgramada > 0) {
                const subtotalproducto = cantidadProgramada * precioUnitario;
                totalProgramadaUSD += subtotalproducto;

                const row = `
                <tr class="rowTabItens" id="rowTabItens">
                                            <td id="clItem" class="col-md-1">
                                                <input type="text" class="form-control" id="itItem" name="itItem" value="${item['ITEM'] || ''}">
                                            </td>
                                            <td id="clProducto" class="col-md-1">
                                                <input type="text" class="form-control" id="itProducto" name="itProducto" value="${item['COD_PRODUCTO'] || ''}">
                                            </td>
                                            <td id="clDescripcion" class="col-md-3">
                                                <input type="text" class="form-control" id="itDescripcion"
                                                    name="itDescripcion" value="${item['DESC_PRODUCTO'] || ''}">
                                            </td>
                                            <td id="clCantidad" class="col-md-1">
                                                <input type="text" class="form-control" id="itCantidad" name="itCantidad" value="${item['CANTIDAD_PRODUCTO'] || ''}">
                                            </td>
                                            <td id="clCtaAprobada" class="col-md-1">
                                                <input type="text" class="form-control" id="itCtaAprobada"
                                                    name="itCtaAprobada" value="${cantidadProgramada}">
                                            </td>
                                            <td id="clCtaSaldo" class="col-md-1">
                                                <input type="text" class="form-control" id="itCtaSaldo" name="itCtaSaldo" value="${item['CANTIDAD_SALDO'] || ''}">
                                            </td>
                                            <td id="clPrcUnitario" class="col-md-1">
                                                <input type="text" class="form-control" id="itPrcUnitario"
                                                    name="itPrcUnitario" value="${formatearNumero(precioUnitario)}">
                                            </td>
                                            <td id="clValor" class="col-md-1">
                                                <input type="text" class="form-control" id="itValor" name="itValor" value="0">
                                            </td>
                                        </tr>
                `;
                tabla.append(row);
                productosAgregados++;
            }
        });
    }

    function limpiarCamposFormulario() {

        $("#nombreCliente").val("");
        $("#rucCliente").val("");
        $("#numeroPedido").val("");
        $("#nombreComercial").val("");
        $("#lineaActual").val("0");
        $("#lineaDisponible").val("0");
        $("#lineaProgramada").val("0");
        $("#lineaSaldo").val("0");
        $("#lineaSugerida").val("0");
        $("#tablaItems").empty();
    }

    cargarSelectPedidos();
    seleccionarPedido();
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