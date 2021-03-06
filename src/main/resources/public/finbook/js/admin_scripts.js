const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
});

function ajaxGetCurrentUserId(){
    $.ajax({
        url: "/auth/get-current-user-id",
        method: "POST",
        dataType: "JSON",
        success: function(data){
            if (data != null){
                $('#user-id').text(data.userid);
            }
        }
    });
}

function highlightCurrentPageInNav(){
    // Split route from admin e.g. "/admin/some/thing"
    let routeFromAdmin = location.pathname.split("/admin/");
    let highlightRoute = routeFromAdmin[1];

    // Split the route after admin e.g. "some/thing"
    let routeWithoutAdmin = routeFromAdmin[1].split("/");
    if (routeWithoutAdmin.length > 1){
        for (let i = 1; i <= routeWithoutAdmin.length; i++) {
            highlightRoute.concat("/").concat(routeWithoutAdmin[i]);
        }
    }

    // Add active class to the properly link
    $('#sidebar .nav-sidebar a[href="/admin/' + highlightRoute + '"]').addClass('active');
}

function isEmail(email) {
    let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function format_amounts() {
    let amounts = $('.currency');
    if (amounts.length){
        amounts.each(function() {
            let monetary_value = $(this).text();
            let i = new Intl.NumberFormat('de-DE', {
                style: 'currency'
                ,currency: 'EUR'
            }).format(monetary_value);
            $(this).text(i);
        });
    }
}

function cleanChart(chartToClean){
    if(chartToClean != null){
        chartToClean.destroy();
    }
}

function ajaxChangeReportPeriod(valueOfSelect){
    $.ajax({
        url: "/admin/reporting/ajax-datepicker",
        method: "POST",
        data: { datepicker_value : valueOfSelect },
        dataType:"JSON",
        success: function(data){
            $('#incomes').text(data.incomes);
            $('#egress').text(data.egress);
            $('#totalTaxesDue').text(data.totalTaxesDue);
            drawBarChart(data.barChart);
            drawPieChart(data.pieChart);
            fillOutTableBodyInvoiceList(data.invoicesShortedList);
            format_amounts();
        },
        error: function () {
            Toast.fire({
                icon: 'error',
                title: 'Something was wrong!'
            })
        }
    });
}

let myBarChart = null;
function drawBarChart(barChartObject){
    let canvasBarChart = $('#canvasBarChart');
    if (canvasBarChart.length){
        let barChartOptions = {
            responsive              : true,
            maintainAspectRatio     : false,
            datasetFill             : false
        };

        cleanChart(myBarChart);

        let barChart = canvasBarChart.get(0).getContext('2d');

        myBarChart = new Chart(barChart, {
            type: barChartObject["type"],
            data: barChartObject["data"],
            options: barChartOptions
        });
    }
}

let myPieChart = null;
function drawPieChart(pieChartObject){
    let canvasPieChart = $('#canvasPieChart');
    if (canvasPieChart.length){
        let pieChartOptions = {
            maintainAspectRatio : false,
            responsive : true,
        };

        cleanChart(myPieChart);

        let pieChart = canvasPieChart.get(0).getContext('2d');

        myPieChart = new Chart(pieChart, {
            type: pieChartObject["type"],
            data: pieChartObject["data"],
            options: pieChartOptions
        });
    }
}

function fillOutTableBodyInvoiceList(invoicesList){
    let tableToFill = $('#datatables_list_with_pagination').DataTable();
    tableToFill.clear();

    $.each(invoicesList, function (i, invoice) {
        tableToFill.row.add( [
            invoice.invoiceDate,
            invoice.issuerName,
            invoice.receiverName,
            invoice.subtotal,
            invoice.totalTaxes,
            invoice.totalDue
        ] );
    });

    tableToFill.draw();
}

function ajaxSendIVAReport(){
    let email = $('#report_email').val();

    if(isEmail(email)){
        let valueOfSelect = $('#datepicker').val();
        $.ajax({
            url: "/admin/reporting/ajax-send-report",
            method: "POST",
            data: { period : valueOfSelect, email : email },
            dataType:"JSON",
            success: function(data){
                $('#close_modal').trigger('click');
                $('#report_email').val('');
                Toast.fire({
                    icon: 'success',
                    title: 'Report sent successfully!'
                });
            },
            error: function () {
                Toast.fire({
                    icon: 'error',
                    title: 'Something was wrong!'
                });
            }
        });
    }else {
        Toast.fire({
            icon: 'error',
            title: 'Wrong email format!'
        });
    }
}

function ajaxSendVATReturnsReport(flag){
    let email, period, whichPeriod;
    if (flag){
        period = "trimester";
        whichPeriod = $("input[name='period']:checked").val();
        email = $('#email_420');
    }else{
        period = "annual";
        email = $('#email_425');
    }

    if (isEmail(email.val())){
        $.ajax({
            url: "/admin/reporting/ajax-vat-returns-report",
            method: "POST",
            data: { period : period, whichPeriod : whichPeriod, email : email.val() },
            dataType:"JSON",
            success: function(){
                email.val('');
                Toast.fire({
                    icon: 'success',
                    title: 'Report sent successfully!'
                });
            },
            error: function () {
                Toast.fire({
                    icon: 'error',
                    title: 'Something was wrong!'
                });
            }
        });
    }else {
        Toast.fire({
            icon: 'error',
            title: 'Wrong email format!'
        });
    }
}

$(function() {
    ajaxGetCurrentUserId();
    highlightCurrentPageInNav();

    // Fill out all dashboard
    let datepicker = $('#datepicker');
    if (datepicker.length){
        ajaxChangeReportPeriod("monthly");
    }
    // If datepicker changes
    datepicker.on('change', function() {
        ajaxChangeReportPeriod(this.value);
    });

    format_amounts();

    // Set up datatables opcions
    $('#datatables_list_with_pagination').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "responsive": true,
    });

});
