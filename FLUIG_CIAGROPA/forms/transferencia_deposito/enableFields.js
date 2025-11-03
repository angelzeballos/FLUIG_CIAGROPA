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


function enableFields(ACTIVIDAD){
    
}