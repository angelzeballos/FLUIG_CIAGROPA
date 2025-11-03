var urlProtheus = 'https://fluig.grupodekalpar.com/api/pc/v1';
var loading = window.FLUIGC.loading(window);

// =================== Variables Globales ====================

window.onload = function () {
    init();
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
            success: function(dataset) {
                try {
                    if (dataset && dataset.values && dataset.values.length > 0) {
                        console.log("Dataset colleague obtenido, filas:", dataset.values.length);
                        
                        // Buscar el usuario
                        var usuarioEncontrado = dataset.values.find(function(row) {
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
            error: function(error) {
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

