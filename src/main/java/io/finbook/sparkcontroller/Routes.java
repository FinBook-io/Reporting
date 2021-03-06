package io.finbook.sparkcontroller;

import io.finbook.command.*;
import io.finbook.command.ReportingCommand;
import io.finbook.util.Path;
import spark.Route;

import static spark.Spark.*;

public class Routes {

    private static Route map(Converter c) {
        return (req, res) -> c.convert(req, res).handle(req, res);
    }

    public void init(){

        get(Path.HomeRoutes.INDEX, map((req, res) -> HomeCommand.index(Auth.isLogged(req))));

        // AUTHENTICATION
        path(Path.AuthRoutes.AUTH, () -> {
            get(Path.AuthRoutes.SIGN_IN, map(Auth::signin));
            post(Path.AuthRoutes.SIGN_IN, Auth::initDemoSession);
            get(Path.AuthRoutes.SIGN_CERTIFICATE, map(Auth::sign));
            post(Path.AuthRoutes.SIGN_CERTIFICATE, (req, res) -> Auth.initCertificateSession(req));
            get(Path.AuthRoutes.SIGN_OUT, Auth::signout);
            post(Path.AuthRoutes.GET_CURRENT_USER_ID, (req, res) -> Auth.ajaxGetCurrentUserId(req));
        });

        // PRIVATE ROUTES - AUTHENTICATION IS REQUIRED
        path(Path.AdminRoutes.ADMIN, () -> {

            // AUTHENTICATION FILTER
            before(Path.AdminRoutes.ADMIN_FILTER, Auth::authFilter);

            // DASHBOARD
            get(Path.AdminRoutes.DASHBOARD, map((req, res) -> DashboardCommand.index()));

            // INVOICES
            path(Path.AdminRoutes.INVOICES, () -> get(Path.AdminRoutes.INVOICES_EMPTY, map((req, res) -> InvoiceCommand.list(Auth.getCurrentUserId(req)))));

            // REPORTS
            path(Path.AdminRoutes.REPORTING, () -> {
                post(Path.AdminRoutes.REPORTING_AJAX_DATEPICKER, (req, res) -> ReportingCommand.getDataPerPeriod(Auth.getCurrentUserId(req), req.queryParams("datepicker_value")));
                post(Path.AdminRoutes.REPORTING_AJAX_SEND_REPORT, (req, res) ->
                        ReportingCommand.sendIVAReport(
                                Auth.getCurrentUserId(req),
                                req.queryParams("period"),
                                req.queryParams("email")
                        ));
                post(Path.AdminRoutes.REPORTING_AJAX_SEND_VAT_RETURNS_REPORT, (req, res) ->
                        ReportingCommand.sendVATReturnsReport(
                                Auth.getCurrentUserId(req),
                                req.queryParams("period"),
                                req.queryParams("whichPeriod"),
                                req.queryParams("email")
                        ));
            });

            get(Path.AdminRoutes.VAT_RETURNS, map((req, res) -> VATReporting.index()));

        });

        // ERROR - NOT FOUND
        // get(Path.HomeRoutes.ERROR_404, map((req, res) -> ErrorCommand.notFound()));

    }

}
