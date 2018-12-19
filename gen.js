var HEX_COLOUR = '3d78a5';

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function imageToBase64(canvas) {
    var value=canvas.toDataURL('image/png');
    return value.replace('data:image/png;base64,', '');
}

function setPixelColour(data, i, rgbaArray) {
    data[i * 4 + 0] = rgbaArray[0]; // Red
    data[i * 4 + 1] = rgbaArray[1]; // Green
    data[i * 4 + 2] = rgbaArray[2]; // Blue
    data[i * 4 + 3] = rgbaArray[3]; // alpha (transparency)
}

function setPixelColourAtCoord(data, x, y, width, rgbaArray) {
    var i = x + y * width;
    setPixelColour(data, i, rgbaArray);
}

function blockOfColour(rgbArray, width, height) {
    var canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    var context = canvas.getContext("2d");
    var imageData = context.createImageData(width, height);

    var data = imageData.data;
    for (var i = 0; i < height * width; i++) {
        setPixelColour(data, i, [...rgbArray, 255])
    }

    context.putImageData(imageData, 0, 0);
    return imageToBase64(canvas);
}

function tickOfColour(rgbArray) {
    const height = 7;
    const width = 7;

    var canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    var context = canvas.getContext("2d");
    var imageData = context.createImageData(width, height);

    var data = imageData.data;
    for (var i = 0; i < height * width; i++) {
        setPixelColour(data, i, [0,0,0,0]);
    }
    
    var rgbaArray = [...rgbArray, 255];
    var rgbaEdgeArray = [...rgbArray, 70];

    setPixelColourAtCoord(data, 0, 3, width, rgbaArray);
    setPixelColourAtCoord(data, 1, 4, width, rgbaArray);
    setPixelColourAtCoord(data, 2, 5, width, rgbaArray);
    setPixelColourAtCoord(data, 3, 4, width, rgbaArray);
    setPixelColourAtCoord(data, 4, 3, width, rgbaArray);
    setPixelColourAtCoord(data, 5, 2, width, rgbaArray);
    setPixelColourAtCoord(data, 6, 1, width, rgbaArray);

    setPixelColourAtCoord(data, 1, 3, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 2, 4, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 3, 3, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 4, 2, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 5, 1, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 6, 0, width, rgbaEdgeArray);

    setPixelColourAtCoord(data, 0, 4, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 1, 5, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 2, 6, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 3, 5, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 4, 4, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 5, 3, width, rgbaEdgeArray);
    setPixelColourAtCoord(data, 6, 2, width, rgbaEdgeArray);

    context.putImageData(imageData, 0, 0);
    return imageToBase64(canvas);
}

function processTemplate(template, comps, lcomps, dcomps, topimgstr, cornerimgstr, tickimgstr) {
    var output = template
    output = output.replace("{0}",comps.join(','));
    output = output.replace("{1}",lcomps.join(','));
    output = output.replace("{2}",dcomps.join(','));
    output = output.replace("{3}",topimgstr);
    output = output.replace("{4}",cornerimgstr);
    output = output.replace("{5}",cornerimgstr);
    output = output.replace("{6}","Highlight");
    output = output.replace("{7}",tickimgstr);
    return output;
}

function getTheme(comps) {
    var lcomps = [0, 0, 0];   //light
    var dcomps = [0, 0, 0];   //dark

    lfac = 0.5;    //lightness factor
    dfac = 0.4;    //darkness factor

    for (i = 0; i < 3; i++) {
        lcomps[i] = Math.floor(comps[i] + (255 - comps[i]) * lfac);  //tint
        dcomps[i] = Math.floor(comps[i] * (1 - dfac));                  //shade
    }

    var topimgstr = blockOfColour(dcomps, 1, 28);
    var cornerimgstr = blockOfColour(dcomps, 5, 28);
    var tickimgstr = tickOfColour(comps);

    $.ajax({
        url: "template.xml",
        dataType: "text",
        success: function(template) {
            var theme = processTemplate(template, comps, lcomps, dcomps, topimgstr, cornerimgstr, tickimgstr);
            download("DarkMOD.xml", theme);
        }
      });
    
}

function hexToRgb(hex) {
    return hex ? [
        parseInt(hex.substring(0,2), 16),
        parseInt(hex.substring(2,4), 16),
        parseInt(hex.substring(4,6), 16)
    ] : null;
}

$(document).ready(function () {
    $('#genlink').click(function () {
        getTheme(hexToRgb(HEX_COLOUR));
    })
})

