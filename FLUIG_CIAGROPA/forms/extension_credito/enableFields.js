function disableField(containerElement, disabled) {
	if (disabled) {
		$("#" + containerElement.attr('id') + "_d").hide();
		containerElement.show();
	}
	else {
		($("#" + containerElement.attr("id") + "_d").length > 0) ? $("#" + containerElement.attr("id") + "_d").show() : containerElement.before(containerElement.clone().attr({ "id": (containerElement.attr("id") + "_d"), "name": (containerElement.attr("name") + "_d") }).attr("disabled", true));
		containerElement.hide();
	}
}

function enableContainer(containerElement, enabled) {
	$(containerElement).find(
		"input[type='radio'], input[type='text'], input[type='checkbox'], " +
		"input[type='zoom'], input[type='number'], textarea, select, " +
		"input[type='button'], img, button"
	).not(".logo").each(function () {
		enableField($(this), enabled);
	});
}

function enableField(containerElement, enabled) {
	if (containerElement.attr("type") == "text") {
		containerElement.prop("readonly", !enabled);
	}
	if (containerElement.attr("type") == "number") {
		containerElement.prop("readonly", !enabled);
	}
	if (containerElement.attr('type') == 'zoom') {
		enableZoom(containerElement, enabled);
		return;
	}
	else if (containerElement.prop("tagName") == "TEXTAREA") {
		containerElement.prop("readonly", !enabled);
	}
	else if (containerElement.prop("tagName") == "SELECT") {
		if (enabled) {
		containerElement.removeClass("disabled")
		} else {
		containerElement.addClass("disabled")
		}
	}
	else if (containerElement.attr("type") == "button" || containerElement.prop("tagName") == "IMG") {
		containerElement.prop("disabled", !enabled);
		if (enabled) {
			containerElement.css("opacity", 1);
			containerElement.css("filter", "");
		} else {
			containerElement.css("opacity", 0.4);
			containerElement.css("filter", "alpha(opacity=40)");
		}
	}
	else if (containerElement.attr("type") == "radio" || containerElement.attr("type") == "checkbox" || containerElement.attr("type") == undefined) {
		var endWithDisabled = new RegExp(/_d$/);
		containerElement = $("[name='" + containerElement[0].name + "']").filter(function (index, element) {
			return !endWithDisabled.test(element.id);
		});

		if (containerElement.length && containerElement.length > 0 && (containerElement.attr("type") == "radio" || containerElement.attr("type") == "checkbox")) {
			containerElement.each(function (i) {
				$("label[for^='" + $(this).prop("id") + "']").each(function (i) {
					var suffix = (endWithDisabled.test($(this).prop("for"))) ? "_d" : "";
					if (enabled) {
						$(this).prop("for", $(this).prop("for").replace(endWithDisabled, ""));
					}
					else if (suffix == "") {
						$(this).prop("for", $(this).prop("for") + "_d");
					}
				});
				disableField($(this), enabled);
			});
		}
	} 
	else if (containerElement.hasClass("has-modal")) {
		var group = containerElement.closest(".input-group");
		var trigger = group.find(".modal-action");
		if (enabled) {
			containerElement.css("pointer-events", "auto").removeClass("disabled");
			trigger.css("pointer-events", "auto").removeClass("disabled");
		} else {
			containerElement.css("pointer-events", "none").addClass("disabled");
			trigger.css("pointer-events", "none").addClass("disabled");
		}
	}
}


function enableFields(ACTIVIDAD) {
    console.log('enableFields llamado con ACTIVIDAD:', ACTIVIDAD);
    
    if (ACTIVIDAD == CREAR_SOLICITUD || ACTIVIDAD == INICIO || ACTIVIDAD == 0 || ACTIVIDAD == 5) {
        enableContainer($("#panel-solicitud"), true);
        enableContainer($("#panel-detalles"), true);

        // Ocultar paneles posteriores
        $("#panel-validacion-comercial").hide();
        $("#panel-gestion-registros").hide();
        $("#panel-aprobacion-etiqueta-tecnica").hide();
        $("#panel-gestion-senave").hide();
        $("#panel-cierre-notificaciones").hide();
        
        console.log('Mostrando panel-solicitud y panel-detalles');
    }

    if (ACTIVIDAD == APROBACION_MARKETING || ACTIVIDAD == 6) {
        // Mostrar paneles anteriores en modo solo lectura
        enableContainer($("#panel-solicitud"), false);
        enableContainer($("#panel-detalles"), false);
        enableContainer($("#panel-validacion-comercial"), true);

        $("#panel-gestion-registros").hide();
        $("#panel-aprobacion-etiqueta-tecnica").hide();
        $("#panel-gestion-senave").hide();
        $("#panel-cierre-notificaciones").hide();
        
        console.log('Mostrando panel-validacion-comercial');
    }

    if (ACTIVIDAD == APROBACION_REGISTROS || ACTIVIDAD == 13) {
        enableContainer($("#panel-solicitud"), false);
        enableContainer($("#panel-detalles"), false);
        enableContainer($("#panel-validacion-comercial"), false);
        enableContainer($("#panel-gestion-registros"), true);

        $("#panel-aprobacion-etiqueta-tecnica").hide();
        $("#panel-gestion-senave").hide();
        $("#panel-cierre-notificaciones").hide();
        
        console.log('Mostrando panel-gestion-registros');
    }

    if (ACTIVIDAD == APROBACION_ETIQUETA_TECNICA || ACTIVIDAD == 20) {
        enableContainer($("#panel-solicitud"), false);
        enableContainer($("#panel-detalles"), false);
        enableContainer($("#panel-validacion-comercial"), false);
        enableContainer($("#panel-gestion-registros"), false);
        enableContainer($("#panel-aprobacion-etiqueta-tecnica"), true);

        $("#panel-gestion-senave").hide();
        $("#panel-cierre-notificaciones").hide();
        
        console.log('Mostrando panel-aprobacion-etiqueta-tecnica');
    }

    if (ACTIVIDAD == DOCUMENTACION_SENAVE || ACTIVIDAD == 27) {
        enableContainer($("#panel-solicitud"), false);
        enableContainer($("#panel-detalles"), false);
        enableContainer($("#panel-validacion-comercial"), false);
        enableContainer($("#panel-gestion-registros"), false);
        enableContainer($("#panel-aprobacion-etiqueta-tecnica"), false);
        enableContainer($("#panel-gestion-senave"), true);

        $("#panel-cierre-notificaciones").hide();
        
        console.log('Mostrando panel-gestion-senave');
    }

    if (ACTIVIDAD == CIERRE_NOTIFICACIONES || ACTIVIDAD == 29) {
        enableContainer($("#panel-solicitud"), false);
        enableContainer($("#panel-detalles"), false);
        enableContainer($("#panel-validacion-comercial"), false);
        enableContainer($("#panel-gestion-registros"), false);
        enableContainer($("#panel-aprobacion-etiqueta-tecnica"), false);
        enableContainer($("#panel-gestion-senave"), false);
        enableContainer($("#panel-cierre-notificaciones"), true);
        
        console.log('Mostrando panel-cierre-notificaciones');
    }
}


