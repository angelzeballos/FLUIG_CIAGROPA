function displayFields(form, customHTML) {
    // Actualizar valores internos
    var EMPRESA = getValue("WKCompany");
    var SOLICITUD = getValue("WKNumProces");
    var NOMBRE_SOLICITANTE = getValue("WKUserName");
    
    if (isNaN(SOLICITUD))
        EMPRESA = 2;

    form.setValue('codEmpresa', EMPRESA);

    if (isNaN(SOLICITUD))
        SOLICITUD = form.getValue("numeroSolicitud");

    // Numero de Solicitud
    if (SOLICITUD > 0) 
        if (form.getValue("numeroSolicitud") == null || form.getValue("numeroSolicitud") == "null" || form.getValue("numeroSolicitud") == "" || form.getValue("numeroSolicitud") == "0" || form.getValue("numeroSolicitud") == "&nbsp;") 
            if (SOLICITUD > 0)
                form.setValue("numeroSolicitud", SOLICITUD);

    // Actividad
    var ACTIVIDAD = parseInt(getValue("WKNumState"));
    if (ACTIVIDAD >= 0)
        form.setValue("intActividad", ACTIVIDAD);

    // Nombre de Solicitante
    var USUARIO = getValue("WKUserName");
    var const1 = DatasetFactory.createConstraint("colleaguePK.colleagueId", USUARIO, USUARIO, ConstraintType.Must);

    customHTML.append("<script>");
    customHTML.append("  window._getActividadInjected = function(){return " + ACTIVIDAD + "};");
    customHTML.append("  window._getProcesoInjected = function(){return '" + SOLICITUD + "'};");
    customHTML.append("  function getFormMode(){return '" + form.getFormMode() + "'};");
    customHTML.append("  function getCIA(){return '" + EMPRESA + "'};");
    customHTML.append("  window._getNombreSolicitanteInjected = function(){return '" + NOMBRE_SOLICITANTE + "'};");
    customHTML.append("</script>");
    customHTML.append("<script> var currentUser = '" + USUARIO + "';</script>");
	customHTML.append("<script> var company = '" + EMPRESA + "';</script>");


}