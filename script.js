
"use strict"

$(document).ready(() => {
    
    $('#content').eq(0).hide(0);

    const inputFile = $('#inputFile');

    const currentlySupportedExtensions = ['xml', 'json', 'csv'];

    inputFile.change(e => {
        const file = e.target.files[0];

        $('#content').find('input').prop('checked', false);
        
        if (file) {
           
            const extension = file.name.split('.').pop();

            const extensionIndex = currentlySupportedExtensions.indexOf(extension);

            if (extensionIndex >= 0) {

                $('#content').eq(0).show(0);

                $(e.target).prev().html(file.name);

                const fileReader = new FileReader();

                fileReader.readAsText(file);

                switch (extensionIndex) {
                    case 0: {

                        fileReader.onloadend = createTableFromXML;
                        break;
                    }
                    case 1: {
                        
                        fileReader.onloadend = createTableFromJSON;
                        break;
                    }
                    case 2: {

                        fileReader.onload = createTableFromCSV;
                        break;
                    }
                }

            } else {
                $('#content').eq(0).hide(0);
                $('#extensionError').modal('show');
            }
        }
        
    })

    $('#darkThemeInput').change(() => {
        $('#content').children().eq(1).children().eq(0).toggleClass('table-dark');
    });

    $('#borderedInput').change(() => {
        $('#content').children().eq(1).children().eq(0).toggleClass('table-bordered');
    });

    $('#borderlessInput').change(() => {
        $('#content').children().eq(1).children().eq(0).toggleClass('table-borderless');
    });

});

function createTableFromXML(event) {

    try {
 
        const parser = new DOMParser();
        const data = parser.parseFromString(event.target.result, "text/xml").children[0];

        if (data.children.length > 0) {

            const table = $('<table class="table"></table>');
            
            const headerRow = $('<thead></thead>')

            for (const header of data.children[0].children) {
                headerRow.append(`<th scope"class">${header.localName}</th>`)
            }

            table.append(headerRow);

            for (const record of data.children) {

                const row = $('<tr></tr>');

                for (const information of record.children) {
                    row.append(`<td>${$(information).html()}</td>`);
                }

                table.append(row);

            }

            addTableToDOM(table);
  
        }  

    } catch(error) {
        console.log(error);
        $('#fileError').modal('show');
    }

}

function createTableFromJSON(event) {
    
    try {

        const data = JSON.parse(event.target.result);

        const table = $('<table class="table"><thead></thead></table>');

        if (Array.isArray(data)) {

            if (data.length > 0) {
                for (const key in data[0]) {
                    table.children().eq(0).append(`<th scope="col">${key}</th>`);
                }

                for (const dataRecord of data) {

                    const row = $('<tr></tr>');

                    for (const key in dataRecord) {
                        if (!Array.isArray(dataRecord[key]) && typeof dataRecord[key] !== 'object') {
                            row.append(`<td>${dataRecord[key]}</td>`);
                        } else {
                            row.append('<td></td>');
                        }
                        
                    }

                    table.append(row);
                }

            }

        } else if (typeof data === 'object') {

            const headerRow = $('<thead></thead>');
            const dataRow = $('<tr></tr>');

            for (const key in data) {
                headerRow.append(`<th scope="col">${key}</th>`);
                dataRow.append(`<td>${data[key]}</td>`);
            }

            table.append(headerRow).append(dataRow);
        }

        addTableToDOM(table);

    } catch (error) {

        console.log(error);

        $('#fileError').modal('show');

    } 
}

function createTableFromCSV(event) {

    try {

        const data = event.target.result.split(/\r?\n/);

        if (data.length > 0) {
            
            const table = $('<table class="table"></table>');

            const delimiter = data[0].includes(';') ? ';' : ',';

            for (const index in data) {

                data[index] = data[index].split(delimiter, -1);

                let row;

                if (index == 0) {
                    row = $('<thead></thead>');
                } else {
                    row = $('<tr></tr>');
                }

                for (const j in data[index]) {
                    if (index == 0) {
                        row.append(`<th scope="col">${data[index][j]}</th>`);
                    } else {
                        row.append(`<td>${data[index][j]}</td>`);
                    }
                }

                table.append(row);
            }
            
            addTableToDOM(table);
            
        }

    } catch (error) {

        console.log(error);
        $('#fileError').modal('show'); 

    }
}

function addTableToDOM(table) {
    $('#content').children().eq(1).html(table);
}
