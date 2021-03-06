var points = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0.5, 1],
    [0, 0.5],
    [1.5, 0.5]
];

var ws;

var sending = false;
var sending_data_post;

var cubicPoints = [];

var zOrT = [0, 5, 5, 5, 5, 5];

var positionPointsXY = [];
var positionPointsZ = [];

function callPositionPlot() {
    $.plot($("#positionChart"), [
        {
            color: 2,
            label: "Position",
            data: positionPointsXY
        }
    ], {
        series: {
            lines: {
                show: false
            },
            points: {
                show: true,
                radius: 7,
                symbol: function robot(ctx, x, y, radius, shadow, i) {

                    var z = -positionPointsZ[i];

                    if (i == positionPointsZ.length - 1) {
                        ctx.lineWidth = 5;
                    }

                    var x1 = x + radius * Math.cos(z);
                    var y1 = y + radius * Math.sin(z);

                    //var x2 = x - 0.5 * radius * Math.cos(z);
                    //var y2 = y - 0.5 * radius * Math.sin(z);

                    var x2 = x;
                    var y2 = y;

                    var x3 = x + radius * Math.cos(z + 2 * Math.PI / 3);
                    var y3 = y + radius * Math.sin(z + 2 * Math.PI / 3);

                    var x4 = x + radius * Math.cos(z - 2 * Math.PI / 3);
                    var y4 = y + radius * Math.sin(z - 2 * Math.PI / 3);

                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x3, y3);
                    ctx.lineTo(x2, y2);
                    ctx.lineTo(x4, y4);
                }
            },
            shadowSize: 0

        },
        grid: {
            hoverable: true,
            clickable: true
        },
        xaxis: {
            zoomRange: [0.1, 10],
            panRange: [-10, 10]
        },
        yaxis: {
            zoomRange: [0.1, 10],
            panRange: [-10, 10]
        },
        zoom: {
            interactive: true
        },
        pan: {
            interactive: true
        }
    });
}

function validateInput() {
    var input = $('input[name="inputGoToT"]');
    if (isNaN(input.val()) || input.val() <= 0) {
        input.parent().addClass('has-error');
    }
    else {
        input.parent().removeClass('has-error');
    }

    input = $('input[name="inputGoToX"]');
    if (isNaN(input.val())) {
        input.parent().addClass('has-error');
    }
    else {
        input.parent().removeClass('has-error');
    }

    input = $('input[name="inputGoToY"]');
    if (isNaN(input.val())) {
        input.parent().addClass('has-error');
    }
    else {
        input.parent().removeClass('has-error');
    }

    input = $('input[name="inputX"]');
    if (isNaN(input.val())) {
        input.parent().addClass('has-error');
    }
    else {
        input.parent().removeClass('has-error');
    }

    input = $('input[name="inputY"]');
    if (isNaN(input.val())) {
        input.parent().addClass('has-error');
    }
    else {
        input.parent().removeClass('has-error');
    }

    input = $('input[name="inputTorZ"]');
    if ($("#selectMethod").val() == "Lineal Smooth" || $("#selectMethod").val() == "Lineal Fixed") {
        if (isNaN(input.val()) || input.val() <= 0) {
            input.parent().addClass('has-error');
        }
        else {
            input.parent().removeClass('has-error');
        }
    }
    else {
        if (isNaN(input.val())) {
            input.parent().addClass('has-error');
        }
        else {
            input.parent().removeClass('has-error');
        }
    }

    input = $('input[name="inputK"]');
    if (isNaN(input.val()) || input.val() <= 0) {
        input.parent().addClass('has-error');
    }
    else {
        input.parent().removeClass('has-error');
    }

    input = $('input[name="inputT"]');
    if (isNaN(input.val()) || input.val() <= 0) {
        input.parent().addClass('has-error');
    }
    else {
        input.parent().removeClass('has-error');
    }
}

function validateButtonPlay() {
    validateInput();
    var input = $('input[name="inputK"]');
    if (isNaN(input.val()) || input.val() <= 0) {
        return false;
    }

    input = $('input[name="inputT"]');
    if (isNaN(input.val()) || input.val() <= 0) {
        return false;
    }
    return true;
}

function validateButtonAdd() {
    validateInput();
    var input = $('input[name="inputX"]');
    if (isNaN(input.val())) {
        return false;
    }

    input = $('input[name="inputY"]');
    if (isNaN(input.val())) {
        return false;
    }

    input = $('input[name="inputTorZ"]');
    if ($("#selectMethod").val() == "Lineal Smooth" || $("#selectMethod").val() == "Lineal Fixed") {
        if (isNaN(input.val()) || input.val() <= 0) {
            return false;
        }
    }
    else {
        if (isNaN(input.val())) {
            return false;
        }
    }
    return true;
}

