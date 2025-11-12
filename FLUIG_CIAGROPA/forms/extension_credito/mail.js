function enviarRequisitos() {

    var destinatario = $("#correoDestinatario").val();
    var cuerpo = $("#requisitoCliente").val();
    var solicitud = $("#numeroSolicitud").val();

    var asunto = "Solicitud de Requisitos - (" + (solicitud ? solicitud : "") + ")";

    var asuntoEnc = encodeURIComponent(asunto);
    var cuerpoEnc = encodeURIComponent(cuerpo);

    var mailtoLink = "mailto:" + destinatario +
        "?subject=" + asuntoEnc +
        "&body=" + cuerpoEnc;

    window.location.href = mailtoLink;
}

function enviarPropuestaTecnica() {
    var destinatario = $("#correoPropuestaTecnica").val();
    var cuerpo = $("#mensajePropuestaTecnica").val();
    var solicitud = $("#numeroSolicitud").val();

    var asunto = "Propuesta de Etiqueta Técnica - (" + (solicitud ? solicitud : "") + ")";

    var asuntoEnc = encodeURIComponent(asunto);
    var cuerpoEnc = encodeURIComponent(cuerpo);

    var mailtoLink = "mailto:" + destinatario +
        "?subject=" + asuntoEnc +
        "&body=" + cuerpoEnc;

    window.location.href = mailtoLink;
}

function enviarSolicitudPago() {

    var destinatario = $("#correoSolicitudPago").val();
    var cuerpo = $("#mensajeSolicitudPago").val();
    var marca = $("#nombreMarca").val();
    var solicitud = $("#numeroSolicitud").val();

    var asunto = "Extensión de Marca: " + (marca ? marca : "") + " - (" + (solicitud ? solicitud : "") + ")";

    var asuntoEnc = encodeURIComponent(asunto);
    var cuerpoEnc = encodeURIComponent(cuerpo);

    var mailtoLink = "mailto:" + destinatario +
        "?subject=" + asuntoEnc +
        "&body=" + cuerpoEnc;

    window.location.href = mailtoLink;
}

function notificarAprobacion() {
    
    var destinatario = "ricardo.martinez@ciagropa.com.py,marco.rodriguez@ciagropa.com.py,paola.guggiari@ciagropa.com.py,pablo.oricchio@ciagropa.com.py,juancarlos.caporaso@ciagropa.com.py,diana.armoa@ciagropa.com.py,daniel.galeano@ciagropa.com.py,nestor.gamarra@ciagropa.com.py,ramon.dominguez@ciagropa.com.py,nicolas.caballero@ciagropa.com.py";
    var cliente = $("#selectCliente").val();
    var producto = $("#selectProducto").val();
    var solicitud = $("#numeroSolicitud").val();
    var cuerpo = "Estimados Compañeros, informamos que ya se encuentra aprobada la extensión del producto " + (producto ? producto : "") + " correspondiente a la empresa " + (cliente ? cliente : "") + " como conocimiento para la impresión de la etiqueta.";

    var asunto = "Notificación de Aprobación de Etiqueta Técnica - (" + (solicitud ? solicitud : "") + ")";

    var asuntoEnc = encodeURIComponent(asunto);
    var cuerpoEnc = encodeURIComponent(cuerpo);

    var mailtoLink = "mailto:" + destinatario +
        "?subject=" + asuntoEnc +
        "&body=" + cuerpoEnc;

    window.location.href = mailtoLink;
}