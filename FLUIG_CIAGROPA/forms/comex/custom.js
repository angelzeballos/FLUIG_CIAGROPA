var urlProtheus = 'https://fluig.grupodekalpar.com/api/pc/v1';
var loading = window.FLUIGC.loading(window);

// =================== Variables Globales ====================

window.onload = function () {
    init();
    inicializarModalAprobacion();
    inicializarModalVerDetalles();
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

// =================== Modal de Confirmación de Cotización ====================

var buttonAgregarCotizacion = null;

function inicializarModalAprobacion() {

    $('#btnAgregarCotizacion').on('click', function (e) {
        // Prevenir la selección inmediata
        e.preventDefault();
        buttonAgregarCotizacion = this;
        $('#modalConfirmacionCotizacion').fadeIn(300);
    });

    // Event listener para el botón de confirmar
    $('#btnConfirmarCotizacion').on('click', function () {
        confirmarAprobacion();
    });

    // Event listener para el botón de cancelar
    $('#btnCancelarCotizacion').on('click', function () {
        cancelarAprobacion();
    });

    // Cerrar modal al hacer clic fuera de él
    $('#modalConfirmacionCotizacion').on('click', function (e) {
        if (e.target.id === 'modalConfirmacionCotizacion') {
            cancelarAprobacion();
        }
    });

    // Cerrar modal con tecla ESC
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#modalConfirmacionCotizacion').is(':visible')) {
            cancelarAprobacion();
        }
    });
}


function confirmarAprobacion() {
    // Limpiar la referencia y cerrar el modal
    buttonAgregarCotizacion = null;
    // Cerrar el modal
    cerrarModalCotizacion();
}

function cancelarAprobacion() {
    
    // Cerrar el modal
    cerrarModalCotizacion();
}

function cerrarModalCotizacion() {
    // Cerrar el modal con efecto de fade
    $('#modalConfirmacionCotizacion').fadeOut(300);
}

// =================== Modal de Ver Detalles ====================

var buttonVerDetalles = null;

function inicializarModalVerDetalles() {

    // Delegación para manejar múltiples filas dinámicas y evitar IDs duplicados
    $('#tablaItems').on('click', 'button.btn-ver-detalles', function (e) {
        e.preventDefault();
        buttonVerDetalles = this;
        $('#modalVerDetalles').fadeIn(300);
    });

    // Event listener para el botón de confirmar
    $('#btnConfirmarCompra').on('click', function () {
        confirmarCompra();
    });

    // Event listener para el botón de cancelar
    $('#btnCerrarVerDetalles').on('click', function () {
        cerrarVerDetalles();
    });

    // Cerrar modal al hacer clic fuera de él
    $('#modalVerDetalles').on('click', function (e) {
        if (e.target.id === 'modalVerDetalles') {
            cerrarVerDetalles();
        }
    });

    // Cerrar modal con tecla ESC
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#modalVerDetalles').is(':visible')) {
            cerrarVerDetalles();
        }
    });
}


function confirmarCompra() {
    // Limpiar la referencia y cerrar el modal
    buttonVerDetalles = null;
    cerrarModalVerDetalles();
}

function cerrarVerDetalles() {
    // Limpiar la referencia y cerrar el modal
    buttonVerDetalles = null;
    cerrarModalVerDetalles();
}

function cerrarModalVerDetalles() {
    // Cerrar el modal con efecto de fade
    $('#modalVerDetalles').fadeOut(300);
}


// =================== Funciones de tabla ====================

function addLINHA() {
    
    // 1. Llama a la función de Fluig para agregar una nueva fila
    //    "tablaItems" es el 'tablename' que definiste en tu <table>
    var newRowId = wdkAddChild("tablaItems");

    // 2. Obtener los valores de los campos del cabecero
    var descOrigen = $("#descDepositoOrigen").val();
    var descDestino = $("#descDepositoDestino").val();
    var descProducto = $("#descProducto").val();
    var lote = $("#lote").val();
    var cantidad = $("#cantidad").val();
    var fechaValidez = $("#fechaValidez").val();


    // 3. Asignar esos valores a los campos de la NUEVA fila
    //    El ID de un campo en una fila 'pai-filho' es: idCampo + '___' + indice
    $("#itDepositoOrigen___" + newRowId).val(descOrigen);
    $("#itDepositoDestino___" + newRowId).val(descDestino);
    $("#itDescProducto___" + newRowId).val(descProducto);
    $("#itLote___" + newRowId).val(lote);
    $("#itCantidad___" + newRowId).val(cantidad);
    $("#itFechaValidez___" + newRowId).val(fechaValidez);
    
    // 4. (Opcional) Limpiamos los campos del producto del cabecero
    //    Usamos reloadZoom() para limpiar el 'display' del zoom de producto
    //    Si no tienes esa función, usa solo los .val("")
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