function callPlot(data) {

    $.plot($("#my_chart"), [
        {
            color: 3,
            label: "Reference",
            data: data
        }
    ], {
        series: {
            lines: {
                show: true
            },
            points: {
                show: true,
                radius: 3
            },
            shadowSize: 0

        },
        grid: {
            hoverable: true,
            clickable: false
        },
        xaxis: {
            zoomRange: [0.1, 10],
            panRange: [-10, 10]
        },
        yaxis: {
            zoomRange: [0.1, 10],
            panRange: [-10, 10]
        },
        zoom: {
            interactive: true
        },
        pan: {
            interactive: true
        }
    });
}

function drawPoints() {

    if ($("#selectMethod").val() == "Lineal Smooth" || $("#selectMethod").val() == 'Lineal Fixed') {
        callPlot(points);
    }
    else {

        cubicPoints = [];

        var T_planning = $('input[name="inputT"]').val();
        var K_planning = $('input[name="inputK"]').val();

        var planning_points = points.length;

        if (planning_points < 2 || T_planning <= 0 || K_planning <= 0) {
            callPlot([]);
            return;
        }

        var dN = T_planning * 20;

        var N = Math.floor(dN);

        var intervals = planning_points - 1;

        var max_count = N * intervals;

        if (max_count > 2000) {
            callPlot([]);
            return;
        }

        var i , j;

        for (j = 0; j < intervals; j++) {
            var x_i = points [j][0];
            var y_i = points [j][1];
            var theta_i = zOrT [j];

            var x_f = points [j + 1][0];
            var y_f = points [j + 1][1];
            var theta_f = zOrT [j + 1];

            var alfa_x = K_planning * Math.cos(theta_f) - 3 * x_f;
            var alfa_y = K_planning * Math.sin(theta_f) - 3 * y_f;

            var beta_x = K_planning * Math.cos(theta_i) + 3 * x_i;
            var beta_y = K_planning * Math.sin(theta_i) + 3 * y_i;


            for (i = 0; i < N; i++) {
                var s = i / N;

                cubicPoints.push([-( s - 1.0 ) * ( s - 1.0 ) * ( s - 1.0 ) * x_i + s * s * s * x_f + alfa_x * ( s * s ) * ( s - 1.0 ) + beta_x * s * ( ( s - 1.0 ) * ( s - 1.0 ) ),
                    -( s - 1.0 ) * ( s - 1.0 ) * ( s - 1.0 ) * y_i + s * s * s * y_f + alfa_y * ( s * s ) * ( s - 1.0 ) + beta_y * s * ( ( s - 1.0 ) * ( s - 1.0 ) )]);
            }
        }

        callPlot(cubicPoints);
    }
}

function initialize() {
    initFields();
    drawPoints();
    initEvents();

    if ("WebSocket" in window) {
        ws = new WebSocket("ws://" + document.domain + ":5000/websocket");
        ws.onmessage = function (msg) {
            var message = JSON.parse(msg.data);

            if (message.hasOwnProperty("position")) {

                positionPointsXY.push([message.position[0], message.position[1]]);
                positionPointsZ.push(message.position[2]);

                callPositionPlot();
            }
            else if (message.hasOwnProperty("file_content")) {
                $("#textAreaFileM").text(message.file_content);
            }
        };
    }

    // Cleanly close websocket when unload window
    window.onbeforeunload = function () {
        ws.onclose = function () {
        }; // disable onclose handler first
        ws.close()
    };

    setTimeout(function () {
        $.getJSON('/position');
    }, 250);

    $("#preview_image").load(function () {
        $("#preview_image").attr('src', '/image_test?time=' + new Date().getTime());
    });

    $("#preview_image").error(function () {
        setTimeout(function () {
            $("#preview_image").attr('src', '/image_test?time=' + new Date().getTime());
        }, 100);
    });

    $("#preview_image").load();

}

function initEvents() {
    $('#buttonRestore').click(function () {
        drawPoints();
    });

    $('#buttonClear').click(function () {
        points = [];

        zOrT = [];

        cubicPoints = [];

        refreshSelect();

        drawPoints();
    });

    $('#buttonAdd').click(function () {
        if (validateButtonAdd() == false) {
            alert("Can't add the point because you specified invalid data.");
            return;
        }
        addPoint($('input[name="inputX"]').val(), $('input[name="inputY"]').val()
            , $('input[name="inputTorZ"]').val());
    });

    $('#buttonPlay').click(function () {
        if (validateButtonPlay() == false) {
            alert("Can't execute the experiment because you specified invalid data.");
            return;
        }

        var data_post = {"k": $('input[name="inputK"]').val(),
            "T": $('input[name = "inputT"]').val(),
            "planning": $("#selectMethod").val(),
            "zOrT": zOrT,
            "points": points
        };

        $.ajax({
            url: "/execute",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
            }
        });
    });

    $('#buttonPosition').click(function () {
        $.getJSON('/position');
    });

    $('#buttonRemove').click(function () {
        var indexes = [];
        $("#selectPoints").children().filter(':selected').each(function () {
            indexes.push(this.value);
        });
        var newPoints = [];
        var newTimes = [];
        for (var i = 0; i < points.length; i++) {
            if (!has(indexes, i)) {
                //if ($.inArray(i, indexes) == -1) {
                //if (indexes.indexOf(i) == -1) {
                newPoints.push(points[i]);
                newTimes.push(zOrT[i]);
            }
        }

        points = newPoints;
        zOrT = newTimes;

        refreshSelect();
        drawPoints();
    });

    $('#selectMethod').change(function () {
        validateInput();
        drawPoints();
        refreshMethod();
    });

    $('input[type="text"]').change(function () {
        validateInput();
    });

    $('input[type="text"]').keyup(function () {
        validateInput();
    });

    $('#my_chart').bind('plothover', function (event, pos, item) {
        $('input[name="inputX"]').val(pos.x.toFixed(2));
        $('input[name="inputY"]').val(pos.y.toFixed(2));
        if (item) {

            var select = $('#selectPoints')[0];

            for (var i = 0; i < select.length; i++) {
                if (i == item.dataIndex) {
                    select[i].selected = true;
                }
                else {
                    select[i].selected = false;
                }
            }

        }
        validateInput();
    });

    $('#positionChart').bind('plothover', function (event, pos, item) {
        $('input[name="inputGoToX"]').val(pos.x.toFixed(2));
        $('input[name="inputGoToY"]').val(pos.y.toFixed(2));
        validateInput();
    });

    $('#buttonPositionRestore').click(function () {
        callPositionPlot();
    });

    $('#buttonPositionReset').click(function () {
        $.ajax({
            url: "/reset",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: "",
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
                positionPointsXY = []
                positionPointsZ = []

//                alert('command: ' + data.program);
                $('#buttonPosition').click();
            }
        });
    });

    $('#buttonGoTo').click(function () {
        if (validateButtonGoTo() == false) {
            alert("Can't execute the movement because you specified invalid data.");
            return;
        }

        var data_post = {
            "X": $('input[name="inputGoToX"]').val(),
            "Y": $('input[name="inputGoToY"]').val(),
            "T": $('input[name="inputGoToT"]').val()
        };

        $.ajax({
            url: "/move",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
            }
        });
    });

    $('#buttonStop').click(function () {
        $.ajax({
            url: "/stop",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: "",
            dataType: "json",
            success: function (data) {
//                alert('command: ' + data.program);
            }
        });
    });

    $('#buttonForward').mousedown(function () {

        sending_data_post = {
            "direction": "forward",
            "speed": 0.5
        };

        $.ajax({
            url: "/start",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(sending_data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
                sending = true;
                setTimeout(keepSending, 500);
            }
        });
    });

    $('#buttonForward').mouseup(function () {

        sending = false;

        sending_data_post = {
            "direction": "forward",
            "speed": 0
        };

        $.ajax({
            url: "/start",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(sending_data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
            }
        });
    });

    $('#buttonBackward').mousedown(function () {

        sending_data_post = {
            "direction": "backward",
            "speed": 0.5
        };

        $.ajax({
            url: "/start",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(sending_data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
                sending = true;
                setTimeout(keepSending, 500);
            }
        });
    });

    $('#buttonBackward').mouseup(function () {

        sending = false;

        sending_data_post = {
            "direction": "backward",
            "speed": 0
        };

        $.ajax({
            url: "/start",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(sending_data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
            }
        });
    });

    $('#buttonRight').mousedown(function () {

        sending_data_post = {
            "direction": "right",
            "speed": 1.25
        };

        $.ajax({
            url: "/start",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(sending_data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
                sending = true;
                setTimeout(keepSending, 500);
            }
        });
    });

    $('#buttonRight').mouseup(function () {

        sending = false;

        sending_data_post = {
            "direction": "right",
            "speed": 0
        };

        $.ajax({
            url: "/start",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(sending_data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
            }
        });
    });

    $('#buttonLeft').mousedown(function () {

        sending_data_post = {
            "direction": "left",
            "speed": 5
        };

        $.ajax({
            url: "/start",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(sending_data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
                sending = true;
                setTimeout(keepSending, 500);
            }
        });
    });

    $('#buttonLeft').mouseup(function () {

        sending = false;

        sending_data_post = {
            "direction": "left",
            "speed": 0
        };

        $.ajax({
            url: "/start",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(sending_data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
            }
        });
    });

    $.contextMenu({
        selector: '#selectPoints',
        items: {
            "remove": {name: "Remove", callback: function (key, option) {
                $('#buttonRemove').click();
            }},
            "selectAll": {name: "Select All", callback: function (key, option) {
                $('#selectPoints').children().each(function () {
                    this.selected = true;
                });
            }}
        }
    });

    $.contextMenu({
        selector: '#my_chart',
        items: {
            "play": {name: "Execute", callback: function (key, option) {
                $('#buttonPlay').click();
            }},
            "stop": {name: "Stop", icon: "paste", callback: function (key, option) {
                $('#buttonStop').click();
            }},
            "sep1": "--------------",
            "addPoint": {name: "Add Point Here", callback: function (key, option) {
                $('#buttonAdd').click();
            }},
            "removePoint": {name: "Remove Point", callback: function (key, option) {
                $('#buttonRemove').click();
            }},
            "sep2": "--------------",
            "restore": {name: "Restore", callback: function (key, option) {
                $('#buttonRestore').click();
            }},
            "clear": {name: "Clear", callback: function (key, option) {
                $('#buttonClear').click();
            }}
        }
    });

    $.contextMenu({
        selector: '#positionChart',
        items: {
            "goTo": {name: "Move Here", callback: function (key, option) {
                $('#buttonGoTo').click();
            }},
            "sep3": "--------------",
            "restore": {name: "Restore", callback: function (key, option) {
                $('#buttonPositionRestore').click();
            }},
            "reset": {name: "Reset", callback: function (key, option) {
                $('#buttonPositionReset').click();
            }},
            "refresh": {name: "Refresh", callback: function (key, option) {
                $('#buttonPosition').click();
            }}
        }
    });
}

function keepSending() {
    if (sending) {

        $.ajax({
            url: "/start",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(sending_data_post),
            dataType: "json",
            success: function (data) {
//                $('#file').val(data.string);
//                alert('command: ' + data.program);
            }
        });
        setTimeout(keepSending, 500);
    }
}

function validateButtonGoTo() {
    validateInput();
    var input = $('input[name="inputGoToT"]');
    if (isNaN(input.val()) || input.val() <= 0) {
        return false;
    }

    input = $('input[name="inputGoToX"]');
    if (isNaN(input.val())) {
        return false;
    }

    input = $('input[name="inputGoToY"]');
    if (isNaN(input.val())) {
        return false;
    }
    return true;
}

function has(array, value) {

    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) {
            return true;
        }
    }

    return false;
}

function addPoint(x, y, t) {

    points.push([x, y]);

    zOrT.push(t);

    refreshSelect();

    drawPoints();
}

function initFields() {

    var chart = $('#my_chart');
    chart.css('height', chart.css('width'));
    chart = $('#positionChart');
    chart.css('height', chart.css('width'));

    $('input[name="inputK"]').val(1)
    $('input[name="inputT"]').val(5);
    $('input[name="inputX"]').val(0);
    $('input[name="inputY"]').val(0);
    $('input[name="inputTorZ"]').val(5);
    $('input[name="inputGoToX"]').val(0);
    $('input[name="inputGoToY"]').val(0);
    $('input[name="inputGoToT"]').val(5);

    var selectMethod = $('#selectMethod');
    selectMethod.children().remove();
    selectMethod.append(new Option('Lineal Smooth'));
    selectMethod.append(new Option('Lineal Fixed'));
    selectMethod.append(new Option('Cubic'));

    refreshSelect();

    refreshMethod();
}

function refreshMethod() {
    if ($("#selectMethod").val() == "Lineal Smooth" || $("#selectMethod").val() == "Lineal Fixed") {
        $('#labelTorZ').text('T');
        var input = $('input[name="inputK"]');
        input.parent().hide();
        input = $('input[name="inputT"]');
        input.parent().hide();
    }
    else {
        $('#labelTorZ').text('Z');
        var input = $('input[name="inputK"]');
        input.parent().show();

        input = $('input[name="inputT"]');
        input.parent().show();
    }
}

function refreshSelect() {

    var selectPoints = $('#selectPoints');

    selectPoints.children().remove();

    for (var i = 0; i < points.length; i++) {
        selectPoints.append(new Option(points[i].toString() + ',' + zOrT[i].toString(), i));
    }

    selectPoints.attr('size', selectPoints[0].options.length);
}
//TODO: Add simple commands for movements
//TODO: Add getting image

//TODO: Add context menu icons
//TODO: Add tooltips or help
//TODO: Add units in axes and change legend
//TODO: Enable/Disable options in context menu
//TODO: Hide multi select scroll bar
//TODO: Look for validation plugin or library
//TODO: Accordion, Tabs or Hide/Show for sections
//TODO: Resize charts on event